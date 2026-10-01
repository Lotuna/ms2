// Scene 4 — Plating: each parallel culture goes on its own T1-coated plate;
// resistant colonies are counted (1943 data).
(function (global) {
  'use strict';
  const { C, seg, ease } = G;
  const D = L.DATA.parallel;

  const PX = (i) => 26 + (i % 10) * 29;
  const PY = (i) => 50 + Math.floor(i / 10) * 46;
  const R = 12;

  const scene = {
    title: 'PLATING',
    mag: '×1',
    dur: 9,
    caption: 'Each culture is spread on its own agar plate coated with T1. Only resistant mutants survive to form colonies. Most plates have none; a few have dozens.',
    captionAt: 0.4,
    draw(t) {
      G.textBg('EACH CULTURE → ITS OWN T1 PLATE', 10, 22, C.CYAN_L, C.VOID);
      const grow = ease.inOut(seg(t, 4.6, 6.4));
      D.forEach((n, i) => {
        const a = seg(t, 0.3 + i * 0.08, 0.8 + i * 0.08);
        if (a <= 0) return;
        G.save(); G.alpha(a);
        const jackpot = n >= 30 && t >= 6.6;
        L.plate(PX(i), PY(i), R, Math.round(n * grow), 50 + i, { phage: true, hot: jackpot });
        G.restore();
        if (t >= 4.6) G.textC(String(Math.round(n * grow)), PX(i), PY(i) + R + 3, n >= 30 ? C.PINK : n === 0 ? C.BLUE2 : C.ICE);
        if (jackpot && Math.floor(t * 3) % 2 === 0) G.textCBg('JACKPOT', PX(i), PY(i) - R - 8, C.MAGENTA, C.VOID);
      });

      // Overnight incubation readout.
      if (t >= 2.2 && t < 4.8) {
        const hr = Math.round(16 * seg(t, 2.4, 4.6));
        HUD.panel(214, 18, 96, 22, 'INCUBATE 37C', C.CYAN);
        G.text('HOUR ' + String(hr).padStart(2, '0') + '/16', 218, 29, C.ICE);
        const a = t * 6;
        G.glow(() => G.line(298, 31, Math.round(298 + Math.cos(a) * 4), Math.round(31 + Math.sin(a) * 4), C.PINK));
      }
      G.textBg('DATA: LURIA & DELBRÜCK 1943, EXP. 23', 10, 133, C.SKY, C.VOID);
    },
  };

  (global.SCENES = global.SCENES || [])[4] = scene;
})(window);
