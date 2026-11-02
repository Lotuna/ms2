// Scene 1 — One boot.
(function (global) {
  'use strict';
  const { C, seg, ease } = G;
  const HX = 160, HY = 110, R = 14;
  const STOMPS = [1.4, 3.4, 5.4];

  const scene = {
    title: 'ONE BOOT', mag: '×1', dur: 8, notToScale: false,
    caption: 'The future, as proposed: a boot.',
    captionAt: 0.3,
    draw(t) {
      // Boot height: lifts, slams down at each stomp time.
      let by = 22, squash = 0, said = -1;
      STOMPS.forEach((s, i) => {
        if (t >= s - 0.9 && t < s) by = 22 + (HY - R * 2 - 38) * ease.in(seg(t, s - 0.9, s));
        if (t >= s && t < s + 1.1) {
          by = HY - 16 - Math.round(2 * R * (1 - 0.55 * Math.max(0, 1 - (t - s) * 2))) + 2;
          squash = Math.max(0, 1 - (t - s) * 1.6);
          said = i;
        }
      });
      if (squash > 0) by = HY + R - Math.round(2 * R * (1 - squash * 0.55)) - 16;
      G.hline(60, 260, HY + R + 1, C.BLUE2);
      B.head(HX, HY, R, squash);
      B.boot(HX - 10, by, 1);
      if (said >= 0 || t > STOMPS[0]) G.textCBg("AND YOU'RE RIGHT TO BE ANNOYED.", HX, 30, C.PINK, C.VOID);
      if (squash > 0.6) G.glow(() => { G.pset(HX - 18, HY + 6, C.WHITE); G.pset(HX + 18, HY + 6, C.WHITE); G.pset(HX - 20, HY + 2, C.ICE); G.pset(HX + 20, HY + 2, C.ICE); });
    },
  };
  (global.SCENES = global.SCENES || [])[1] = scene;
})(window);
