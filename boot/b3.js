// Scene 3 — A revision to Orwell.
(function (global) {
  'use strict';
  const { C } = G;
  const scene = {
    title: 'REVISED EDITION', mag: '1984', dur: 10, notToScale: false,
    caption: 'With apologies to Orwell.',
    captionAt: 0.3,
    draw(t) {
      HUD.panel(20, 24, 280, 108, 'QUOTE', C.CYAN);
      G.typeText('IF YOU WANT A PICTURE OF THE FUTURE,\nIMAGINE A BOOT STAMPING ON A HUMAN\nFACE -', 30, 38, C.ICE, t - 0.4, { cps: 40, cursor: t < 3.6 });
      if (t >= 3.2) {
        G.text('FOREVER.', 58, 54, C.ICE);
        if (t >= 5.0) G.glow(() => G.hline(57, 89, 56, C.MAGENTA));
      }
      if (t >= 5.6) G.glitchText("WHILE SAYING 'AND YOU'RE RIGHT", 30, 68, C.PINK, t - 5.6, 0.5);
      if (t >= 6.2) G.glitchText("TO BE ANNOYED' - FOREVER.", 30, 77, C.PINK, t - 6.2, 0.5);
      if (t >= 2.6) G.text('- GEORGE ORWELL, 1984', 30, 100, C.SKY);
      if (t >= 7.2) G.text('  (REVISED BY A LANGUAGE MODEL)', 30, 110, C.MAGENTA);
    },
  };
  (global.SCENES = global.SCENES || [])[3] = scene;
})(window);
