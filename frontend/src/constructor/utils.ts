import { GRID_SIZE, WallNode, Wall } from './types';

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

export const wallSegmentLength = (wall: Wall, segmentIndex: number) => {
  const start = wall.nodes[segmentIndex];
  const end = wall.nodes[segmentIndex + 1];
  if (!start || !end) {
    return 0;
  }
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  return Math.hypot(dx, dy);
};

export const interpolatePoint = (wall: Wall, segmentIndex: number, offset: number) => {
  const start = wall.nodes[segmentIndex];
  const end = wall.nodes[segmentIndex + 1];
  if (!start || !end) {
    return { x: 0, y: 0 };
  }
  return {
    x: start.x + (end.x - start.x) * offset,
    y: start.y + (end.y - start.y) * offset,
  };
};

export const segmentAngleDeg = (wall: Wall, segmentIndex: number) => {
  const start = wall.nodes[segmentIndex];
  const end = wall.nodes[segmentIndex + 1];
  if (!start || !end) {
    return 0;
  }
  return (Math.atan2(end.y - start.y, end.x - start.x) * 180) / Math.PI;
};

export const projectPointToSegment = (
  point: { x: number; y: number },
  start: { x: number; y: number },
  end: { x: number; y: number },
) => {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const lengthSq = dx * dx + dy * dy;
  if (lengthSq === 0) {
    return { point: start, offset: 0 };
  }
  const t = ((point.x - start.x) * dx + (point.y - start.y) * dy) / lengthSq;
  const offset = clamp(t, 0, 1);
  return {
    point: {
      x: start.x + dx * offset,
      y: start.y + dy * offset,
    },
    offset,
  };
};

export const findNearestSegment = (wall: Wall, point: { x: number; y: number }) => {
  let bestIndex = 0;
  let bestDistance = Number.POSITIVE_INFINITY;
  let bestOffset = 0;

  for (let i = 0; i < wall.nodes.length - 1; i += 1) {
    const start = wall.nodes[i];
    const end = wall.nodes[i + 1];
    const { point: projected, offset } = projectPointToSegment(point, start, end);
    const distance = Math.hypot(projected.x - point.x, projected.y - point.y);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestIndex = i;
      bestOffset = offset;
    }
  }

  return { segmentIndex: bestIndex, offset: bestOffset, distance: bestDistance };
};
