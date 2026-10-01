// Scene 7 — Conclusion: clone size depends on when the mutation happened.
(function (global) {
  'use strict';
  const { C, seg, ease } = G;

  const W = 84, Y0 = 36, DY = 11, GENS = 4;
  const CASES = [
    { x: 14, title: 'EARLY MUTATION', mut: (g, k) => g >= 1 && (k >> (g - 1)) === 0, res: 'BIG CLONE', ex: 'JACKPOT: 35-107', n: 60, c: C.PINK },
    { x: 118, title: 'LATE MUTATION', mut: (g, k) => g === 4 && k === 11, res: '1 MUTANT', ex: 'FEW: 1-6', n: 3, c: C.ICE },
    { x: 222, title: 'NO MUTATION', mut: () => false, res: 'NONE', ex: 'ZERO: 11 OF 20', n: 0, c: C.SKY },
  ];

  const scene = {
    title: 'CONCLUSION',
    mag: 'MODEL',
    dur: 9,
    notToScale: false,
    caption: 'Clone size depends on when a mutation happened. Mutations arise at random, before selection; the phage only reveals them. (Nobel Prize, 1969.)',
    captionAt: 0.4,
    draw(t) {
      const shown = GENS * ease.inOut(seg(t, 0.4, 3.0));
      CASES.forEach((cs, i) => {
        G.textBg(cs.title, cs.x, 22, i === 0 ? C.PINK : C.CYAN_L, C.VOID);
        L.tree(cs.x, Y0, W, GENS, shown, cs.mut, DY);
        if (t >= 3.2) {
          G.textCBg(cs.ex, cs.x + W / 2, Y0 + GENS * DY + 6, cs.c, C.VOID);
          L.plate(cs.x + W / 2, 103, 9, Math.round(cs.n * seg(t, 3.4, 4.4)), 200 + i, { phage: true, hot: i === 0 });
        }
      });
      if (t >= 5.0) {
        HUD.panel(10, 116, 300, 25, null, C.MAGENTA);
        G.typeText('MUTATIONS ARISE AT RANDOM, BEFORE SELECTION.', 15, 120, C.ICE, t - 5.0, { cps: 45, cursor: t < 6.2 });
        if (t >= 6.2) G.typeText('NOBEL PRIZE 1969: DELBRÜCK, HERSHEY, LURIA', 15, 129, C.PINK, t - 6.2, { cps: 45 });
      }
    },
  };

  (global.SCENES = global.SCENES || [])[7] = scene;
})(window);
