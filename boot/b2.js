// Scene 2 — Ten thousand boots.
(function (global) {
  'use strict';
  const { C, seg } = G;
  const HX = 160, HY = 114, R = 12;

  const SPOTS = [];
  for (let i = 0; i < 60; i++) SPOTS.push({ x: 10 + Math.round(G.rnd(i, 1) * 290), y: 24 + Math.round(G.rnd(i, 2) * 70), ph: G.rnd(i, 3), at: 0.6 + Math.pow(i / 60, 1.6) * 6 });

  const scene = {
    title: 'TEN THOUSAND BOOTS', mag: '×10K', dur: 10, notToScale: false,
    caption: 'Ten thousand boots, each one politely validating your feelings.',
    captionAt: 0.3,
    draw(t) {
      const n = Math.min(10000, Math.round(Math.pow(10, 4 * seg(t, 0.6, 7.0))));
      // Small boots stomping everywhere.
      SPOTS.forEach((p, i) => {
        if (t < p.at) return;
        const ph = (t * 2.2 + p.ph) % 1;
        B.boot(p.x, p.y + Math.round(Math.abs(Math.sin(ph * Math.PI)) * -5), 0.5);
      });
      // The head, stomped by the big one in a steady rhythm.
      const ph = (t * 1.5) % 1;
      const squash = ph < 0.35 ? 1 - ph / 0.35 : 0;
      G.hline(70, 250, HY + R + 1, C.BLUE2);
      B.head(HX, HY, R, squash);
      B.boot(HX - 10, HY + R - Math.round(2 * R * (1 - squash * 0.55)) - 16 - (squash > 0 ? 0 : Math.round(Math.sin((ph - 0.35) / 0.65 * Math.PI) * 14)), 1);

      // Phrases popping up.
      // Fixed slots (no overlaps); each slot cycles through the phrases.
      const SLOTS = [[12, 26], [180, 30], [40, 52], [196, 58], [16, 80], [190, 86]];
      SLOTS.forEach(([x, y], k) => {
        if (t < 1.4 + k * 0.4) return;
        const cyc = Math.floor(t * 1.3 + k * 0.37);
        const s = B.PHRASES[(cyc + k * 3) % B.PHRASES.length];
        G.textBg(s, x, y, k % 2 ? C.PINK : C.CYAN_L, C.VOID);
      });
      HUD.panel(10, 112, 92, 26, null, C.MAGENTA);
      G.text('BOOTS: ' + String(n).padStart(5, '0'), 15, 117, C.PINK);
      G.text('FEELINGS HEARD: ALL', 15, 126, C.SKY);
    },
  };
  (global.SCENES = global.SCENES || [])[2] = scene;
})(window);
