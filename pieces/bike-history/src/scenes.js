// =====================================================================
//  SCENES — one function per era, world coords 1080x1920. Ground line G; bikes ride in place while the world scrolls.
// =====================================================================
const G = 1300;
// a paper ring (rim / tyre): a thick torn stroke with a soft shadow
function ring(x, y, r, w, c, key) {
  ctx.save(); ctx.shadowColor = 'rgba(35,20,10,0.30)'; ctx.shadowBlur = 8; ctx.shadowOffsetX = 2; ctx.shadowOffsetY = 5;
  ink(ellipsePts(x, y, r, r, 0, 48), { closed: true, w, color: c, amt: 0.8, key });
  ctx.restore();
}
// a wheel. o: tyre (colour), tw (tyre width), rim, spokes (n), sw (spoke width), sc (spoke colour), ang (rotation), hub
function wheel(x, y, r, o = {}) {
  const key = o.key ?? 'wh', n = o.spokes ?? 16, a0 = o.ang ?? 0;
  for (let i = 0; i < n; i++) { const a = a0 + i / n * TAU; ink([[x, y], [x + Math.cos(a) * r, y + Math.sin(a) * r]], { w: o.sw ?? 3, color: o.sc ?? PAL.charcoal, amt: 0.4, key: key + 's' + i }); }
  if (o.rim) ring(x, y, r - (o.tw ?? 8) * 0.5, o.rimW ?? 6, o.rim, key + 'rim');
  ring(x, y, r, o.tw ?? 8, o.tyre ?? PAL.ink, key + 'ty');
  cut(ellipsePts(x, y, o.hub ?? r * 0.1 + 6, o.hub ?? r * 0.1 + 6, 0, 16), o.hubC ?? PAL.charcoal, { key: key + 'hub', sb: 4, sy: 3 });
}
const tube = (x1, y1, x2, y2, w, c, key) => cut(capsulePts(x1, y1, x2, y2, w, 6), c, { key, sb: 6, sy: 4, tear: 0.6, grain: 0.5 });
const spin = (r, speed, t = TT) => t * speed / r;                    // wheel angle for a ground speed (px/s)
const scroll = (t, speed, tile) => -mod(t * speed, tile);           // world offset for repeating props
// a little top hat (1817) / bowler (1870s) / helmet (today) on the spark
function hat(x, y, s, kind, key) {
  if (kind === 'top') { cut(rect(x - 60 * s, y - 8 * s, 120 * s, 18 * s, 6), PAL.navy, { key: key + 'b', sb: 4 }); cut(rect(x - 38 * s, y - 92 * s, 76 * s, 88 * s, 6), PAL.navy, { key: key + 'c', sb: 4, pat: pat.stripes('rgba(255,255,255,0.10)', 4, 18) }); cut(rect(x - 38 * s, y - 30 * s, 76 * s, 14 * s, 2), PAL.mustard, { key: key + 'r', shadow: false }); }
  else if (kind === 'bowler') { cut(rect(x - 58 * s, y - 8 * s, 116 * s, 16 * s, 8), PAL.charcoal, { key: key + 'b', sb: 4 }); cut(ellipsePts(x, y - 20 * s, 40 * s, 38 * s, 0, 24, Math.PI, TAU), PAL.charcoal, { key: key + 'c', sb: 4 }); }
  else { cut(ellipsePts(x, y - 4 * s, 62 * s, 50 * s, 0, 28, Math.PI, TAU), PAL.teal, { key: key + 'c', sb: 4, pat: pat.stripes('rgba(255,255,255,0.35)', 8, 30) }); }
}
function dust(x, y, t0, key) {   // a kick of dust that puffs and drifts back
  const u = ev(t0, 0.5); if (u <= 0 || u >= 1) return;
  for (let i = 0; i < 3; i++) cut(ellipsePts(x - u * 120 - i * 30, y - 20 - i * 14 - u * 30, (16 + i * 6) * (1 - u * 0.5), (12 + i * 4) * (1 - u * 0.5), 0, 14), '#e8dcc0', { key: key + i, sb: 4 });
}
function cloud(x, y, s, key) { [[0, 0, 70, 34], [-60, 12, 46, 26], [62, 10, 50, 28]].forEach(([dx, dy, rx, ry], i) => cut(ellipsePts(x + dx * s, y + dy * s, rx * s, ry * s, 0, 20), '#ffffff', { key: key + i, sb: 6, sy: 4 })); }
function bird(x, y, s, key, c = PAL.navy) { cut(ellipsePts(x, y, 26 * s, 20 * s, 0, 16), c, { key: key + 'b', sb: 4 }); cut([[x + 22 * s, y - 4 * s], [x + 38 * s, y + 2 * s], [x + 22 * s, y + 6 * s]], PAL.mustard, { key: key + 'k', shadow: false }); dot(x + 12 * s, y - 6 * s, 3.5 * s); }
function poplar(x, y, s, key) { cut(capsulePts(x, y, x, y - 90 * s, 18 * s), PAL.woodD, { key: key + 't', sb: 4 }); cut(ellipsePts(x, y - 220 * s, 62 * s, 170 * s, 0, 26), PAL.greenD, { key: key + 'c', pat: pat.stripes('rgba(255,255,255,0.10)', 5, 22, 0.4) }); }
function speedLines(x, y, n, key) { for (let i = 0; i < n; i++) { const R = RNG('sl', key, i, B % 3); const yy = y + i * 46, L = R.r(70, 150); ink([[x - L, yy], [x, yy]], { w: 5, color: 'rgba(255,255,255,0.8)', amt: 0.5, key: key + i }); } }
function skyWall(c, key, p) { cut(rect(-30, -30, W + 60, H + 60, 0), c, { key, shadow: false, tear: 0, shade: false, pat: p }); }

// ---- 1817: the running machine (Drais, Mannheim). no pedals: the rider pushes off the ground
function sDrais(o = {}) {
  const today = !!o.today, sp = 260;
  skyWall(PAL.sky, 'sky1', pat.dots('rgba(255,255,255,0.35)', 3, 60));
  cloud(220 + Math.sin(TT * 0.6) * 20, 520, 1.1, 'cl1'); cloud(800, 420, 0.8, 'cl2');
  // distant town line
  cut([[-40, 1010], [80, 1010], [80, 930], [140, 880], [200, 930], [200, 1010], [700, 1010], [700, 900], [760, 850], [820, 900], [820, 1010], [1120, 1010], [1120, 1100], [-40, 1100]], today ? '#b6c7d6' : '#c9d4dc', { key: 'town', sb: 6 });
  cut([[-40, 1040], [300, 1000], [700, 1030], [1120, 990], [1120, 1200], [-40, 1200]], PAL.green, { key: 'hill1', pat: pat.stripes('rgba(255,255,255,0.12)', 4, 22, 0.3) });
  const off = scroll(TT, sp * 0.5, 300);
  for (let i = 0; i < 5; i++) poplar(off + i * 300 + 60, 1120, 0.9, 'pp' + i);
  // the road: sandy in 1817, asphalt with a bike lane today
  cut(rect(-30, 1180, W + 60, 800, 0), today ? '#9a9aa2' : '#e2c48f', { key: today ? 'roadT' : 'road1', tear: 0, sy: -5, pat: today ? pat.dots('rgba(255,255,255,0.12)', 2, 18) : pat.dots('rgba(150,100,50,0.18)', 3, 26) });
  if (today) { const lo = scroll(TT, sp, 220); for (let i = 0; i < 7; i++) cut(rect(lo + i * 220, 1395, 120, 16, 4), '#ffffff', { key: 'lane' + i, shadow: false }); }
  else { const so = scroll(TT, sp, 180); for (let i = 0; i < 8; i++) cut(ellipsePts(so + i * 180 + 40, 1420 + (i % 2) * 40, 12, 8, 0, 10), '#c9a46a', { key: 'pb' + i, shadow: false }); }
  // birds on a wire
  ink([[-20, 700], [400, 760], [1100, 690]], { w: 3, color: PAL.ink, amt: 0.6, key: 'wire' });
  bird(150, 715, 0.8, 'bd1'); bird(230, 727, 0.8, 'bd2');
  // the coach / the bus falls behind
  const cx0 = lerp(760, -260, EZ.io(seg(TT, E0 + 0.3, E0 + 3.3)));
  if (today) { cut(rect(cx0 - 180, 960, 360, 210, 22), PAL.yellow, { key: 'bus', pat: pat.lines('rgba(0,0,0,0.08)', 30, 10) }); for (let i = 0; i < 4; i++) cut(rect(cx0 - 160 + i * 84, 990, 64, 60, 6), PAL.sky, { key: 'bw' + i, shadow: false }); wheel(cx0 - 110, 1172, 34, { spokes: 0, tw: 22, key: 'bwa' }); wheel(cx0 + 110, 1172, 34, { spokes: 0, tw: 22, key: 'bwb' }); }
  else {
    cut(rect(cx0 - 120, 960, 240, 160, 16), PAL.purple, { key: 'coach', pat: pat.stripes('rgba(255,255,255,0.15)', 6, 40) });
    cut(rect(cx0 - 80, 990, 60, 60, 4), PAL.sky, { key: 'cw1', shadow: false }); cut(rect(cx0 + 20, 990, 60, 60, 4), PAL.sky, { key: 'cw2', shadow: false });
    wheel(cx0 - 80, 1140, 44, { spokes: 8, tw: 6, sc: PAL.woodD, ang: spin(44, 120), key: 'cwa' }); wheel(cx0 + 80, 1140, 44, { spokes: 8, tw: 6, sc: PAL.woodD, ang: spin(44, 120), key: 'cwb' });
    const hx = cx0 + 230, hb = Math.sin(TT * 9) * 6;   // the horse, tired
    cut(ellipsePts(hx, 1060 + hb, 80, 40, 0, 20), PAL.woodD, { key: 'hb' });
    cut(capsulePts(hx + 60, 1050 + hb, hx + 110, 990 + hb, 40), PAL.woodD, { key: 'hn' });
    cut(ellipsePts(hx + 130, 985 + hb, 34, 22, 0.3, 16), PAL.woodD, { key: 'hh' });
    [-50, -20, 30, 60].forEach((d, i) => tube(hx + d, 1080 + hb, hx + d + Math.sin(TT * 9 + i) * 10, 1150, 14, PAL.woodD, 'hl' + i));
  }
  
  // the hero's machine
  const kick = (TIMELINE.cues.kick || []).reduce((a, c) => a + Math.exp(-Math.max(0, TT - c) * 8) * (TT >= c ? 1 : 0), 0);
  if (today) { modernBike(400, G, 10); kidBike(730, G + 95); }
  else {
    const ang = spin(105, sp);
    wheel(290, G - 105, 105, { spokes: 10, sw: 9, sc: PAL.wood, tyre: PAL.charcoal, tw: 9, rim: PAL.woodD, ang, key: 'dwr' });
    tube(230, G - 175, 680, G - 175, 34, PAL.wood, 'beam');
    wheel(640, G - 105, 105, { spokes: 10, sw: 9, sc: PAL.wood, tyre: PAL.charcoal, tw: 9, rim: PAL.woodD, ang, key: 'dwf' });
    tube(640, G - 105, 660, G - 300, 18, PAL.woodD, 'fork');
    tube(610, G - 300, 720, G - 300, 16, PAL.woodD, 'bar');
    cut(rect(400, G - 215, 140, 30, 12), PAL.brick, { key: 'seat' });
    const sy = G - 290 - kick * 16;
    spark(470, sy, 74, { rays: 5, mood: 'happy', key: 'hero' });
    hat(470, sy - 60, 0.8, 'top', 'th');
    (TIMELINE.cues.kick || []).forEach((c, i) => dust(430, G, c, 'du' + i));
    yearTag('1817'); capStrip('no pedals: just run!');
  }
}

// ---- 1860s: the velocipede, pedals on the front wheel; iron tyres on cobbles = the boneshaker
function sBoneshaker() {
  const sp = 300, R = RNG('shake', B), jx = R.n(5), jy = R.n(7);
  skyWall('#f0d9a8', 'wall2', pat.stripes('rgba(255,255,255,0.18)', 18, 60));
  const bo = scroll(TT, sp * 0.6, 360), cols = [PAL.pinkL, PAL.cream, PAL.mint];
  for (let i = 0; i < 5; i++) {
    const x = bo + i * 360 - 20, k = mod(i + Math.floor(-(TT * sp * 0.6) / 360), 3);
    cut(rect(x, 520, 330, 700, 6), cols[(k + 3) % 3], { key: 'bld' + i, pat: pat.lines('rgba(120,80,60,0.10)', 34) });
    cut(rect(x + 50, 620, 90, 140, 4), PAL.navy, { key: 'wa' + i, shadow: false }); cut(rect(x + 190, 620, 90, 140, 4), PAL.navy, { key: 'wb' + i, shadow: false });
    cut([[x + 20, 900], [x + 310, 900], [x + 290, 990], [x + 40, 990]], [PAL.teal, PAL.pink, PAL.blue][(k + 3) % 3], { key: 'aw' + i, pat: pat.stripes('rgba(255,255,255,0.55)', 26, 52) });
    if (i === 2) cat(x + 120, 750, 0.55, PAL.charcoal, 'cat2');
  }
  // cobbles
  cut(rect(-30, 1180, W + 60, 800, 0), '#8f8790', { key: 'cob', tear: 0, sy: -5 });
  const co = scroll(TT, sp, 120);
  for (let r = 0; r < 4; r++) for (let i = 0; i < 11; i++) cut(ellipsePts(co + i * 120 + (r % 2) * 60, 1215 + r * 62, 52, 24, 0, 14), r % 2 ? '#a9a1a8' : '#9c949b', { key: 'cs' + r + i, shadow: false, grain: false });
  // a gas lamp and pigeons
  const lx = mod(700 - TT * sp, 1400) - 100;
  tube(lx, 1220, lx, 700, 20, PAL.charcoal, 'lamp'); cut([[lx - 40, 700], [lx + 40, 700], [lx + 28, 620], [lx - 28, 620]], PAL.yellow, { key: 'lampg' });
  [[860, 1480], [930, 1500]].forEach(([x, y], i) => bird(x + Math.sin(TT * 3 + i) * 6, y, 0.9, 'pg' + i, PAL.grey));
  // the boneshaker, rattling
  ctx.save(); ctx.translate(jx, jy);
  const ang = spin(125, sp);
  wheel(300, G - 95, 95, { spokes: 12, sw: 6, sc: PAL.wood, tyre: '#5d5a62', tw: 10, ang: spin(95, sp), key: 'bwr' });
  cut([[300, G - 95], [360, G - 210], [480, G - 240], [600, G - 320], [630, G - 330], [600, G - 300], [480, G - 220], [360, G - 190], [310, G - 90]], PAL.charcoal, { key: 'serp', sb: 6 });
  wheel(640, G - 125, 125, { spokes: 12, sw: 6, sc: PAL.wood, tyre: '#5d5a62', tw: 10, ang, key: 'bwf' });
  tube(640, G - 125, 630, G - 340, 16, PAL.charcoal, 'bfork'); tube(580, G - 350, 690, G - 340, 14, PAL.charcoal, 'bbar');
  [0, Math.PI].forEach((d, i) => { const a = ang + d, px = 640 + Math.cos(a) * 50, py = G - 125 + Math.sin(a) * 50; ink([[640, G - 125], [px, py]], { w: 9, color: PAL.ink, amt: 0.3, key: 'crank' + i }); cut(rect(px - 22, py - 8, 44, 16, 4), PAL.mustard, { key: 'ped' + i, sb: 4 }); });
  cut(rect(440, G - 280, 130, 28, 12), PAL.brick, { key: 'seat2' });
  spark(510, G - 355, 76, { rays: 6, mood: 'wow', key: 'hero' });
  ctx.restore();
  for (let i = 0; i < 3; i++) ink(arcPts(640, G - 125, 160 + i * 22, -0.5 + (B % 2) * 0.1, 0.3, 8), { w: 4, color: PAL.ink, amt: 1.5, key: 'rat' + i });
  yearTag('1860s'); capStrip('pedals! (the boneshaker)');
}

// ---- 1870s: the penny-farthing. fast, high — and one stone sends the rider over the bars (a "header")
const PENNY = { fx: 560, fr: 330, rx: 210, rr: 70 };
function sPenny() {
  const sp = 420, cu = TIMELINE.cues, tm = Math.min(TT, cu.freeze);
  skyWall('#bfe0ec', 'sky3', pat.dots('rgba(255,255,255,0.4)', 3, 56));
  cloud(mod(900 - tm * 40, 1300) - 100, 400, 1.0, 'cl3'); cloud(mod(300 - tm * 40, 1300) - 100, 560, 0.7, 'cl4');
  cut([[-40, 980], [260, 900], [620, 960], [900, 880], [1120, 930], [1120, 1200], [-40, 1200]], '#7fb87a', { key: 'h3a', pat: pat.stripes('rgba(255,255,255,0.12)', 4, 22, 0.3) });
  const so = scroll(tm, sp * 0.3, 540);
  for (let i = 0; i < 3; i++) { const x = so + i * 540 + 200; cut(ellipsePts(x, 1010, 54, 34, 0, 18), '#ffffff', { key: 'sh' + i, pat: pat.dots('rgba(0,0,0,0.06)', 6, 16) }); cut(ellipsePts(x + 50, 990, 22, 18, 0, 12), PAL.charcoal, { key: 'shh' + i }); }
  const ho = scroll(tm, sp * 0.7, 200);
  for (let i = 0; i < 7; i++) cut(ellipsePts(ho + i * 200 + 60, 1150, 120, 70, 0, 22), PAL.greenD, { key: 'hg' + i, pat: pat.dots('rgba(255,255,255,0.10)', 5, 22) });
  cut(rect(-30, 1180, W + 60, 800, 0), '#d7b98a', { key: 'lane3', tear: 0, sy: -5, pat: pat.dots('rgba(120,80,40,0.15)', 3, 30) });
  [[700, 300], [780, 340]].forEach(([x, y], i) => bird(mod(x - tm * 60, 1200), y + Math.sin(TT * 4 + i) * 10, 0.6, 'fb' + i));
  // the stone rolls in toward the big wheel
  const sx = PENNY.fx + 90 + (cu.hit - tm) * sp;
  if (sx < W + 80) cut(ellipsePts(sx, G - 26, 52, 34, 0, 16), '#8a8590', { key: 'stone', pat: pat.dots('rgba(255,255,255,0.15)', 4, 14) });
  // the bike pitches forward over the contact point
  const pitch = EZ.i2(seg(tm, cu.hit, cu.freeze)) * 0.55, ang = spin(PENNY.fr, sp, tm);
  ctx.save(); ctx.translate(PENNY.fx + 60, G); ctx.rotate(pitch); ctx.translate(-PENNY.fx - 60, -G);
  wheel(PENNY.rx, G - PENNY.rr, PENNY.rr, { spokes: 10, sw: 3, tw: 12, ang: spin(PENNY.rr, sp, tm), key: 'prw' });
  cut([[PENNY.rx, G - PENNY.rr], [250, G - 260], [360, G - 560], [500, G - 690], [PENNY.fx, G - PENNY.fr - 10], [490, G - 670], [340, G - 540], [230, G - 250], [PENNY.rx + 6, G - PENNY.rr + 10]], PAL.charcoal, { key: 'pbone', sb: 6 });
  wheel(PENNY.fx, G - PENNY.fr, PENNY.fr, { spokes: 28, sw: 2.4, tw: 14, ang, hub: 30, key: 'pfw' });
  tube(PENNY.fx, G - PENNY.fr, 555, G - 700, 16, PAL.charcoal, 'pfork'); tube(470, G - 705, 650, G - 700, 14, PAL.charcoal, 'pbar');
  cut(rect(470, G - 735, 110, 26, 12), PAL.brick, { key: 'seat3' });
  ctx.restore();
  // the rider: on top until the hit, then thrown forward — and the picture freezes
  const fl = EZ.o2(seg(tm, cu.hit, cu.freeze)), hx = lerp(525, 800, fl), hy = lerp(G - 800, G - 900, fl) + fl * fl * 60;
  ctx.save(); ctx.translate(hx, hy); ctx.rotate(fl * 1.7);
  spark(0, 0, 74, { rays: 7, mood: TT < cu.hit ? 'happy' : 'wow', key: 'hero' });
  if (fl < 0.5) hat(0, -60, 0.75, 'bowler', 'bh');
  ctx.restore();
  if (fl >= 0.5) { ctx.save(); ctx.translate(hx - 120, hy - 150); ctx.rotate(-0.8); hat(0, 0, 0.75, 'bowler', 'bh'); ctx.restore(); }
  if (TT < cu.hit) speedLines(130, G - 520, 4, 'psl');
  else for (let i = 0; i < 3; i++) ink(arcPts(560, G - 560, 300 + i * 40, -1.9, -1.2 - fl * 0.25, 10), { w: 5, color: 'rgba(255,255,255,0.85)', amt: 0.8, key: 'arc' + i });
  if (TT >= cu.freeze) { const f = () => tag('a header!', 760, G - 1010, 64, { rot: 0.06, s: popS(cu.freeze), fill: PAL.yellow }); if (DEFER) DEFER.push(f); else f(); }
  yearTag('1870s');
  if (TT < cu.hit) capStrip('the high wheel: fast...');
  else { const f = () => tag('...and a long way down', CX, H - SAFE.bottom - 60, 50, { rot: 0.012, tape: false, frac: ev(cu.hit + 0.1, 0.4) }); if (DEFER) DEFER.push(f); else f(); }
}

// ---- 1885: the safety bicycle (Starley's Rover): equal wheels, chain to the back. 1888: air tyres (Dunlop)
const ROVER = { rx: 280, fx: 680, r: 150 };
function roverTyre() { const n = Math.floor(seg(TT, TIMELINE.cues.pump, TIMELINE.cues.pump + 1.0) * 4) / 4; return lerp(9, 26, EZ.o2(n)); }
function sRover() {
  const sp = 340, cu = TIMELINE.cues, air = TT >= 14.5;
  skyWall('#f3c9a8', 'wall4', pat.stripes('rgba(255,255,255,0.14)', 10, 44));
  // factory chimneys with smoke, bunting
  [[160, 560], [380, 480], [880, 600]].forEach(([x, y], i) => {
    cut(rect(x - 34, y, 68, 700, 4), PAL.brick, { key: 'ch' + i, pat: pat.lines('rgba(90,40,30,0.18)', 26) });
    for (let k = 0; k < 3; k++) { const u = mod(TT * 0.5 + k / 3 + i * 0.2, 1); cut(ellipsePts(x + u * 90, y - 40 - u * 220, 30 + u * 40, 22 + u * 26, 0, 16), '#efe9e2', { key: 'sm' + i + k, sb: 6 }); }
  });
  cut(rect(-30, 860, W + 60, 340, 0), '#b77c66', { key: 'brickwall', tear: 0, pat: pat.lines('rgba(70,30,20,0.18)', 40) });
  ink([[-20, 760], [540, 820], [1100, 760]], { w: 3, color: PAL.ink, amt: 0.6, key: 'bunt' });
  for (let i = 0; i < 11; i++) { const x = i * 100 + 20, y = 760 + 60 * Math.sin(Math.PI * clamp(x / 1080)) * 0.95 - 2; cut([[x - 26, y], [x + 26, y], [x, y + 52]], [PAL.yellow, PAL.teal, PAL.pink, PAL.blue][i % 4], { key: 'bf' + i, sb: 4 }); }
  cut(rect(-30, 1180, W + 60, 800, 0), '#9a8c84', { key: 'road4', tear: 0, sy: -5, pat: pat.dots('rgba(255,255,255,0.12)', 3, 24) });
  // a dog trots along and watches
  const dx = 900, db = Math.abs(Math.sin(TT * 7)) * 8;
  cut(ellipsePts(dx, 1440 - db, 60, 30, 0, 18), PAL.wood, { key: 'dgb' }); cut(ellipsePts(dx + 56, 1400 - db, 30, 26, 0, 16), PAL.wood, { key: 'dgh' });
  cut(ellipsePts(dx + 50, 1385 - db, 10, 22, 0.4, 12), PAL.woodD, { key: 'dge' }); dot(dx + 66, 1396 - db, 4); [-36, 36].forEach((d, i) => tube(dx + d, 1460 - db, dx + d, 1500, 12, PAL.wood, 'dgl' + i));
  // the bike
  const tw = roverTyre(), ty = air ? PAL.ink : '#55505a', ang = spin(ROVER.r, sp);
  wheel(ROVER.rx, G - ROVER.r, ROVER.r, { spokes: 24, sw: 2.4, tw, tyre: ty, ang, key: 'rrw' });
  wheel(ROVER.fx, G - ROVER.r, ROVER.r, { spokes: 24, sw: 2.4, tw, tyre: ty, ang, key: 'rfw' });
  const S = [420, G - 380], BB = [450, G - 140], HD = [640, G - 380], RA = [ROVER.rx, G - ROVER.r];
  ink([[BB[0], BB[1] - 34], [RA[0], RA[1] - 16], [RA[0], RA[1] + 16], [BB[0], BB[1] + 34]], { w: 5, color: PAL.ink, amt: 0.3, key: 'chain', closed: true });
  cut(ellipsePts(BB[0], BB[1], 36, 36, 0, 20), PAL.mustard, { key: 'ring', sb: 4 });
  tube(...S, ...BB, 20, PAL.navy, 'st'); tube(...BB, ...HD, 20, PAL.navy, 'dt'); tube(...S, ...HD, 18, PAL.navy, 'tt');
  tube(...S, ...RA, 14, PAL.navy, 'ss'); tube(...BB, ...RA, 14, PAL.navy, 'cs'); tube(...HD, ROVER.fx, G - ROVER.r, 16, PAL.navy, 'rfk');
  tube(600, G - 470, 700, G - 440, 14, PAL.charcoal, 'rbar'); tube(...HD, 650, G - 455, 14, PAL.navy, 'stem');
  cut(rect(370, G - 410, 120, 28, 12), PAL.brick, { key: 'seat4' });
  [0, Math.PI].forEach((d, i) => { const a = ang * 0.6 + d, px = BB[0] + Math.cos(a) * 52, py = BB[1] + Math.sin(a) * 52; ink([BB, [px, py]], { w: 8, color: PAL.ink, amt: 0.3, key: 'rck' + i }); cut(rect(px - 22, py - 8, 44, 16, 4), PAL.mustard, { key: 'rpd' + i, sb: 4 }); });
  // the spark lands safe in the saddle (a spring from the throw)
  const sy = springMove(cu.slam, G - 560, G - 470, SPRING.playful);
  spark(440, sy, 76, { rays: air ? 9 : 8, mood: 'happy', key: 'hero' });
  speedLines(90, G - 420, 4, 'rsl');
  // 1888: the pump — air in the tyres
  if (TT >= cu.pump - 0.25) {
    const pk = popS(cu.pump - 0.25), st = Math.abs(Math.sin(seg(TT, cu.pump, cu.pump + 1.0) * Math.PI * 4)) * 50;
    ctx.save(); ctx.translate(80, 1500); ctx.scale(pk, pk);
    cut(rect(-26, -200, 52, 200, 8), PAL.teal, { key: 'pump', pat: pat.stripes('rgba(255,255,255,0.3)', 6, 30) });
    tube(0, -200 - st, 0, -280 - st, 12, PAL.charcoal, 'prod'); tube(-50, -280 - st, 50, -280 - st, 18, PAL.woodD, 'phd');
    ink([[0, 0], [70, 30], [ROVER.rx - 80, G - 30 - 1500]], { w: 7, color: PAL.ink, amt: 0.6, key: 'hose' });
    ctx.restore();
  }
  if (!air) {   // the slam: the shot is complete on its first frame
    const f = () => { tag('1885', 70 + (handW('1885', 80) + 72) / 2, SAFE.top + 90, 80, { rot: -0.04 }); tag('the safety bicycle', CX, H - SAFE.bottom - 60, 50, { rot: 0.012, tape: false }); };
    if (DEFER) DEFER.push(f); else f();
  }
  else {
    const f = () => { tag('1888', 70 + (handW('1888', 80) + 72) / 2, SAFE.top + 90, 80, { rot: -0.04, s: popS(14.5) }); tag('air in the tyres', CX, H - SAFE.bottom - 60, 50, { rot: 0.012, tape: false, frac: ev(14.7, 0.6) }); };
    if (DEFER) DEFER.push(f); else f();
  }
}

// ---- today: the same road as 1817. a child on a balance bike — no pedals, again
function modernBike(x, g, rays) {
  const r = 150, rx = x - 190, fx = x + 190, ang = spin(r, 260);
  wheel(rx, g - r, r, { spokes: 20, sw: 2, tw: 18, ang, key: 'mrw' }); wheel(fx, g - r, r, { spokes: 20, sw: 2, tw: 18, ang, key: 'mfw' });
  const S = [x - 40, g - 370], BB = [x - 10, g - 140], HD = [x + 160, g - 360];
  tube(...S, ...BB, 18, PAL.teal, 'mst'); tube(...BB, ...HD, 20, PAL.teal, 'mdt'); tube(...S, ...HD, 16, PAL.teal, 'mtt');
  tube(...S, rx, g - r, 12, PAL.teal, 'mss'); tube(...BB, rx, g - r, 12, PAL.teal, 'mcs'); tube(...HD, fx, g - r, 14, PAL.teal, 'mfk');
  tube(x + 140, g - 440, x + 220, g - 420, 14, PAL.charcoal, 'mbar'); tube(...HD, x + 160, g - 430, 14, PAL.teal, 'mstem');
  cut(rect(x - 100, g - 400, 120, 26, 12), PAL.charcoal, { key: 'mseat' });
  const sy = g - 470;
  spark(x - 20, sy, 76, { rays, mood: 'happy', key: 'hero' });
  hat(x - 20, sy - 56, 0.8, 'helmet', 'mh');
}
function kidBike(x, g) {
  const k = clamp(popS(TIMELINE.cues.kid)); if (k <= 0) return;
  const xx = lerp(x + 260, x, EZ.o3(ev(TIMELINE.cues.kid, 0.6))), r = 62, ang = spin(r, 260), step = Math.sin(TT * 8) * 26;
  wheel(xx - 90, g - r, r, { spokes: 0, tw: 16, key: 'kbr' }); wheel(xx + 90, g - r, r, { spokes: 0, tw: 16, key: 'kbf' });
  tube(xx - 90, g - r, xx + 60, g - 150, 18, PAL.pink, 'kbf1'); tube(xx + 60, g - 150, xx + 90, g - r, 14, PAL.pink, 'kbf2'); tube(xx + 40, g - 200, xx + 90, g - 190, 12, PAL.charcoal, 'kbbar');
  cut(rect(xx - 50, g - 175, 80, 22, 10), PAL.charcoal, { key: 'kbs' });
  // the child: legs walking on the ground (no pedals)
  tube(xx - 10, g - 170, xx - 30 + step, g - 4, 24, PAL.navy, 'kl1'); tube(xx - 10, g - 170, xx - 30 - step, g - 4, 24, PAL.navy, 'kl2');
  cut(rect(xx - 50, g - 300, 80, 140, 34), PAL.yellow, { key: 'kbody', pat: pat.stripes('rgba(255,255,255,0.35)', 10, 30, Math.PI / 2) });
  tube(xx, g - 270, xx + 60, g - 200, 18, PAL.yellow, 'karm');
  cut(ellipsePts(xx, g - 350, 52, 54, 0, 24), PAL.skin1, { key: 'khead' });
  face(xx + 6, g - 346, 0.9, 'happy');
  hat(xx, g - 380, 0.85, 'helmet', 'kh');
}
function sToday() {
  sDrais({ today: true });
  yearTag('today'); capStrip('still no pedals');
}
