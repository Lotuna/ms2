// Scene 3 — Why it works: averaging many loci, each person's small leans add
// up, so the two clouds separate.
(function (global) {
  'use strict';
  const { C, seg, ease } = G;

  const N = 48, MAXL = 50;
  const PX = 34, PY = 30, S = 100; // plot box
  // Cumulative lit-allele counts per person for x-axis loci (0..49) and
  // y-axis loci (50..99).
  const PEOPLE = [];
  for (let i = 0; i < 2 * N; i++) {
    const p = i < N ? W.PA : W.PB;
    const cx = [0], cy = [0];
    for (let l = 0; l < MAXL; l++) {
      cx.push(cx[l] + W.geno(i, l, p));
      cy.push(cy[l] + W.geno(i, l + MAXL, p));
    }
    PEOPLE.push({ a: i < N, cx, cy, jx: G.rnd(i, 31) * 4 - 2, jy: G.rnd(i, 37) * 4 - 2 });
  }
  const STEPS = [1, 2, 4, 8, 16, 32, 50];

  const scene = {
    title: 'CORRELATION',
    mag: 'MODEL',
    dur: 10,
    notToScale: false,
    caption: "Each axis averages a different set of loci. Group membership tilts every locus the same way, so a person's small leans add up instead of cancelling. One-locus-at-a-time summaries leave this out.",
    captionAt: 0.3,
    draw(t) {
      const step = Math.min(STEPS.length - 1, Math.floor(seg(t, 0.6, 6.2) * STEPS.length));
      const L = STEPS[step];

      G.rect(PX, PY, S, S, C.VOID);
      G.rectO(PX - 1, PY - 1, S + 2, S + 2, C.BLUE2);
      G.line(PX, PY + S - 1, PX + S - 1, PY, C.NAVY2, [1, 2, 0]);
      for (const p of PEOPLE) {
        const fx = p.cx[L] / (2 * L), fy = p.cy[L] / (2 * L);
        const x = Math.round(PX + 4 + fx * (S - 10) + p.jx), y = Math.round(PY + 4 + (1 - fy) * (S - 10) + p.jy);
        G.glow(() => G.rect(x, y, 2, 2, p.a ? C.CYAN_L : C.PINK));
      }
      G.text(L + ' LOCI PER AXIS', PX, PY + S + 3, C.SKY);

      HUD.panel(150, 21, 160, 64, 'WHAT CHANGES', C.CYAN);
      G.text('LOCI PER AXIS: ' + L, 154, 32, C.CYAN_L);
      G.text('EACH DOT: ONE PERSON', 154, 41, C.ICE);
      G.text('AXIS: SHARE OF A-LEANING', 154, 48, C.SKY);
      G.text('ALLELES ON ITS LOCI', 154, 55, C.SKY);
      G.text('SPREAD SHRINKS AS LOCI', 154, 66, C.ICE);
      G.text('ADD UP; THE GAP STAYS', 154, 73, C.ICE);

      if (t >= 6.6) {
        HUD.panel(150, 92, 160, 49, null, C.MAGENTA);
        G.typeText('THE SIGNAL IS IN HOW\nALLELES AT DIFFERENT LOCI\nVARY TOGETHER, NOT IN\nANY SINGLE LOCUS.', 155, 97, C.PINK, t - 6.6, { cps: 40 });
      }
      G.textBg('A', PX + S - 10, PY + 3, C.CYAN_L, C.VOID);
      G.textBg('B', PX + 4, PY + S - 9, C.PINK, C.VOID);
    },
  };

  (global.SCENES = global.SCENES || [])[3] = scene;
})(window);
