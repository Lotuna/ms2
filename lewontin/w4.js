// Scene 4 — Both statements hold; they answer different questions.
(function (global) {
  'use strict';
  const { C, seg } = G;

  function claim(y, title, line1, line2, c, t0, t) {
    if (t < t0) return;
    HUD.panel(14, y, 292, 30, null, c);
    G.glow(() => { G.line(22, y + 15, 25, y + 18, C.WHITE); G.line(25, y + 18, 31, y + 11, C.WHITE); }); // check mark
    G.text(title, 38, y + 5, c === C.CYAN ? C.CYAN_L : C.PINK);
    G.typeText(line1 + '\n' + line2, 38, y + 13, C.ICE, t - t0 - 0.3, { cps: 45, cursor: false });
  }

  const scene = {
    title: 'BOTH CAN BE TRUE',
    mag: 'LOGIC',
    dur: 10,
    notToScale: false,
    caption: "Both statements hold. Splitting variance and classifying people are different questions. The error is concluding from the first that the second can't be done. Whether Lewontin himself made that error is debated.",
    captionAt: 0.3,
    draw(t) {
      claim(24, 'APPORTIONING VARIANCE', 'MOST VARIATION AT A LOCUS IS', 'WITHIN GROUPS (LEWONTIN)', C.CYAN, 0.3, t);
      claim(60, 'CLASSIFYING INDIVIDUALS', 'MANY LOCI TOGETHER CAN', 'INFER GROUP OF ORIGIN (EDWARDS)', C.MAGENTA, 2.0, t);
      if (t >= 4.2) {
        const blink = Math.floor(t * 3) % 2 === 0 && t < 5.4;
        G.textCBg('THE FALLACY:', 160, 98, blink ? C.WHITE : C.MAGENTA, C.VOID);
        G.typeText("\"MOSTLY WITHIN\" -> \"CAN'T TELL APART\"", 82, 107, C.ICE, t - 4.6, { cps: 40, cursor: false });
      }
      if (t >= 6.4) {
        G.typeText('LATER AUTHORS ARGUE LEWONTIN DID NOT\nMAKE THIS INFERENCE; THE LABEL IS CONTESTED.', 14, 122, C.SKY, t - 6.4, { cps: 50 });
      }
    },
  };

  (global.SCENES = global.SCENES || [])[4] = scene;
})(window);
