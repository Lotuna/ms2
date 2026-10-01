// Scene 5 — Control: ten samples from one bulk culture give similar counts.
(function (global) {
  'use strict';
  const { C, seg, ease, lerp } = G;
  const D = L.DATA.bulk;

  const PX = (i) => 86 + i * 24;
  const PY = 78, R = 10;
  const FX = 36, FTOP = 52;

  const scene = {
    title: 'CONTROL',
    mag: '×1',
    dur: 8,
    caption: 'Control: ten samples drawn from one large culture. Their counts are all similar, differing only by sampling chance.',
    captionAt: 0.4,
    draw(t) {
      // Bulk flask (same shape as scene 3).
      const top = FTOP, h = 50, neck = 12;
      const hw = (y) => (y < top + neck ? 7 : lerp(7, 26, (y - top - neck) / (h - neck)));
      G.shade(FX - 26, top + neck + 4, 52, h - neck - 4, (x, y) => (Math.abs(x + 0.5 - FX) < hw(y) - 1 ? G.dith(x, y, 0.75, C.NAVY2, C.CYAN_D) : -1));
      G.glow(() => G.polyline([[FX - 7, top], [FX - 7, top + neck], [FX - 26, top + h], [FX + 25, top + h], [FX + 6, top + neck], [FX + 6, top]], C.SKY));
      G.textCBg('1 CULTURE', FX, top + h + 4, C.CYAN_L, C.VOID);

      G.textBg('10 SAMPLES OF THE SAME CULTURE', 86, 22, C.CYAN_L, C.VOID);
      const grow = ease.inOut(seg(t, 3.4, 5.0));
      D.forEach((n, i) => {
        const t0 = 0.5 + i * 0.18;
        const k = seg(t, t0, t0 + 0.6);
        if (k > 0 && k < 1) {
          const x = lerp(FX, PX(i), k), y = lerp(top - 2, PY - R - 2, k) - Math.sin(k * Math.PI) * 20;
          G.glow(() => G.pset(Math.round(x), Math.round(y), C.CYAN_L));
        }
        if (k <= 0) return;
        L.plate(PX(i), PY, R, Math.round(n * grow), 90 + i, { phage: true });
        if (t >= 3.4) G.textC(String(Math.round(n * grow)), PX(i), PY + R + 3, C.ICE);
      });
      if (t >= 5.4) {
        G.glow(() => { G.hline(PX(0) - R, PX(9) + R, PY + R + 11, C.CYAN); G.vline(PX(0) - R, PY + R + 9, PY + R + 11, C.CYAN); G.vline(PX(9) + R, PY + R + 9, PY + R + 11, C.CYAN); });
        G.textCBg('ALL SIMILAR: 13 TO 26', (PX(0) + PX(9)) / 2, PY + R + 15, C.CYAN_L, C.VOID);
      }
      G.textBg('DATA: LURIA & DELBRÜCK 1943', 10, 133, C.SKY, C.VOID);
    },
  };

  (global.SCENES = global.SCENES || [])[5] = scene;
})(window);
