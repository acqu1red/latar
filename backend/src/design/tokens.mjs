/**
 * Design tokens for floor plan generation
 * Based on architectural drawing standards
 */

export const colors = {
  ink: '#111111',
  paleFill: '#EAF6FA',
  white: '#FFFFFF',
};

export const lineWidths = {
  wall: 1.8,
  heavy: 1.2,
  normal: 0.8,
  thin: 0.45,
  hair: 0.25,
};

export const dashes = {
  hidden: '5 4',
};

export const fonts = {
  family: 'Inter, Arial, sans-serif',
  size: 2.6,
};

export const radii = {
  small: 8,
};

export const opacity = {
  zone: 0.35,
};

// Scale factors for different export scales
export const scales = {
  '1:50': 1,
  '1:75': 0.75,
  '1:100': 0.5,
};

// Scale: '1:50' | '1:75' | '1:100'
// MM: number (millimeters)
