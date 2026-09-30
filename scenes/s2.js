// Scene 2 — Entry: the pilus retracts, dragging MS2 to the cell surface;
// maturation protein + RNA go in, the empty capsid stays outside.
(function (global) {
  'use strict';
  const { C, seg, ease, lerp } = G;

  const ENV_Y = 106; // outer membrane top row
  const TUBE_X = 150, TUBE_W = 7;
  const CAP_R = 14;
  const CAP_X = TUBE_X + TUBE_W + CAP_R; // capsid rim touches tube's right edge

  // Genome path into the cell: from the maturation protein down the pilus
  // stub, through both membranes, then coiling into the cytoplasm.
  const ENTRY = [[158, 91], [159, 100], [159, 112], [158, 123], [150, 129], [138, 131], [124, 128], [110, 133], [96, 131], [84, 136]];

  const scene = {
    title: 'ENTRY',
    mag: '×2M',
    dur: 9,
    caption: 'The pilus retracts, pulling MS2 to the cell. The maturation protein and RNA genome enter together; the empty capsid stays outside.',
    captionAt: 0.6,
    draw(t) {
      const env = S.envelope(5, 314, ENV_Y, [[TUBE_X - 1, TUBE_X + TUBE_W]], 143);

      // Retraction: tube top and attached capsid ride down together.
      const r = ease.inOut(seg(t, 1.0, 4.2));
      const yTop = Math.round(lerp(24, 73, r));
      const capY = yTop + 18;
      S.pilusTube(TUBE_X, yTop, env.im + 3, TUBE_W, yTop);
      if (t > 1.0 && t < 4.2) {
        // chevrons marching down beside the tube
        for (let k = 0; k < 3; k++) {
          const y = yTop + 6 + ((Math.floor(t * 20) + k * 8) % 24);
          G.glow(() => { G.pset(TUBE_X - 4, y, C.MAGENTA); G.pset(TUBE_X - 3, y + 1, C.MAGENTA); G.pset(TUBE_X - 2, y, C.MAGENTA); });
        }
      }

      // Ejection progress (0..1).
      const ej = ease.inOut(seg(t, 4.6, 7.0));
      const ejected = t >= 4.6;

      // Capsid with genome visible through it (x-ray), then empty.
      if (!ejected || ej < 1) {
        G.save(); G.clip(CAP_X - CAP_R, capY - CAP_R, CAP_R * 2, CAP_R * 2);
        S.rnaKnot(CAP_X, capY, Math.max(1, 10 * (1 - ej)), 21);
        G.restore();
      }
      G.save();
      if (!ejected) G.alpha(0.75);
      S.capsid(CAP_X, capY, CAP_R, { mat: ejected ? null : Math.PI, rot: 0.3, empty: ej >= 1 });
      G.restore();

      // Genome + maturation protein threading into the cytoplasm.
      if (ejected) {
        let head = null;
        G.glow(() => { head = G.partial(ENTRY, 0, Math.max(0.02, ej), C.CYAN); });
        if (head) G.glow(() => G.rect(Math.round(head[0]) - 1, Math.round(head[1]) - 1, 2, 2, C.MAGENTA));
        // hairpins pop out along the entered strand
        const R = G.resample(ENTRY, 1).pts;
        for (const f of [0.55, 0.72, 0.88]) {
          if (ej < f + 0.05) continue;
          const p = R[Math.round(f * (R.length - 1))];
          G.glow(() => { G.vline(Math.round(p[0]), Math.round(p[1]) + 1, Math.round(p[1]) + 3, C.CYAN); G.vline(Math.round(p[0]) + 2, Math.round(p[1]) + 1, Math.round(p[1]) + 3, C.CYAN); G.pset(Math.round(p[0]) + 1, Math.round(p[1]) + 4, C.CYAN); });
        }
      }

      // Labels.
      if (t < 4.2) HUD.label('F PILUS', 110, yTop + 2, TUBE_X - 1, yTop + 4, C.ICE, C.SKY);
      if (t > 1.0 && t < 4.6) G.textBg('RETRACTING', 102, yTop + 10, C.MAGENTA, C.VOID);
      if (!ejected) HUD.label('MATURATION PROTEIN', 60, capY + 4, TUBE_X + TUBE_W, capY, C.PINK, C.PURPLE);
      if (ej >= 1) HUD.label('EMPTY CAPSID STAYS OUT', 194, capY - 20, CAP_X + 6, capY - 10, C.SKY, C.BLUE2);
      if (ej > 0.4) HUD.label('RNA + MATURATION PROTEIN', 172, 125, 140, 131, C.CYAN_L, C.SKY);
      G.textBg('OUTER MEMBRANE', 8, env.om - 8, C.SKY, C.VOID);
      G.textBg('INNER MEMBRANE', 8, env.im + 5, C.SKY, C.VOID);
      G.textBg('CYTOPLASM', 8, env.im + 12, C.SKY, C.VOID);

      HUD.legend(222, 22, 88, [
        [(x, y) => S.capsid(x, y, 3, {}), 'COAT SHELL'],
        [(x, y) => G.glow(() => G.rect(x - 1, y - 1, 2, 2, C.MAGENTA)), 'MATURATION PROT.'],
        [(x, y) => G.glow(() => G.hline(x - 3, x + 2, y, C.CYAN)), '(+) RNA GENOME'],
      ]);

      HUD.zoomReveal(t, 0.6, [TUBE_X + 2, 40, 11, 11], 'ZOOM ×40');
    },
  };

  (global.SCENES = global.SCENES || [])[2] = scene;
})(window);
