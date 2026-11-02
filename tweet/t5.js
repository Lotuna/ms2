// Scene 5 — "except Trump is old, started a war": the safety net tears.
(function (global) {
  'use strict';
  const { C, seg, ease, lerp } = G;

  const BX = 30, BASE = 104;

  const scene = {
    title: 'STEP 5: THE EXCEPT',
    mag: 'CLAIM',
    dur: 10,
    notToScale: false,
    caption: "Step 5, the 'except': the author thinks no rescue will come, because the president is old and has started a war. Those are the author's claims, and rescues also involve the Fed and Congress.",
    captionAt: 0.3,
    draw(t) {
      TW.quote('EXCEPT TRUMP IS OLD, STARTED A WAR');
      // Net with holes opening.
      const tear = ease.inOut(seg(t, 2.6, 4.2));
      const x0 = BX + 13 - 50;
      for (let x = 0; x < 100; x++) {
        const hole = Math.abs(x - 50) < tear * 24 || Math.abs(x - 16) < tear * 7 || Math.abs(x - 84) < tear * 8;
        if (!hole) G.pset(x0 + x, BASE + 6 + ((x >> 2) % 2), C.SKY);
      }
      // Tower falls through once the net tears.
      const fall = ease.in(seg(t, 4.6, 6.0));
      for (let i = 0; i < 8; i++) {
        const y = Math.round(BASE - 8 - i * 8 + fall * (60 + i * 3));
        const x = BX + Math.round(fall * (i % 2 ? 4 : -4) * i * 0.4);
        if (y > 140) continue;
        G.rect(x, y, 26, 7, C.NAVY2); G.rectO(x, y, 26, 7, fall > 0 ? C.PURPLE : C.BLUE2); G.text('$', x + 21, y + 1, C.PINK);
      }
      if (t >= 0.8 && t < 2.6) {
        const s = 'EXCEPT';
        G.glow(() => G.glitchText(s, 112, 40, C.MAGENTA, t - 0.8, 0.5));
      }
      if (t >= 2.0) {
        G.textBg("AUTHOR'S REASONS:", 104, 40, C.PINK, C.VOID);
        G.textBg('- AN OLD PRESIDENT', 104, 48, C.ICE, C.VOID);
        G.textBg('- A WAR', 104, 55, C.ICE, C.VOID);
      }
      if (t >= 6.2) G.textBg('NO RESCUE -> CRASH', 104, 70, C.MAGENTA, C.VOID);

      TW.notes(t, "THE GOVERNMENT IS TOO DISTRACTED OR TOO STRETCHED TO BAIL AI OUT. THE NET THAT CAUGHT 2008 ISN'T THERE THIS TIME.",
        'THE FED AND CONGRESS ALSO RUN RESCUES, NOT ONE PERSON. THE WAR CLAIM IS THE AUTHOR\'S.');
    },
  };

  (global.SCENES = global.SCENES || [])[5] = scene;
})(window);
