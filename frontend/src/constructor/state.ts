import {
  ConstructorState,
  DoorItem,
  FloatingDoor,
  FloatingWindow,
  Room,
  RoomPhoto,
  Tool,
  Wall,
  WallNode,
  WindowItem,
} from './types';
import { ensureAnchorSnap, generateId } from './utils';

export const initialState: ConstructorState = {
  rooms: [],
  walls: [],
  windows: [],
  doors: [],
  floatingWindows: [],
  floatingDoors: [],
  activeTool: 'select',
  selectedRoomId: null,
  planImageUrl: null,
  isGenerating: false,
};

export type ConstructorAction =
  | { type: 'SET_TOOL'; tool: Tool }
  | { type: 'SET_SELECTED_ROOM'; roomId: string | null }
  | { type: 'ADD_ROOM'; room: Room }
  | { type: 'UPDATE_ROOM'; roomId: string; patch: Partial<Room> }
  | { type: 'REMOVE_ROOM'; roomId: string }
  | { type: 'UPSERT_PHOTO'; roomId: string; photo: RoomPhoto }
  | { type: 'REMOVE_PHOTO'; roomId: string; photoId: string }
  | { type: 'ADD_WALL'; wall: Wall }
  | { type: 'UPDATE_WALL'; wallId: string; nodes: WallNode[] }
  | { type: 'REMOVE_WALL'; wallId: string }
  | { type: 'REMOVE_WALL_SEGMENT'; wallId: string; segmentIndex: number }
  | { type: 'ADD_WINDOW'; window: WindowItem }
  | { type: 'UPDATE_WINDOW'; windowId: string; patch: Partial<WindowItem> }
  | { type: 'REMOVE_WINDOW'; windowId: string }
  | { type: 'ADD_DOOR'; door: DoorItem }
  | { type: 'UPDATE_DOOR'; doorId: string; patch: Partial<DoorItem> }
  | { type: 'REMOVE_DOOR'; doorId: string }
  | { type: 'ADD_FLOATING_WINDOW'; window: FloatingWindow }
  | { type: 'UPDATE_FLOATING_WINDOW'; windowId: string; patch: Partial<FloatingWindow> }
  | { type: 'REMOVE_FLOATING_WINDOW'; windowId: string }
  | { type: 'ADD_FLOATING_DOOR'; door: FloatingDoor }
  | { type: 'UPDATE_FLOATING_DOOR'; doorId: string; patch: Partial<FloatingDoor> }
  | { type: 'REMOVE_FLOATING_DOOR'; doorId: string }
  | { type: 'SET_PLAN_IMAGE'; url: string | null }
  | { type: 'SET_IS_GENERATING'; value: boolean };

const purgeRoomRelations = (state: ConstructorState, roomId: string) => {
  const walls = state.walls.filter((wall) => wall.roomId !== roomId);
  const windows = state.windows.filter((item) => item.roomId !== roomId);
  const doors = state.doors.filter((item) => item.roomId !== roomId);
  return { walls, windows, doors };
};

export const constructorReducer = (
  state: ConstructorState,
  action: ConstructorAction,
): ConstructorState => {
  switch (action.type) {
    case 'SET_TOOL':
      return { ...state, activeTool: action.tool };
    case 'SET_SELECTED_ROOM':
      return { ...state, selectedRoomId: action.roomId };
    case 'ADD_ROOM':
      return {
        ...state,
        rooms: [...state.rooms, action.room],
        selectedRoomId: action.room.id,
      };
    case 'UPDATE_ROOM':
      return {
        ...state,
        rooms: state.rooms.map((room) =>
          room.id === action.roomId ? { ...room, ...action.patch } : room,
        ),
      };
    case 'REMOVE_ROOM': {
      const rooms = state.rooms.filter((room) => room.id !== action.roomId);
      const { walls, windows, doors } = purgeRoomRelations(state, action.roomId);
      const selectedRoomId = state.selectedRoomId === action.roomId ? null : state.selectedRoomId;
      return { ...state, rooms, walls, windows, doors, selectedRoomId };
    }
    case 'UPSERT_PHOTO':
      return {
        ...state,
        rooms: state.rooms.map((room) => {
          if (room.id !== action.roomId) {
            return room;
          }
          const existing = room.photos.find((photo) => photo.id === action.photo.id);
          if (existing) {
            return {
              ...room,
              photos: room.photos.map((p) => (p.id === action.photo.id ? action.photo : p)),
            };
          }
          return {
            ...room,
            photos: [...room.photos, action.photo],
          };
        }),
      };
    case 'REMOVE_PHOTO':
      return {
        ...state,
        rooms: state.rooms.map((room) =>
          room.id === action.roomId
            ? { ...room, photos: room.photos.filter((photo) => photo.id !== action.photoId) }
            : room,
        ),
      };
    case 'ADD_WALL':
      return { ...state, walls: [...state.walls, action.wall] };
    case 'UPDATE_WALL':
      return {
        ...state,
        walls: state.walls.map((wall) =>
          wall.id === action.wallId
            ? { ...wall, nodes: action.nodes.map((node) => ensureAnchorSnap(node)) }
            : wall,
        ),
      };
    case 'REMOVE_WALL':
      return {
        ...state,
        walls: state.walls.filter((wall) => wall.id !== action.wallId),
        windows: state.windows.filter((window) => window.wallId !== action.wallId),
        doors: state.doors.filter((door) => door.wallId !== action.wallId),
      };
    case 'REMOVE_WALL_SEGMENT':
      return {
        ...state,
        walls: state.walls
          .map((wall) => {
            if (wall.id !== action.wallId) {
              return wall;
            }
            if (wall.nodes.length <= 2) {
              return wall;
            }
            const nextNodes = [...wall.nodes];
            nextNodes.splice(action.segmentIndex + 1, 1);
            return {
              ...wall,
              nodes: nextNodes,
            };
          })
          .filter((wall) => wall.nodes.length >= 2),
        windows: state.windows
          .filter((window) => !(window.wallId === action.wallId && window.segmentIndex === action.segmentIndex))
          .map((window) =>
            window.wallId === action.wallId && window.segmentIndex !== null && window.segmentIndex > action.segmentIndex
              ? { ...window, segmentIndex: window.segmentIndex - 1 }
              : window,
          ),
        doors: state.doors
          .filter((door) => !(door.wallId === action.wallId && door.segmentIndex === action.segmentIndex))
          .map((door) =>
            door.wallId === action.wallId && door.segmentIndex !== null && door.segmentIndex > action.segmentIndex
              ? { ...door, segmentIndex: door.segmentIndex - 1 }
              : door,
          ),
      };
    case 'ADD_WINDOW':
      return { ...state, windows: [...state.windows, action.window] };
    case 'UPDATE_WINDOW':
      return {
        ...state,
        windows: state.windows.map((item) =>
          item.id === action.windowId ? { ...item, ...action.patch } : item,
        ),
      };
    case 'REMOVE_WINDOW':
      return {
        ...state,
        windows: state.windows.filter((item) => item.id !== action.windowId),
      };
    case 'ADD_FLOATING_WINDOW':
      return { ...state, floatingWindows: [...state.floatingWindows, action.window] };
    case 'UPDATE_FLOATING_WINDOW':
      return {
        ...state,
        floatingWindows: state.floatingWindows.map((item) =>
          item.id === action.windowId ? { ...item, ...action.patch } : item,
        ),
      };
    case 'REMOVE_FLOATING_WINDOW':
      return {
        ...state,
        floatingWindows: state.floatingWindows.filter((item) => item.id !== action.windowId),
      };
    case 'ADD_DOOR':
      return { ...state, doors: [...state.doors, action.door] };
    case 'UPDATE_DOOR':
      return {
        ...state,
        doors: state.doors.map((item) =>
          item.id === action.doorId ? { ...item, ...action.patch } : item,
        ),
      };
    case 'REMOVE_DOOR':
      return {
        ...state,
        doors: state.doors.filter((item) => item.id !== action.doorId),
      };
    case 'ADD_FLOATING_DOOR':
      return { ...state, floatingDoors: [...state.floatingDoors, action.door] };
    case 'UPDATE_FLOATING_DOOR':
      return {
        ...state,
        floatingDoors: state.floatingDoors.map((item) =>
          item.id === action.doorId ? { ...item, ...action.patch } : item,
        ),
      };
    case 'REMOVE_FLOATING_DOOR':
      return {
        ...state,
        floatingDoors: state.floatingDoors.filter((item) => item.id !== action.doorId),
      };
    case 'SET_PLAN_IMAGE':
      return { ...state, planImageUrl: action.url };
    case 'SET_IS_GENERATING':
      return { ...state, isGenerating: action.value };
    default:
      return state;
  }
};

export const createRoom = (area: number, position: { x: number; y: number }): Room => {
  const length = Math.sqrt(area);
  const snappedLength = Math.max(1, Math.round(length * 2) / 2);
  const width = Math.round((area / snappedLength) * 2) / 2;
  return {
    id: generateId(),
    label: 'Комната',
    area,
    length: snappedLength,
    width,
    position,
    photos: [],
  };
};

export const createWall = (roomId: string | null, start: WallNode, end: WallNode): Wall => ({
  id: generateId(),
  roomId,
  nodes: [ensureAnchorSnap({ ...start, kind: 'anchor' }), ensureAnchorSnap({ ...end, kind: 'anchor' })],
});

interface WindowOptions {
  wallId?: string | null;
  roomId?: string | null;
  segmentIndex?: number | null;
  length?: number;
  offset?: number;
  rotation?: number;
}

interface DoorOptions {
  wallId?: string | null;
  roomId?: string | null;
  segmentIndex?: number | null;
  offset?: number;
  rotation?: number;
}

export const createWindow = (options: WindowOptions = {}): WindowItem => ({
  id: generateId(),
  wallId: options.wallId ?? null,
  roomId: options.roomId ?? null,
  segmentIndex: options.segmentIndex ?? null,
  offset: options.offset ?? 0,
  length: options.length ?? 1.5,
  rotation: options.rotation ?? 0,
});

export const createDoor = (options: DoorOptions = {}): DoorItem => ({
  id: generateId(),
  wallId: options.wallId ?? null,
  roomId: options.roomId ?? null,
  segmentIndex: options.segmentIndex ?? null,
  offset: options.offset ?? 0,
  rotation: options.rotation ?? 0,
});

export const createFloatingWindow = (position: { x: number; y: number }, length = 1.5): FloatingWindow => ({
  id: generateId(),
  position,
  length,
  rotation: 0,
});

export const createFloatingDoor = (position: { x: number; y: number }): FloatingDoor => ({
  id: generateId(),
  position,
  rotation: 0,
});
