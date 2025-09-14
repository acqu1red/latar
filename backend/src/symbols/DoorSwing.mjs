/**
 * Swinging door component with door panel and opening arc
 */

import { colors, lineWidths } from '../design/tokens.mjs';
import { mmToSvg, getStrokeWidth } from '../utils/scale.mjs';
import { Rect, Arc, Line } from '../draw/primitives.mjs';

export function DoorSwing({
  x,
  y,
  width,
  depth,
  angle = 90,
  hinge,
  scale = '1:50'
}) {
  const elements = [];

  // Door opening (rectangular frame)
  const openingRect = Rect({
    x: x - width / 2,
    y: y - depth / 2,
    width: width,
    height: depth,
    fill: 'none',
    stroke: colors.ink,
    strokeWidth: lineWidths.normal,
    scale
  });
  elements.push(openingRect);

  // Calculate door panel position and rotation
  let panelX = x;
  let panelY = y;
  let panelWidth = width;
  let panelHeight = depth;
  let rotationAngle = 0;

  switch (hinge) {
    case 'left':
      panelX = x - width / 2;
      panelY = y;
      panelWidth = depth;
      panelHeight = 35; // 35mm door thickness
      rotationAngle = angle;
      break;
    case 'right':
      panelX = x + width / 2;
      panelY = y;
      panelWidth = depth;
      panelHeight = 35;
      rotationAngle = -angle;
      break;
    case 'top':
      panelX = x;
      panelY = y - depth / 2;
      panelWidth = 35;
      panelHeight = depth;
      rotationAngle = angle;
      break;
    case 'bottom':
      panelX = x;
      panelY = y + depth / 2;
      panelWidth = 35;
      panelHeight = depth;
      rotationAngle = -angle;
      break;
  }

  // Door panel
  const svgX = mmToSvg(panelX, scale);
  const svgY = mmToSvg(panelY, scale);
  const svgWidth = mmToSvg(panelWidth, scale);
  const svgHeight = mmToSvg(panelHeight, scale);
  const svgStrokeWidth = getStrokeWidth(lineWidths.thin, scale);

  const panelRect = `<rect x="${svgX - svgWidth/2}" y="${svgY - svgHeight/2}" width="${svgWidth}" height="${svgHeight}" fill="none" stroke="${colors.ink}" stroke-width="${svgStrokeWidth}" transform="rotate(${rotationAngle} ${svgX} ${svgY})"/>`;
  elements.push(panelRect);

  // Opening arc
  const arcRadius = Math.min(width, depth);
  const arcStartAngle = 0;
  const arcEndAngle = angle;

  const arc = Arc({
    x: panelX,
    y: panelY,
    radius: arcRadius,
    startAngle: arcStartAngle,
    endAngle: arcEndAngle,
    stroke: colors.ink,
    strokeWidth: lineWidths.thin,
    scale
  });
  elements.push(arc);

  return elements.join('\n');
}
