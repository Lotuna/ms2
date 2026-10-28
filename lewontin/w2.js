// Scene 2 — Adding loci: each locus keeps its 85/15 split, but the combined
// score separates the groups.
(function (global) {
  'use strict';
  const { C, seg } = G;

  const STEPS = [1, 2, 3, 5, 10, 20, 50, 100];
  const X0 = 40, XW = 240, BASE = 100, H = 56;
  const CACHE = {};
  function dists(L) {
    if (!CACHE[L]) CACHE[L] = { a: W.pmf(2 * L, W.PA), b: W.pmf(2 * L, W.PB) };
    return CACHE[L];
  }

  const scene = {
    title: 'ADDING LOCI',
    mag: 'MODEL',
    dur: 11,
    notToScale: false,
    caption: 'Add independent loci, each with the same small difference. Every locus still splits 85/15, yet the combined score pulls the groups apart: about 4% error with 10 loci, almost none with 100.',
    captionAt: 0.3,
    draw(t) {
      const step = Math.min(STEPS.length - 1, Math.floor(seg(t, 0.6, 7.6) * STEPS.length));
      const L = STEPS[step];
      const { a, b } = dists(L);
      const n = 2 * L;
      const max = Math.max(...a, ...b);

      G.textBg('SCORE = SHARE OF A-LEANING ALLELES, ALL LOCI', 14, 22, C.ICE, C.VOID);
      G.hline(X0 - 2, X0 + XW + 2, BASE + 1, C.SKY);
      G.text('0%', X0 - 4, BASE + 4, C.SKY); G.text('50%', X0 + XW / 2 - 5, BASE + 4, C.SKY); G.text('100%', X0 + XW - 8, BASE + 4, C.SKY);
      G.line(X0 + XW / 2, 34, X0 + XW / 2, BASE, C.BLUE2, [2, 2, 0]);

      // Bars: one per possible score; B drawn over A with dithered overlap.
      const bw = Math.max(1, Math.min(10, Math.floor(XW / (n + 1)) - 1));
      for (const [arr, c, alpha] of [[a, C.CYAN, 1], [b, C.MAGENTA, 0.6]]) {
        G.save(); G.alpha(alpha);
        for (let k = 0; k <= n; k++) {
          const h = Math.round(arr[k] / max * H);
          if (h <= 0) continue;
          const x = Math.round(X0 + (k / n) * XW - bw / 2);
          G.rect(x, BASE - h + 1, bw, h, c);
        }
        G.restore();
      }
      G.textBg('GROUP A', X0 + XW - 34, 36, C.CYAN_L, C.VOID);
      G.textBg('GROUP B', X0 + 2, 36, C.PINK, C.VOID);

      // Readouts.
      HUD.panel(14, 112, 140, 29, null, C.CYAN);
      G.text('LOCI: ' + L, 18, 116, C.CYAN_L);
      G.text('MISCLASSIFIED: ' + W.pct(W.misclass(L)), 18, 125, C.MAGENTA);
      G.text('(TOY MODEL, F = 0.15)', 18, 133, C.SKY);
      HUD.panel(162, 112, 144, 29, null, C.MAGENTA);
      G.text('EACH LOCUS, STILL:', 166, 116, C.ICE);
      W.shareBar(167, 125, 134, [[0.85, C.CYAN_D], [0.15, C.MAGENTA]]);
      G.text('85% WITHIN / 15% BETWEEN', 166, 133, C.SKY);
    },
  };

  (global.SCENES = global.SCENES || [])[2] = scene;
})(window);
