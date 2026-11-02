// Scene 2 — "AI fries people's brains": feeds crowd out attention until a
// two-hour show is too long.
(function (global) {
  'use strict';
  const { C, seg, ease } = G;

  const TILES = [];
  for (let i = 0; i < 14; i++) TILES.push({ x: 12 + Math.round(G.rnd(i, 1) * 150), y: 34 + Math.round(G.rnd(i, 2) * 50), at: 1.0 + i * 0.32 });

  const scene = {
    title: 'STEP 2: BRAIN FRY',
    mag: 'CLAIM',
    dur: 9,
    notToScale: false,
    caption: 'Step 2: an endless stream of AI-made content wears down attention until even a passive TV show feels too long. Weak spot: this is hard to measure, and the evidence is mixed.',
    captionAt: 0.3,
    draw(t) {
      TW.quote("CAN'T EVEN WATCH NETFLIX");
      // TV with a long show on it.
      G.glow(() => G.rectO(54, 40, 72, 44, C.CYAN));
      G.shade(55, 41, 70, 42, (x, y) => G.dith(x, y, 0.25 + 0.1 * Math.sin(t * 2 + y * 0.3), C.NAVY, C.BLUE));
      G.text('2-HOUR SHOW', 68, 58, C.ICE);
      G.text(String(Math.floor(t * 7) % 60).padStart(2, '0') + ':' + String(Math.floor(t * 61) % 60).padStart(2, '0'), 80, 66, C.SKY);
      G.hline(82, 98, 85, C.BLUE2); G.hline(76, 104, 86, C.BLUE2);

      // Short-form tiles keep popping up over it.
      TILES.forEach((p, i) => {
        if (t < p.at) return;
        const age = t - p.at;
        G.rect(p.x, p.y, 11, 17, C.VOID);
        G.glow(() => G.rectO(p.x, p.y, 11, 17, i % 3 ? C.MAGENTA : C.PINK));
        G.shade(p.x + 1, p.y + 1, 9, 15, (x, y) => G.dith(x, y, 0.5, C.PURPLE, (Math.floor(age * 6) + x + y) % 5 ? C.INDIGO : C.PINK));
        G.pset(p.x + 5, p.y + 13, C.WHITE);
      });

      // Attention meter drains.
      const a = 1 - ease.inOut(seg(t, 1.0, 6.0)) * 0.94;
      G.text('ATTENTION SPAN', 12, 102, C.ICE);
      G.rect(12, 110, 160, 6, C.NAVY);
      G.rect(12, 110, Math.max(1, Math.round(160 * a)), 6, a > 0.3 ? C.CYAN : C.MAGENTA);
      G.rectO(11, 109, 162, 8, C.BLUE2);
      if (t >= 6.2 && Math.floor(t * 3) % 2 === 0) G.textBg('TOO LONG. SKIP.', 12, 122, C.MAGENTA, C.VOID);

      TW.notes(t, 'AI-MADE FEEDS, CLIPS AND CHATBOTS ARE ENDLESS AND TUNED TO GRAB YOU. THE CLAIM: FOCUS GETS SO WORN DOWN THAT EVEN TV IS TOO MUCH.',
        'ATTENTION IS HARD TO MEASURE, AND STUDIES OF SCREEN TIME AND FOCUS DISAGREE.');
    },
  };

  (global.SCENES = global.SCENES || [])[2] = scene;
})(window);
