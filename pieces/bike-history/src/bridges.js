// =====================================================================
//  ERAS, CAMERAS, BRIDGES — read by kit/morph.js. Every bridge is a front wheel becoming the next era's front wheel.
// =====================================================================
const ERA_BG = ['#cfe2ee', '#f0d9a8', '#bfe0ec', '#f3c9a8', '#cfe2ee'];
function pieceCam(era, t) { return null; }
const BRIDGES = [
  { tc: 3.5, d: 0.4, A: () => ({ P: ellipsePts(640, G - 105, 110, 110, 0, 64), c: PAL.wood }), B: () => ({ P: ellipsePts(640, G - 125, 130, 130, 0, 64), c: '#5d5a62' }) },          // wooden wheel -> iron-tyred wheel
  { tc: 7.0, d: 0.4, A: () => ({ P: ellipsePts(640, G - 125, 130, 130, 0, 64), c: '#5d5a62' }), B: () => ({ P: ellipsePts(PENNY.fx, G - PENNY.fr, PENNY.fr + 7, PENNY.fr + 7, 0, 64), c: PAL.charcoal }) },   // -> the high wheel
  { tc: 16.5, d: 0.4, A: () => ({ P: ellipsePts(ROVER.fx, G - ROVER.r, ROVER.r + 12, ROVER.r + 12, 0, 64), c: PAL.ink }), B: () => ({ P: ellipsePts(590, G - 150, 160, 160, 0, 64), c: PAL.ink }) },        // the air tyre -> today's wheel
];
