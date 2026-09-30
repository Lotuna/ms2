// Scene 7 — Lysis: the small L protein breaks the envelope; the cell bursts
// and new MS2 drift off toward the next F+ cell's pilus. Loops to scene 0.
(function (global) {
  'use strict';
  const { C, seg, ease, lerp } = G;

  const CX = 100, CY = 96, LEN = 100, R = 18;
  const AX = CX - LEN / 2 + R, BX = CX + LEN / 2 - R;
  const BURST = 4.0;
  const NEXT = { x: 300, y: 100 }; // next F+ cell (partly off-screen)
  const PIL_A = [268, 84], PIL_B = [222, 40];

  // Progeny positions packed inside the cell (deterministic).
  const DOTS = [];
  for (let y = CY - R + 5; y <= CY + R - 5; y += 5) {
    for (let x = CX - LEN / 2 + 5; x <= CX + LEN / 2 - 5; x += 5) {
      const jx = x + Math.round(G.rnd(x, y) * 2), jy = y + Math.round(G.rnd(y, x) * 2);
      if (G.sdCapsule(jx, jy, AX, CY, BX, CY, R) < -4) DOTS.push([jx, jy]);
    }
  }
  // Envelope pixels (outer line), with their outward normal.
  const RIM = [];
  for (let y = CY - R - 1; y <= CY + R + 1; y++) {
    for (let x = CX - LEN / 2 - 1; x <= CX + LEN / 2 + 1; x++) {
      const v = G.sdCapsule(x + 0.5, y + 0.5, AX, CY, BX, CY, R);
      if (v <= 0 && v > -1) {
        const qx = G.clamp(x + 0.5, AX, BX);
        const nx = x + 0.5 - qx, ny = y + 0.5 - CY, nl = Math.hypot(nx, ny) || 1;
        RIM.push([x, y, nx / nl, ny / nl]);
      }
    }
  }
  const L_SITES = [];
  for (let i = 0; i < 26; i++) L_SITES.push(RIM[Math.floor(G.rnd(i, 99) * RIM.length)]);

  const scene = {
    title: 'LYSIS',
    mag: '×50K',
    dur: 10,
    caption: 'The small lysis protein L disrupts the envelope. It is a single small protein, not an enzyme. The cell bursts, releasing thousands of new MS2 that drift toward the next F+ pilus.',
    captionAt: 0.6,
    draw(t) {
      const k = seg(t, BURST, BURST + 1.6); // debris spread
      const burst = t >= BURST;

      // Next F+ cell and its pilus fade in after the burst.
      if (t >= BURST + 0.4) {
        G.save(); G.alpha(seg(t, BURST + 0.4, BURST + 1.4));
        S.ecoli(NEXT.x, NEXT.y, 96, 16, { seed: 5 });
        G.restore();
        const g = ease.out(seg(t, BURST + 0.8, BURST + 2.2));
        if (g > 0) S.pilus(S.pilusPath(PIL_A[0], PIL_A[1], lerp(PIL_A[0], PIL_B[0], g), lerp(PIL_A[1], PIL_B[1], g), 1.5, t));
        G.textBg('NEXT F+ CELL', 246, 119, C.CYAN, C.VOID);
      }

      if (!burst) {
        // Intact, swollen with progeny; L protein accumulates in the envelope.
        const shake = t > BURST - 0.8 ? (Math.floor(t * 20) % 2) : 0;
        S.ecoli(CX + shake, CY, LEN, R, { seed: 12 });
        for (const [x, y] of DOTS) {
          G.pset(x + shake, y, C.ICE); G.pset(x + 1 + shake, y, C.SKY);
          if (G.rnd(x, y) < 0.15) G.pset(x + shake, y + 1, C.MAGENTA);
        }
        const nL = Math.floor(seg(t, 0.8, 3.4) * L_SITES.length);
        G.glow(() => { for (let i = 0; i < nL; i++) G.pset(L_SITES[i][0] + shake, L_SITES[i][1], C.MAGENTA); });
        G.textCBg('INFECTED E. COLI', CX, CY - R - 10, C.SKY, C.VOID);
        if (nL > 3) HUD.label('L PROTEIN', 30, 128, L_SITES[2][0], L_SITES[2][1], C.PINK, C.PURPLE);
      } else {
        // Flash, then envelope fragments fly apart and fade to a ghost.
        G.save(); G.alpha(1 - k * 0.75);
        const flash = t < BURST + 0.15;
        for (const [x, y, nx, ny] of RIM) {
          const grp = Math.floor(((Math.atan2(ny, nx) + Math.PI) / (Math.PI * 2)) * 14);
          const d = k * (6 + G.rnd(grp, 4) * 16);
          G.pset(Math.round(x + nx * d), Math.round(y + ny * d), flash ? C.WHITE : (grp % 2 ? C.CYAN_D : C.AZURE));
        }
        G.restore();
      }

      // Progeny spray out, then some home in on the next pilus.
      if (burst) {
        const pts = S.pilusPath(PIL_A[0], PIL_A[1], PIL_B[0], PIL_B[1], 1.5, t);
        DOTS.forEach(([x0, y0], i) => {
          const dx = x0 - CX, dy = y0 - CY, dl = Math.hypot(dx, dy) || 1;
          const sp = 20 + G.rnd(i, 3) * 70;
          const e = ease.out(k);
          let x = x0 + (dx / dl + (G.rnd(i, 5) - 0.5)) * sp * e + (t - BURST) * 6;
          let y = y0 + (dy / dl + (G.rnd(i, 6) - 0.5)) * sp * e * 0.8;
          x += Math.sin(t * 2 + i) * 2; y += Math.cos(t * 1.7 + i) * 2;
          const seeker = i % 9 === 0;
          if (seeker) {
            const s = ease.inOut(seg(t, BURST + 2.4 + (i % 4) * 0.3, BURST + 4.6 + (i % 4) * 0.3));
            const p = pts[Math.min(pts.length - 1, 4 + (i * 7) % (pts.length - 4))];
            x = lerp(x, p[0] + 3, s); y = lerp(y, p[1] + 2, s);
          }
          if (seeker || i % 3 === 0) S.ms2Dot(x, y, seeker && t > BURST + 4.6 ? 3 : null);
          else { G.pset(Math.round(x), Math.round(y), C.ICE); G.pset(Math.round(x) + 1, Math.round(y), C.SKY); }
        });
        // Release tally.
        const n = Math.round(ease.out(seg(t, BURST, BURST + 2)) * 10000);
        HUD.panel(8, 21, 118, 30, 'RELEASE', C.CYAN);
        G.text('NEW MS2: ' + (n >= 10000 ? '~10 000' : String(n)), 12, 31, C.CYAN_L);
        G.text('1 DOT = MANY VIRIONS', 12, 40, C.SKY);
      }

      // L protein magnifier (virus scale) before the burst.
      HUD.inset({
        t,
        open: Math.min(seg(t, 1.0, 1.5), 1 - seg(t, BURST - 0.3, BURST)),
        src: [L_SITES[0][0] - 4, L_SITES[0][1] - 4, 9, 9],
        dst: [170, 21, 140, 58],
        title: 'ENVELOPE',
        zoom: '×40',
        draw(w, h) {
          const lp = seg(t, 1.5, 3.4);
          const sites = [22, 58, 96, 120].filter((_, i) => lp > i * 0.22);
          const gaps = sites.filter((_, i) => lp > i * 0.22 + 0.25).map((x) => [x - 3, x + 4]);
          S.envelope(0, w - 1, 14, gaps, h);
          sites.forEach((x) => { S.lysisL(x, 12); S.lysisL(x, 24); });
          G.textBg('L PROTEIN: 75 AA', 2, 2, C.PINK, C.VOID);
          G.textBg('NOT AN ENZYME', 72, 2, C.ICE, C.VOID);
          if (gaps.length) G.textBg('ENVELOPE FAILS', 40, 38, C.MAGENTA, C.VOID);
        },
      });

      HUD.zoomReveal(t, 0.6, [CX - 3, CY - 3, 7, 7], 'ZOOM ×1/40');
    },
  };

  (global.SCENES = global.SCENES || [])[7] = scene;
})(window);
