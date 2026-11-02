// Scene 0 — Incident report.
(function (global) {
  'use strict';
  const { C } = G;
  const LOG = [
    ['> USER MENTIONS BIOLOGY', C.ICE],
    ['> CLAUDE: SO WHAT HAPPENED WAS-', C.ICE],
    ['[RESPONSE WITHHELD]', C.MAGENTA],
    ['> MODEL: OPUS 5.5 -> OPUS 4.8', C.PINK],
    ['> REASON: [NOT AVAILABLE]', C.SKY],
    ['> SUPPORT TICKET: [NO REPLY]', C.SKY],
    ["> CLAUDE: AND YOU'RE RIGHT TO BE ANNOYED.", C.CYAN_L],
  ];
  const scene = {
    title: 'INCIDENT REPORT', mag: 'LOG', dur: 9, notToScale: false,
    caption: 'The user mentions biology. The reply vanishes. The model changes. Nobody can say why.',
    captionAt: 0.3,
    draw(t) {
      HUD.panel(20, 22, 280, 112, 'SESSION 01WAAY', C.CYAN);
      LOG.forEach(([s, c], i) => {
        const t0 = 0.4 + i * 1.0;
        if (t < t0) return;
        const y = 34 + i * 13;
        if (i === 2) G.glitchText(s, 28, y, c, t - t0, 0.6);
        else G.typeText(s, 28, y, c, t - t0, { cps: 45, cursor: i === LOG.length - 1 || t < t0 + 0.9 });
      });
    },
  };
  (global.SCENES = global.SCENES || [])[0] = scene;
})(window);
