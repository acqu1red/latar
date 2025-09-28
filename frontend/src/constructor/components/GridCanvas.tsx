import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Stage, Layer, Rect, Text, Group, Circle, Shape } from 'react-konva';
import Konva from 'konva';
import { KonvaEventObject } from 'konva/lib/Node';
import {
  ConstructorState,
  DOOR_LENGTH,
  GRID_SIZE,
  WORKSPACE_HEIGHT,
  WORKSPACE_WIDTH,
  WINDOW_MAX_RATIO,
  DoorItem,
  FloatingDoor,
  FloatingWindow,
  Room,
  Wall,
  WallNode,
  WindowItem,
} from '../types';
import {
  ConstructorAction,
  createDoor,
  createFloatingDoor,
  createFloatingWindow,
  createWall,
  createWindow,
} from '../state';
import {
  clamp,
  clampPointToWorkspace,
  findNearestSegment,
  getWallSegments,
  interpolatePoint,
  segmentAngleDeg,
  snapToStep,
  toPixels,
  wallSegmentLength,
  FindClosestWallSegmentResult,
  isFindClosestWallSegmentResult,
} from '../utils';

interface GridCanvasProps {
  state: ConstructorState;
  dispatch: React.Dispatch<ConstructorAction>;
  onRequestPhoto: (roomId: string) => void;
}

const WORKSPACE_PIXEL_WIDTH = WORKSPACE_WIDTH * GRID_SIZE;
const WORKSPACE_PIXEL_HEIGHT = WORKSPACE_HEIGHT * GRID_SIZE;
const SNAP_STEP = 0.5;
const WINDOW_THICKNESS = GRID_SIZE * 0.18;
const DOOR_THICKNESS = GRID_SIZE * 0.22;
const ATTACH_THRESHOLD = 0.45; // in grid cells

const GridCanvas: React.FC<GridCanvasProps> = ({ state, dispatch, onRequestPhoto }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<Konva.Stage | null>(null);
  const [draftWall, setDraftWall] = useState<WallNode[] | null>(null);
  const [selectedWindowId, setSelectedWindowId] = useState<string | null>(null);
  const [selectedDoorId, setSelectedDoorId] = useState<string | null>(null);

  useEffect(() => {
    if (state.activeTool !== 'select') {
      setSelectedDoorId(null);
      setSelectedWindowId(null);
    }
  }, [state.activeTool]);

  const getStage = () => stageRef.current;

  const toGridPoint = useCallback((pixel: { x: number; y: number }) => {
    const stage = getStage();
    if (!stage) {
      return null;
    }
    const transform = stage.getAbsoluteTransform().copy().invert();
    const local = transform.point(pixel);
    return {
      x: local.x / GRID_SIZE,
      y: local.y / GRID_SIZE,
    };
  }, []);

  const getPointer = useCallback(
    (snap = false) => {
      const stage = getStage();
      if (!stage) {
        return null;
      }
      const pointer = stage.getPointerPosition();
      if (!pointer) {
        return null;
      }
      const gridPoint = toGridPoint(pointer);
      if (!gridPoint) {
        return null;
      }
      const snapped = snap
        ? {
            x: snapToStep(gridPoint.x, SNAP_STEP),
            y: snapToStep(gridPoint.y, SNAP_STEP),
          }
        : gridPoint;
      return clampPointToWorkspace(snapped);
    },
    [toGridPoint],
  );

  const clampRoomPosition = useCallback((room: Room, position: { x: number; y: number }) => {
    return {
      x: clamp(position.x, 0, Math.max(0, WORKSPACE_WIDTH - room.length)),
      y: clamp(position.y, 0, Math.max(0, WORKSPACE_HEIGHT - room.width)),
    };
  }, []);

  const gridLines = useMemo(() => {
    const lines: number[][] = [];
    for (let i = 0; i <= WORKSPACE_WIDTH; i += 1) {
      const x = i * GRID_SIZE;
      lines.push([x, 0, x, WORKSPACE_PIXEL_HEIGHT]);
    }
    for (let j = 0; j <= WORKSPACE_HEIGHT; j += 1) {
      const y = j * GRID_SIZE;
      lines.push([0, y, WORKSPACE_PIXEL_WIDTH, y]);
    }
    return lines;
  }, []);

  const handleStageMouseDown = useCallback(
    (event: KonvaEventObject<MouseEvent>) => {
      const stage = event.target.getStage();
      if (!stage) {
        return;
      }
      const pointer = getPointer(); // Теперь по умолчанию snap=false
      if (!pointer) {
        return;
      }

      if (state.activeTool === 'window' && event.target === stage) {
        const floating = createFloatingWindow(pointer, 1.5);
        dispatch({ type: 'ADD_FLOATING_WINDOW', window: floating });
        setSelectedWindowId(floating.id);
        return;
      }

      if (state.activeTool === 'door' && event.target === stage) {
        const floating = createFloatingDoor(pointer);
        dispatch({ type: 'ADD_FLOATING_DOOR', door: floating });
        setSelectedDoorId(floating.id);
        return;
      }

      if (state.activeTool !== 'wall' || event.target !== stage) {
        return;
      }

      const snappedPointer = getPointer(true); // Для стен всегда делаем snap=true
      if (!snappedPointer) {
        return;
      }

      const anchor: WallNode = {
        id: `anchor-${Date.now()}`,
        x: snappedPointer.x,
        y: snappedPointer.y,
        kind: 'anchor',
      };
      setDraftWall([anchor, { ...anchor, id: `anchor-${Date.now()}-end` }]);
    },
    [dispatch, getPointer, state.activeTool],
  );

  const handleStageMouseMove = useCallback(() => {
    if (!draftWall) {
      return;
    }
    const pointer = getPointer(true);
    if (!pointer) {
      return;
    }
    setDraftWall((currentDraftWall) => {
      if (!currentDraftWall || !currentDraftWall[0]) {
        return null;
      }
      const [start] = currentDraftWall;
      return [start, { ...pointer, id: 'draft-end', kind: 'anchor' }];
    });
  }, [getPointer]);

  const handleStageMouseUp = useCallback(() => {
    if (!draftWall) {
      return;
    }
    const pointer = getPointer(true);
    if (!pointer) {
      setDraftWall(null);
      return;
    }
    const start = draftWall[0];
    if (!start) {
      setDraftWall(null);
      return;
    }
    const end: WallNode = {
      id: `anchor-${Date.now()}-final`,
      x: pointer.x,
      y: pointer.y,
      kind: 'anchor',
    };
    const distance = Math.hypot(end.x - start.x, end.y - start.y);
    if (distance >= 0.25) {
      dispatch({
        type: 'ADD_WALL',
        wall: createWall(state.selectedRoomId, start, end),
      });
    }
    setDraftWall(null);
  }, [dispatch, draftWall, getPointer, state.selectedRoomId]);

  const handleStageContextMenu = useCallback((event: KonvaEventObject<PointerEvent>) => {
    event.evt.preventDefault();
    setDraftWall(null);
  }, []);

  const handleRoomDragEnd = useCallback(
    (room: Room, evt: KonvaEventObject<DragEvent>) => {
      const node = evt.target;
      const raw = {
        x: node.x() / GRID_SIZE,
        y: node.y() / GRID_SIZE,
      };
      const snapped = {
        x: snapToStep(raw.x, SNAP_STEP),
        y: snapToStep(raw.y, SNAP_STEP),
      };
      const clamped = clampRoomPosition(room, snapped);
      dispatch({ type: 'UPDATE_ROOM', roomId: room.id, patch: { position: clamped } });
      node.position({ x: toPixels(clamped.x), y: toPixels(clamped.y) });
    },
    [clampRoomPosition, dispatch],
  );

  const handleRoomSelect = useCallback(
    (roomId: string) => {
      dispatch({ type: 'SET_SELECTED_ROOM', roomId });
    },
    [dispatch],
  );

  const handleRoomResize = useCallback(
    (room: Room, direction: 'horizontal' | 'vertical', pointerGrid: { x: number; y: number }) => {
      if (direction === 'horizontal') {
        const maxLength = Math.max(1, WORKSPACE_WIDTH - room.position.x);
        const tentative = clamp(pointerGrid.x - room.position.x, 1, Math.min(room.area * 2, maxLength));
        if (tentative <= 0) {
          return null;
        }
        const width = clamp(room.area / tentative, 1, WORKSPACE_HEIGHT - room.position.y);
        const lengthValue = Number(tentative.toFixed(3));
        const widthValue = Number(width.toFixed(3));
        dispatch({
          type: 'UPDATE_ROOM',
          roomId: room.id,
          patch: { length: lengthValue, width: widthValue },
        });
        return { length: lengthValue, width: widthValue };
      }
      const maxWidth = Math.max(1, WORKSPACE_HEIGHT - room.position.y);
      const tentative = clamp(pointerGrid.y - room.position.y, 1, Math.min(room.area * 2, maxWidth));
      if (tentative <= 0) {
        return null;
      }
      const length = clamp(room.area / tentative, 1, WORKSPACE_WIDTH - room.position.x);
      const widthValue = Number(tentative.toFixed(3));
      const lengthValue = Number(length.toFixed(3));
      dispatch({
        type: 'UPDATE_ROOM',
        roomId: room.id,
        patch: { width: widthValue, length: lengthValue },
      });
      return { length: lengthValue, width: widthValue };
    },
    [dispatch],
  );

  const handleWallDoubleClick = useCallback(
    (event: KonvaEventObject<Event>, wall: Wall) => {
      event.cancelBubble = true;
      const pointer = getPointer(false);
      if (!pointer) {
        return;
      }
      const result = findNearestSegment(wall, pointer);
      if (!result) {
        return;
      }
      const segment = result.segment;
      if (!segment) {
        return;
      }
      const nodes = [...wall.nodes];
      const controlPoint: WallNode = {
        id: `control-${Date.now()}`,
        x: pointer.x,
        y: pointer.y,
        kind: 'control',
      };
      if (segment.controlIndex !== null) {
        // Если уже есть контрольная точка, обновляем её
        nodes[segment.controlIndex] = controlPoint;
      } else {
        // Иначе вставляем новую контрольную точку в середину сегмента
        nodes.splice(segment.startIndex + 1, 0, controlPoint);
      }
      dispatch({ type: 'UPDATE_WALL', wallId: wall.id, nodes });
    },
    [dispatch, getPointer],
  );

  const handleWallContextMenu = useCallback(
    (event: KonvaEventObject<PointerEvent>, wall: Wall) => {
      event.evt.preventDefault();
      const pointer = getPointer(false);
      if (!pointer) {
        return;
      }
      const result = findNearestSegment(wall, pointer);
      if (!result) { // Добавляем эту проверку
        return;
      }
      const segment = result.segment;
      if (!segment || segment.controlIndex === null) {
        return;
      }
      const nodes = [...wall.nodes];
      nodes.splice(segment.controlIndex, 1); // Удаляем контрольную точку
      dispatch({ type: 'UPDATE_WALL', wallId: wall.id, nodes });
    },
    [dispatch, getPointer],
  );

  const handleWallNodeDrag = useCallback(
    (wall: Wall, nodeIndex: number) => (evt: KonvaEventObject<DragEvent>) => {
      const stage = getStage();
      if (!stage) {
        return;
      }
      const nodeShape = evt.target;
      const absolute = nodeShape.getAbsolutePosition();
      const transform = stage.getAbsoluteTransform().copy().invert();
      const local = transform.point(absolute);
      const gridPoint = clampPointToWorkspace({
        x: local.x / GRID_SIZE,
        y: local.y / GRID_SIZE,
      });
      const nodes = wall.nodes.map((existing, index) => {
        if (index !== nodeIndex) {
          return existing;
        }
        if (existing.kind === 'anchor') {
          return {
            ...existing,
            x: snapToStep(gridPoint.x, SNAP_STEP),
            y: snapToStep(gridPoint.y, SNAP_STEP),
          };
        }
        return { ...existing, x: gridPoint.x, y: gridPoint.y };
      });
      dispatch({ type: 'UPDATE_WALL', wallId: wall.id, nodes });
      const updated = nodes[nodeIndex];
      nodeShape.position({ x: toPixels(updated.x), y: toPixels(updated.y) });
    },
    [dispatch],
  );

  const findClosestWallSegment = useCallback(
    (point: { x: number; y: number }): FindClosestWallSegmentResult | null => {
      let best: FindClosestWallSegmentResult | null = null;
      state.walls.forEach((wall) => {
        const result = findNearestSegment(wall, point);
        if (!result) {
          return;
        }
        if (!best || result.distance < best.distance) {
          best = { ...result, wall };
        }
      });
      return best;
    },
    [state.walls],
  );

  const tryAttachFloatingWindow = useCallback(
    (floating: FloatingWindow, pointer: { x: number; y: number }) => {
      const closestResult = findClosestWallSegment(pointer);
      if (!isFindClosestWallSegmentResult(closestResult) || closestResult.distance > ATTACH_THRESHOLD) {
        return false;
      }
      const { wall, segment, segmentIndex, offset } = closestResult;
      const segmentLength = wallSegmentLength(segment);
      if (segmentLength === 0) {
        return false;
      }
      const length = Math.min(floating.length, segmentLength * WINDOW_MAX_RATIO);
      const ratio = length / segmentLength;
      const baseOffset = clamp(offset - ratio / 2, 0, Math.max(0, 1 - ratio));
      const midOffset = baseOffset + ratio / 2;
      const rotation = segmentAngleDeg(segment, midOffset);
      const attachedWindow = createWindow({
        wallId: wall.id,
        roomId: wall.roomId,
        segmentIndex: segmentIndex,
        offset: baseOffset,
        length,
        rotation,
      });
      dispatch({ type: 'REMOVE_FLOATING_WINDOW', windowId: floating.id });
      dispatch({ type: 'ADD_WINDOW', window: attachedWindow });
      setSelectedWindowId(attachedWindow.id);
      return true;
    },
    [dispatch, findClosestWallSegment],
  );

  const tryAttachFloatingDoor = useCallback(
    (floating: FloatingDoor, pointer: { x: number; y: number }) => {
      const closestResult = findClosestWallSegment(pointer);
      if (!isFindClosestWallSegmentResult(closestResult) || closestResult.distance > ATTACH_THRESHOLD) {
        return false;
      }
      const { wall, segment, segmentIndex, offset } = closestResult;
      const segmentLength = wallSegmentLength(segment);
      if (segmentLength === 0) {
        return false;
      }
      const effectiveLength = Math.min(DOOR_LENGTH, segmentLength);
      const ratio = effectiveLength / segmentLength;
      const baseOffset = clamp(offset - ratio / 2, 0, Math.max(0, 1 - ratio));
      const midOffset = baseOffset + ratio / 2;
      const rotation = segmentAngleDeg(segment, midOffset);
      const attachedDoor = createDoor({
        wallId: wall.id,
        roomId: wall.roomId,
        segmentIndex: segmentIndex,
        offset: baseOffset,
        rotation,
      });
      dispatch({ type: 'REMOVE_FLOATING_DOOR', doorId: floating.id });
      dispatch({ type: 'ADD_DOOR', door: attachedDoor });
      setSelectedDoorId(attachedDoor.id);
      return true;
    },
    [dispatch, findClosestWallSegment],
  );

  const updateAttachedWindow = useCallback(
    (windowItem: WindowItem, pointer: { x: number; y: number }) => {
      if (!windowItem.wallId || windowItem.segmentIndex === null) {
        return null;
      }
      const wall = state.walls.find((item) => item.id === windowItem.wallId);
      if (!wall) {
        return null;
      }
      const result = findNearestSegment(wall, pointer);
      if (!result) { // Добавляем эту проверку
        return null;
      }
      const segment = result.segment;
      if (!segment) {
        return null;
      }
      const segmentLength = wallSegmentLength(segment);
      if (segmentLength === 0) {
        return null;
      }
      const length = Math.min(windowItem.length, segmentLength * WINDOW_MAX_RATIO);
      const ratio = length / segmentLength;
      const baseOffset = clamp(result.offset - ratio / 2, 0, Math.max(0, 1 - ratio));
      const midOffset = baseOffset + ratio / 2;
      const rotation = segmentAngleDeg(segment, midOffset);
      const midPoint = interpolatePoint(segment, midOffset);
      dispatch({
        type: 'UPDATE_WINDOW',
        windowId: windowItem.id,
        patch: {
          wallId: wall.id,
          segmentIndex: result.segmentIndex,
          offset: baseOffset,
          length,
          rotation,
        },
      });
      return { midPoint, rotation, length };
    },
    [dispatch, state.walls],
  );

  const updateAttachedDoor = useCallback(
    (door: DoorItem, pointer: { x: number; y: number }) => {
      if (!door.wallId || door.segmentIndex === null) {
        return null;
      }
      const wall = state.walls.find((item) => item.id === door.wallId);
      if (!wall) {
        return null;
      }
      const result = findNearestSegment(wall, pointer);
      if (!result) { // Добавляем эту проверку
        return null;
      }
      const segment = result.segment;
      if (!segment) {
        return null;
      }
      const segmentLength = wallSegmentLength(segment);
      if (segmentLength === 0) {
        return null;
      }
      const effectiveLength = Math.min(DOOR_LENGTH, segmentLength);
      const ratio = effectiveLength / segmentLength;
      const baseOffset = clamp(result.offset - ratio / 2, 0, Math.max(0, 1 - ratio));
      const midOffset = baseOffset + ratio / 2;
      const rotation = segmentAngleDeg(segment, midOffset);
      const midPoint = interpolatePoint(segment, midOffset);
      dispatch({
        type: 'UPDATE_DOOR',
        doorId: door.id,
        patch: {
          wallId: wall.id,
          segmentIndex: result.segmentIndex,
          offset: baseOffset,
          rotation,
        },
      });
      return { midPoint, rotation };
    },
    [dispatch, state.walls],
  );

  const renderRooms = () =>
    state.rooms.map((room) => {
      const roomX = toPixels(room.position.x);
      const roomY = toPixels(room.position.y);
      const width = toPixels(room.length);
      const height = toPixels(room.width);
      const isSelected = state.selectedRoomId === room.id;
      const photoButtonSize = 40;
      const center = {
        x: toPixels(room.position.x + room.length / 2),
        y: toPixels(room.position.y + room.width / 2),
      };

      return (
        <Group key={room.id} x={roomX} y={roomY} draggable onDragEnd={(evt) => handleRoomDragEnd(room, evt)}>
          <Rect
            width={width}
            height={height}
            fill="rgba(100, 180, 255, 0.15)"
            stroke={isSelected ? '#4fa7ff' : 'rgba(255, 255, 255, 0.35)'}
            strokeWidth={isSelected ? 3 : 1}
            onClick={() => handleRoomSelect(room.id)}
          />
          <Text
            x={12}
            y={12}
            text={`${room.label}\n${room.area.toFixed(1)} м²`}
            fontSize={16}
            fill="#ffffff"
          />
          <Group
            x={center.x - roomX - photoButtonSize / 2}
            y={center.y - roomY - photoButtonSize / 2}
            onClick={() => onRequestPhoto(room.id)}
          >
            <Rect
              width={photoButtonSize}
              height={photoButtonSize}
              fill="rgba(0,0,0,0.65)"
              cornerRadius={8}
              stroke="rgba(255,255,255,0.5)"
              strokeWidth={1}
            />
            <Text x={0} y={10} width={photoButtonSize} align="center" text="📷" fontSize={20} />
            {room.photos.length > 0 && (
              <Text
                x={0}
                y={30}
                width={photoButtonSize}
                align="center"
                text={`x${room.photos.length}`}
                fontSize={12}
                fill="#9ecbff"
              />
            )}
          </Group>

          <Circle
            x={width}
            y={height / 2}
            radius={8}
            fill="#4fa7ff"
            draggable
            onDragMove={() => {
              const pointer = getPointer();
              if (!pointer) {
                return;
              }
              handleRoomResize(room, 'horizontal', pointer);
            }}
            onDragEnd={() => {
              const pointer = getPointer();
              if (!pointer) {
                return;
              }
              handleRoomResize(room, 'horizontal', pointer);
              // Ensure the resizer also snaps to the new position
              // by updating its position based on the new room dimensions.
              // evt.target.position({ x: toPixels(nextLength), y: toPixels(nextWidth / 2) });
            }}
          />

          <Circle
            x={width / 2}
            y={height}
            radius={8}
            fill="#4fa7ff"
            draggable
            onDragMove={() => {
              const pointer = getPointer();
              if (!pointer) {
                return;
              }
              handleRoomResize(room, 'vertical', pointer);
            }}
            onDragEnd={() => {
              const pointer = getPointer();
              if (!pointer) {
                return;
              }
              handleRoomResize(room, 'vertical', pointer);
              // Ensure the resizer also snaps to the new position
              // by updating its position based on the new room dimensions.
              // evt.target.position({ x: toPixels(nextLength / 2), y: toPixels(nextWidth) });
            }}
          />
        </Group>
      );
    });

  const renderWallShape = (wall: Wall) => (
    <Shape
      stroke="#ffffff"
      strokeWidth={4}
      lineCap="round"
      listening
      onDblClick={(event) => handleWallDoubleClick(event, wall)}
      onContextMenu={(event) => handleWallContextMenu(event, wall)}
      sceneFunc={(ctx, shape) => {
        const nodes = wall.nodes;
        if (!nodes.length) {
          return;
        }
        const segments = getWallSegments(wall);
        ctx.beginPath();
        ctx.moveTo(toPixels(nodes[0].x), toPixels(nodes[0].y));
        segments.forEach((segment) => {
          if (segment.control) {
            ctx.quadraticCurveTo(
              toPixels(segment.control.x),
              toPixels(segment.control.y),
              toPixels(segment.end.x),
              toPixels(segment.end.y),
            );
          } else {
            ctx.lineTo(toPixels(segment.end.x), toPixels(segment.end.y));
          }
        });
        ctx.strokeShape(shape);
      }}
    />
  );

  const renderWalls = () =>
    state.walls.map((wall) => (
      <Group key={wall.id}>
        {renderWallShape(wall)}
        {wall.nodes.map((node, index) => (
          <Circle
            key={node.id}
            x={toPixels(node.x)}
            y={toPixels(node.y)}
            radius={node.kind === 'anchor' ? 6 : 5}
            fill={node.kind === 'anchor' ? '#ffffff' : '#7cd3ff'}
            stroke="rgba(0,0,0,0.4)"
            strokeWidth={1}
            draggable
            onDragMove={handleWallNodeDrag(wall, index)}
            onDragEnd={handleWallNodeDrag(wall, index)}
          />
        ))}
      </Group>
    ));

  const renderFloatingWindows = () =>
    state.floatingWindows.map((floating) => {
      const lengthPx = floating.length * GRID_SIZE;
      const isSelected = selectedWindowId === floating.id;
      return (
        <Group
          key={floating.id}
          x={toPixels(floating.position.x)}
          y={toPixels(floating.position.y)}
          draggable
          onClick={() => setSelectedWindowId(floating.id)}
          onDragMove={(evt) => {
            const stage = getStage();
            if (!stage) {
              return;
            }
            const absolute = evt.target.getAbsolutePosition();
            const local = toGridPoint(absolute);
            if (!local) {
              return;
            }
            const clamped = clampPointToWorkspace(local);
            dispatch({
              type: 'UPDATE_FLOATING_WINDOW',
              windowId: floating.id,
              patch: { position: clamped },
            });
            evt.target.position({ x: toPixels(clamped.x), y: toPixels(clamped.y) });
          }}
          onDragEnd={(evt) => {
            const absolute = evt.target.getAbsolutePosition();
            const local = toGridPoint(absolute);
            if (!local) {
              return;
            }
            const clamped = clampPointToWorkspace(local);
            if (!tryAttachFloatingWindow(floating, clamped)) {
              dispatch({
                type: 'UPDATE_FLOATING_WINDOW',
                windowId: floating.id,
                patch: { position: clamped },
              });
              evt.target.position({ x: toPixels(clamped.x), y: toPixels(clamped.y) });
            }
          }}
        >
          <Rect
            x={-lengthPx / 2}
            y={-WINDOW_THICKNESS / 2}
            width={lengthPx}
            height={WINDOW_THICKNESS}
            cornerRadius={4}
            fill={isSelected ? 'rgba(124, 211, 255, 0.9)' : 'rgba(124, 211, 255, 0.6)'}
            stroke={isSelected ? '#7cd3ff' : 'rgba(255,255,255,0.9)'}
            strokeWidth={2}
            shadowColor={isSelected ? '#7cd3ff' : 'black'}
            shadowBlur={isSelected ? 10 : 0}
            shadowOpacity={isSelected ? 0.8 : 0.4}
          />
        </Group>
      );
    });

  const renderFloatingDoors = () =>
    state.floatingDoors.map((floating) => {
      const isSelected = selectedDoorId === floating.id;
      return (
        <Group
          key={floating.id}
          x={toPixels(floating.position.x)}
          y={toPixels(floating.position.y)}
          draggable
          onClick={() => setSelectedDoorId(floating.id)}
          onDragMove={(evt) => {
          const absolute = evt.target.getAbsolutePosition();
          const local = toGridPoint(absolute);
          if (!local) {
            return;
          }
          const clamped = clampPointToWorkspace(local);
          dispatch({
            type: 'UPDATE_FLOATING_DOOR',
            doorId: floating.id,
            patch: { position: clamped },
          });
          evt.target.position({ x: toPixels(clamped.x), y: toPixels(clamped.y) });
        }}
        onDragEnd={(evt) => {
          const absolute = evt.target.getAbsolutePosition();
          const local = toGridPoint(absolute);
          if (!local) {
            return;
          }
          const clamped = clampPointToWorkspace(local);
          if (!tryAttachFloatingDoor(floating, clamped)) {
            dispatch({
              type: 'UPDATE_FLOATING_DOOR',
              doorId: floating.id,
              patch: { position: clamped },
            });
            evt.target.position({ x: toPixels(clamped.x), y: toPixels(clamped.y) });
          }
        }}
      >
          <Rect
            x={-DOOR_LENGTH * GRID_SIZE * 0.5}
            y={-DOOR_THICKNESS / 2}
            width={DOOR_LENGTH * GRID_SIZE}
            height={DOOR_THICKNESS}
            cornerRadius={4}
            fill={isSelected ? 'rgba(255, 200, 150, 0.9)' : 'rgba(255, 226, 179, 0.7)'}
            stroke={isSelected ? '#ffad66' : '#ffe3b3'}
            strokeWidth={2}
            shadowColor={isSelected ? '#ffad66' : 'black'}
            shadowBlur={isSelected ? 10 : 0}
            shadowOpacity={isSelected ? 0.8 : 0.4}
          />
        </Group>
      );
    });

  const renderWindows = () =>
    state.windows
      .filter((windowItem) => windowItem.wallId && windowItem.segmentIndex !== null)
      .map((windowItem) => {
        const wall = state.walls.find((item) => item.id === windowItem.wallId);
        if (!wall) {
          return null;
        }
        const segments = getWallSegments(wall);
        const segment = segments[windowItem.segmentIndex!];
        if (!segment) {
          return null;
        }
        const segmentLength = wallSegmentLength(segment);
        if (segmentLength === 0) {
          return null;
        }
        const length = Math.min(windowItem.length, segmentLength * WINDOW_MAX_RATIO);
        const ratio = length / segmentLength;
        const baseOffset = clamp(windowItem.offset, 0, Math.max(0, 1 - ratio));
        const midOffset = baseOffset + ratio / 2;
        const midPoint = interpolatePoint(segment, midOffset);
        const rotation = segmentAngleDeg(segment, midOffset);
        const pixelLength = length * GRID_SIZE;
        const isSelected = selectedWindowId === windowItem.id;

        return (
          <Group
            key={windowItem.id}
            x={toPixels(midPoint.x)}
            y={toPixels(midPoint.y)}
            rotation={rotation}
            draggable
            onDragMove={(evt) => {
              const stage = getStage();
              if (!stage) {
                return;
              }
              const absolute = evt.target.getAbsolutePosition();
              const local = toGridPoint(absolute);
              if (!local) {
                return;
              }
              const result = updateAttachedWindow(windowItem, local);
              if (result) {
                evt.target.position({ x: toPixels(result.midPoint.x), y: toPixels(result.midPoint.y) });
                evt.target.rotation(result.rotation);
              }
            }}
            onDragEnd={(evt) => {
              const absolute = evt.target.getAbsolutePosition();
              const local = toGridPoint(absolute);
              if (!local) {
                return;
              }
              const result = updateAttachedWindow(windowItem, local);
              if (result) {
                evt.target.position({ x: toPixels(result.midPoint.x), y: toPixels(result.midPoint.y) });
                evt.target.rotation(result.rotation);
              }
            }}
            onClick={() => setSelectedWindowId(windowItem.id)}
          >
            <Rect
              x={-pixelLength / 2}
              y={-WINDOW_THICKNESS / 2}
              width={pixelLength}
              height={WINDOW_THICKNESS}
              cornerRadius={4}
              fill={isSelected ? 'rgba(124, 211, 255, 0.8)' : 'rgba(124, 211, 255, 0.45)'}
              stroke={isSelected ? '#7cd3ff' : 'rgba(255,255,255,0.9)'}
              strokeWidth={2}
            />
          </Group>
        );
      });

  const renderDoors = () =>
    state.doors
      .filter((door) => door.wallId && door.segmentIndex !== null)
      .map((door) => {
        const wall = state.walls.find((item) => item.id === door.wallId);
        if (!wall) {
          return null;
        }
        const segments = getWallSegments(wall);
        const segment = segments[door.segmentIndex!];
        if (!segment) {
          return null;
        }
        const segmentLength = wallSegmentLength(segment);
        if (segmentLength === 0) {
          return null;
        }
        const effectiveLength = Math.min(DOOR_LENGTH, segmentLength);
        const ratio = effectiveLength / segmentLength;
        const baseOffset = clamp(door.offset, 0, Math.max(0, 1 - ratio));
        const midOffset = baseOffset + ratio / 2;
        const midPoint = interpolatePoint(segment, midOffset);
        const rotation = segmentAngleDeg(segment, midOffset);
        const isSelected = selectedDoorId === door.id;

        return (
          <Group
            key={door.id}
            x={toPixels(midPoint.x)}
            y={toPixels(midPoint.y)}
            rotation={rotation}
            draggable
            onDragMove={(evt) => {
              const absolute = evt.target.getAbsolutePosition();
              const local = toGridPoint(absolute);
              if (!local) {
                return;
              }
              const result = updateAttachedDoor(door, local);
              if (result) {
                evt.target.position({ x: toPixels(result.midPoint.x), y: toPixels(result.midPoint.y) });
                evt.target.rotation(result.rotation);
              }
            }}
            onDragEnd={(evt) => {
              const absolute = evt.target.getAbsolutePosition();
              const local = toGridPoint(absolute);
              if (!local) {
                return;
              }
              const result = updateAttachedDoor(door, local);
              if (result) {
                evt.target.position({ x: toPixels(result.midPoint.x), y: toPixels(result.midPoint.y) });
                evt.target.rotation(result.rotation);
              }
            }}
            onClick={() => setSelectedDoorId(door.id)}
          >
            <Rect
              x={-(DOOR_LENGTH * GRID_SIZE) / 2}
              y={-DOOR_THICKNESS / 2}
              width={DOOR_LENGTH * GRID_SIZE}
              height={DOOR_THICKNESS}
              cornerRadius={4}
              fill={isSelected ? 'rgba(255, 200, 150, 0.85)' : 'rgba(255, 226, 179, 0.6)'}
              stroke={isSelected ? '#ffad66' : '#ffe3b3'}
              strokeWidth={2}
            />
          </Group>
        );
      });

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Delete') {
        return;
      }
      if (state.selectedRoomId) {
        dispatch({ type: 'REMOVE_ROOM', roomId: state.selectedRoomId });
        return;
      }
      if (selectedWindowId) {
        const floatingWindow = state.floatingWindows.find((item) => item.id === selectedWindowId);
        if (floatingWindow) {
          dispatch({ type: 'REMOVE_FLOATING_WINDOW', windowId: floatingWindow.id });
        } else {
          dispatch({ type: 'REMOVE_WINDOW', windowId: selectedWindowId });
        }
        setSelectedWindowId(null);
        return;
      }
      if (selectedDoorId) {
        const floatingDoor = state.floatingDoors.find((item) => item.id === selectedDoorId);
        if (floatingDoor) {
          dispatch({ type: 'REMOVE_FLOATING_DOOR', doorId: floatingDoor.id });
        } else {
          dispatch({ type: 'REMOVE_DOOR', doorId: selectedDoorId });
        }
        setSelectedDoorId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dispatch, selectedDoorId, selectedWindowId, state.floatingDoors, state.floatingWindows, state.selectedRoomId]);

  return (
    <div ref={containerRef} className="constructor-canvas">
      <Stage
        ref={stageRef}
        width={WORKSPACE_PIXEL_WIDTH}
        height={WORKSPACE_PIXEL_HEIGHT}
        onMouseDown={handleStageMouseDown}
        onMouseMove={handleStageMouseMove}
        onMouseUp={handleStageMouseUp}
        onContextMenu={handleStageContextMenu}
      >
        <Layer listening={false}>
          <Rect
            x={0}
            y={0}
            width={WORKSPACE_PIXEL_WIDTH}
            height={WORKSPACE_PIXEL_HEIGHT}
            fill="rgba(4, 9, 16, 0.95)"
            stroke="rgba(255,255,255,0.12)"
            strokeWidth={2}
          />
          {gridLines.map((points, index) => (
            <Shape
              key={`grid-${index}`}
              stroke="rgba(255,255,255,0.05)"
              strokeWidth={1}
              sceneFunc={(ctx, shape) => {
                ctx.beginPath();
                ctx.moveTo(points[0], points[1]);
                ctx.lineTo(points[2], points[3]);
                ctx.strokeShape(shape);
              }}
            />
          ))}
        </Layer>
        <Layer>{renderRooms()}</Layer>
        <Layer>{renderWalls()}</Layer>
        <Layer>{renderWindows()}</Layer>
        <Layer>{renderDoors()}</Layer>
        <Layer>{renderFloatingWindows()}</Layer>
        <Layer>{renderFloatingDoors()}</Layer>
        {draftWall && (
          <Layer listening={false}>
            <Shape
              stroke="#7cd3ff"
              strokeWidth={3}
              dash={[10, 10]}
              sceneFunc={(ctx, shape) => {
                const nodes = draftWall;
                if (!nodes.length) {
                  return;
                }
                ctx.beginPath();
                ctx.moveTo(toPixels(nodes[0].x), toPixels(nodes[0].y));
                nodes.slice(1).forEach((node) => {
                  ctx.lineTo(toPixels(node.x), toPixels(node.y));
                });
                ctx.strokeShape(shape);
              }}
            />
          </Layer>
        )}
      </Stage>
    </div>
  );
};

export default GridCanvas;
// new content will be inserted
