// Scene 3 — Setup: many small parallel cultures, each started from a few
// cells, plus one bulk culture as the control. No phage yet.
(function (global) {
  'use strict';
  const { C, seg, ease, lerp } = G;

  // Conical flask: neck from top..top+neck, body widens to wBot at bottom.
  function flask(cx, top, h, neck, wNeck, wBot, level, density) {
    const bot = top + h;
    const hw = (y) => (y < top + neck ? wNeck / 2 : lerp(wNeck / 2, wBot / 2, (y - top - neck) / (h - neck)));
    const fillTop = bot - Math.round((h - neck) * level);
    G.shade(cx - wBot / 2, fillTop, wBot, bot - fillTop, (x, y) =>
      (Math.abs(x + 0.5 - cx) < hw(y) - 1 ? G.dith(x, y, density, C.NAVY2, C.CYAN_D) : -1));
    if (level > 0) G.hline(Math.round(cx - hw(fillTop) + 1), Math.round(cx + hw(fillTop) - 2), fillTop, C.SKY);
    G.glow(() => G.polyline([
      [cx - wNeck / 2, top], [cx - wNeck / 2, top + neck], [cx - wBot / 2, bot],
      [cx + wBot / 2 - 1, bot], [cx + wNeck / 2 - 1, top + neck], [cx + wNeck / 2 - 1, top],
    ].map(([x, y]) => [Math.round(x), Math.round(y)]), C.SKY));
  }

  const TX = (i) => 58 + i * 13;
  const TY = 36;

  const scene = {
    title: 'THE SETUP',
    mag: '×1',
    dur: 9,
    caption: 'The fluctuation test: start many small cultures from a few cells each and grow them separately, with no phage. Grow one large culture as a control.',
    captionAt: 0.4,
    draw(t) {
      const grow = seg(t, 2.6, 6.2);
      const dens = 0.1 + 0.7 * ease.inOut(grow);

      // Starter culture feeds the tubes.
      flask(28, 40, 34, 10, 8, 28, 0.7, 0.35);
      G.textCBg('STARTER', 28, 80, C.SKY, C.VOID);
      for (let i = 0; i < 20; i++) {
        const t0 = 0.5 + i * 0.09;
        const k = seg(t, t0, t0 + 0.5);
        if (k > 0 && k < 1) {
          // a drop arcs from the starter to the tube
          const x = lerp(28, TX(i) + 3, k), y = lerp(38, TY - 2, k) - Math.sin(k * Math.PI) * 12;
          G.glow(() => G.pset(Math.round(x), Math.round(y), C.CYAN_L));
        }
        L.tube(TX(i), TY, k >= 1 ? 0.55 : 0, k >= 1 ? dens : 0, false);
      }
      G.textBg('20 PARALLEL CULTURES', 58, 24, C.CYAN_L, C.VOID);

      // Bulk control culture.
      flask(200, 86, 50, 12, 14, 56, t > 2.2 ? 0.8 : 0, dens);
      G.textBg('1 LARGE CULTURE', 236, 104, C.CYAN_L, C.VOID);
      G.textBg('(CONTROL)', 236, 111, C.SKY, C.VOID);

      // Growth readout.
      const e = Math.round(lerp(2, 8, ease.inOut(grow)));
      HUD.panel(10, 98, 132, 40, 'GROWTH', C.CYAN);
      G.text('CELLS PER TUBE ~10^' + e, 14, 109, C.ICE);
      G.text('NO PHAGE PRESENT', 14, 118, C.PINK);
      G.rect(14, 128, 124, 3, C.NAVY);
      G.rect(14, 128, Math.round(124 * grow), 3, C.CYAN);
    },
  };

  (global.SCENES = global.SCENES || [])[3] = scene;
})(window);
