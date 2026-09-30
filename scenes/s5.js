// Scene 5 — Regulation: a coat dimer clamps the hairpin that hides the
// replicase start codon; translation of replicase stops. The same hairpin
// is the packaging signal.
(function (global) {
  'use strict';
  const { C, seg, ease, lerp } = G;

  const SY = 120; // strand row
  const HX = 160; // hairpin centre
  const TOP = 82; // top of the stem

  // Coat dimer drawn at this closer zoom: two round lobes.
  function bigDimer(x, y, hot) {
    x = Math.round(x); y = Math.round(y);
    G.glow(() => { G.circle(x - 3, y, 2, hot ? C.ICE : C.SKY); G.circle(x + 3, y, 2, hot ? C.ICE : C.CYAN_L); });
    G.disc(x - 3, y, 1, C.AZURE); G.disc(x + 3, y, 1, C.CYAN_D);
  }
  function bigRibosome(x, y) {
    x = Math.round(x); y = Math.round(y);
    G.glow(() => { G.circle(x, y - 9, 8, C.PINK); G.rectO(x - 9, y + 1, 19, 5, C.PINK); });
    G.disc(x, y - 9, 7, (px, py) => G.dith(px, py, 0.3 + (py - y + 16) / 40, C.MAGENTA, C.PURPLE));
    G.rect(x - 8, y + 2, 17, 3, C.PURPLE);
    G.text('RIBO', x - 7, y - 11, C.WHITE);
  }

  // Drifting dimers: [x0, y0, gather x, gather y].
  const CROWD = [[40, 70, HX - 12, TOP - 12], [270, 78, HX + 12, TOP - 12], [230, 100, HX, TOP - 18], [90, 96, HX - 17, TOP - 3]];

  const scene = {
    title: 'REGULATION',
    mag: '×4M',
    dur: 7.5,
    caption: 'Coat protein dimers bind a hairpin at the start of the replicase gene, shutting off replicase translation. The same hairpin signals packaging.',
    captionAt: 0.3,
    draw(t) {
      const blocked = t >= 2.2;
      HUD.panel(8, 21, 304, 30, 'GENE MAP', C.CYAN);
      HUD.geneMap(22, 31, 276, { repOff: t >= 3.8, hot: t >= 3.8 && t < 4.4 && Math.floor(t * 8) % 2 ? 'REP' : null });

      // Strand + the operator hairpin.
      G.glow(() => {
        G.hline(8, HX - 5, SY, C.CYAN); G.hline(HX + 5, 312, SY, C.CYAN);
        G.line(HX - 5, SY, HX - 4, SY - 1, C.CYAN); G.line(HX + 5, SY, HX + 4, SY - 1, C.CYAN);
        G.vline(HX - 4, TOP, SY - 1, blocked ? C.CYAN_L : C.CYAN);
        G.vline(HX + 4, TOP, SY - 1, blocked ? C.CYAN_L : C.CYAN);
        G.arc(HX, TOP, 4, Math.PI, Math.PI * 2, blocked ? C.CYAN_L : C.CYAN);
      });
      for (let y = TOP + 3; y < SY - 2; y += 3) G.hline(HX - 3, HX + 3, y, C.ICE); // base pairs
      // Start codon hidden in the stem.
      G.glow(() => G.vline(HX + 4, SY - 12, SY - 8, C.WHITE));
      HUD.label('AUG: REPLICASE START', 196, SY - 14, HX + 6, SY - 10, C.WHITE, C.SKY);
      HUD.label('OPERATOR HAIRPIN', 36, TOP + 6, HX - 6, TOP + 6, C.CYAN_L, C.SKY);

      // Dimer that clamps the loop.
      const b = ease.out(seg(t, 0.6, 2.2));
      const dx = lerp(250, HX, b) + Math.sin(t * 3) * 6 * (1 - b);
      const dy = lerp(64, TOP - 6, b) + Math.cos(t * 2.4) * 4 * (1 - b);
      bigDimer(dx, dy, blocked);
      if (t >= 2.2 && t < 2.5) G.glow(() => G.circle(HX, TOP - 5, 8, C.WHITE));
      if (t > 1.0) HUD.label('COAT DIMER', 214, 58, Math.round(dx) + 6, Math.round(dy), C.SKY, C.BLUE2);

      // Ribosome slides in but can't reach the buried AUG.
      const rp = ease.out(seg(t, 2.3, 3.6));
      const jit = t > 3.6 && t < 5.2 ? (Math.floor(t * 12) % 2) : 0;
      const rx = lerp(-10, HX - 19, rp) - jit;
      if (t >= 2.3) bigRibosome(rx, SY);
      if (t >= 3.6) {
        if (Math.floor(t * 4) % 2 === 0) G.glow(() => { G.line(HX - 11, SY - 22, HX - 5, SY - 16, C.MAGENTA); G.line(HX - 5, SY - 22, HX - 11, SY - 16, C.MAGENTA); });
        G.textBg('REPLICASE OFF', 40, SY - 20, C.MAGENTA, C.VOID);
      }

      // Same hairpin = packaging signal: more dimers gather.
      if (t >= 4.6) {
        CROWD.forEach(([x0, y0, gx, gy], i) => {
          const g = ease.inOut(seg(t, 4.6 + i * 0.25, 6.0 + i * 0.25));
          bigDimer(lerp(x0, gx, g) + Math.sin(t * 2 + i) * 3 * (1 - g), lerp(y0, gy, g), g >= 1);
        });
        G.textBg('SAME HAIRPIN =', 214, 76, C.PINK, C.VOID);
        G.textBg('PACKAGING SIGNAL', 214, 83, C.PINK, C.VOID);
      } else {
        CROWD.forEach(([x0, y0], i) => bigDimer(x0 + Math.sin(t * 1.7 + i) * 5, y0 + Math.cos(t * 1.3 + i * 2) * 3, false));
      }
    },
  };

  (global.SCENES = global.SCENES || [])[5] = scene;
})(window);
