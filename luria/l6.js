// Scene 6 — Results: both data sets on one scale; variance vs mean.
(function (global) {
  'use strict';
  const { C, seg, ease } = G;
  const P = L.DATA.parallel, B = L.DATA.bulk;
  const SP = L.stats(P), SB = L.stats(B);

  const BASE = 106, PXC = 0.55; // baseline row, pixels per colony (107 -> 59 px)

  function chart(x0, step, w, data, color, t0, t) {
    G.hline(x0 - 3, x0 + data.length * step, BASE + 1, C.SKY);
    G.text('0', x0 - 8, BASE - 2, C.SKY);
    data.forEach((n, i) => {
      const k = ease.out(seg(t, t0 + i * 0.05, t0 + 0.8 + i * 0.05));
      const h = Math.round(n * PXC * k);
      const x = x0 + i * step;
      if (h > 0) G.glow(() => G.rect(x, BASE - h + 1, w, h, color));
      else if (k > 0.5) G.pset(x + 1, BASE, C.BLUE2);
      if (n >= 30 && k >= 1) G.textC(String(n), x + 2, BASE - h - 6, C.PINK);
    });
  }

  const scene = {
    title: 'RESULTS',
    mag: 'DATA',
    dur: 10,
    notToScale: false,
    caption: 'Parallel cultures fluctuate far more than samples of one culture: their variance is many times the mean. That fits random mutation before exposure, not induction.',
    captionAt: 0.4,
    draw(t) {
      G.textBg('20 PARALLEL CULTURES', 14, 22, C.PINK, C.VOID);
      G.textBg('10 SAMPLES, ONE CULTURE', 186, 22, C.CYAN_L, C.VOID);
      G.text('RESISTANT COLONIES, SAME SCALE', 92, 31, C.SKY);
      chart(20, 7, 5, P, C.MAGENTA, 0.4, t);
      chart(194, 11, 6, B, C.CYAN, 1.2, t);

      if (t >= 2.4) {
        const f = (v) => (v < 100 ? (Math.round(v * 10) / 10).toFixed(1) : String(Math.round(v)));
        G.text('MEAN ' + f(SP.mean) + '   VARIANCE ' + f(SP.variance), 14, 111, C.ICE);
        G.text('MEAN ' + f(SB.mean) + '  VAR ' + f(SB.variance), 186, 111, C.ICE);
      }
      if (t >= 3.6) {
        G.textBg('VARIANCE >> MEAN', 14, 119, C.MAGENTA, C.VOID);
        G.textBg('VARIANCE NEAR MEAN', 186, 119, C.CYAN_L, C.VOID);
        G.text(SP.zeros + ' OF 20 HAD ZERO', 88, 119, C.SKY);
      }
      if (t >= 5.6) {
        const s = 'SUPPORTS B) SPONTANEOUS MUTATION';
        const w = G.textW(s) + 8, x = Math.round(160 - w / 2);
        G.rect(x, 128, w, 11, C.VOID);
        G.glow(() => G.rectO(x, 128, w, 11, C.MAGENTA));
        if (t < 6.2) G.glitchText(s, x + 4, 131, C.PINK, t - 5.6, 0.5);
        else G.text(s, x + 4, 131, C.PINK);
      }
    },
  };

  (global.SCENES = global.SCENES || [])[6] = scene;
})(window);
