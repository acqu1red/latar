export const GRID_SIZE = 48;
export const WORKSPACE_WIDTH = 40; // in grid cells
export const WORKSPACE_HEIGHT = 26; // in grid cells
export const WINDOW_MAX_RATIO = 0.8;
export const DOOR_LENGTH = 1.2;

export type Tool = 'select' | 'room' | 'wall' | 'window' | 'door' | 'pan';

export interface Vector2 {
  x: number;
  y: number;
}

export interface RoomPhoto {
  id: string;
  roomId: string;
  name: string;
  url: string;
}

export interface Room {
  id: string;
  label: string;
  area: number;
  length: number;
  width: number;
  position: Vector2;
  photos: RoomPhoto[];
}

export type WallNodeKind = 'anchor' | 'control';

export interface WallNode {
  id: string;
  x: number;
  y: number;
  kind: WallNodeKind;
}

export interface Wall {
  id: string;
  roomId: string | null;
  nodes: WallNode[];
}

export interface WindowItem {
  id: string;
  roomId: string | null;
  wallId: string | null;
  segmentIndex: number | null;
  offset: number;
  length: number;
  rotation: number;
}

export interface DoorItem {
  id: string;
  roomId: string | null;
  wallId: string | null;
  segmentIndex: number | null;
  offset: number;
  rotation: number;
}

export interface FloatingWindow {
  id: string;
  position: Vector2;
  length: number;
  rotation: number;
}

export interface FloatingDoor {
  id: string;
  position: Vector2;
  rotation: number;
}

export interface ConstructorState {
  rooms: Room[];
  walls: Wall[];
  windows: WindowItem[];
  doors: DoorItem[];
  floatingWindows: FloatingWindow[];
  floatingDoors: FloatingDoor[];
  activeTool: Tool;
  selectedRoomId: string | null;
  planImageUrl: string | null;
  isGenerating: boolean;
}
