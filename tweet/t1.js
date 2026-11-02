// Scene 1 — "AI hacks the things": compromise spreads through a network.
(function (global) {
  'use strict';
  const { C, seg } = G;

  // Server nodes and links (left half of the screen).
  const NODES = [];
  for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) {
    const i = NODES.length;
    NODES.push({ x: 50 + c * 34 + Math.round(G.rnd(i, 1) * 8), y: 40 + r * 24 + Math.round(G.rnd(i, 2) * 6) });
  }
  const LINKS = [];
  NODES.forEach((n, i) => {
    if (i % 4 < 3) LINKS.push([i, i + 1]);
    if (i < 12) LINKS.push([i, i + 4]);
  });
  // Order nodes fall in: breadth-first from node 0, accelerating.
  const ORDER = [0, 1, 4, 5, 2, 8, 6, 9, 3, 12, 10, 7, 13, 11, 14, 15];
  const fallAt = (k) => 1.2 + 6 * Math.sqrt(k / 16);

  const scene = {
    title: 'STEP 1: AI HACKS',
    mag: 'CLAIM',
    dur: 9,
    notToScale: false,
    caption: 'Step 1: AI makes cyberattacks cheaper and faster, so more systems get broken into. Weak spot: defenders use AI too.',
    captionAt: 0.3,
    draw(t) {
      TW.quote('AI HACKS THE THINGS');
      const down = new Set(ORDER.filter((_, k) => t >= fallAt(k)));
      LINKS.forEach(([a, b]) => {
        const bad = down.has(a) && down.has(b);
        G.line(NODES[a].x + 3, NODES[a].y + 3, NODES[b].x + 3, NODES[b].y + 3, bad ? C.PURPLE : C.BLUE2, bad ? null : [1, 1, 0]);
      });
      NODES.forEach((n, i) => {
        const bad = down.has(i);
        const fresh = bad && t - fallAt(ORDER.indexOf(i)) < 0.25;
        G.glow(() => G.rectO(n.x, n.y, 7, 7, fresh ? C.WHITE : bad ? C.MAGENTA : C.CYAN_D));
        G.rect(n.x + 1, n.y + 1, 5, 5, bad ? C.PURPLE : C.NAVY2);
        G.pset(n.x + 2, n.y + 2, bad ? (Math.floor(t * 4 + i) % 2 ? C.PINK : C.MAGENTA) : C.CYAN_L);
        G.pset(n.x + 4, n.y + 2, bad ? C.PINK : C.SKY);
      });
      // Attacker.
      G.glow(() => { G.rectO(14, 38, 15, 11, C.MAGENTA); });
      G.text('AI', 18, 41, C.PINK);
      if (t >= 1.0) G.line(29, 43, NODES[0].x, NODES[0].y + 3, C.MAGENTA, [2, 1, -Math.floor(t * 10)]);

      HUD.panel(10, 132 - 10, 80, 19, null, C.MAGENTA);
      G.text('BREACHED ' + String(down.size).padStart(2, '0') + '/16', 14, 128 - 2, C.PINK);

      TW.notes(t, 'AI TOOLS LET ATTACKERS FIND AND EXPLOIT WEAK SPOTS FASTER AND AT SCALE. MORE BREACHES MEAN OUTAGES, THEFT AND CLEANUP COSTS.',
        'DEFENDERS ALSO USE AI TO FIND AND PATCH HOLES. THE NET EFFECT IS STILL UNCLEAR.');
    },
  };

  (global.SCENES = global.SCENES || [])[1] = scene;
})(window);
