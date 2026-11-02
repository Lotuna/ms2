// tweet/common.js — shared bits for the tweet explainer: step header and
// the "means / weak spot" side panel.
(function (global) {
  'use strict';
  const { C } = G;

  // Right-hand panel: what the step means, then its weak spot.
  function notes(t, means, weak, y) {
    y = y || 21;
    HUD.panel(186, y, 124, 120, null, C.CYAN);
    G.text('IN PLAIN TERMS', 191, y + 5, C.CYAN_L);
    G.typeText(means, 191, y + 15, C.ICE, t - 0.6, { maxChars: 28, cps: 50, cursor: false });
    if (t >= 4.0) {
      G.text('WEAK SPOT', 191, y + 70, C.PINK);
      G.typeText(weak, 191, y + 80, C.SKY, t - 4.2, { maxChars: 28, cps: 50 });
    }
  }
  // The tweet's own line, quoted at the top-left.
  function quote(s) { G.textBg('"' + s + '"', 10, 22, C.PINK, C.VOID); }

  global.TW = { notes, quote };
})(window);
