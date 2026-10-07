  // =====================================================================
  //  SCORE — D major, 120 BPM. Thin at 1817 -> a rattling groove (1860s) -> the busiest run (1870s)
  //  -> the stone, then dead silence (the header) -> the loudest hit on the slam (1885) -> warm (1888) -> the opening motif.
  // =====================================================================
  const T = TIMELINE, cu = T.cues, R = RNG('score');
  to = 'm';
  // 1817: a soft pad, the spark's rising fifth, wooden footsteps on the kicks
  pad(0.0, 3.6, ['D3', 'A3', 'Fs4'], 0.035, { type: 'triangle', cut: 900, att: 0.08, rel: 0.25 });
  [['D4', 0.25], ['A4', 0.5]].forEach(([n, t], i) => pluck(t, nz(n), 0.2, 0.1 - i * 0.2, 0.6, 2600, 0.35));
  [['D5', 2.0], ['A5', 2.25], ['Fs5', 2.75]].forEach(([n, t]) => pluck(t, nz(n), 0.1, 0.2, 0.4, 3400, 0.3));
  // 1860s: the groove starts — bass on the beat
  pad(3.4, 7.05, ['G3', 'D4', 'B4'], 0.04, { cut: 1100, att: 0.2, rel: 0.2, send: 0.3 });
  for (let t = 3.5; t < 7.0; t += BEAT) bass(t, nz(t < 5.25 ? 'G2' : 'A2'), 0.22);
  for (let t = 3.75; t < 7.0; t += 1.0) pluck(t, nz(['B4', 'D5', 'G5', 'A5'][Math.round(t) % 4]), 0.1, -0.2, 0.3, 3000, 0.2);
  // 1870s: the busiest — 8th-note arpeggio, bass, sub on bars; everything ends before the silence
  pad(6.9, 10.1, ['D3', 'A3', 'D4', 'Fs4'], 0.025, { cut: 1100, att: 0.15, rel: 0.08, send: 0.1 });
  const arp = ['D4', 'Fs4', 'A4', 'D5', 'A4', 'Fs4', 'E4', 'A4'];
  for (let k = 0, t = 7.0; t < 10.0 - 1e-6; t += E8, k++) {
    pluck(t, nz(arp[k % 8]), 0.1, (k % 2 ? 0.25 : -0.25), 0.22, 3600, 0.1);
    if (k % 2 === 0) bass(t, nz(k % 8 < 4 ? 'D2' : 'A2'), 0.2);
    if (k % 8 === 0) sub(t, 0.06);
  }
  // the 1888 tyres, today: warm
  pad(11.6, 14.5, ['D3', 'A3', 'D4', 'Fs4'], 0.05, { cut: 1500, att: 0.3, rel: 0.3, send: 0.5 });       // flat chord after the hit
  pad(14.5, 16.6, ['G3', 'D4', 'B4', 'D5'], 0.055, { cut: 1600, att: 0.3, rel: 0.25, send: 0.5 });
  for (let i = 0; i < 4; i++) pluck(14.5 + i * BEAT, nz(['G4', 'B4', 'D5', 'G5'][i]), 0.1, 0.2 - i * 0.1, 0.5, 3200, 0.35);
  pad(16.4, 20.0, ['D3', 'A3', 'Fs4'], 0.018, { type: 'triangle', cut: 900, att: 0.3, rel: 0.6, send: 0.5 });
  [['D4', 17.0], ['A4', 17.25], ['D5', 18.5], ['A5', 18.75]].forEach(([n, t], i) => pluck(t, nz(n), 0.08 - i * 0.01, 0.1, 0.6, 2400, 0.4));
  // THE SLAM: the safety bicycle — a short chord stab and a sub (the loudest moment)
  ['D3', 'A3', 'D4', 'Fs4', 'A4', 'D5'].forEach((n, i) => pluck(cu.slam + i * 0.006, nz(n), 0.36, (i - 2.5) * 0.15, 0.7, 5200, 0.4));
  pad(cu.slam, cu.slam + 0.4, ['D3', 'A3', 'D4', 'Fs4', 'A4', 'D5'], 0.5, { cut: 3600, att: 0.008, rel: 0.35, send: 0.3 });
  to = 's';
  // wooden footsteps (1817)
  cu.kick.forEach((t) => noiseHit(t, 0.06, 'lowpass', 700, 0.9, 0.12));
  // paper swishes into each morph
  T.morphs.forEach((m) => sweep(m - 0.4, m + 0.05, 0.011, 500, 2600, 0));
  // the boneshaker rattles on 8ths
  for (let t = 3.75; t < 6.9; t += E8) noiseHit(t + R.n(0.01), 0.04, 'bandpass', 2600 + R.n(400), 2, 0.05, R.n(0.4));
  // the stone: a thud, then nothing (dry: no reverb into the silence)
  noiseHit(cu.hit, 0.08, 'lowpass', 400, 0.8, 0.12);
  // the slam
  sub(cu.slam, 0.75); sub(cu.slam + 0.004, 0.35); noiseHit(cu.slam, 0.012, 'highpass', 6000, 0.8, 0.25); noiseHit(cu.slam, 0.3, 'lowpass', 900, 0.7, 0.3, 0, 0.4);
  chime(cu.slam + 0.02, [nz('D5'), nz('Fs5'), nz('A5'), nz('D6')], 0.09);
  // the bell rings (1885) and the pump hisses (1888)
  chime(12.5, [nz('A6'), nz('A6') * 1.5], 0.05); chime(12.75, [nz('A6'), nz('A6') * 1.5], 0.04);
  for (let i = 0; i < 4; i++) noiseHit(cu.pump + i * 0.25, 0.16, 'bandpass', 3800, 1.2, 0.07, -0.5);
  // today: a bike bell, and the child's footsteps (no pedals)
  chime(17.75, [nz('A6'), nz('A6') * 1.5], 0.03);
  for (let t = cu.kid + 0.25; t < 19.6; t += BEAT) noiseHit(t, 0.05, 'lowpass', 900, 0.9, 0.035, 0.3);
