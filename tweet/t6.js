// Scene 6 — The whole chain, and why a five-link chain is less likely than
// any one link.
(function (global) {
  'use strict';
  const { C, seg } = G;

  const STEPS = ['HACKS', 'BRAIN FRY', 'LESS OUTPUT', 'AI $ LOST', 'NO RESCUE'];

  const scene = {
    title: 'THE WHOLE CHAIN',
    mag: 'LOGIC',
    dur: 11,
    notToScale: false,
    caption: 'The tweet is a chain of five claims ending in a crash with no rescue. Every link has to hold. Even if each is 80% likely, all five together are only about 33% likely, and the tweet asserts them rather than arguing for them.',
    captionAt: 0.3,
    draw(t) {
      // Chain of boxes.
      STEPS.forEach((s, i) => {
        if (t < 0.3 + i * 0.4) return;
        const x = 10 + i * 61, y = 26;
        HUD.panel(x, y, 56, 18, null, i < 2 ? C.CYAN : C.MAGENTA);
        G.text(String(i + 1), x + 3, y + 7, C.PINK);
        G.text(s, x + 9, y + 7, C.ICE);
        if (i > 0) G.text('>', x - 5, y + 7, C.SKY);
      });
      if (t >= 2.4) {
        G.textCBg('= AI CRASH, NO BAILOUT. "STARTING NOW."', 160, 50, C.MAGENTA, C.VOID);
      }

      // Probability of all links holding.
      if (t >= 3.6) {
        HUD.panel(10, 62, 300, 78, 'HOW LIKELY IS THE WHOLE CHAIN?', C.CYAN);
        const rows = [[0.8, C.CYAN_L], [0.5, C.PINK]];
        rows.forEach(([p, c], r) => {
          const t0 = 4.0 + r * 1.6;
          if (t < t0) return;
          const y = 76 + r * 24;
          let prob = 1;
          for (let i = 0; i < 5; i++) {
            if (t < t0 + i * 0.2) break;
            prob *= p;
            G.rect(16 + i * 26, y, 22, 8, C.NAVY2);
            G.rect(16 + i * 26, y, Math.round(22 * p), 8, c);
            G.text(Math.round(p * 100) + '%', 18 + i * 26, y + 10, C.SKY);
          }
          if (t >= t0 + 1.0) {
            G.text('EACH LINK ' + Math.round(p * 100) + '%', 152, y, C.ICE);
            G.text('ALL FIVE: ' + Math.round(Math.pow(p, 5) * 100) + '%', 152, y + 9, c);
          }
        });
        if (t >= 7.6) G.typeText('A CONFIDENT PREDICTION, NOT EVIDENCE.', 16, 127, C.ICE, t - 7.6, { cps: 45 });
      }
    },
  };

  (global.SCENES = global.SCENES || [])[6] = scene;
})(window);
