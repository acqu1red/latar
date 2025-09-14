/**
 * Window component with sill, radiator, and curtains
 */

import { colors, lineWidths } from '../design/tokens.mjs';
import { mmToSvg, getStrokeWidth } from '../utils/scale.mjs';
import { Rect, Line, Polyline } from '../draw/primitives.mjs';

export function Window({
  x,
  y,
  length,
  wallThickness,
  inwardOffset = wallThickness / 3,
  withRadiator = false,
  curtain = { amplitude: 6, period: 30 },
  scale = '1:50'
}) {
  const elements = [];

  // Window opening in wall
  const openingRect = Rect({
    x: x - wallThickness / 2,
    y: y,
    width: wallThickness,
    height: length,
    fill: colors.white,
    stroke: colors.ink,
    strokeWidth: lineWidths.wall,
    scale
  });
  elements.push(openingRect);

  // Window frame (thin rectangle inside wall)
  const frameRect = Rect({
    x: x - wallThickness / 2 + inwardOffset,
    y: y + inwardOffset,
    width: wallThickness - 2 * inwardOffset,
    height: length - 2 * inwardOffset,
    fill: 'none',
    stroke: colors.ink,
    strokeWidth: lineWidths.thin,
    scale
  });
  elements.push(frameRect);

  // Window sill (inside room)
  const sillLength = length - 2 * inwardOffset;
  const sillLine = Line({
    x1: x - wallThickness / 2 + inwardOffset,
    y1: y + length - inwardOffset,
    x2: x + wallThickness / 2 - inwardOffset,
    y2: y + length - inwardOffset,
    stroke: colors.ink,
    strokeWidth: lineWidths.hair,
    scale
  });
  elements.push(sillLine);

  // Radiator under window
  if (withRadiator) {
    const radiatorWidth = 200; // 200mm
    const radiatorHeight = 100; // 100mm
    const radiatorY = y + length + 50; // 50mm below window

    // Radiator body
    const radiatorRect = Rect({
      x: x - radiatorWidth / 2,
      y: radiatorY,
      width: radiatorWidth,
      height: radiatorHeight,
      fill: 'none',
      stroke: colors.ink,
      strokeWidth: lineWidths.hair,
      scale
    });
    elements.push(radiatorRect);

    // Diagonal hatching
    const hatchSpacing = 3; // 3mm spacing
    const hatchCount = Math.floor(radiatorWidth / hatchSpacing);
    for (let i = 0; i < hatchCount; i++) {
      const hatchX = x - radiatorWidth / 2 + i * hatchSpacing;
      const hatchLine = Line({
        x1: hatchX,
        y1: radiatorY,
        x2: hatchX + radiatorHeight,
        y2: radiatorY + radiatorHeight,
        stroke: colors.ink,
        strokeWidth: lineWidths.hair,
        scale
      });
      elements.push(hatchLine);
    }
  }

  // Curtains (wavy line)
  const curtainY = y + length / 2;
  const curtainPoints = generateWavyLine(
    x - wallThickness / 2 + inwardOffset,
    curtainY,
    x + wallThickness / 2 - inwardOffset,
    curtainY,
    curtain.amplitude,
    curtain.period,
    scale
  );
  
  const curtainLine = Polyline({
    points: curtainPoints,
    fill: 'none',
    stroke: colors.ink,
    strokeWidth: lineWidths.thin,
    scale
  });
  elements.push(curtainLine);

  return elements.join('\n');
}

function generateWavyLine(
  x1,
  y1,
  x2,
  y2,
  amplitude,
  period,
  scale
) {
  const points = [];
  const length = Math.abs(x2 - x1);
  const step = 2; // 2mm step for smooth curve
  
  for (let x = x1; x <= x2; x += step) {
    const normalizedX = (x - x1) / length;
    const waveY = y1 + amplitude * Math.sin((2 * Math.PI * normalizedX * length) / period);
    points.push({ x, y: waveY });
  }
  
  return points;
}
