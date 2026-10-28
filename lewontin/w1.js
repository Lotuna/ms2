// Scene 1 — One locus: groups differ in allele frequency, but most variation
// is within groups, and one locus classifies people poorly.
(function (global) {
  'use strict';
  const { C, seg, ease } = G;

  // 16 people per group, 32 alleles each; A carries 22 lit alleles (69%),
  // B carries 10 (31%), spread deterministically.
  function alleles(nLit, seed) {
    const a = Array.from({ length: 32 }, (_, i) => (i < nLit ? 1 : 0));
    for (let i = 31; i > 0; i--) { const j = Math.floor(G.rnd(i, seed) * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return Array.from({ length: 16 }, (_, i) => a[2 * i] + a[2 * i + 1]);
  }
  const GA = alleles(22, 3), GB = alleles(10, 7);

  function group(x0, gs, c, label, t0, t) {
    G.textBg(label, x0, 22, c, C.VOID);
    gs.forEach((g, i) => {
      const a = seg(t, t0 + i * 0.04, t0 + 0.3 + i * 0.04);
      if (a <= 0) return;
      const x = x0 + (i % 8) * 17, y = 32 + Math.floor(i / 8) * 20;
      G.save(); G.alpha(a);
      W.person(x, y, c, false);
      W.genotype(x, y + 10, g);
      G.restore();
    });
  }

  const scene = {
    title: 'ONE LOCUS',
    mag: 'MODEL',
    dur: 10,
    notToScale: false,
    caption: 'A toy model: at one locus, an allele is common in group A (69%) and less common in group B (31%). 85% of the variation is still within groups, and this locus alone misclassifies about 31% of people.',
    captionAt: 0.3,
    draw(t) {
      group(14, GA, C.CYAN_L, 'GROUP A: ALLELE X 69%', 0.2, t);
      group(170, GB, C.PINK, 'GROUP B: ALLELE X 31%', 0.6, t);
      G.line(160, 20, 160, 72, C.BLUE2, [2, 2, 0]);

      if (t >= 2.0) {
        G.text('VARIANCE AT THIS LOCUS', 14, 78, C.ICE);
        G.rect(200, 78, 2, 2, C.ICE); G.text('= ALLELE X', 205, 77, C.SKY);
        W.shareBar(15, 87, 290, [[0.85, C.CYAN_D], [0.15, C.MAGENTA]], ease.inOut(seg(t, 2.0, 3.0)));
        if (t >= 3.0) { G.text('85% WITHIN GROUPS', 16, 96, C.CYAN_L); G.text('15% BETWEEN', 254, 96, C.PINK); }
      }

      // A stranger: which group?
      if (t >= 4.4) {
        HUD.panel(14, 106, 292, 34, 'GUESS THE GROUP FROM THIS ONE LOCUS', C.CYAN);
        W.person(22, 118, C.ICE, true);
        W.genotype(22, 128, 1);
        if (Math.floor(t * 3) % 2 === 0) G.text('?', 30, 118, C.WHITE);
        if (t >= 5.4) G.typeText('ONE X ALLELE: COULD BE EITHER GROUP.', 40, 117, C.ICE, t - 5.4, { cps: 40, cursor: false });
        if (t >= 6.6) G.typeText('BEST POSSIBLE GUESS IS WRONG ' + W.pct(W.misclass(1)) + ' OF THE TIME', 40, 127, C.MAGENTA, t - 6.6, { cps: 40 });
      }
    },
  };

  (global.SCENES = global.SCENES || [])[1] = scene;
})(window);
