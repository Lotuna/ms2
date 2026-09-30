// hud.js — lab-monitor frame, HUD panels, inset magnifier, ambient loops.
(function (global) {
  'use strict';
  const { C } = G;

  // Layout (internal 320x180 pixels).
  const SCREEN = { x: 4, y: 8, w: 312, h: 168 };
  const VIEW = { x: 5, y: 18, w: 310, h: 125 };
  const CAP = { x: 5, y: 144, w: 310, h: 31 };
  const CAP_TEXT_X = 10, CAP_CHARS = 57;

  // Deterministic flicker for the ceiling tube: mostly on, occasional
  // single-frame drops plus a stutter burst every ~7 s.
  function lightOn(t) {
    const k = Math.floor(t * 24);
    if (G.rnd(k, 7) < 0.025) return false;
    const m = t % 7.3;
    if (m < 0.35 && G.rnd(k, 3) < 0.55) return false;
    return true;
  }

  // ---- static-ish frame (drawn before the scene) --------------------------
  function frameBack(t) {
    G.clear(C.VOID);
    // Back wall: dark tiles like the reference lab.
    G.shade(0, 0, G.W, 8, (x, y) => (x % 16 === 0 || y === 4) ? C.NAVY : C.VOID);
    // Hanging cables behind the monitor.
    const cable = (x0, x1, sag, c) => {
      const pts = [];
      for (let x = x0; x <= x1; x += 2) {
        const u = (x - x0) / (x1 - x0);
        pts.push([x, Math.round(4 * sag * u * (1 - u))]);
      }
      G.polyline(pts, c);
    };
    cable(10, 96, 7, C.INDIGO); cable(40, 128, 9, C.PURPLE);
    cable(214, 300, 8, C.INDIGO); cable(236, 316, 6, C.PURPLE);

    // Ceiling tube light (flickers).
    const on = lightOn(t);
    G.rect(108, 0, 104, 4, C.NAVY2);
    if (on) G.glow(() => G.rect(111, 1, 98, 2, C.ICE));
    else G.rect(111, 1, 98, 2, C.SKY);

    // Monitor bezel.
    G.rect(1, 5, 318, 174, C.NAVY2);
    G.hline(1, 318, 5, C.BLUE2); G.vline(1, 5, 178, C.BLUE);
    G.hline(1, 318, 178, C.NAVY); G.vline(318, 5, 178, C.NAVY);
    G.rectO(3, 7, 314, 170, C.NAVY);
    if (on) G.remap(100, 5, 120, 2, G.LIGHT, 0.5); // light spill on the bezel lip

    // Screen + grid.
    G.rect(SCREEN.x, SCREEN.y, SCREEN.w, SCREEN.h, C.VOID);
    G.shade(VIEW.x, VIEW.y, VIEW.w, VIEW.h, (x, y) =>
      ((x - VIEW.x) % 10 === 0 || (y - VIEW.y) % 10 === 0) ? C.NAVY : -1);
  }

  // ---- overlays (drawn after the scene) ----------------------------------
  function frameFront(t, info) {
    // Title bar.
    G.gradH(SCREEN.x, 9, SCREEN.w, 8, [C.NAVY2, C.NAVY, C.VOID, C.VOID, C.NAVY]);
    G.text('MS2 PHAGE // LIFE CYCLE', 8, 10, C.CYAN_L);
    const tag = 'SCN ' + String(info.index).padStart(2, '0') + '/' + String(info.count - 1).padStart(2, '0') + '  ' + info.title;
    G.text(tag, 112, 10, C.SKY);
    if (Math.floor(t * 1.5) % 2 === 0) G.glow(() => G.disc(261, 12, 1, C.MAGENTA));
    G.text('REC', 265, 10, C.PINK);
    G.text(info.mag || '', 312 - G.textW(info.mag || ''), 10, C.CYAN_L);
    // Scene progress rule.
    G.hline(SCREEN.x, SCREEN.x + SCREEN.w - 1, 17, C.NAVY2);
    const pw = Math.round(SCREEN.w * G.clamp(info.progress, 0, 1));
    if (pw > 0) G.hline(SCREEN.x, SCREEN.x + pw - 1, 17, C.CYAN_D);

    // Caption panel.
    G.rect(CAP.x, 143, CAP.w, 33, C.VOID);
    G.hline(CAP.x, CAP.x + CAP.w - 1, 143, C.NAVY2);
    G.line(CAP.x, 143, CAP.x + CAP.w - 1, 143, C.BLUE2, [2, 2, Math.floor(t * 8)]);
    G.text('>', 5, 147, C.MAGENTA);
    if (info.caption) G.typeText(info.caption, CAP_TEXT_X, 147, C.ICE, info.captionT, { maxChars: CAP_CHARS, cps: 32, cursorC: C.CYAN });
    G.vline(241, 146, 173, C.NAVY2);
    ambient(t);

    // CRT: slow rolling brightness band + corner brackets.
    const bandY = Math.floor(((t * 18) % (SCREEN.h + 40)) - 20) + SCREEN.y;
    G.remap(SCREEN.x, Math.max(SCREEN.y, bandY), SCREEN.w, Math.min(14, SCREEN.y + SCREEN.h - bandY), G.LIGHT, 0.125);
    brackets(SCREEN.x, SCREEN.y, SCREEN.w, SCREEN.h, C.AZURE, 4);

    // Bezel LEDs.
    G.pset(300, 177, Math.floor(t * 2) % 2 ? C.MAGENTA : C.PURPLE);
    G.pset(304, 177, C.CYAN);
  }

  // Scrolling waveform, pulsing ring, bar meters, blinking LEDs.
  function ambient(t) {
    // Waveform.
    const wx = 245, wy = 152, ww = 40;
    G.hline(wx, wx + ww - 1, wy, C.NAVY2);
    const pts = [];
    for (let i = 0; i < ww; i++) {
      const s = i + t * 30;
      const burst = Math.sin(s * 0.09) > 0.3 ? 1 : 0.3;
      pts.push([wx + i, wy + Math.round((Math.sin(s * 0.7) * 2.5 + Math.sin(s * 0.23) * 1.5) * burst)]);
    }
    G.glow(() => G.polyline(pts, C.MAGENTA));

    // Pulsing ring indicator (like the reference's donut).
    const rx = 299, ry = 152;
    G.circle(rx, ry, 5, C.NAVY2);
    const a = t * 4;
    G.glow(() => {
      G.arc(rx, ry, 5, a, a + 2.2, C.CYAN);
      G.disc(rx, ry, (Math.floor(t * 3) % 3) === 0 ? 1 : 0, C.CYAN_L);
    });

    // Bar meters.
    for (let i = 0; i < 8; i++) {
      const k = Math.floor(t * 5);
      const hgt = 2 + Math.round(8 * (0.5 * G.rnd(i, k) + 0.5 * G.rnd(i, k - 1)));
      G.rect(245 + i * 5, 172 - hgt, 3, hgt, i % 3 === 2 ? C.CYAN_D : C.MAGENTA);
      G.rect(245 + i * 5, 162, 3, 10 - hgt, C.NAVY);
    }
    // LEDs.
    const leds = [[C.CYAN, 1.3], [C.MAGENTA, 0.7], [C.ICE, 2.1]];
    leds.forEach(([c, hz], i) => {
      const on = Math.floor(t * hz * 2 + i) % 2 === 0;
      G.rect(292 + i * 6, 166, 3, 3, on ? c : C.NAVY2);
    });
  }

  // HUD corner brackets.
  function brackets(x, y, w, h, c, n) {
    n = n || 3;
    const x1 = x + w - 1, y1 = y + h - 1;
    G.hline(x, x + n - 1, y, c); G.vline(x, y, y + n - 1, c);
    G.hline(x1 - n + 1, x1, y, c); G.vline(x1, y, y + n - 1, c);
    G.hline(x, x + n - 1, y1, c); G.vline(x, y1 - n + 1, y1, c);
    G.hline(x1 - n + 1, x1, y1, c); G.vline(x1, y1 - n + 1, y1, c);
  }

  // Translucent HUD panel with title strip.
  function panel(x, y, w, h, title, c) {
    c = c == null ? C.CYAN : c;
    G.shade(x, y, w, h, (px, py) => G.dith(px, py, 0.25, C.VOID, C.NAVY));
    G.rectO(x, y, w, h, C.NAVY2);
    G.glow(() => brackets(x, y, w, h, c, 3));
    if (title) {
      G.rect(x + 1, y + 1, w - 2, 7, C.NAVY2);
      G.text(title, x + 3, y + 2, c);
    }
  }

  // Scrolling event log with typed lines.
  //   entries: [{t, s}] in scene seconds.
  function log(x, y, w, h, entries, t, title) {
    panel(x, y, w, h, title || 'EVENT LOG', C.CYAN);
    const rows = Math.floor((h - 10) / 7);
    const shown = entries.filter((e) => t >= e.t);
    const vis = shown.slice(-rows);
    vis.forEach((e, i) => {
      const last = i === vis.length - 1;
      G.text('>', x + 3, y + 10 + i * 7, last ? C.MAGENTA : C.PURPLE);
      if (last) G.typeText(e.s, x + 8, y + 10 + i * 7, C.CYAN_L, t - e.t, { cps: 40 });
      else G.text(e.s, x + 8, y + 10 + i * 7, C.SKY);
    });
  }

  // Magnifier inset. Box interpolates from `src` to `dst` as `open` goes
  // 0->1; dashed callouts tie it to the source region; `draw(w,h,t)` renders
  // local content (0,0 = inner top-left), clipped.
  function inset(o) {
    const open = G.clamp(o.open, 0, 1);
    if (open <= 0) return;
    const e = G.ease.inOut(open);
    const [sx, sy, sw, sh] = o.src, [dx, dy, dw, dh] = o.dst;
    const bx = Math.round(G.lerp(sx, dx, e)), by = Math.round(G.lerp(sy, dy, e));
    const bw = Math.max(3, Math.round(G.lerp(sw, dw, e))), bh = Math.max(3, Math.round(G.lerp(sh, dh, e)));
    const phase = Math.floor((o.t || 0) * 10);

    // Source marker + callout lines.
    G.glow(() => brackets(sx, sy, sw, sh, C.CYAN, 2));
    G.line(sx, sy, bx, by + bh - 1, C.CYAN_D, [1, 2, phase]);
    G.line(sx + sw - 1, sy, bx + bw - 1, by + bh - 1, C.CYAN_D, [1, 2, phase]);

    G.rect(bx, by, bw, bh, C.VOID);
    G.glow(() => G.rectO(bx, by, bw, bh, C.CYAN));
    if (open < 1) {
      // Static while the box is in flight.
      G.shade(bx + 1, by + 1, bw - 2, bh - 2, (x, y) => (G.rnd(x + phase * 131, y) < 0.18 ? C.BLUE2 : -1));
      return;
    }
    G.rect(bx + 1, by + 1, bw - 2, 7, C.NAVY2);
    G.text(o.title || 'INSET', bx + 3, by + 2, C.CYAN_L);
    const zl = 'ZOOM ' + (o.zoom || '');
    G.text(zl, bx + bw - 3 - G.textW(zl), by + 2, C.PINK);
    G.save();
    G.clip(bx + 1, by + 8, bw - 2, bh - 9);
    G.translate(bx + 1, by + 8);
    o.draw(bw - 2, bh - 9, o.t || 0);
    G.restore();
  }

  function tag(str, x, y) {
    const w = G.textW(str) + 5;
    G.rect(x, y, w, 9, C.VOID);
    G.rectO(x, y, w, 9, C.MAGENTA);
    G.text(str, x + 3, y + 2, C.PINK);
  }

  function scaleBar(x, y, len, label) {
    G.hline(x, x + len - 1, y, C.ICE);
    G.vline(x, y - 2, y, C.ICE); G.vline(x + len - 1, y - 2, y, C.ICE);
    G.textC(label, x + len / 2, y - 7, C.ICE);
  }

  // Text label with a leader line to (ax, ay).
  function label(str, x, y, ax, ay, c, lc) {
    G.line(ax, ay, x < ax ? x + G.textW(str) + 1 : x - 2, y + 2, lc == null ? C.SKY : lc);
    G.textBg(str, x, y, c == null ? C.ICE : c, C.VOID);
  }

  // Scale-change transition drawn over a scene: everything outside a box
  // growing from `src` to the full view is blanked, with a neon frame and a
  // zoom readout. Call after the scene content, while t < dur.
  function zoomReveal(t, dur, src, s) {
    if (t >= dur) return;
    const e = G.ease.inOut(G.seg(t, 0, dur));
    const x = Math.round(G.lerp(src[0], VIEW.x, e)), y = Math.round(G.lerp(src[1], VIEW.y, e));
    const w = Math.round(G.lerp(src[2], VIEW.w, e)), h = Math.round(G.lerp(src[3], VIEW.h, e));
    G.shade(VIEW.x, VIEW.y, VIEW.w, VIEW.h, (px, py) =>
      (px >= x && px < x + w && py >= y && py < y + h) ? -1
        : ((px - VIEW.x) % 10 === 0 || (py - VIEW.y) % 10 === 0) ? C.NAVY : C.VOID);
    G.glow(() => G.rectO(x, y, w, h, C.CYAN));
    G.textBg(s, Math.min(x + 2, VIEW.x + VIEW.w - G.textW(s) - 3), Math.max(VIEW.y + 2, y - 8), C.PINK, C.VOID);
  }

  // MS2 genome map (3569 nt): maturation | coat | replicase, with lysis on a
  // second row overlapping the coat end / replicase start.
  const GENES = {
    MAT: [130, 1311], COAT: [1335, 1727], LYS: [1678, 1905], REP: [1761, 3395], LEN: 3569,
  };
  function ntX(nt, x0, w) { return Math.round(x0 + nt / GENES.LEN * w); }
  function geneMap(x, y, w, o) {
    o = o || {};
    const bar = (g, row, c, name, off) => {
      const a = ntX(GENES[g][0], x, w), b = ntX(GENES[g][1], x, w);
      const yy = y + row * 8;
      if (off) {
        G.rectD(a, yy, b - a, 7, C.VOID, C.PURPLE, 0.5);
        G.rectO(a, yy, b - a, 7, c);
      } else G.rect(a, yy, b - a, 7, c);
      const lbl = G.textW(name) <= b - a - 2 ? name : name.slice(0, Math.max(1, Math.floor((b - a - 1) / 4)));
      if (!off) G.text(lbl, a + 2, yy + 1, C.VOID);
      else G.textBg(name + ' OFF', a + 3, yy + 1, C.PINK, C.VOID);
      if (o.hot === g) G.glow(() => G.rectO(a - 1, yy - 1, b - a + 2, 9, C.WHITE));
    };
    G.hline(x, x + w - 1, y + 3, C.SKY);
    G.text("5'", x - 9, y + 1, C.SKY);
    G.text("3'", x + w + 2, y + 1, C.SKY);
    bar('MAT', 0, C.MAGENTA, 'MATURATION');
    bar('COAT', 0, C.CYAN_L, 'COAT');
    bar('REP', 0, C.PINK, 'REPLICASE', o.repOff);
    bar('LYS', 1, C.ICE, 'LYS');
  }

  // Legend rows: [[drawIcon(x, y), label], ...]
  function legend(x, y, w, rows, title) {
    panel(x, y, w, 10 + rows.length * 8, title || 'KEY', C.CYAN);
    rows.forEach(([icon, str], i) => {
      icon(x + 6, y + 13 + i * 8);
      G.text(str, x + 13, y + 11 + i * 8, C.ICE);
    });
  }

  global.HUD = { SCREEN, VIEW, CAP, frameBack, frameFront, panel, log, inset, tag, scaleBar, label, brackets, lightOn, zoomReveal, geneMap, legend, GENES, ntX };
})(window);
