// Scene 0 — The tweet itself, typed out, and its thesis in one line.
(function (global) {
  'use strict';
  const { C } = G;

  const LINES = [
    ["IT'S INSANELY SIMPLE", C.WHITE],
    ['1] AI HACKS THE THINGS', C.ICE],
    ["2] AI FRIES PPLS BRAINS TO THE PT", C.ICE],
    ["   THEY CAN'T EVEN WATCH NETFLIX", C.ICE],
    ['3] PRODUCTIVITY IS GOING TO DROP,', C.ICE],
    ['   NOT INCREASE', C.ICE],
    ['4] TRILLIONS ARE ALREADY INVESTED.', C.ICE],
    ["   IT'D BE TOO BIG TO FAIL EXCEPT", C.ICE],
    ['5] TRUMP IS OLD, STARTED A WAR.', C.ICE],
    ["IT'S STARTING NOW", C.PINK],
  ];

  const scene = {
    title: 'THE POST',
    mag: 'INPUT',
    dur: 10,
    notToScale: false,
    caption: "A five-step prediction. In plain terms: AI will cause an economic crash, and this time nobody will be able to rescue the economy.",
    captionAt: 5.2,
    draw(t) {
      HUD.panel(36, 21, 248, 98, 'INCOMING POST', C.CYAN);
      let tt = t - 0.3;
      LINES.forEach(([s, c], i) => {
        if (tt < 0) return;
        G.typeText(s, 44, 31 + i * 8, c, tt, { cps: 60, cursor: tt * 60 < s.length + 4 });
        tt -= s.length / 60 + 0.08;
      });
      if (t >= 5.6) {
        const s = 'THESIS: AN AI CRASH WITH NO RESCUE';
        const w = G.textW(s) + 8, x = Math.round(160 - w / 2);
        G.rect(x, 125, w, 11, C.VOID);
        G.glow(() => G.rectO(x, 125, w, 11, C.MAGENTA));
        if (t < 6.2) G.glitchText(s, x + 4, 128, C.PINK, t - 5.6, 0.5);
        else G.text(s, x + 4, 128, C.PINK);
      }
    },
  };

  (global.SCENES = global.SCENES || [])[0] = scene;
})(window);
