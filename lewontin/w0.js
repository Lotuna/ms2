// Scene 0 — Two claims: Lewontin's apportionment (1972) and Edwards'
// critique (2003).
(function (global) {
  'use strict';
  const { C, seg, ease } = G;

  const scene = {
    title: 'TWO CLAIMS',
    mag: 'DATA',
    dur: 10,
    notToScale: false,
    caption: "Lewontin found that most human genetic variation lies within populations. Edwards called one conclusion drawn from this a fallacy: it looks at one locus at a time.",
    captionAt: 0.4,
    draw(t) {
      HUD.panel(10, 21, 146, 120, 'LEWONTIN 1972', C.CYAN);
      G.text('AT AN AVERAGE LOCUS:', 14, 32, C.ICE);
      const k = ease.inOut(seg(t, 0.6, 2.2));
      W.shareBar(15, 42, 136, [[0.854, C.CYAN_D], [0.083, C.PINK], [0.063, C.MAGENTA]], k);
      if (t >= 2.0) {
        const rows = [['85.4%', 'WITHIN POPULATIONS', C.CYAN_L], ['8.3%', 'BETWEEN POPULATIONS,', C.PINK], ['', 'SAME RACE', C.PINK], ['6.3%', 'BETWEEN RACES', C.MAGENTA]];
        rows.forEach(([n, s, c], i) => {
          if (t < 2.0 + i * 0.25) return;
          G.text(n, 14, 54 + i * 7, c); G.text(s, 38, 54 + i * 7, C.ICE);
        });
      }
      if (t >= 3.4) G.typeText('CONCLUDED: RACE CATEGORIES\nHAVE LITTLE GENETIC OR\nTAXONOMIC SIGNIFICANCE', 14, 90, C.SKY, t - 3.4, { cps: 40, cursor: t < 5.2 });

      if (t >= 5.0) {
        HUD.panel(164, 21, 146, 120, 'EDWARDS 2003', C.MAGENTA);
        G.textBg("'LEWONTIN'S FALLACY'", 168, 32, C.PINK, C.VOID);
        G.typeText('THAT CONCLUSION IGNORES\nCORRELATIONS ACROSS LOCI.\n\nMANY LOCI TOGETHER CAN\nPREDICT A PERSON\'S\nPOPULATION OF ORIGIN\nVERY ACCURATELY.', 168, 44, C.ICE, t - 5.2, { cps: 45 });
      }
    },
  };

  (global.SCENES = global.SCENES || [])[0] = scene;
})(window);
