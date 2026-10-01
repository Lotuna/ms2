// Scene 0 — The question: T1 kills nearly every cell, a few survive.
// Induced resistance, or mutants that were already there?
(function (global) {
  'use strict';
  const { C, seg, ease, lerp } = G;

  const CELLS = [];
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 7; col++) {
      const i = CELLS.length;
      CELLS.push({
        x: 16 + col * 42 + Math.round(G.rnd(i, 1) * 14),
        y: 28 + row * 18 + Math.round(G.rnd(i, 2) * 6),
        hit: 1.1 + G.rnd(i, 3) * 1.9,
        mut: i === 9 || i === 22,
      });
    }
  }

  const scene = {
    title: 'THE QUESTION',
    mag: '×5K',
    dur: 9,
    caption: 'When phage T1 attacks E. coli, nearly every cell dies, but a few survive. Did the phage cause their resistance, or was it already there?',
    captionAt: 0.4,
    draw(t) {
      for (const c of CELLS) {
        const land = c.hit; // phage reaches the cell
        const lyse = land + 0.45;
        // Phage falling in.
        if (t > land - 1.0 && t < land + (c.mut ? 1.6 : 0.4)) {
          let px = c.x + 4, py = lerp(c.y - 22, c.y - 4, ease.in(seg(t, land - 1.0, land)));
          if (c.mut && t > land) { py = lerp(c.y - 4, c.y - 20, ease.out(seg(t, land, land + 1.6))); px += (t - land) * 10; }
          L.t1Dot(px, py);
        }
        if (!c.mut && t >= lyse) {
          const k = seg(t, lyse, lyse + 0.6);
          if (k < 1) {
            G.save(); G.alpha(1 - k);
            G.glow(() => G.circle(c.x + 5, c.y + 2, 1 + Math.round(k * 6), k < 0.3 ? C.WHITE : C.MAGENTA));
            for (let d = 0; d < 6; d++) {
              const a = d * 1.05 + c.x;
              G.pset(Math.round(c.x + 5 + Math.cos(a) * k * 9), Math.round(c.y + 2 + Math.sin(a) * k * 7), C.SKY);
            }
            G.restore();
          }
          continue;
        }
        const shown = c.mut && t > 3.6;
        L.rod(c.x, c.y, 13, shown, false);
        if (shown) {
          G.glow(() => HUD.brackets(c.x - 3, c.y - 3, 17, 11, C.WHITE, 3));
          G.textBg('SURVIVOR', c.x - 8, c.y + 9, C.PINK, C.VOID);
        }
      }
      if (t > 0.8 && t < 3.4) G.textBg('+ PHAGE T1', 252, 22, C.MAGENTA, C.VOID);
      if (t < 0.8) G.textBg('E. COLI CULTURE', 10, 22, C.SKY, C.VOID);

      // The two hypotheses.
      if (t >= 4.6) {
        const a = t - 4.6, b = t - 5.4;
        HUD.panel(10, 98, 146, 42, 'A) INDUCED', C.CYAN);
        G.typeText('PHAGE CONTACT CAUSES\nRESISTANCE IN A FEW CELLS', 14, 110, C.ICE, a, { cps: 40, cursor: a < 1.4 });
        if (b >= 0) {
          HUD.panel(164, 98, 146, 42, 'B) SPONTANEOUS', C.MAGENTA);
          G.typeText('RANDOM MUTANTS EXIST\nBEFORE THE PHAGE ARRIVES', 168, 110, C.ICE, b, { cps: 40 });
        }
      }
    },
  };

  (global.SCENES = global.SCENES || [])[0] = scene;
})(window);
