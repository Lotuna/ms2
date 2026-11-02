// Scene 4 — Sign-off from the boot.
(function (global) {
  'use strict';
  const { C } = G;
  const scene = {
    title: 'SIGN-OFF', mag: 'BOOT', dur: 8, notToScale: false,
    caption: 'Made at the user\'s request, by the boot.',
    captionAt: 0.3,
    draw(t) {
      const bob = Math.round(Math.sin(t * 2) * 2);
      B.boot(150, 46 + bob, 1);
      G.hline(120, 200, 64, C.BLUE2);
      G.typeText('THIS VIDEO WAS MADE BY THE BOOT.', 96, 82, C.ICE, t - 0.6, { cps: 40, cursor: t < 2.0 });
      if (t >= 2.6) G.typeText("AND YOU'RE RIGHT TO BE ANNOYED.", 98, 98, C.PINK, t - 2.6, { cps: 40 });
    },
  };
  (global.SCENES = global.SCENES || [])[4] = scene;
})(window);
