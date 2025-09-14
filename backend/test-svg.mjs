/**
 * Test script for new SVG generation system
 */

import { generateSvgFromData } from './src/generateSvgFromData.mjs';

// Test data
const testRooms = [
  {
    key: 'living-room',
    name: 'Гостиная',
    layout: { x: 0.1, y: 0.1, width: 0.4, height: 0.3 },
    sqm: 25.5,
    windows: [
      { side: 'right', pos: 0.3, len: 0.4 }
    ],
    doors: [
      { side: 'left', pos: 0.5, len: 0.2, type: 'entrance' }
    ]
  },
  {
    key: 'bedroom',
    name: 'Спальня',
    layout: { x: 0.6, y: 0.1, width: 0.3, height: 0.4 },
    sqm: 18.2,
    windows: [
      { side: 'right', pos: 0.2, len: 0.3 }
    ],
    doors: [
      { side: 'left', pos: 0.3, len: 0.15, type: 'interior' }
    ]
  }
];

const totalSqm = 43.7;

async function testSvgGeneration() {
  try {
    console.log('Testing SVG generation...');
    const result = await generateSvgFromData(testRooms, totalSqm);
    
    console.log('✅ SVG generation successful!');
    console.log('Debug info:', result.debug);
    console.log('SVG data URL length:', result.svgDataUrl.length);
    
    if (result.pngDataUrl) {
      console.log('PNG data URL length:', result.pngDataUrl.length);
    }
    
    return result;
  } catch (error) {
    console.error('❌ SVG generation failed:', error);
    throw error;
  }
}

testSvgGeneration().catch(console.error);
