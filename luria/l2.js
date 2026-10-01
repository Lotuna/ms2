// Scene 2 — Two hypotheses as lineage trees, and what each predicts across
// many cultures.
(function (global) {
  'use strict';
  const { C, seg, ease } = G;

  const GENS = 5, DY = 11, Y0 = 34;
  const LX = 14, RX = 172, W = 132;
  const INDUCED_LEAVES = [9, 23];
  const MUT_G = 2, MUT_K = 1; // spontaneous mutation: generation 2, cell 1
  const EXPOSE = 5.6;

  const scene = {
    title: 'TWO HYPOTHESES',
    mag: 'MODEL',
    dur: 10,
    notToScale: false,
    caption: "If phage induces resistance, every culture should end with similar numbers of survivors. If mutations arise at random during growth, an early one makes a huge clone: a 'jackpot'.",
    captionAt: 0.4,
    draw(t) {
      const shown = GENS * ease.inOut(seg(t, 0.6, 5.0));
      const exposed = t >= EXPOSE;

      G.textBg('A) INDUCED', LX, 22, C.CYAN_L, C.VOID);
      G.textBg('B) SPONTANEOUS', RX, 22, C.PINK, C.VOID);
      G.line(159, 20, 159, 142, C.BLUE2, [2, 2, 0]);

      const indMut = (g, k) => exposed && g === GENS && INDUCED_LEAVES.includes(k);
      const spoMut = (g, k) => g >= MUT_G && (k >> (g - MUT_G)) === MUT_K;
      const deadIf = (mut) => (g, k) => exposed && g === GENS && !mut(g, k);
      L.tree(LX, Y0, W, GENS, shown, indMut, DY, deadIf(indMut));
      const pos = L.tree(RX, Y0, W, GENS, shown, spoMut, DY, deadIf(spoMut));

      // Mutation event flashes as generation 2 appears.
      if (shown >= MUT_G && t < 4.2) {
        const [mx, my] = pos(MUT_G, MUT_K);
        if (Math.floor(t * 6) % 2 === 0) G.glow(() => G.circle(Math.round(mx), Math.round(my), 5, C.WHITE));
        G.textBg('MUTATION', Math.round(mx) + 8, Math.round(my) - 2, C.MAGENTA, C.VOID);
      }

      // Phage exposure: everything that isn't resistant dies.
      if (exposed) {
        G.textBg('+ T1: ONLY RESISTANT CELLS SURVIVE', 92, Y0 + GENS * DY + 5, C.MAGENTA, C.VOID);
      }

      // Predictions across many cultures.
      if (t >= 6.6) {
        const a = t - 6.6;
        HUD.panel(10, 102, 144, 39, 'A) PREDICTS', C.CYAN);
        L.bars(16, 112, 14, [3, 2, 4, 3, 2, 3, 4, 2, 3, 3].map((v, i) => v * seg(a, i * 0.05, 0.6 + i * 0.05)), 10, C.CYAN_L);
        G.text('SIMILAR', 70, 113, C.ICE); G.text('COUNTS IN', 70, 120, C.ICE); G.text('EVERY CULTURE', 70, 127, C.ICE);
        HUD.panel(166, 102, 144, 39, 'B) PREDICTS', C.MAGENTA);
        L.bars(172, 112, 14, [0, 0, 9, 0, 1, 0, 0, 3, 0, 0].map((v, i) => v * seg(a, i * 0.05, 0.6 + i * 0.05)), 10, C.PINK);
        G.text('MOSTLY 0,', 226, 113, C.ICE); G.text('RARE HUGE', 226, 120, C.ICE); G.text('JACKPOTS', 226, 127, C.ICE);
      }
    },
  };

  (global.SCENES = global.SCENES || [])[2] = scene;
})(window);
