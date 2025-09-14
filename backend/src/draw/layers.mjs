/**
 * SVG layer system with z-order
 */

export function Layer({ id, children }) {
  return `<g id="${id}">${children}</g>`;
}

// Predefined layer IDs with z-order
export const LAYERS = {
  ZONES: 'zones',
  WALLS: 'walls',
  FIXTURES: 'fixtures',
  OPENINGS: 'openings',
  DOORS: 'doors',
  FURNITURE: 'furniture',
  ANNOTATIONS: 'annotations',
};

export function ZonesLayer(children) {
  return Layer({ id: LAYERS.ZONES, children });
}

export function WallsLayer(children) {
  return Layer({ id: LAYERS.WALLS, children });
}

export function FixturesLayer(children) {
  return Layer({ id: LAYERS.FIXTURES, children });
}

export function OpeningsLayer(children) {
  return Layer({ id: LAYERS.OPENINGS, children });
}

export function DoorsLayer(children) {
  return Layer({ id: LAYERS.DOORS, children });
}

export function FurnitureLayer(children) {
  return Layer({ id: LAYERS.FURNITURE, children });
}

export function AnnotationsLayer(children) {
  return Layer({ id: LAYERS.ANNOTATIONS, children });
}
