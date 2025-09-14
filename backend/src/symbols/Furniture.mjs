/**
 * Furniture components with minimalistic styling
 */

import { colors, lineWidths, radii } from '../design/tokens.mjs';
import { mmToSvg, getStrokeWidth } from '../utils/scale.mjs';
import { Rect, Circle, Line } from '../draw/primitives.mjs';

export function Furniture({
  kind,
  x,
  y,
  w,
  h,
  rotation = 0,
  detail = 'light',
  scale = '1:50'
}) {
  const elements = [];

  const svgX = mmToSvg(x, scale);
  const svgY = mmToSvg(y, scale);
  const svgW = mmToSvg(w, scale);
  const svgH = mmToSvg(h, scale);
  const svgStrokeWidth = getStrokeWidth(lineWidths.normal, scale);
  const svgHairWidth = getStrokeWidth(lineWidths.hair, scale);
  const svgRadius = mmToSvg(radii.small, scale);

  const transform = rotation !== 0 ? `transform="rotate(${rotation} ${svgX} ${svgY})"` : '';

  switch (kind) {
    case 'bed':
      // Bed frame
      const bedRect = `<rect x="${svgX - svgW/2}" y="${svgY - svgH/2}" width="${svgW}" height="${svgH}" fill="${colors.white}" stroke="${colors.ink}" stroke-width="${svgStrokeWidth}" rx="${svgRadius}" ${transform}/>`;
      elements.push(bedRect);

      if (detail === 'light') {
        // Two pillows
        const pillowW = svgW * 0.3;
        const pillowH = svgH * 0.4;
        const pillow1 = `<rect x="${svgX - svgW/2 + 10}" y="${svgY - svgH/2 + 10}" width="${pillowW}" height="${pillowH}" fill="none" stroke="${colors.ink}" stroke-width="${svgHairWidth}" rx="${svgRadius/2}" ${transform}/>`;
        const pillow2 = `<rect x="${svgX + svgW/2 - pillowW - 10}" y="${svgY - svgH/2 + 10}" width="${pillowW}" height="${pillowH}" fill="none" stroke="${colors.ink}" stroke-width="${svgHairWidth}" rx="${svgRadius/2}" ${transform}/>`;
        elements.push(pillow1, pillow2);
      }
      break;

    case 'sofa':
      // Sofa frame
      const sofaRect = `<rect x="${svgX - svgW/2}" y="${svgY - svgH/2}" width="${svgW}" height="${svgH}" fill="${colors.white}" stroke="${colors.ink}" stroke-width="${svgStrokeWidth}" rx="${svgRadius}" ${transform}/>`;
      elements.push(sofaRect);

      if (detail === 'light') {
        // Back cushion
        const cushionW = svgW * 0.8;
        const cushionH = svgH * 0.3;
        const cushion = `<rect x="${svgX - cushionW/2}" y="${svgY - svgH/2 + 10}" width="${cushionW}" height="${cushionH}" fill="none" stroke="${colors.ink}" stroke-width="${svgHairWidth}" rx="${svgRadius/2}" ${transform}/>`;
        elements.push(cushion);
      }
      break;

    case 'tableRound':
      // Round table
      const tableCircle = Circle({
        x,
        y,
        radius: w / 2,
        fill: colors.white,
        stroke: colors.ink,
        strokeWidth: lineWidths.normal,
        scale
      });
      elements.push(tableCircle);

      if (detail === 'light') {
        // Table legs (small circles)
        const legRadius = 5;
        const leg1 = Circle({ x: x - w/4, y: y - h/4, radius: legRadius, fill: colors.ink, scale });
        const leg2 = Circle({ x: x + w/4, y: y - h/4, radius: legRadius, fill: colors.ink, scale });
        const leg3 = Circle({ x: x - w/4, y: y + h/4, radius: legRadius, fill: colors.ink, scale });
        const leg4 = Circle({ x: x + w/4, y: y + h/4, radius: legRadius, fill: colors.ink, scale });
        elements.push(leg1, leg2, leg3, leg4);
      }
      break;

    case 'tableRect':
      // Rectangular table
      const tableRect = `<rect x="${svgX - svgW/2}" y="${svgY - svgH/2}" width="${svgW}" height="${svgH}" fill="${colors.white}" stroke="${colors.ink}" stroke-width="${svgStrokeWidth}" rx="${svgRadius}" ${transform}/>`;
      elements.push(tableRect);

      if (detail === 'light') {
        // Table edge line
        const edgeLine = `<line x1="${svgX - svgW/2 + 10}" y1="${svgY - svgH/2 + 10}" x2="${svgX + svgW/2 - 10}" y2="${svgY - svgH/2 + 10}" stroke="${colors.ink}" stroke-width="${svgHairWidth}" ${transform}/>`;
        elements.push(edgeLine);
      }
      break;

    case 'chair':
      // Chair seat (circle)
      const seatCircle = Circle({
        x,
        y,
        radius: w / 2,
        fill: colors.white,
        stroke: colors.ink,
        strokeWidth: lineWidths.normal,
        scale
      });
      elements.push(seatCircle);

      if (detail === 'light') {
        // Chair back (small arc)
        const backArc = `<path d="M ${svgX - svgW/4} ${svgY - svgH/4} A ${svgW/4} ${svgW/4} 0 0 1 ${svgX + svgW/4} ${svgY - svgH/4}" fill="none" stroke="${colors.ink}" stroke-width="${svgHairWidth}"/>`;
        elements.push(backArc);
      }
      break;

    case 'desk':
      // Desk surface
      const deskRect = `<rect x="${svgX - svgW/2}" y="${svgY - svgH/2}" width="${svgW}" height="${svgH}" fill="${colors.white}" stroke="${colors.ink}" stroke-width="${svgStrokeWidth}" rx="${svgRadius}" ${transform}/>`;
      elements.push(deskRect);

      if (detail === 'light') {
        // Desk edge line
        const edgeLine = `<line x1="${svgX - svgW/2 + 10}" y1="${svgY - svgH/2 + 10}" x2="${svgX + svgW/2 - 10}" y2="${svgY - svgH/2 + 10}" stroke="${colors.ink}" stroke-width="${svgHairWidth}" ${transform}/>`;
        elements.push(edgeLine);
      }
      break;

    case 'tvStand':
      // TV stand
      const tvStandRect = `<rect x="${svgX - svgW/2}" y="${svgY - svgH/2}" width="${svgW}" height="${svgH}" fill="${colors.white}" stroke="${colors.ink}" stroke-width="${svgStrokeWidth}" rx="${svgRadius}" ${transform}/>`;
      elements.push(tvStandRect);

      if (detail === 'light') {
        // TV screen
        const tvW = svgW * 0.8;
        const tvH = svgH * 0.6;
        const tvRect = `<rect x="${svgX - tvW/2}" y="${svgY - svgH/2 + 10}" width="${tvW}" height="${tvH}" fill="none" stroke="${colors.ink}" stroke-width="${svgHairWidth}" ${transform}/>`;
        elements.push(tvRect);
      }
      break;
  }

  return elements.join('\n');
}
