/**
 * Basic SVG primitives for floor plan drawing
 */

import { colors, lineWidths } from '../design/tokens.mjs';
import { mmToSvg, getStrokeWidth } from '../utils/scale.mjs';

export function Line({ 
  x1, y1, x2, y2, 
  stroke = colors.ink, 
  strokeWidth = lineWidths.normal,
  strokeDasharray,
  scale = '1:50'
}) {
  const svgX1 = mmToSvg(x1, scale);
  const svgY1 = mmToSvg(y1, scale);
  const svgX2 = mmToSvg(x2, scale);
  const svgY2 = mmToSvg(y2, scale);
  const svgStrokeWidth = getStrokeWidth(strokeWidth, scale);

  return `<line x1="${svgX1}" y1="${svgY1}" x2="${svgX2}" y2="${svgY2}" stroke="${stroke}" stroke-width="${svgStrokeWidth}"${strokeDasharray ? ` stroke-dasharray="${strokeDasharray}"` : ''}/>`;
}

export function Arc({ 
  x, y, radius, startAngle, endAngle,
  stroke = colors.ink,
  strokeWidth = lineWidths.normal,
  fill = 'none',
  scale = '1:50'
}) {
  const svgX = mmToSvg(x, scale);
  const svgY = mmToSvg(y, scale);
  const svgRadius = mmToSvg(radius, scale);
  const svgStrokeWidth = getStrokeWidth(strokeWidth, scale);

  // Convert angles to radians
  const startRad = (startAngle * Math.PI) / 180;
  const endRad = (endAngle * Math.PI) / 180;

  // Calculate start and end points
  const startX = svgX + svgRadius * Math.cos(startRad);
  const startY = svgY + svgRadius * Math.sin(startRad);
  const endX = svgX + svgRadius * Math.cos(endRad);
  const endY = svgY + svgRadius * Math.sin(endRad);

  // Large arc flag
  const largeArcFlag = Math.abs(endAngle - startAngle) > 180 ? 1 : 0;

  const pathData = `M ${startX} ${startY} A ${svgRadius} ${svgRadius} 0 ${largeArcFlag} 1 ${endX} ${endY}`;

  return `<path d="${pathData}" stroke="${stroke}" stroke-width="${svgStrokeWidth}" fill="${fill}"/>`;
}

export function Rect({ 
  x, y, width, height,
  fill = 'none',
  stroke = colors.ink,
  strokeWidth = lineWidths.normal,
  rx,
  ry,
  scale = '1:50'
}) {
  const svgX = mmToSvg(x, scale);
  const svgY = mmToSvg(y, scale);
  const svgWidth = mmToSvg(width, scale);
  const svgHeight = mmToSvg(height, scale);
  const svgStrokeWidth = getStrokeWidth(strokeWidth, scale);
  const svgRx = rx ? mmToSvg(rx, scale) : undefined;
  const svgRy = ry ? mmToSvg(ry, scale) : undefined;

  return `<rect x="${svgX}" y="${svgY}" width="${svgWidth}" height="${svgHeight}" fill="${fill}" stroke="${stroke}" stroke-width="${svgStrokeWidth}"${svgRx ? ` rx="${svgRx}"` : ''}${svgRy ? ` ry="${svgRy}"` : ''}/>`;
}

export function Circle({ 
  x, y, radius,
  fill = 'none',
  stroke = colors.ink,
  strokeWidth = lineWidths.normal,
  scale = '1:50'
}) {
  const svgX = mmToSvg(x, scale);
  const svgY = mmToSvg(y, scale);
  const svgRadius = mmToSvg(radius, scale);
  const svgStrokeWidth = getStrokeWidth(strokeWidth, scale);

  return `<circle cx="${svgX}" cy="${svgY}" r="${svgRadius}" fill="${fill}" stroke="${stroke}" stroke-width="${svgStrokeWidth}"/>`;
}

export function Polyline({ 
  points,
  fill = 'none',
  stroke = colors.ink,
  strokeWidth = lineWidths.normal,
  strokeDasharray,
  scale = '1:50'
}) {
  const svgPoints = points.map(p => `${mmToSvg(p.x, scale)},${mmToSvg(p.y, scale)}`).join(' ');
  const svgStrokeWidth = getStrokeWidth(strokeWidth, scale);

  return `<polyline points="${svgPoints}" fill="${fill}" stroke="${stroke}" stroke-width="${svgStrokeWidth}"${strokeDasharray ? ` stroke-dasharray="${strokeDasharray}"` : ''}/>`;
}
