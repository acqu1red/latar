/**
 * Main SVG plan canvas component
 */

import { colors, lineWidths, opacity, type MM, type Scale } from '../design/tokens.js';
import { mmToSvg, getStrokeWidth, type Scale as ScaleType } from '../utils/scale.js';
import { Rect, Line, Circle } from '../draw/primitives.js';
import { 
  ZonesLayer, 
  WallsLayer, 
  FixturesLayer, 
  OpeningsLayer, 
  DoorsLayer, 
  FurnitureLayer, 
  AnnotationsLayer 
} from '../draw/layers.js';
import { Window } from '../symbols/Window.js';
import { DoorSwing, DoorPocket } from '../symbols/DoorSwing.js';
import { ClosetFront } from '../symbols/ClosetFront.js';
import { Furniture } from '../symbols/Furniture.js';
import { Bathtub, Toilet, Sink, Kitchen } from '../symbols/BathKitchen.js';

export interface RoomData {
  key: string;
  name: string;
  x: MM;
  y: MM;
  width: MM;
  height: MM;
  sqm: number;
  windows?: Array<{
    side: 'left' | 'right' | 'top' | 'bottom';
    pos: number;
    len: number;
  }>;
  doors?: Array<{
    side: 'left' | 'right' | 'top' | 'bottom';
    pos: number;
    len: number;
    type: 'entrance' | 'interior';
  }>;
  furniture?: Array<{
    kind: 'bed' | 'sofa' | 'tableRound' | 'tableRect' | 'chair' | 'desk' | 'tvStand';
    x: MM;
    y: MM;
    w: MM;
    h: MM;
    rotation?: number;
  }>;
  fixtures?: Array<{
    type: 'bathtub' | 'toilet' | 'sink' | 'kitchen';
    x: MM;
    y: MM;
    w: MM;
    h: MM;
  }>;
}

export interface PlanCanvasProps {
  rooms: RoomData[];
  totalSqm: number;
  scale?: Scale;
  width?: MM;
  height?: MM;
}

export function PlanCanvas({ 
  rooms, 
  totalSqm, 
  scale = '1:50',
  width = 8000,
  height = 6000
}: PlanCanvasProps): string {
  const svgWidth = mmToSvg(width, scale);
  const svgHeight = mmToSvg(height, scale);

  // Generate layers
  const zones = generateZones(rooms, scale);
  const walls = generateWalls(rooms, scale);
  const fixtures = generateFixtures(rooms, scale);
  const openings = generateOpenings(rooms, scale);
  const doors = generateDoors(rooms, scale);
  const furniture = generateFurniture(rooms, scale);
  const annotations = generateAnnotations(rooms, totalSqm, scale);

  const svgContent = `
<svg width="${svgWidth}" height="${svgHeight}" xmlns="http://www.w3.org/2000/svg" style="background-color: ${colors.white}; shape-rendering: crispEdges;">
  <defs>
    <pattern id="wallHatch" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <rect width="12" height="12" fill="${colors.ink}"/>
      <rect y="6" width="12" height="6" fill="#3C3C3C"/>
    </pattern>
  </defs>
  ${zones}
  ${walls}
  ${fixtures}
  ${openings}
  ${doors}
  ${furniture}
  ${annotations}
</svg>`;

  return svgContent;
}

function generateZones(rooms: RoomData[], scale: ScaleType): string {
  const zoneElements = rooms.map(room => {
    const zoneRect = Rect({
      x: room.x,
      y: room.y,
      width: room.width,
      height: room.height,
      fill: colors.paleFill,
      stroke: 'none',
      scale
    });
    return zoneRect;
  }).join('\n');

  return ZonesLayer(zoneElements);
}

function generateWalls(rooms: RoomData[], scale: ScaleType): string {
  const wallElements: string[] = [];

  // Generate walls for each room
  rooms.forEach(room => {
    // Room outline
    const roomRect = Rect({
      x: room.x,
      y: room.y,
      width: room.width,
      height: room.height,
      fill: colors.ink,
      stroke: colors.ink,
      strokeWidth: lineWidths.wall,
      scale
    });
    wallElements.push(roomRect);

    // Room interior (white fill)
    const interiorRect = Rect({
      x: room.x + lineWidths.wall,
      y: room.y + lineWidths.wall,
      width: room.width - 2 * lineWidths.wall,
      height: room.height - 2 * lineWidths.wall,
      fill: colors.white,
      stroke: 'none',
      scale
    });
    wallElements.push(interiorRect);
  });

  return WallsLayer(wallElements.join('\n'));
}

function generateFixtures(rooms: RoomData[], scale: ScaleType): string {
  const fixtureElements: string[] = [];

  rooms.forEach(room => {
    if (room.fixtures) {
      room.fixtures.forEach(fixture => {
        switch (fixture.type) {
          case 'bathtub':
            fixtureElements.push(Bathtub(fixture, scale));
            break;
          case 'toilet':
            fixtureElements.push(Toilet(fixture, scale));
            break;
          case 'sink':
            fixtureElements.push(Sink(fixture, scale));
            break;
          case 'kitchen':
            fixtureElements.push(Kitchen(fixture, scale));
            break;
        }
      });
    }
  });

  return FixturesLayer(fixtureElements.join('\n'));
}

function generateOpenings(rooms: RoomData[], scale: ScaleType): string {
  const openingElements: string[] = [];

  rooms.forEach(room => {
    if (room.windows) {
      room.windows.forEach(window => {
        const windowX = room.x + (window.side === 'left' ? 0 : room.width);
        const windowY = room.y + (window.side === 'top' ? 0 : room.height);
        const windowLength = window.len * (window.side === 'left' || window.side === 'right' ? room.height : room.width);
        
        const windowSpec = {
          x: windowX,
          y: windowY,
          length: windowLength,
          wallThickness: lineWidths.wall * 2,
          withRadiator: true,
          curtain: { amplitude: 6, period: 30 },
          scale
        };

        openingElements.push(Window(windowSpec));
      });
    }
  });

  return OpeningsLayer(openingElements.join('\n'));
}

function generateDoors(rooms: RoomData[], scale: ScaleType): string {
  const doorElements: string[] = [];

  rooms.forEach(room => {
    if (room.doors) {
      room.doors.forEach(door => {
        const doorX = room.x + (door.side === 'left' ? 0 : room.width);
        const doorY = room.y + (door.side === 'top' ? 0 : room.height);
        const doorWidth = door.len * (door.side === 'left' || door.side === 'right' ? room.height : room.width);
        
        const doorSpec = {
          x: doorX,
          y: doorY,
          width: doorWidth,
          depth: 100, // 100mm door depth
          hinge: door.side,
          scale
        };

        if (door.type === 'entrance') {
          doorElements.push(DoorSwing(doorSpec));
        } else {
          doorElements.push(DoorPocket(doorSpec));
        }
      });
    }
  });

  return DoorsLayer(doorElements.join('\n'));
}

function generateFurniture(rooms: RoomData[], scale: ScaleType): string {
  const furnitureElements: string[] = [];

  rooms.forEach(room => {
    if (room.furniture) {
      room.furniture.forEach(item => {
        const furnitureSpec = {
          ...item,
          scale
        };
        furnitureElements.push(Furniture(furnitureSpec));
      });
    }
  });

  return FurnitureLayer(furnitureElements.join('\n'));
}

function generateAnnotations(rooms: RoomData[], totalSqm: number, scale: ScaleType): string {
  const annotationElements: string[] = [];

  // Room labels
  rooms.forEach(room => {
    const labelX = room.x + room.width / 2;
    const labelY = room.y + room.height / 2;
    const fontSize = getStrokeWidth(2.6, scale);
    
    const roomLabel = `<text x="${mmToSvg(labelX, scale)}" y="${mmToSvg(labelY, scale)}" text-anchor="middle" font-family="${fonts.family}" font-size="${fontSize}" font-weight="700" fill="${colors.ink}">${room.name}</text>`;
    annotationElements.push(roomLabel);

    // Area label
    const areaLabel = `<text x="${mmToSvg(labelX, scale)}" y="${mmToSvg(labelY + 20, scale)}" text-anchor="middle" font-family="${fonts.family}" font-size="${fontSize * 0.7}" fill="${colors.ink}">${room.sqm.toFixed(1)} м²</text>`;
    annotationElements.push(areaLabel);
  });

  // Total area
  const totalAreaLabel = `<text x="${mmToSvg(50, scale)}" y="${mmToSvg(50, scale)}" font-family="${fonts.family}" font-size="${getStrokeWidth(3, scale)}" font-weight="800" fill="${colors.ink}">Общая площадь: ${totalSqm.toFixed(1)} м²</text>`;
  annotationElements.push(totalAreaLabel);

  return AnnotationsLayer(annotationElements.join('\n'));
}
