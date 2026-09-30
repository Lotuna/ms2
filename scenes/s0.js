// Scene 0 — F+ vs F- cells, pilus, conjugation.
// Each scene file registers SCENES[n]; draw(t) gets scene-local seconds and
// draws inside HUD.VIEW (already clipped). Coordinates are internal pixels.
(function (global) {
  'use strict';
  const { C, seg, ease, lerp } = G;

  // ---------------------------------------------------------------------
  // Scene 0 — F+ vs F- cells, pilus, conjugation.
  // ---------------------------------------------------------------------
  const CY = 106, LEN = 96, R = 16; // cell geometry (1 µm = 48 px)
  const FP_X = 95; // F+ cell centre; right pole pixel = 142
  const FM_X0 = 247, FM_X1 = 191; // F- cell slides until its left pole touches
  const PLASMID = [70, 110, 5];
  const TRA = [-1.9, -0.6];

  const scene0 = {
    title: 'F+ VS F-',
    mag: '×50K',
    dur: 10,
    caption: "F+ cells carry the F plasmid, which builds a pilus used for bacterial 'mating'.",
    captionAt: 0.3,
    log: [
      { t: 0.4, s: 'F+ CELL: F PLASMID PRESENT' },
      { t: 1.2, s: 'TRA GENES BUILD THE F PILUS' },
      { t: 2.6, s: 'PILUS CONTACTS F- CELL' },
      { t: 3.3, s: 'PILUS RETRACTS: CELLS PAIR' },
      { t: 5.3, s: 'SSDNA COPY OF F TRANSFERS' },
      { t: 7.9, s: 'RECIPIENT IS NOW F+' },
    ],
    draw(t) {
      const retract = ease.inOut(seg(t, 3.2, 5.2));
      const fmX = Math.round(lerp(FM_X0, FM_X1, retract));
      const fmLeft = fmX - LEN / 2; // first pixel of F- cell
      const converted = t >= 7.9;

      // Cells (ordered-dither fade in).
      G.save(); G.alpha(seg(t, 0, 0.8));
      S.ecoli(FP_X, CY, LEN, R, { seed: 3 });
      G.restore();
      const contactFlash = t > 2.6 && t < 2.95;
      const doneFlash = t > 7.8 && t < 8.0;
      G.save(); G.alpha(seg(t, 0.3, 1.1));
      S.ecoli(fmX, CY, LEN, R, { seed: 9, flash: contactFlash || doneFlash ? 1 : 0 });
      G.restore();

      // Donor plasmid; tra region blinks while the pilus is being built;
      // a bright marker orbits during rolling-circle transfer.
      const rolling = t >= 6.0 && t < 7.8;
      G.save(); G.alpha(seg(t, 0.4, 1.0));
      S.plasmid(PLASMID[0], PLASMID[1], PLASMID[2], {
        tra: TRA,
        pulse: t > 1.0 && t < 2.6 && Math.floor(t * 8) % 2 === 0 ? 1 : 0,
        roll: rolling ? t * 9 : null,
      });
      G.restore();

      // Short idle pilus on top of the F+ cell.
      const idle = ease.out(seg(t, 1.0, 1.8));
      if (idle > 0) S.pilus(S.pilusPath(118, 123, lerp(118, 127, idle), lerp(123, 135, idle), 1.5, t * 2.5));

      // Main pilus: grows toward F-, contacts, then retracts pulling F- in.
      const grow = ease.out(seg(t, 0.9, 2.6));
      let tipX;
      if (t < 3.2) tipX = Math.round(lerp(143, FM_X0 - LEN / 2 - 1, grow));
      else tipX = fmLeft - 1;
      if (tipX > 144) {
        const amp = t < 2.6 ? 2 : 2 * (1 - seg(t, 2.6, 3.4)); // goes taut on contact
        S.pilus(S.pilusPath(143, CY, tipX, CY, amp, t * 3));
      }
      // Contact burst at the pilus tip.
      if (t >= 2.6 && t < 3.2) {
        const k = seg(t, 2.6, 3.2);
        G.save(); G.alpha(1 - k);
        G.glow(() => G.circle(tipX, CY, 1 + Math.round(k * 6), k < 0.4 ? C.WHITE : C.MAGENTA));
        G.restore();
      }

      // Mating bridge (conjugation pore) once envelopes touch.
      if (t >= 5.2) {
        const blink = t < 5.8 && Math.floor(t * 10) % 2 === 0;
        if (!blink) G.glow(() => { G.vline(142, CY - 4, CY + 3, C.MAGENTA); G.vline(143, CY - 4, CY + 3, C.MAGENTA); });
      }

      // Single-stranded copy travels donor -> recipient and recircularises.
      const recip = [fmX - 22, 110];
      if (t >= 6.0 && t < 7.8) {
        const path = [[75, 110], [108, 107], [142, 106], [156, 107], [recip[0] - 5, 110]];
        const f1 = ease.inOut(seg(t, 6.0, 7.0)), f0 = seg(t, 7.0, 7.8);
        let head = null;
        G.glow(() => { head = G.partial(path, f0, f1, C.PINK, [2, 1, -Math.floor(t * 20)]); });
        if (head && f1 < 1) G.pset(Math.round(head[0]), Math.round(head[1]), C.WHITE);
      }
      if (t >= 7.0) {
        S.plasmid(recip[0], recip[1], 5, {
          build: seg(t, 7.0, 7.8), buildA: Math.PI,
          tra: TRA,
        });
      }

      // New pilus sprouts on the converted cell.
      const sprout = ease.out(seg(t, 8.3, 9.3));
      if (sprout > 0) S.pilus(S.pilusPath(fmX + 23, 123, lerp(fmX + 23, fmX + 32, sprout), lerp(123, 135, sprout), 1.5, t * 2.5));

      // ---- labels ----
      G.save(); G.alpha(seg(t, 0.2, 0.8));
      G.textCBg('F+ CELL', FP_X, 76, C.CYAN, C.VOID);
      G.textCBg('F PLASMID + PILUS', FP_X, 83, C.SKY, C.VOID);
      G.restore();

      G.save(); G.alpha(seg(t, 0.5, 1.1));
      if (!converted) {
        G.textCBg('F- CELL', fmX, 76, C.SKY, C.VOID);
        G.textCBg('NO PLASMID, NO PILUS', fmX, 83, C.SKY, C.VOID);
      } else {
        const w = G.textW('F+ CELL');
        G.rect(fmX - 40, 75, 81, 14, C.VOID);
        G.glitchText('F+ CELL', fmX - Math.round(w / 2), 76, C.CYAN, t - 7.9, 0.4);
        const s = 'GOT F PLASMID';
        G.glitchText(s, fmX - Math.round(G.textW(s) / 2), 83, C.SKY, t - 7.9, 0.6);
      }
      G.restore();

      if (t >= 0.8) HUD.label('F PLASMID', 80, 129, PLASMID[0], PLASMID[1] + 6, C.ICE, C.SKY);
      if (t >= 1.4 && t < 3.4) HUD.label('F PILUS', 152, 94, 168, CY - 2, C.ICE, C.SKY);
      if (t >= 5.4 && t < 7.9) HUD.label('MATING BRIDGE', 148, 129, 143, CY + 5, C.PINK, C.PURPLE);

      HUD.scaleBar(12, 139, 48, '1 ' + G.UM);

      // Plasmid magnifier.
      HUD.inset({
        t,
        open: Math.min(seg(t, 0.8, 1.3), 1 - seg(t, 5.0, 5.4)),
        src: [64, 104, 13, 13],
        dst: [10, 21, 96, 52],
        title: 'F PLASMID',
        zoom: '×8',
        draw(w, h) {
          const cx = 21, cy = 21;
          const pulse = t > 1.0 && t < 2.6 && Math.floor(t * 8) % 2 === 0;
          G.glow(() => {
            G.circle(cx, cy, 15, C.CYAN); G.circle(cx, cy, 14, C.CYAN);
            G.arc(cx, cy, 15, TRA[0], TRA[1], pulse ? C.PINK : C.MAGENTA);
            G.arc(cx, cy, 14, TRA[0], TRA[1], pulse ? C.PINK : C.MAGENTA);
          });
          // gene boundary ticks
          for (const a of [0.5, 1.3, 2.4, 3.3, 4.4, 5.3]) G.pset(Math.round(cx + Math.cos(a) * 17), Math.round(cy + Math.sin(a) * 17), C.SKY);
          G.text('~100 KB DNA', 42, 3, C.SKY);
          G.line(31, 9, 40, 16, C.PURPLE);
          G.text('TRA GENES', 42, 15, C.PINK);
          G.text('BUILD PILUS', 42, 22, C.ICE);
          G.text('NOT IN F-', 42, 33, C.SKY);
        },
      });

      HUD.log(170, 21, 140, 50, this.log, t);
    },
  };

  (global.SCENES = global.SCENES || [])[0] = scene0;
})(window);
