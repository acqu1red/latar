import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Stage, Layer, Line, Rect, Text, Group, Circle } from 'react-konva';
import Konva from 'konva';
import { KonvaEventObject } from 'konva/lib/Node';
import {
  ConstructorState,
  GRID_SIZE,
  Room,
  Wall,
  WallNode,
  WindowItem,
  DoorItem,
  WINDOW_MAX_RATIO,
  DOOR_LENGTH,
} from '../types';
import { ConstructorAction, createDoor, createWall, createWindow } from '../state';
import {
  clamp,
  findNearestSegment,
  fromPixels,
  interpolatePoint,
  projectPointToSegment,
  segmentAngleDeg,
  snapToStep,
  toPixels,
  wallSegmentLength,
} from '../utils';

interface GridCanvasProps {
  state: ConstructorState;
  dispatch: React.Dispatch<ConstructorAction>;
  onRequestPhoto: (roomId: string) => void;
}

interface Dimensions {
  width: number;
  height: number;
}

const GRID_PADDING = 2000;

const GridCanvas: React.FC<GridCanvasProps> = ({ state, dispatch, onRequestPhoto }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<Konva.Stage | null>(null);
  const [dimensions, setDimensions] = useState<Dimensions>({ width: 1200, height: 800 });
  const [stagePosition, setStagePosition] = useState({ x: 0, y: 0 });
  const [draftWall, setDraftWall] = useState<WallNode[] | null>(null);
  const [selectedWindowId, setSelectedWindowId] = useState<string | null>(null);
  const [selectedDoorId, setSelectedDoorId] = useState<string | null>(null);

  useLayoutEffect(() => {
    const element = containerRef.current;
    if (!element) {
      return;
    }
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setDimensions({ width: entry.contentRect.width, height: entry.contentRect.height });
      }
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const getStage = () => stageRef.current;

  const getPointer = useCallback(() => {
    const stage = getStage();
    if (!stage) {
      return null;
    }
    const pointer = stage.getPointerPosition();
    if (!pointer) {
      return null;
    }
    return {
      x: snapToStep(fromPixels(pointer.x), 0.5),
      y: snapToStep(fromPixels(pointer.y), 0.5),
    };
  }, []);

  const gridLines = useMemo(() => {
    const lines: { points: number[] }[] = [];
    const columns = Math.ceil((dimensions.width + GRID_PADDING * 2) / GRID_SIZE);
    const rows = Math.ceil((dimensions.height + GRID_PADDING * 2) / GRID_SIZE);

    for (let i = -columns; i <= columns; i += 1) {
      const x = i * GRID_SIZE;
      lines.push({ points: [x, -GRID_PADDING, x, dimensions.height + GRID_PADDING] });
    }

    for (let j = -rows; j <= rows; j += 1) {
      const y = j * GRID_SIZE;
      lines.push({ points: [-GRID_PADDING, y, dimensions.width + GRID_PADDING, y] });
    }

    return lines;
  }, [dimensions.height, dimensions.width]);

  const handleStageMouseDown = useCallback(
    (event: KonvaEventObject<MouseEvent>) => {
    if (state.activeTool !== 'wall') {
      return;
    }
      if (event.target !== event.target.getStage()) {
        return;
      }
    const pointer = getPointer();
    if (!pointer) {
      return;
    }
    const anchor: WallNode = {
      id: `${Date.now()}-start`,
      x: pointer.x,
      y: pointer.y,
      kind: 'anchor',
    };
    setDraftWall([anchor, { ...anchor, id: `${Date.now()}-end` }]);
    },
    [getPointer, state.activeTool],
  );

  const handleStageMouseMove = useCallback(() => {
    if (!draftWall) {
      return;
    }
    const pointer = getPointer();
    if (!pointer) {
      return;
    }
    setDraftWall((current) => {
      if (!current) {
        return current;
      }
      const [start] = current;
      if (!start) {
        return current;
      }
      return [start, { ...pointer, kind: 'anchor', id: 'draft-end' }];
    });
  }, [draftWall, getPointer]);

  const handleStageMouseUp = useCallback(() => {
    if (!draftWall) {
      return;
    }
    const [start, end] = draftWall;
    if (!start || !end) {
      setDraftWall(null);
      return;
    }
    const distance = Math.hypot(end.x - start.x, end.y - start.y);
    if (distance >= 0.25) {
      dispatch({ type: 'ADD_WALL', wall: createWall(state.selectedRoomId, start, end) });
    }
    setDraftWall(null);
  }, [dispatch, draftWall, state.selectedRoomId]);

  const handleStageContextMenu = useCallback((event: KonvaEventObject<PointerEvent>) => {
    event.evt.preventDefault();
    setDraftWall(null);
  }, []);

  const handleRoomDragEnd = useCallback(
    (room: Room, evt: KonvaEventObject<DragEvent>) => {
      const node = evt.target;
      const x = snapToStep(fromPixels(node.x()), 0.5);
      const y = snapToStep(fromPixels(node.y()), 0.5);
      dispatch({ type: 'UPDATE_ROOM', roomId: room.id, patch: { position: { x, y } } });
      node.position({ x: toPixels(x), y: toPixels(y) });
    },
    [dispatch],
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
        const newLength = clamp(pointerGrid.x - room.position.x, 1, room.area * 2);
        if (newLength <= 0) {
          return null;
        }
        const width = room.area / newLength;
        const lengthValue = Number(newLength.toFixed(3));
        const widthValue = Number(width.toFixed(3));
        dispatch({
          type: 'UPDATE_ROOM',
          roomId: room.id,
          patch: { length: lengthValue, width: widthValue },
        });
        return { length: lengthValue, width: widthValue };
      } else {
        const newWidth = clamp(pointerGrid.y - room.position.y, 1, room.area * 2);
        if (newWidth <= 0) {
          return null;
        }
        const length = room.area / newWidth;
        const widthValue = Number(newWidth.toFixed(3));
        const lengthValue = Number(length.toFixed(3));
        dispatch({
          type: 'UPDATE_ROOM',
          roomId: room.id,
          patch: { width: widthValue, length: lengthValue },
        });
        return { length: lengthValue, width: widthValue };
      }
    },
    [dispatch],
  );

  const handleWallClick = useCallback(
    (event: KonvaEventObject<MouseEvent>, wall: Wall) => {
      const pointer = getPointer();
      if (!pointer) {
        return;
      }
      if (state.activeTool === 'wall') {
        const { segmentIndex } = findNearestSegment(wall, pointer);
        dispatch({ type: 'REMOVE_WALL_SEGMENT', wallId: wall.id, segmentIndex });
        return;
      }
      if (state.activeTool === 'window') {
        const { segmentIndex, offset } = findNearestSegment(wall, pointer);
        const segmentLength = wallSegmentLength(wall, segmentIndex);
        if (segmentLength === 0) {
          return;
        }
        const item = createWindow(wall.id, wall.roomId, segmentIndex, Math.min(2, segmentLength * WINDOW_MAX_RATIO));
        const ratio = item.length / segmentLength;
        const baseOffset = clamp(offset - ratio / 2, 0, Math.max(0, 1 - ratio));
        dispatch({ type: 'ADD_WINDOW', window: { ...item, offset: baseOffset } });
        setSelectedWindowId(item.id);
        return;
      }
      if (state.activeTool === 'door') {
        const { segmentIndex, offset } = findNearestSegment(wall, pointer);
        const segmentLength = wallSegmentLength(wall, segmentIndex);
        if (segmentLength === 0) {
          return;
        }
        const door = createDoor(wall.id, wall.roomId, segmentIndex);
        const ratio = Math.min(DOOR_LENGTH, segmentLength) / segmentLength;
        const baseOffset = clamp(offset - ratio / 2, 0, Math.max(0, 1 - ratio));
        dispatch({ type: 'ADD_DOOR', door: { ...door, offset: baseOffset } });
        setSelectedDoorId(door.id);
      }
    },
    [dispatch, getPointer, state.activeTool],
  );

  const handleWallContextMenu = useCallback(
    (event: KonvaEventObject<PointerEvent>, wall: Wall) => {
      event.evt.preventDefault();
      const pointer = getPointer();
      if (!pointer) {
        return;
      }
      const { segmentIndex } = findNearestSegment(wall, pointer);
      const start = wall.nodes[segmentIndex];
      const end = wall.nodes[segmentIndex + 1];
      if (!start || !end) {
        return;
      }
      const { point } = projectPointToSegment(pointer, start, end);
      const updatedNodes = [...wall.nodes];
      updatedNodes.splice(segmentIndex + 1, 0, {
        id: `node-${Date.now()}`,
        x: point.x,
        y: point.y,
        kind: 'control',
      });
      dispatch({ type: 'UPDATE_WALL', wallId: wall.id, nodes: updatedNodes });
    },
    [dispatch, getPointer],
  );

  const handleWallNodeDrag = useCallback(
    (wall: Wall, nodeIndex: number) => (evt: KonvaEventObject<DragEvent>) => {
      const node = evt.target;
      const point = {
        x: fromPixels(node.x()),
        y: fromPixels(node.y()),
      };
      const nodes = wall.nodes.map((existing, index) => {
        if (index !== nodeIndex) {
          return existing;
        }
        if (existing.kind === 'anchor') {
          return {
            ...existing,
            x: snapToStep(point.x, 0.5),
            y: snapToStep(point.y, 0.5),
          };
        }
        return { ...existing, ...point };
      });
      dispatch({ type: 'UPDATE_WALL', wallId: wall.id, nodes });
      const updated = nodes[nodeIndex];
      node.position({ x: toPixels(updated.x), y: toPixels(updated.y) });
    },
    [dispatch],
  );

  const renderRooms = () => {
    return state.rooms.map((room) => {
      const x = toPixels(room.position.x);
      const y = toPixels(room.position.y);
      const width = toPixels(room.length);
      const height = toPixels(room.width);
      const isSelected = state.selectedRoomId === room.id;

      const center = {
        x: toPixels(room.position.x + room.length / 2),
        y: toPixels(room.position.y + room.width / 2),
      };

      const photoButtonSize = 40;

      return (
        <Group key={room.id} x={x} y={y} draggable onDragEnd={(evt) => handleRoomDragEnd(room, evt)}>
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
            x={center.x - x - photoButtonSize / 2}
            y={center.y - y - photoButtonSize / 2}
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
            <Text
              x={0}
              y={10}
              width={photoButtonSize}
              align="center"
              text="📷"
              fontSize={20}
            />
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

          {/* Horizontal handle */}
          <Circle
            x={width}
            y={height / 2}
            radius={8}
            fill="#4fa7ff"
            draggable
            onDragMove={(evt) => {
              const point = getPointer();
              if (!point) {
                return;
              }
              handleRoomResize(room, 'horizontal', point);
            }}
            onDragEnd={(evt) => {
              const point = getPointer();
              if (!point) {
                return;
              }
              const result = handleRoomResize(room, 'horizontal', point);
              const nextLength = result?.length ?? room.length;
              evt.target.position({ x: toPixels(nextLength), y: height / 2 });
            }}
          />

          {/* Vertical handle */}
          <Circle
            x={width / 2}
            y={height}
            radius={8}
            fill="#4fa7ff"
            draggable
            onDragMove={(evt) => {
              const point = getPointer();
              if (!point) {
                return;
              }
              handleRoomResize(room, 'vertical', point);
            }}
            onDragEnd={(evt) => {
              const point = getPointer();
              if (!point) {
                return;
              }
              const result = handleRoomResize(room, 'vertical', point);
              const nextWidth = result?.width ?? room.width;
              evt.target.position({ x: width / 2, y: toPixels(nextWidth) });
            }}
          />
        </Group>
      );
    });
  };

  const updateWindowOffset = useCallback(
    (windowItem: WindowItem, position: { x: number; y: number }) => {
      const wall = state.walls.find((item) => item.id === windowItem.wallId);
      if (!wall) {
        return null;
      }
      const start = wall.nodes[windowItem.segmentIndex];
      const end = wall.nodes[windowItem.segmentIndex + 1];
      if (!start || !end) {
        return null;
      }
      const segmentLength = wallSegmentLength(wall, windowItem.segmentIndex);
      if (segmentLength === 0) {
        return null;
      }
      const { offset } = projectPointToSegment(position, start, end);
      const ratio = windowItem.length / segmentLength;
      const newOffset = clamp(offset - ratio / 2, 0, Math.max(0, 1 - ratio));
      dispatch({ type: 'UPDATE_WINDOW', windowId: windowItem.id, patch: { offset: newOffset } });
      return newOffset;
    },
    [dispatch, state.walls],
  );

  const updateWindowLength = useCallback(
    (windowItem: WindowItem, pointer: { x: number; y: number }) => {
      const wall = state.walls.find((item) => item.id === windowItem.wallId);
      if (!wall) {
        return null;
      }
      const start = wall.nodes[windowItem.segmentIndex];
      const end = wall.nodes[windowItem.segmentIndex + 1];
      if (!start || !end) {
        return null;
      }
      const segmentLength = wallSegmentLength(wall, windowItem.segmentIndex);
      if (segmentLength === 0) {
        return null;
      }
      const { point } = projectPointToSegment(pointer, start, end);
      const baseStart = interpolatePoint(wall, windowItem.segmentIndex, windowItem.offset);
      const dx = point.x - baseStart.x;
      const dy = point.y - baseStart.y;
      const newLength = clamp(Math.hypot(dx, dy), 0.5, segmentLength * WINDOW_MAX_RATIO);
      dispatch({ type: 'UPDATE_WINDOW', windowId: windowItem.id, patch: { length: Number(newLength.toFixed(3)) } });
      return newLength;
    },
    [dispatch, state.walls],
  );

  const updateDoorOffset = useCallback(
    (door: DoorItem, position: { x: number; y: number }) => {
      const wall = state.walls.find((item) => item.id === door.wallId);
      if (!wall) {
        return null;
      }
      const start = wall.nodes[door.segmentIndex];
      const end = wall.nodes[door.segmentIndex + 1];
      if (!start || !end) {
        return null;
      }
      const segmentLength = wallSegmentLength(wall, door.segmentIndex);
      if (segmentLength === 0) {
        return null;
      }
      const { offset } = projectPointToSegment(position, start, end);
      const ratio = Math.min(DOOR_LENGTH, segmentLength) / segmentLength;
      const newOffset = clamp(offset - ratio / 2, 0, Math.max(0, 1 - ratio));
      dispatch({ type: 'UPDATE_DOOR', doorId: door.id, patch: { offset: newOffset } });
      return newOffset;
    },
    [dispatch, state.walls],
  );

  const renderWindows = () => {
    return state.windows.map((windowItem) => {
      const wall = state.walls.find((item) => item.id === windowItem.wallId);
      if (!wall) {
        return null;
      }
      const start = wall.nodes[windowItem.segmentIndex];
      const end = wall.nodes[windowItem.segmentIndex + 1];
      if (!start || !end) {
        return null;
      }
      const segmentLength = wallSegmentLength(wall, windowItem.segmentIndex);
      if (segmentLength === 0) {
        return null;
      }
      const length = Math.min(windowItem.length, segmentLength * WINDOW_MAX_RATIO);
      const actualOffset = clamp(windowItem.offset, 0, Math.max(0, 1 - length / segmentLength));
      const windowStart = interpolatePoint(wall, windowItem.segmentIndex, actualOffset);
      const direction = interpolatePoint(wall, windowItem.segmentIndex, actualOffset + length / segmentLength);
      const angle = segmentAngleDeg(wall, windowItem.segmentIndex);

      const isSelected = selectedWindowId === windowItem.id;

      return (
        <Group
          key={windowItem.id}
          x={toPixels(windowStart.x)}
          y={toPixels(windowStart.y)}
          rotation={angle}
          draggable
          onDragMove={(evt) => {
            const stage = evt.target.getStage();
            if (!stage) {
              return;
            }
            const pos = evt.target.position();
            const updatedOffset = updateWindowOffset(windowItem, {
              x: fromPixels(pos.x),
              y: fromPixels(pos.y),
            });
            const ratio = length / segmentLength;
            const effectiveOffset = updatedOffset ?? actualOffset;
            const startPoint = interpolatePoint(wall, windowItem.segmentIndex, effectiveOffset);
            evt.target.position({ x: toPixels(startPoint.x), y: toPixels(startPoint.y) });
          }}
          onClick={() => setSelectedWindowId(windowItem.id)}
        >
          <Line
            points={[0, 0, toPixels(direction.x - windowStart.x), toPixels(direction.y - windowStart.y)]}
            stroke={isSelected ? '#7cd3ff' : '#ffffff'}
            strokeWidth={6}
            lineCap="round"
          />
          <Circle
            x={0}
            y={0}
            radius={6}
            fill="#7cd3ff"
            draggable
            onDragMove={(evt) => {
              const pos = evt.target.getAbsolutePosition();
              const updatedOffset = updateWindowOffset(windowItem, {
                x: fromPixels(pos.x),
                y: fromPixels(pos.y),
              });
              if (updatedOffset !== null) {
                const startPoint = interpolatePoint(wall, windowItem.segmentIndex, updatedOffset);
                evt.target.absolutePosition({ x: toPixels(startPoint.x), y: toPixels(startPoint.y) });
              }
            }}
            onDragEnd={(evt) => {
              const pos = evt.target.getAbsolutePosition();
              const updatedOffset = updateWindowOffset(windowItem, {
                x: fromPixels(pos.x),
                y: fromPixels(pos.y),
              });
              if (updatedOffset !== null) {
                const startPoint = interpolatePoint(wall, windowItem.segmentIndex, updatedOffset);
                evt.target.absolutePosition({ x: toPixels(startPoint.x), y: toPixels(startPoint.y) });
              }
            }}
          />
          <Circle
            x={toPixels(direction.x - windowStart.x)}
            y={toPixels(direction.y - windowStart.y)}
            radius={6}
            fill="#7cd3ff"
            draggable
            onDragMove={(evt) => {
              const pos = evt.target.getAbsolutePosition();
              const updatedLength = updateWindowLength(windowItem, {
                x: fromPixels(pos.x),
                y: fromPixels(pos.y),
              });
              const nextLength = updatedLength ?? length;
              const startPoint = interpolatePoint(wall, windowItem.segmentIndex, actualOffset);
              const endPoint = interpolatePoint(
                wall,
                windowItem.segmentIndex,
                actualOffset + nextLength / segmentLength,
              );
              evt.target.absolutePosition({ x: toPixels(endPoint.x), y: toPixels(endPoint.y) });
            }}
            onDragEnd={(evt) => {
              const pos = evt.target.getAbsolutePosition();
              const updatedLength = updateWindowLength(windowItem, {
                x: fromPixels(pos.x),
                y: fromPixels(pos.y),
              });
              const nextLength = updatedLength ?? length;
              const startPoint = interpolatePoint(wall, windowItem.segmentIndex, actualOffset);
              const endPoint = interpolatePoint(
                wall,
                windowItem.segmentIndex,
                actualOffset + nextLength / segmentLength,
              );
              evt.target.absolutePosition({ x: toPixels(endPoint.x), y: toPixels(endPoint.y) });
            }}
          />
        </Group>
      );
    });
  };

  const renderDoors = () => {
    return state.doors.map((door) => {
      const wall = state.walls.find((item) => item.id === door.wallId);
      if (!wall) {
        return null;
      }
      const start = wall.nodes[door.segmentIndex];
      const end = wall.nodes[door.segmentIndex + 1];
      if (!start || !end) {
        return null;
      }
      const segmentLength = wallSegmentLength(wall, door.segmentIndex);
      if (segmentLength === 0) {
        return null;
      }
      const effectiveLength = Math.min(DOOR_LENGTH, segmentLength);
      const ratio = effectiveLength / segmentLength;
      const offset = clamp(door.offset, 0, Math.max(0, 1 - ratio));
      const doorStart = interpolatePoint(wall, door.segmentIndex, offset);
      const direction = interpolatePoint(wall, door.segmentIndex, offset + ratio);
      const angle = segmentAngleDeg(wall, door.segmentIndex);
      const isSelected = selectedDoorId === door.id;

      return (
        <Group
          key={door.id}
          x={toPixels(doorStart.x)}
          y={toPixels(doorStart.y)}
          rotation={angle}
          draggable
          onDragMove={(evt) => {
            const pos = evt.target.position();
            const updatedOffset = updateDoorOffset(door, {
              x: fromPixels(pos.x),
              y: fromPixels(pos.y),
            });
            const effectiveOffset = updatedOffset ?? offset;
            const startPoint = interpolatePoint(wall, door.segmentIndex, effectiveOffset);
            evt.target.position({ x: toPixels(startPoint.x), y: toPixels(startPoint.y) });
          }}
          onClick={() => setSelectedDoorId(door.id)}
        >
          <Line
            points={[0, 0, toPixels(direction.x - doorStart.x), toPixels(direction.y - doorStart.y)]}
            stroke={isSelected ? '#ffad66' : '#ffe3b3'}
            strokeWidth={6}
            lineCap="round"
          />
        </Group>
      );
    });
  };

  const renderWalls = () => {
    return state.walls.map((wall) => {
      const points = wall.nodes.flatMap((node) => [toPixels(node.x), toPixels(node.y)]);
      return (
        <Group key={wall.id}>
          <Line
            points={points}
            stroke="#ffffff"
            strokeWidth={4}
            lineCap="round"
            onClick={(event) => handleWallClick(event, wall)}
            onDblClick={() => dispatch({ type: 'REMOVE_WALL', wallId: wall.id })}
            onContextMenu={(event) => handleWallContextMenu(event, wall)}
          />
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
      );
    });
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Delete') {
        return;
      }
      if (state.selectedRoomId) {
        dispatch({ type: 'REMOVE_ROOM', roomId: state.selectedRoomId });
      } else if (selectedWindowId) {
        dispatch({ type: 'REMOVE_WINDOW', windowId: selectedWindowId });
        setSelectedWindowId(null);
      } else if (selectedDoorId) {
        dispatch({ type: 'REMOVE_DOOR', doorId: selectedDoorId });
        setSelectedDoorId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dispatch, selectedDoorId, selectedWindowId, state.selectedRoomId]);

  return (
    <div ref={containerRef} className="constructor-canvas">
      <Stage
        width={dimensions.width}
        height={dimensions.height}
        draggable={state.activeTool === 'pan'}
        x={stagePosition.x}
        y={stagePosition.y}
        onDragEnd={(evt) => setStagePosition({ x: evt.target.x(), y: evt.target.y() })}
        ref={stageRef}
        onMouseDown={handleStageMouseDown}
        onMouseMove={handleStageMouseMove}
        onMouseUp={handleStageMouseUp}
        onContextMenu={handleStageContextMenu}
      >
        <Layer>
          {gridLines.map((line, index) => (
            <Line
              key={index}
              points={line.points}
              stroke="rgba(255,255,255,0.05)"
              strokeWidth={1}
              listening={false}
            />
          ))}
        </Layer>
        <Layer>{renderRooms()}</Layer>
        <Layer>{renderWalls()}</Layer>
        <Layer>{renderWindows()}</Layer>
        <Layer>{renderDoors()}</Layer>
        {draftWall && (
          <Layer>
            <Line
              points={draftWall.flatMap((node) => [toPixels(node.x), toPixels(node.y)])}
              stroke="#7cd3ff"
              strokeWidth={3}
              dash={[10, 10]}
            />
          </Layer>
        )}
      </Stage>
    </div>
  );
};

export default GridCanvas;
