/**
 * Built-in closet front component
 */

import { colors, lineWidths } from '../design/tokens.mjs';
import { mmToSvg, getStrokeWidth } from '../utils/scale.mjs';
import { Rect, Line } from '../draw/primitives.mjs';

export function ClosetFront({
  x,
  y,
  width,
  height,
  scale = '1:50'
}) {
  const elements = [];

  // Closet outline
  const outlineRect = Rect({
    x: x - width / 2,
    y: y - height / 2,
    width: width,
    height: height,
    fill: 'none',
    stroke: colors.ink,
    strokeWidth: lineWidths.normal,
    scale
  });
  elements.push(outlineRect);

  // Vertical hatching lines
  const hatchSpacing = 25; // 25mm spacing
  const hatchCount = Math.floor(width / hatchSpacing);
  
  for (let i = 1; i < hatchCount; i++) {
    const hatchX = x - width / 2 + i * hatchSpacing;
    const hatchLine = Line({
      x1: hatchX,
      y1: y - height / 2 + 10, // 10mm margin from top
      x2: hatchX,
      y2: y + height / 2 - 10, // 10mm margin from bottom
      stroke: colors.ink,
      strokeWidth: lineWidths.hair,
      scale
    });
    elements.push(hatchLine);
  }

  return elements.join('\n');
}
