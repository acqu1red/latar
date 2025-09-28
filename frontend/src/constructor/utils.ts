import {
  GRID_SIZE,
  WORKSPACE_HEIGHT,
  WORKSPACE_WIDTH,
  WallNode,
  Wall,
} from './types';

export interface WallSegment {
  start: WallNode;
  end: WallNode;
  control: WallNode | null;
  startIndex: number;
  endIndex: number;
  controlIndex: number | null;
}

export const generateId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `id-${Math.random().toString(16).slice(2)}`;
};

export const snapToStep = (value: number, step = 0.5) => {
  return Math.round(value / step) * step;
};

export const clamp = (value: number, min: number, max: number) => {
  return Math.min(Math.max(value, min), max);
};

export const toPixels = (value: number) => value * GRID_SIZE;

export const fromPixels = (value: number) => value / GRID_SIZE;

export const ensureAnchorSnap = (node: WallNode) => {
  if (node.kind === 'control') {
    return node;
  }
  return {
    ...node,
    x: snapToStep(node.x, 0.5),
    y: snapToStep(node.y, 0.5),
  };
};

export const ensureWithinWorkspace = (value: number, max: number) => clamp(value, 0, max);

export const clampPointToWorkspace = (point: { x: number; y: number }) => ({
  x: ensureWithinWorkspace(point.x, WORKSPACE_WIDTH),
  y: ensureWithinWorkspace(point.y, WORKSPACE_HEIGHT),
});

const quadraticPoint = (start: WallNode, control: WallNode, end: WallNode, t: number) => {
  const oneMinusT = 1 - t;
  const x = oneMinusT * oneMinusT * start.x + 2 * oneMinusT * t * control.x + t * t * end.x;
  const y = oneMinusT * oneMinusT * start.y + 2 * oneMinusT * t * control.y + t * t * end.y;
  return { x, y };
};

const quadraticDerivative = (start: WallNode, control: WallNode, end: WallNode, t: number) => {
  const dx = 2 * (1 - t) * (control.x - start.x) + 2 * t * (end.x - control.x);
  const dy = 2 * (1 - t) * (control.y - start.y) + 2 * t * (end.y - control.y);
  return { dx, dy };
};

export const getWallSegments = (wall: Wall): WallSegment[] => {
  const segments: WallSegment[] = [];
  const nodes = wall.nodes;
  for (let i = 0; i < nodes.length - 1; ) {
    const current = nodes[i];
    const next = nodes[i + 1];
    if (!current || !next) {
      break;
    }
    if (current.kind === 'control') {
      i += 1;
      continue;
    }
    if (next.kind === 'control') {
      const anchorAfter = nodes[i + 2];
      if (!anchorAfter) {
        break;
      }
      segments.push({
        start: current,
        end: anchorAfter,
        control: next,
        startIndex: i,
        endIndex: i + 2,
        controlIndex: i + 1,
      });
      i += 2;
      continue;
    }
    segments.push({
      start: current,
      end: next,
      control: null,
      startIndex: i,
      endIndex: i + 1,
      controlIndex: null,
    });
    i += 1;
  }
  return segments;
};

export const wallSegmentLength = (segment: WallSegment, samples = 16) => {
  if (!segment.control) {
    const dx = segment.end.x - segment.start.x;
    const dy = segment.end.y - segment.start.y;
    return Math.hypot(dx, dy);
  }
  let length = 0;
  let prev = quadraticPoint(segment.start, segment.control, segment.end, 0);
  for (let i = 1; i <= samples; i += 1) {
    const t = i / samples;
    const next = quadraticPoint(segment.start, segment.control, segment.end, t);
    length += Math.hypot(next.x - prev.x, next.y - prev.y);
    prev = next;
  }
  return length;
};

export const interpolatePoint = (segment: WallSegment, offset: number) => {
  if (!segment.control) {
    return {
      x: segment.start.x + (segment.end.x - segment.start.x) * offset,
      y: segment.start.y + (segment.end.y - segment.start.y) * offset,
    };
  }
  return quadraticPoint(segment.start, segment.control, segment.end, offset);
};

export const segmentAngleDeg = (segment: WallSegment, offset = 0) => {
  if (!segment.control) {
    return (Math.atan2(segment.end.y - segment.start.y, segment.end.x - segment.start.x) * 180) / Math.PI;
  }
  const { dx, dy } = quadraticDerivative(segment.start, segment.control, segment.end, offset);
  return (Math.atan2(dy, dx) * 180) / Math.PI;
};

export const projectPointToSegment = (segment: WallSegment, point: { x: number; y: number }) => {
  if (!segment.control) {
    const dx = segment.end.x - segment.start.x;
    const dy = segment.end.y - segment.start.y;
    const lengthSq = dx * dx + dy * dy;
    if (lengthSq === 0) {
      return { point: segment.start, offset: 0 };
    }
    const t = ((point.x - segment.start.x) * dx + (point.y - segment.start.y) * dy) / lengthSq;
    const offset = clamp(t, 0, 1);
    return {
      point: {
        id: generateId(),
        x: segment.start.x + dx * offset,
        y: segment.start.y + dy * offset,
        kind: 'anchor',
      },
      offset,
    };
  }

  let bestOffset = 0;
  let bestDistance = Number.POSITIVE_INFINITY;
  let bestPoint = segment.start;
  const samples = 32;
  for (let i = 0; i <= samples; i += 1) {
    const t = i / samples;
    const samplePoint = quadraticPoint(segment.start, segment.control, segment.end, t);
    const distance = Math.hypot(samplePoint.x - point.x, samplePoint.y - point.y);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestOffset = t;
      bestPoint = { ...samplePoint, id: generateId(), kind: 'anchor' }; // Создаем WallNode
    }
  }
  return { point: bestPoint, offset: bestOffset };
};

export const findNearestSegment = (wall: Wall, point: { x: number; y: number }) => {
  const segments = getWallSegments(wall);
  let bestIndex = 0;
  let bestDistance = Number.POSITIVE_INFINITY;
  let bestOffset = 0;

  if (!segments.length) {
    return null;
  }

  segments.forEach((segment, index) => {
    const { point: projected, offset } = projectPointToSegment(segment, point);
    const distance = Math.hypot(projected.x - point.x, projected.y - point.y);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestIndex = index;
      bestOffset = offset;
    }
  });

  return { segmentIndex: bestIndex, offset: bestOffset, distance: bestDistance, segment: segments[bestIndex] };
};

export type FindNearestSegmentResult = ReturnType<typeof findNearestSegment>;

export type FindClosestWallSegmentResult = NonNullable<FindNearestSegmentResult> & { wall: Wall };

export const isFindClosestWallSegmentResult = (
  result: FindClosestWallSegmentResult | null,
): result is FindClosestWallSegmentResult => {
  return !!result;
};
