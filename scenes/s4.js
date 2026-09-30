// Scene 4 — Replication: replicase copies + into a - template, then makes
// many new + strands from it.
(function (global) {
  'use strict';
  const { C, seg, ease, lerp } = G;

  const X0 = 40, X1 = 280;
  const PLUS_Y = 52, MINUS_Y0 = 62, MINUS_Y1 = 102;
  const PINS = [70, 118, 166, 214, 250];
  const COPIES = [4.2, 4.8, 5.4, 6.0, 6.6, 7.2]; // start times on the - template
  const COPY_D = 2.0;

  const scene = {
    title: 'REPLICATION',
    mag: '×2M',
    dur: 9.5,
    caption: 'Replicase copies the + strand into a - strand template, then uses that template to make many new + strands.',
    captionAt: 0.4,
    draw(t) {
      // Original + strand (template for round 1).
      S.rna(X0, X1, PLUS_Y, { pins: PINS, dir: -1, stem: 4 });
      G.textBg("(+)", X1 + 5, PLUS_Y - 2, C.CYAN_L, C.VOID);
      G.text("5'", X0 - 9, PLUS_Y - 2, C.SKY);

      // Round 1: replicase starts at the 3' end and walks to the 5' end.
      const a = ease.inOut(seg(t, 0.6, 3.4));
      const xr = Math.round(lerp(X1, X0, a));
      const drop = ease.inOut(seg(t, 3.4, 4.2));
      const minusY = Math.round(lerp(MINUS_Y0, MINUS_Y1, drop));
      if (t >= 0.6) {
        S.rna(xr, X1, minusY, { c: C.PINK, rung: C.WHITE, pins: drop > 0.5 ? PINS : [], dir: 1, stem: 4 });
      }
      if (drop > 0.2) G.textBg('(-)', X1 + 5, minusY - 2, C.PINK, C.VOID);
      if (drop >= 1) G.text("3'", X0 - 9, minusY - 2, C.SKY);

      const active = [];
      if (t >= 0.3 && t < 3.6) active.push([xr, PLUS_Y + 5]);

      // Round 2: several replicases on the - template make new + strands.
      let done = 0;
      COPIES.forEach((t0, i) => {
        const u = seg(t, t0, t0 + COPY_D);
        if (t < t0) return;
        if (u >= 1) {
          done++;
          // finished strand balls up and drifts to the tally
          const k = ease.inOut(seg(t, t0 + COPY_D, t0 + COPY_D + 0.8));
          S.rnaKnot(Math.round(lerp(X1 - 18, 150 + i * 16, k)), Math.round(lerp(MINUS_Y1 - 21, 126, k)), 5, 60 + i);
          return;
        }
        const x = Math.round(lerp(X0, X1, ease.inOut(u)));
        // Nascent + strand leaves the complex and folds up as it is made.
        const len = x - X0;
        const kx = x - 18, ky = MINUS_Y1 - 20;
        G.glow(() => G.polyline([[x - 3, MINUS_Y1 - 7], [x - 10, MINUS_Y1 - 12], [kx, ky]], C.CYAN));
        if (len > 18) S.rnaKnot(kx, ky - 1, Math.min(7, 2 + len / 40), 60 + i);
        active.push([x, MINUS_Y1 - 5]);
      });
      active.forEach(([ax, ay]) => S.replicase(ax, ay));

      // Replicase label with leader to the most recent complex.
      G.textBg('REPLICASE + HOST', 10, 23, C.PINK, C.VOID);
      G.textBg('EF-TU, EF-TS, S1', 10, 30, C.PINK, C.VOID);
      if (active.length) {
        const [lx, ly] = active[active.length - 1];
        G.line(40, 36, lx - 2, ly - 5, C.PURPLE, [2, 1, 0]);
      }

      // Flow + tally panel.
      HUD.panel(8, 110, 118, 30, 'COPY FLOW', C.CYAN);
      let fx = 12;
      fx += G.text('(+)', fx, 120, C.CYAN_L) + 2;
      fx += G.text('>', fx, 120, t > 0.6 ? C.ICE : C.NAVY2) + 2;
      fx += G.text('(-)', fx, 120, t > 3.4 ? C.PINK : C.NAVY2) + 2;
      fx += G.text('>', fx, 120, t > 4.2 ? C.ICE : C.NAVY2) + 2;
      G.text('(+)(+)(+)...', fx, 120, t > 4.2 ? C.CYAN_L : C.NAVY2);
      G.text('NEW (+) STRANDS: ' + done + (done >= COPIES.length ? '...' : ''), 12, 130, C.ICE);

      HUD.zoomReveal(t, 0.5, [150, 80, 11, 11], 'CYTOPLASM');
    },
  };

  (global.SCENES = global.SCENES || [])[4] = scene;
})(window);
