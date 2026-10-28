// Scene 5 — Caveats: along a smooth cline, sampling only the far ends makes
// two clusters; sampling everywhere shows a gradient.
(function (global) {
  'use strict';
  const { C, seg, ease, lerp } = G;

  const MX = 20, MW = 280, MY = 32; // map strip
  const HX = 30, HW = 260, HB = 118, HH = 34; // histogram
  const LOCI = 200;
  // Allele frequency drifts smoothly across the map.
  const freq = (u) => W.PB + (W.PA - W.PB) * u;
  // Deterministic approx-normal score for a person at position u.
  function score(u, i) {
    const p = freq(u), sd = Math.sqrt(p * (1 - p) / LOCI);
    const z = Math.sqrt(-2 * Math.log(G.rnd(i, 3) + 1e-9)) * Math.cos(2 * Math.PI * G.rnd(i, 4));
    return p + sd * z;
  }
  const ENDS = [], ALL = [];
  for (let i = 0; i < 40; i++) {
    const u = i < 20 ? G.rnd(i, 1) * 0.12 : 0.88 + G.rnd(i, 1) * 0.12;
    ENDS.push({ u, s: score(u, i) });
  }
  for (let i = 0; i < 80; i++) { const u = (i + G.rnd(i, 9)) / 80; ALL.push({ u, s: score(u, 100 + i) }); }

  function hist(pts, k) {
    const bins = new Array(26).fill(0);
    pts.forEach(({ s }) => { const b = Math.floor((s - 0.25) / 0.5 * 26); if (b >= 0 && b < 26) bins[b]++; });
    const max = Math.max(4, ...bins);
    G.hline(HX - 2, HX + HW + 2, HB + 1, C.SKY);
    bins.forEach((n, b) => {
      const h = Math.round(n / max * HH * k);
      if (h > 0) G.rect(HX + b * 10, HB - h + 1, 8, h, b < 13 ? C.CYAN_D : C.MAGENTA);
    });
    G.text('GENETIC SCORE (' + LOCI + ' LOCI)', HX, HB + 4, C.SKY);
  }

  const scene = {
    title: 'WHAT IT DOES NOT SHOW',
    mag: 'MODEL',
    dur: 11,
    notToScale: false,
    caption: 'Being able to classify does not mean groups are discrete. Along a smooth cline, sampling only the far ends gives two clusters; sampling everywhere shows a gradient. Clusters need not match social race categories.',
    captionAt: 0.3,
    draw(t) {
      // Map strip: smooth gradient between the two ends.
      G.shade(MX, MY, MW, 8, (x, y) => G.ramp(x, y, (x - MX) / MW, [C.CYAN_D, C.AZURE, C.PURPLE, C.MAGENTA]));
      G.rectO(MX - 1, MY - 1, MW + 2, 10, C.BLUE2);
      G.textBg('A SMOOTH GEOGRAPHIC CLINE', MX, 22, C.ICE, C.VOID);

      const phase2 = t >= 5.4;
      const pts = phase2 ? ALL : ENDS;
      const k = ease.out(seg(t, phase2 ? 5.6 : 0.8, phase2 ? 7.0 : 2.2));
      pts.forEach(({ u }, i) => {
        if (G.rnd(i, 77) > k * 1.2) return;
        const x = Math.round(MX + u * (MW - 1));
        G.glow(() => G.pset(x, MY + 11 + (i % 3) * 2, u < 0.5 ? C.CYAN_L : C.PINK));
      });

      G.rect(HX - 4, 54, HW + 8, HB - 52, C.VOID);
      hist(pts, k);
      G.textBg(phase2 ? 'SAMPLE EVERYWHERE: A GRADIENT' : 'SAMPLE ONLY THE ENDS: 2 CLUSTERS', HX, 56, phase2 ? C.CYAN_L : C.PINK, C.VOID);
      if (t >= 8.2) G.textBg('RESULTS DEPEND ON WHO IS SAMPLED', 82, 130, C.MAGENTA, C.VOID);
    },
  };

  (global.SCENES = global.SCENES || [])[5] = scene;
})(window);
