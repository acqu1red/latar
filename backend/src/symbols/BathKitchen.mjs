/**
 * Bathroom and kitchen fixtures
 */

import { colors, lineWidths } from '../design/tokens.mjs';
import { mmToSvg, getStrokeWidth } from '../utils/scale.mjs';
import { Rect, Circle, Line } from '../draw/primitives.mjs';

export function Bathtub({ x, y, width, height, scale = '1:50' }) {
  const elements = [];

  // Bathtub outline
  const outlineRect = Rect({
    x: x - width / 2,
    y: y - height / 2,
    width: width,
    height: height,
    fill: colors.white,
    stroke: colors.ink,
    strokeWidth: lineWidths.normal,
    scale
  });
  elements.push(outlineRect);

  // Inner oval
  const innerWidth = width * 0.8;
  const innerHeight = height * 0.6;
  const innerEllipse = `<ellipse cx="${mmToSvg(x, scale)}" cy="${mmToSvg(y, scale)}" rx="${mmToSvg(innerWidth/2, scale)}" ry="${mmToSvg(innerHeight/2, scale)}" fill="none" stroke="${colors.ink}" stroke-width="${getStrokeWidth(lineWidths.thin, scale)}"/>`;
  elements.push(innerEllipse);

  return elements.join('\n');
}

export function Toilet({ x, y, width, height, scale = '1:50' }) {
  const elements = [];

  // Toilet bowl (oval)
  const bowlWidth = width * 0.7;
  const bowlHeight = height * 0.6;
  const bowlEllipse = `<ellipse cx="${mmToSvg(x, scale)}" cy="${mmToSvg(y + height * 0.1, scale)}" rx="${mmToSvg(bowlWidth/2, scale)}" ry="${mmToSvg(bowlHeight/2, scale)}" fill="${colors.white}" stroke="${colors.ink}" stroke-width="${getStrokeWidth(lineWidths.normal, scale)}"/>`;
  elements.push(bowlEllipse);

  // Tank (small circle)
  const tankRadius = width * 0.15;
  const tankCircle = Circle({
    x: x - width * 0.3,
    y: y - height * 0.2,
    radius: tankRadius,
    fill: colors.white,
    stroke: colors.ink,
    strokeWidth: lineWidths.normal,
    scale
  });
  elements.push(tankCircle);

  return elements.join('\n');
}

export function Sink({ x, y, width, height, scale = '1:50' }) {
  const elements = [];

  // Sink cabinet
  const cabinetRect = Rect({
    x: x - width / 2,
    y: y - height / 2,
    width: width,
    height: height,
    fill: colors.white,
    stroke: colors.ink,
    strokeWidth: lineWidths.normal,
    scale
  });
  elements.push(cabinetRect);

  // Sink bowl (oval)
  const bowlWidth = width * 0.6;
  const bowlHeight = height * 0.4;
  const bowlEllipse = `<ellipse cx="${mmToSvg(x, scale)}" cy="${mmToSvg(y, scale)}" rx="${mmToSvg(bowlWidth/2, scale)}" ry="${mmToSvg(bowlHeight/2, scale)}" fill="none" stroke="${colors.ink}" stroke-width="${getStrokeWidth(lineWidths.thin, scale)}"/>`;
  elements.push(bowlEllipse);

  // Drain (small circle)
  const drainRadius = 3;
  const drainCircle = Circle({
    x,
    y,
    radius: drainRadius,
    fill: colors.ink,
    scale
  });
  elements.push(drainCircle);

  return elements.join('\n');
}

export function Kitchen({ x, y, width, height, scale = '1:50' }) {
  const elements = [];

  // Kitchen counter
  const counterRect = Rect({
    x: x - width / 2,
    y: y - height / 2,
    width: width,
    height: height,
    fill: colors.white,
    stroke: colors.ink,
    strokeWidth: lineWidths.normal,
    scale
  });
  elements.push(counterRect);

  // Cabinet divisions
  const divisionSpacing = 600; // 600mm per cabinet
  const divisionCount = Math.floor(width / divisionSpacing);
  
  for (let i = 1; i < divisionCount; i++) {
    const divX = x - width / 2 + i * divisionSpacing;
    const divisionLine = Line({
      x1: divX,
      y1: y - height / 2,
      x2: divX,
      y2: y + height / 2,
      stroke: colors.ink,
      strokeWidth: lineWidths.hair,
      scale
    });
    elements.push(divisionLine);
  }

  // Sink
  const sinkX = x - width * 0.3;
  const sinkY = y;
  const sinkWidth = 400; // 400mm
  const sinkHeight = 300; // 300mm
  const sinkEllipse = `<ellipse cx="${mmToSvg(sinkX, scale)}" cy="${mmToSvg(sinkY, scale)}" rx="${mmToSvg(sinkWidth/2, scale)}" ry="${mmToSvg(sinkHeight/2, scale)}" fill="none" stroke="${colors.ink}" stroke-width="${getStrokeWidth(lineWidths.thin, scale)}"/>`;
  elements.push(sinkEllipse);

  // Stove
  const stoveX = x + width * 0.3;
  const stoveY = y;
  const stoveSize = 600; // 600x600mm
  const stoveRect = Rect({
    x: stoveX - stoveSize / 2,
    y: stoveY - stoveSize / 2,
    width: stoveSize,
    height: stoveSize,
    fill: colors.white,
    stroke: colors.ink,
    strokeWidth: lineWidths.normal,
    scale
  });
  elements.push(stoveRect);

  // Burners (4 small circles)
  const burnerRadius = 30; // 30mm
  const burnerPositions = [
    { x: stoveX - stoveSize/4, y: stoveY - stoveSize/4 },
    { x: stoveX + stoveSize/4, y: stoveY - stoveSize/4 },
    { x: stoveX - stoveSize/4, y: stoveY + stoveSize/4 },
    { x: stoveX + stoveSize/4, y: stoveY + stoveSize/4 }
  ];

  burnerPositions.forEach(pos => {
    const burnerCircle = Circle({
      x: pos.x,
      y: pos.y,
      radius: burnerRadius,
      fill: 'none',
      stroke: colors.ink,
      strokeWidth: lineWidths.thin,
      scale
    });
    elements.push(burnerCircle);
  });

  return elements.join('\n');
}
