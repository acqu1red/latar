/**
 * Pocket/sliding door component
 */

import { colors, lineWidths } from '../design/tokens.mjs';
import { mmToSvg, getStrokeWidth } from '../utils/scale.mjs';
import { Rect, Line } from '../draw/primitives.mjs';

export function DoorPocket({
  x,
  y,
  width,
  pocket,
  scale = '1:50'
}) {
  const elements = [];

  // Door opening (rectangular frame)
  const openingRect = Rect({
    x: x - width / 2,
    y: y - 100, // 100mm depth
    width: width,
    height: 200, // 200mm total depth
    fill: 'none',
    stroke: colors.ink,
    strokeWidth: lineWidths.normal,
    scale
  });
  elements.push(openingRect);

  // Door panels (narrow rectangles)
  const panelWidth = 50; // 50mm panel width
  const panelHeight = 200; // 200mm panel height

  if (pocket === 'left' || pocket === 'both') {
    const leftPanel = Rect({
      x: x - width / 2,
      y: y - panelHeight / 2,
      width: panelWidth,
      height: panelHeight,
      fill: 'none',
      stroke: colors.ink,
      strokeWidth: lineWidths.thin,
      scale
    });
    elements.push(leftPanel);
  }

  if (pocket === 'right' || pocket === 'both') {
    const rightPanel = Rect({
      x: x + width / 2 - panelWidth,
      y: y - panelHeight / 2,
      width: panelWidth,
      height: panelHeight,
      fill: 'none',
      stroke: colors.ink,
      strokeWidth: lineWidths.thin,
      scale
    });
    elements.push(rightPanel);
  }

  // Track/guide line
  const trackLength = width + 100; // 100mm extension
  const trackLine = Line({
    x1: x - trackLength / 2,
    y1: y,
    x2: x + trackLength / 2,
    y2: y,
    stroke: colors.ink,
    strokeWidth: lineWidths.hair,
    scale
  });
  elements.push(trackLine);

  return elements.join('\n');
}
