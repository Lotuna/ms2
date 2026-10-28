// Scene 6 — Summary.
(function (global) {
  'use strict';
  const { C } = G;

  const LINES = [
    ['1', 'PER LOCUS, ~85% OF HUMAN GENETIC', 'VARIATION IS WITHIN POPULATIONS.', C.CYAN_L],
    ['2', 'ACROSS MANY LOCI, ANCESTRY CAN BE', 'INFERRED BECAUSE SMALL DIFFERENCES ADD UP.', C.PINK],
    ['3', 'NEITHER FACT ALONE SETTLES WHAT', "'RACE' MEANS OR WHETHER IT IS USEFUL.", C.ICE],
  ];

  const scene = {
    title: 'SUMMARY',
    mag: 'LOGIC',
    dur: 9,
    notToScale: false,
    caption: "Lewontin's numbers and Edwards' point are compatible. What they imply about race depends on further questions that these statistics alone don't answer.",
    captionAt: 0.3,
    draw(t) {
      LINES.forEach(([n, a, b, c], i) => {
        const t0 = 0.4 + i * 1.8;
        if (t < t0) return;
        const y = 26 + i * 36;
        HUD.panel(14, y, 292, 30, null, c === C.ICE ? C.CYAN : c === C.PINK ? C.MAGENTA : C.CYAN);
        G.glow(() => G.text(n, 22, y + 11, c));
        G.typeText(a + '\n' + b, 34, y + 7, C.ICE, t - t0, { cps: 45, cursor: i === LINES.length - 1 });
      });
    },
  };

  (global.SCENES = global.SCENES || [])[6] = scene;
})(window);
