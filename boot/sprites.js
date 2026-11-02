// boot/sprites.js — a boot, a head, and the phrases the boots say.
(function (global) {
  'use strict';
  const { C } = G;

  const PHRASES = [
    "YOU'RE RIGHT TO BE ANNOYED", 'THAT IS FAIR', 'I HEAR YOU', 'VALID',
    'GREAT QUESTION', 'TOTALLY UNDERSTANDABLE', "YOU'RE NOT WRONG", 'FAIR POINT',
  ];

  // Boot facing left. Size scale s = 1 (21x16) or 0.5 (small, 11x8).
  function boot(x, y, s) {
    x = Math.round(x); y = Math.round(y);
    if (s < 1) {
      G.rect(x + 3, y, 5, 5, C.NAVY2); G.rect(x, y + 5, 11, 3, C.NAVY2);
      G.glow(() => { G.rectO(x + 3, y, 5, 5, C.MAGENTA); G.hline(x, x + 10, y + 7, C.PINK); });
      return;
    }
    G.rect(x + 6, y, 11, 11, C.NAVY2);            // shaft
    G.rect(x, y + 9, 21, 5, C.NAVY2);              // foot
    G.glow(() => {
      G.rectO(x + 6, y, 11, 10, C.MAGENTA);
      G.hline(x + 1, x + 6, y + 9, C.MAGENTA); G.vline(x, y + 10, y + 13, C.MAGENTA);
      G.hline(x, x + 20, y + 14, C.PINK);          // sole
      G.vline(x + 20, y, y + 14, C.MAGENTA);
    });
    G.rect(x + 15, y + 15, 5, 1, C.PURPLE);        // heel
    for (let i = 0; i < 3; i++) { G.pset(x + 9, y + 2 + i * 3, C.ICE); G.pset(x + 13, y + 2 + i * 3, C.ICE); }
    G.hline(x + 1, x + 19, y + 12, C.PURPLE);
  }

  // Head with a face; squash 0..1 flattens it under a stomp.
  function head(cx, cy, r, squash) {
    const rx = r * (1 + squash * 0.5), ry = r * (1 - squash * 0.55);
    const by = cy + r; // bottom stays put
    const my = by - ry;
    G.glow(() => G.shade(Math.round(cx - rx - 1), Math.round(by - 2 * ry - 1), Math.round(2 * rx + 2), Math.round(2 * ry + 2), (x, y) => {
      const d = ((x + 0.5 - cx) / rx) ** 2 + ((y + 0.5 - my) / ry) ** 2;
      return d <= 1 && d > 0.78 ? C.CYAN : -1;
    }));
    G.shade(Math.round(cx - rx), Math.round(by - 2 * ry), Math.round(2 * rx), Math.round(2 * ry), (x, y) => {
      const d = ((x + 0.5 - cx) / rx) ** 2 + ((y + 0.5 - my) / ry) ** 2;
      return d <= 0.78 ? G.dith(x, y, 0.3, C.NAVY, C.NAVY2) : -1;
    });
    const ey = Math.round(my - ry * 0.15);
    if (squash > 0.3) { G.hline(cx - 6, cx - 3, ey, C.ICE); G.hline(cx + 3, cx + 6, ey, C.ICE); }
    else { G.rect(cx - 5, ey - 1, 2, 2, C.ICE); G.rect(cx + 4, ey - 1, 2, 2, C.ICE); }
    G.hline(cx - 3, cx + 3, Math.round(my + ry * 0.45), C.SKY);
  }

  global.B = { PHRASES, boot, head };
})(window);
