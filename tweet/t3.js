// Scene 3 — "Productivity is going to drop": promised curve vs the tweet's.
(function (global) {
  'use strict';
  const { C, seg, ease } = G;

  const X0 = 22, Y0 = 34, CW = 150, CH = 70; // chart box

  const scene = {
    title: 'STEP 3: OUTPUT FALLS',
    mag: 'CLAIM',
    dur: 9,
    notToScale: false,
    caption: "Step 3: put steps 1 and 2 together and AI makes the economy less productive, not more. That is the opposite of what AI's backers promise.",
    captionAt: 0.3,
    draw(t) {
      TW.quote('PRODUCTIVITY IS GOING TO DROP');
      G.rectO(X0 - 1, Y0 - 1, CW + 2, CH + 2, C.BLUE2);
      G.line(X0, Y0 + CH / 2, X0 + CW - 1, Y0 + CH / 2, C.NAVY2, [2, 2, 0]);
      G.text('NOW', X0, Y0 + CH + 3, C.SKY); G.text('LATER', X0 + CW - 19, Y0 + CH + 3, C.SKY);
      G.text('OUTPUT PER HOUR', X0 + 2, Y0 + 2, C.SKY);

      const k = ease.inOut(seg(t, 0.8, 4.0));
      const n = Math.round(CW * k);
      const up = [], dn = [];
      for (let i = 0; i < n; i++) {
        const u = i / CW;
        up.push([X0 + i, Math.round(Y0 + CH / 2 - u * u * 28)]);
        dn.push([X0 + i, Math.round(Y0 + CH / 2 + u * 26 + Math.sin(u * 12) * 2)]);
      }
      if (up.length > 1) G.glow(() => G.polyline(up, C.CYAN));
      if (dn.length > 1 && t >= 1.6) G.glow(() => G.polyline(dn.slice(0, Math.max(2, Math.round(dn.length * seg(t, 1.6, 4.4)))), C.MAGENTA));
      if (t >= 2.4) { G.textBg('PROMISED', X0 + CW - 34, Y0 + 6, C.CYAN_L, C.VOID); }
      if (t >= 4.0) { G.textBg("TWEET'S FORECAST", X0 + CW - 66, Y0 + CH - 9, C.PINK, C.VOID); }

      if (t >= 4.4) {
        G.text('1 HACKS     -> LOST TIME', 12, 116, C.ICE);
        G.text('2 BRAIN FRY -> LESS WORK', 12, 124, C.ICE);
      }

      TW.notes(t, 'AI WAS SUPPOSED TO MAKE WORKERS MORE PRODUCTIVE. THE TWEET SAYS STEPS 1 AND 2 WILL MORE THAN CANCEL THAT OUT, SO OUTPUT FALLS.',
        'THIS IS A FORECAST, NOT DATA. EARLY MEASUREMENTS OF AI AT WORK ARE MIXED.');
    },
  };

  (global.SCENES = global.SCENES || [])[3] = scene;
})(window);
