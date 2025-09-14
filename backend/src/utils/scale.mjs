/**
 * Scaling utilities for converting from millimeters to SVG units
 */

import { scales } from '../design/tokens.mjs';

/**
 * Convert millimeters to SVG units based on scale
 */
export function mmToSvg(mm, scale = '1:50') {
  return mm * scales[scale];
}

/**
 * Convert line width from design tokens to SVG stroke-width
 */
export function getStrokeWidth(lineWidth, scale = '1:50') {
  return mmToSvg(lineWidth, scale);
}

/**
 * Get scaled font size
 */
export function getFontSize(baseSize, scale = '1:50') {
  return mmToSvg(baseSize, scale);
}

/**
 * Generate grid snap points
 */
export function getGridSnap(value, scale = '1:50') {
  const gridSize = 50; // 50mm grid
  return Math.round(value / gridSize) * gridSize;
}

/**
 * Convert SVG coordinates back to millimeters
 */
export function svgToMm(svg, scale = '1:50') {
  return svg / scales[scale];
}
