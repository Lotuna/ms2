// Scene 4 — "Trillions are already invested. Too big to fail": a tower of
// AI spending inside a bubble, normally caught by a safety net.
(function (global) {
  'use strict';
  const { C, seg, ease } = G;

  const BX = 30, BASE = 104; // tower base

  // Data-centre rack block.
  function rack(x, y, lit) {
    G.rect(x, y, 26, 7, C.NAVY2);
    G.rectO(x, y, 26, 7, C.BLUE2);
    for (let i = 0; i < 5; i++) G.pset(x + 3 + i * 4, y + 3, lit && (i + y) % 3 ? C.CYAN_L : C.AZURE);
    G.text('$', x + 21, y + 1, C.PINK);
  }

  const scene = {
    title: 'STEP 4: TOO BIG TO FAIL',
    mag: 'CLAIM',
    dur: 10,
    notToScale: false,
    caption: 'Step 4: trillions are already sunk into AI chips and data centres. If they never pay off, the losses are so large that normally the government would step in, as with the 2008 bank bailouts.',
    captionAt: 0.3,
    draw(t) {
      TW.quote('TRILLIONS ARE ALREADY INVESTED');
      const n = Math.min(8, Math.floor(seg(t, 0.4, 3.2) * 9));
      for (let i = 0; i < n; i++) rack(BX, BASE - 8 - i * 8, true);
      if (t >= 1.0) G.textBg('CHIPS + DATA CENTRES', 98, 40, C.ICE, C.VOID);

      // Bubble around the tower.
      if (t >= 3.4) {
        const crack = t >= 6.4;
        G.glow(() => {
          for (let a = 0; a < 64; a++) {
            if (crack && (a % 9 === 0 || a % 9 === 1)) continue;
            const ang = a / 64 * Math.PI * 2;
            G.pset(Math.round(BX + 13 + Math.cos(ang) * 38), Math.round(BASE - 34 + Math.sin(ang) * 37), crack ? C.PINK : C.CYAN);
          }
        });
        G.textBg('PAYS OFF ONLY IF', 98, 54, C.CYAN_L, C.VOID);
        G.textBg('PRODUCTIVITY BOOMS', 98, 61, C.CYAN_L, C.VOID);
        if (crack) G.textBg("STEP 3: IT WON'T", 98, 72, C.MAGENTA, C.VOID);
      }

      // Safety net under it: the usual rescue.
      const net = ease.out(seg(t, 4.6, 5.6));
      if (net > 0) {
        const w = Math.round(100 * net), x0 = BX + 13 - w / 2;
        for (let x = 0; x < w; x++) G.pset(Math.round(x0 + x), BASE + 6 + ((x >> 2) % 2), C.SKY);
        for (let x = 0; x < w; x += 6) G.line(Math.round(x0 + x), BASE + 6, Math.round(x0 + x + 3), BASE + 9, C.AZURE);
        G.textBg('SAFETY NET: GOVERNMENT RESCUE', 12, BASE + 14, C.SKY, C.VOID);
        G.textBg('(LIKE THE 2008 BANK BAILOUTS)', 12, BASE + 22, C.BLUE2, C.VOID);
      }

      TW.notes(t, 'HUGE SUMS ARE BEING SPENT ON AI. IF IT DOES NOT PAY OFF, THE LOSSES SPREAD TO BANKS, PENSIONS AND JOBS. SO BIG A FAILURE USUALLY GETS A RESCUE.',
        "THE TWEET DOESN'T SHOW THE MONEY IS WASTED; THAT DEPENDS ON STEP 3.");
    },
  };

  (global.SCENES = global.SCENES || [])[4] = scene;
})(window);
