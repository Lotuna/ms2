// Scene 1 — Resistance at virus scale: T1 binds its receptor and injects
// DNA into a sensitive cell; a resistant mutant's altered receptor can't
// be bound.
(function (global) {
  'use strict';
  const { C, seg, ease, lerp } = G;

  const ENV_Y = 100;
  const HEAD_R = 7, TAIL = 26;
  const REC_L = [44, 100, 136], REC_R = [196, 250, 292];

  function receptor(x, y, altered) {
    x = Math.round(x);
    G.glow(() => {
      if (!altered) {
        // open barrel with a socket on top
        G.vline(x - 2, y - 5, y - 1, C.CYAN_L); G.vline(x + 2, y - 5, y - 1, C.CYAN_L);
        G.pset(x - 1, y - 5, C.CYAN_L); G.pset(x + 1, y - 5, C.CYAN_L);
      } else {
        // altered: closed, misshapen top
        G.vline(x - 2, y - 4, y - 1, C.PINK); G.vline(x + 2, y - 4, y - 1, C.PINK);
        G.hline(x - 3, x + 3, y - 5, C.MAGENTA);
      }
    });
    G.vline(x - 1, y - 4, y - 1, altered ? C.PURPLE : C.AZURE);
    G.vline(x + 1, y - 4, y - 1, altered ? C.PURPLE : C.AZURE);
  }

  const scene = {
    title: 'T1 AND RESISTANCE',
    mag: '×1M',
    dur: 8,
    caption: 'T1 attaches to a receptor protein on the outer membrane and injects its DNA. A resistant mutant makes an altered receptor, so T1 cannot attach.',
    captionAt: 0.5,
    draw(t) {
      const env = S.envelope(5, 314, ENV_Y, [], 143);
      REC_L.forEach((x) => receptor(x, ENV_Y, false));
      REC_R.forEach((x) => receptor(x, ENV_Y, true));
      G.line(160, 20, 160, 142, C.BLUE2, [2, 2, 0]);
      G.textBg('SENSITIVE CELL', 10, 22, C.CYAN_L, C.VOID);
      G.textBg('RESISTANT MUTANT', 166, 22, C.PINK, C.VOID);

      // Left: lands on receptor, injects DNA.
      const dl = ease.inOut(seg(t, 0.6, 2.6));
      const lyHead = Math.round(lerp(18, ENV_Y - 5 - TAIL - HEAD_R - 1, dl));
      const inj = seg(t, 2.9, 4.8);
      if (inj > 0) {
        const pts = [];
        const n = Math.round(inj * 40);
        for (let i = 0; i <= n; i++) {
          const y = ENV_Y - 4 + i;
          pts.push([REC_L[1] + Math.round(Math.sin(i * 0.5) * (i > 18 ? 6 : 0.6)), Math.min(y, 140 - (i > 30 ? i - 30 : 0))]);
        }
        G.glow(() => G.polyline(pts, C.CYAN));
        pts.forEach(([x, y], i) => { if (i % 3 === 0) G.pset(x + 1, y, C.ICE); });
      }
      G.save(); if (inj >= 1) G.alpha(0.6);
      L.t1(REC_L[1], lyHead, HEAD_R, Math.PI / 2, TAIL, t * (1 - dl) * 3);
      G.restore();
      if (t >= 2.6 && t < 3.0) G.glow(() => G.circle(REC_L[1], ENV_Y - 5, 4, C.WHITE));

      // Right: reaches the altered receptor, fails, drifts off.
      const dr = ease.inOut(seg(t, 0.9, 2.9));
      const back = ease.inOut(seg(t, 3.5, 6.5));
      const rx = Math.round(lerp(REC_R[1], REC_R[1] + 30, back));
      const ryHead = Math.round(lerp(lerp(18, ENV_Y - 5 - TAIL - HEAD_R - 2, dr), 24, back));
      L.t1(rx, ryHead, HEAD_R, Math.PI / 2 + back * 0.5, TAIL, t * 3);
      if (t >= 2.9 && t < 4.4 && Math.floor(t * 6) % 2 === 0) {
        G.glow(() => { G.line(REC_R[1] - 3, ENV_Y - 14, REC_R[1] + 3, ENV_Y - 8, C.MAGENTA); G.line(REC_R[1] + 3, ENV_Y - 14, REC_R[1] - 3, ENV_Y - 8, C.MAGENTA); });
      }

      // Labels.
      HUD.label('T1 PHAGE', 10, 44, REC_L[1] - 8, lyHead, C.PINK, C.PURPLE);
      HUD.label('TONA RECEPTOR', 12, 80, REC_L[0], ENV_Y - 6, C.CYAN_L, C.SKY);
      if (inj > 0.5) G.textBg('DNA INJECTED', 112, 132, C.CYAN_L, C.VOID);
      HUD.label('ALTERED RECEPTOR', 170, 80, REC_R[0], ENV_Y - 6, C.PINK, C.PURPLE);
      if (t >= 3.0) G.textBg("CAN'T ATTACH", 252, 60, C.MAGENTA, C.VOID);
      G.textBg('OUTER MEMBRANE', 166, env.om + 5, C.SKY, C.VOID);

      HUD.zoomReveal(t, 0.6, [150, 60, 11, 11], 'ZOOM ×200');
    },
  };

  (global.SCENES = global.SCENES || [])[1] = scene;
})(window);
