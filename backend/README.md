# Apt-Plan Backend

This is the backend service for the "Apt-Plan" application. It receives room photos and data, analyzes them using the OpenAI Vision API, and generates a 2D SVG floor plan.

## Features

-   **Image Analysis**: Uses OpenAI's `gpt-4o-mini` (FREE) or `gpt-4o` (paid) to analyze room layouts from images.
-   **SVG Plan Generation**: Programmatically renders a 2D floor plan in SVG format based on the analysis.
-   **PNG Fallback**: Can convert the SVG to PNG for easier download.
-   **Image Generation Fallback**: An alternative mode to generate a complete floor plan image directly from a model like DALL-E.
-   **Secure**: The OpenAI API key is handled securely on the backend and is never exposed to the client.

## 💰 **Cost Information**

**🆓 FREE Option (Recommended for testing):**
- **Model**: `gpt-4o-mini` (default)
- **Cost**: **FREE** for new OpenAI accounts
- **Features**: Full vision analysis, room layout generation
- **Limitations**: Slightly less accurate than paid models

**💳 PAID Option (For production):**
- **Model**: `gpt-4o` 
- **Cost**: ~$0.01-0.02 per image analysis
- **Features**: Highest accuracy, better reasoning

## API

### `POST /api/generate-plan`

Accepts `multipart/form-data` to generate a floor plan.

#### Request Body

-   `roomsJson` (string): A JSON string representing an array of room objects.
    ```json
    [
      { "key": "room1", "name": "Комната 1", "sqm": 18.5, "enabled": true },
      { "key": "kitchen", "name": "Кухня", "sqm": 10.2, "enabled": true }
    ]
    ```
-   `photo_<key>` (file): For each room with `enabled: true`, a corresponding image file must be attached. For the example above, the files would be named `photo_room1` and `photo_kitchen`.

#### Success Response (`200 OK`)

```json
{
  "ok": true,
  "mode": "svg",
  "svgDataUrl": "data:image/svg+xml;base64,...",
  "pngDataUrl": "data:image/png;base64,...",
  "totalSqm": 28.7,
  "rooms": [
    {
      "key": "room1",
      "name": "Комната 1",
      "sqm": 18.5,
      "objects": [
        { "type": "bed", "x": 0.72, "y": 0.60, "w": 0.22, "h": 0.32 }
      ]
    }
  ]
}
```

#### Error Response

```json
{
  "ok": false,
  "error": "Descriptive error message."
}
```
The HTTP status code will also reflect the error (e.g., `400`, `500`).

### `GET /healthz`

A simple health check endpoint that returns `200 OK` with the text "OK".

## Tech Stack

-   **Node.js 20+** (with ES Modules)
-   **Express**: Web framework
-   **Multer**: Middleware for handling `multipart/form-data`
-   **OpenAI SDK**: For interacting with the Vision and Image APIs
-   **Zod**: For JSON validation
-   **Sharp**: For converting SVG to PNG
-   **CORS**: For handling cross-origin requests
-   **Dotenv**: For managing environment variables locally

## Setup and Running Locally

1.  **Navigate to the backend directory:**
    From the root of the repository, run:
    ```bash
    cd backend
    ```

2.  **Install dependencies:**
    ```