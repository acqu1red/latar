/**
 * Scaling utilities for converting from millimeters to SVG units
 */

import { scales, type Scale, type MM } from '../design/tokens.js';

/**
 * Convert millimeters to SVG units based on scale
 */
export function mmToSvg(mm: MM, scale: Scale = '1:50'): number {
  return mm * scales[scale];
}

/**
 * Convert line width from design tokens to SVG stroke-width
 */
export function getStrokeWidth(lineWidth: number, scale: Scale = '1:50'): number {
  return mmToSvg(lineWidth, scale);
}

/**
 * Get scaled font size
 */
export function getFontSize(baseSize: number, scale: Scale = '1:50'): number {
  return mmToSvg(baseSize, scale);
}

/**
 * Generate grid snap points
 */
export function getGridSnap(value: MM, scale: Scale = '1:50'): MM {
  const gridSize = 50; // 50mm grid
  return Math.round(value / gridSize) * gridSize;
}

/**
 * Convert SVG coordinates back to millimeters
 */
export function svgToMm(svg: number, scale: Scale = '1:50'): MM {
  return svg / scales[scale];
}
