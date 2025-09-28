from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Any, Dict, List, Optional

import httpx
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, ConfigDict, Field


BASE_DIR = Path(__file__).resolve().parents[2]
UPLOADS_DIR = BASE_DIR / "uploads"
PHOTOS_DIR = UPLOADS_DIR / "photos"
LAYOUTS_DIR = UPLOADS_DIR / "layouts"

UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
PHOTOS_DIR.mkdir(parents=True, exist_ok=True)
LAYOUTS_DIR.mkdir(parents=True, exist_ok=True)

PROMPT_TEMPLATE = """
Create a top-down 2D schematic floor plan of an apartment.
Each room has known dimensions (length x width in meters) and photos.
Use the provided data to adapt furniture and layout according to photos.
Include windows, doors, and curved walls where specified.
The plan should be a clean 2D visualization with labeled rooms and furniture, schematic style.
All proportions must reflect the provided dimensions.
"""

COMET_ENDPOINT = "https://api.cometapi.io/v1/generate"


class VectorNode(BaseModel):
  model_config = ConfigDict(populate_by_name=True)

  id: str
  x: float
  y: float
  kind: str


class Vector(BaseModel):
  model_config = ConfigDict(populate_by_name=True)

  id: str
  nodes: List[VectorNode]


class WindowItem(BaseModel):
  model_config = ConfigDict(populate_by_name=True)

  id: str
  wall_id: str = Field(..., alias="wallId")
  room_id: Optional[str] = Field(None, alias="roomId")
  segment_index: int = Field(..., alias="segmentIndex")
  offset: float
  length: float


class DoorItem(BaseModel):
  model_config = ConfigDict(populate_by_name=True)

  id: str
  wall_id: str = Field(..., alias="wallId")
  room_id: Optional[str] = Field(None, alias="roomId")
  segment_index: int = Field(..., alias="segmentIndex")
  offset: float


class RoomPosition(BaseModel):
  x: float
  y: float


class RoomPayload(BaseModel):
  model_config = ConfigDict(populate_by_name=True)

  id: str
  label: str
  area: float
  length: float
  width: float
  position: RoomPosition
  vectors: List[Vector]
  windows: List[WindowItem]
  doors: List[DoorItem]
  photos: List[str]


class LayoutPayload(BaseModel):
  model_config = ConfigDict(populate_by_name=True)

  rooms: List[RoomPayload]
  detached_walls: List[Vector] = Field(default_factory=list, alias="detachedWalls")
  windows: List[WindowItem]
  doors: List[DoorItem]
  walls_by_id: Dict[str, Vector] = Field(default_factory=dict, alias="wallsById")


class SaveLayoutRequest(BaseModel):
  model_config = ConfigDict(populate_by_name=True)

  layout_id: str = Field(..., alias="layoutId")
  payload: Dict[str, Any]


class PhotoResponse(BaseModel):
  id: str
  room_id: str = Field(..., alias="roomId")
  name: str
  url: str


def get_app() -> FastAPI:
  app = FastAPI(title="AI Constructor API", version="1.0.0")

  app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
  )

  app.mount("/uploads", StaticFiles(directory=UPLOADS_DIR), name="uploads")

  @app.post("/upload-photo", response_model=PhotoResponse)
  async def upload_photo(roomId: str = Form(...), file: UploadFile = File(...)):
    try:
      photo_id = f"{roomId}-{os.urandom(6).hex()}"
      extension = Path(file.filename or "").suffix or ".jpg"
      safe_extension = extension if extension.lower() in {".png", ".jpg", ".jpeg", ".webp"} else ".jpg"
      target_dir = PHOTOS_DIR / roomId
      target_dir.mkdir(parents=True, exist_ok=True)
      file_path = target_dir / f"{photo_id}{safe_extension}"

      content = await file.read()
      file_path.write_bytes(content)

      photo = PhotoResponse(
        id=photo_id,
        roomId=roomId,
        name=file.filename or file_path.name,
        url=f"/uploads/photos/{roomId}/{file_path.name}",
      )

      return photo
    except Exception as e:
      print(f"Error uploading photo: {e}")
      raise HTTPException(status_code=500, detail=f"Upload error: {str(e)}")

  @app.post("/save-layout")
  async def save_layout(request_body: SaveLayoutRequest):
    layout_file = LAYOUTS_DIR / f"{request_body.layout_id}.json"
    layout_file.write_text(json.dumps(request_body.payload, ensure_ascii=False, indent=2))
    return {"status": "ok", "layoutId": request_body.layout_id}

  @app.post("/generate-plan")
  async def generate_plan(payload: LayoutPayload):
    api_key = os.getenv("COMET_API_KEY")
    if not api_key:
      raise HTTPException(status_code=500, detail="COMET_API_KEY is not configured")

    prompt = f"{PROMPT_TEMPLATE}\n\nDATA:\n{payload.model_dump_json(by_alias=True)}"

    try:
      async with httpx.AsyncClient(timeout=120) as client:
        response = await client.post(
          COMET_ENDPOINT,
          headers={"Authorization": f"Bearer {api_key}"},
          json={
            "model": "nano-banana (gemini-2.5-flash-image)",
            "prompt": prompt,
            "size": "1024x1024",
            "n": 1,
          },
        )
    except httpx.HTTPError as exc:  # pragma: no cover - network errors
      raise HTTPException(status_code=502, detail="Failed to contact Comet API") from exc

    if response.status_code >= 400:
      detail = response.text
      raise HTTPException(status_code=502, detail=f"Comet API error: {detail}")

    data = response.json()
    image_url: Optional[str] = None

    if isinstance(data, dict):
      if "data" in data and isinstance(data["data"], list) and data["data"]:
        image_url = data["data"][0].get("url") or data["data"][0].get("image_url")
      if not image_url:
        image_url = data.get("imageUrl") or data.get("url")

    if not image_url:
      raise HTTPException(status_code=502, detail="Invalid response from Comet API")

    return JSONResponse({"imageUrl": image_url})

  return app


app = get_app()
