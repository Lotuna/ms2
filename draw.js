// draw.js — indexed-color framebuffer and pixel primitives.
//
// Everything is drawn into a 320x180 Uint8Array of palette indices, so no
// color outside palette.js can ever reach the screen. All coordinates are
// floored to integers at the pixel-write boundary.
(function (global) {
  'use strict';

  const W = 320, H = 180;

  // ---- palette -----------------------------------------------------------
  function hexToRgb(h) {
    const n = parseInt(h.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  const RGB = PALETTE.map(hexToRgb);
  function nearest(hex) {
    const t = hexToRgb(hex);
    let best = 0, bd = Infinity;
    RGB.forEach((c, i) => {
      const d = (c[0] - t[0]) ** 2 + (c[1] - t[1]) ** 2 + (c[2] - t[2]) ** 2;
      if (d < bd) { bd = d; best = i; }
    });
    return best;
  }

  // Named roles, resolved to the nearest extracted color so the rest of the
  // code survives a re-run of tools/extract_palette.py.
  const C = {
    VOID: nearest('#000010'), NAVY: nearest('#000250'), NAVY2: nearest('#141e70'),
    INDIGO: nearest('#300384'), BLUE: nearest('#0232a0'), BLUE2: nearest('#0444b9'),
    PURPLE: nearest('#7e1f8c'), MAGENTA: nearest('#d823b3'), AZURE: nearest('#0e78c2'),
    SKY: nearest('#429dd1'), CYAN_D: nearest('#0fb6dd'), PINK: nearest('#d88fd0'),
    CYAN: nearest('#1edde4'), CYAN_L: nearest('#4de8ec'), ICE: nearest('#aef0f5'),
    WHITE: nearest('#ffffff'),
  };

  function roleMap(pairs, fallback) {
    const m = new Uint8Array(256).fill(255);
    for (const [a, b] of pairs) m[C[a]] = C[b];
    for (let i = 0; i < PALETTE.length; i++) if (m[i] === 255) m[i] = fallback == null ? i : C[fallback];
    return m;
  }
  // 1px neon halo color for each core color.
  const HALO = roleMap([
    ['WHITE', 'CYAN'], ['ICE', 'CYAN_D'], ['CYAN_L', 'CYAN_D'], ['CYAN', 'AZURE'],
    ['CYAN_D', 'BLUE2'], ['SKY', 'BLUE2'], ['AZURE', 'BLUE'], ['MAGENTA', 'PURPLE'],
    ['PINK', 'PURPLE'], ['PURPLE', 'INDIGO'], ['BLUE2', 'NAVY2'],
  ], 'NAVY2');
  // One step brighter, same hue family (used by CRT roll band / flashes).
  const LIGHT = roleMap([
    ['VOID', 'NAVY'], ['NAVY', 'NAVY2'], ['NAVY2', 'BLUE'], ['INDIGO', 'PURPLE'],
    ['BLUE', 'BLUE2'], ['BLUE2', 'AZURE'], ['AZURE', 'SKY'], ['SKY', 'CYAN_D'],
    ['CYAN_D', 'CYAN'], ['CYAN', 'CYAN_L'], ['CYAN_L', 'ICE'], ['ICE', 'WHITE'],
    ['PURPLE', 'MAGENTA'], ['MAGENTA', 'PINK'], ['PINK', 'WHITE'],
  ]);

  // ---- framebuffer + state -----------------------------------------------
  const fb = new Uint8Array(W * H);
  const glowBuf = new Uint8Array(W * H).fill(255); // 255 = empty
  let target = fb;
  let gx0 = W, gy0 = H, gx1 = -1, gy1 = -1; // glow layer dirty box

  // 4x4 Bayer matrix, values 0..15.
  const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
  function bayer(x, y) { return BAYER[((y & 3) << 2) | (x & 3)]; }

  let st = { ox: 0, oy: 0, cx0: 0, cy0: 0, cx1: W, cy1: H, a: 16 };
  const stack = [];
  function save() { stack.push(Object.assign({}, st)); }
  function restore() { st = stack.pop(); }
  function translate(dx, dy) { st.ox += Math.floor(dx); st.oy += Math.floor(dy); }
  function clip(x, y, w, h) {
    x = Math.floor(x) + st.ox; y = Math.floor(y) + st.oy;
    st.cx0 = Math.max(st.cx0, x); st.cy0 = Math.max(st.cy0, y);
    st.cx1 = Math.min(st.cx1, x + Math.floor(w)); st.cy1 = Math.min(st.cy1, y + Math.floor(h));
  }
  // Ordered-dither transparency: a in [0,1] is the fraction of pixels drawn.
  function alpha(a) { st.a = Math.max(0, Math.min(16, Math.round(a * 16 * (st.a / 16)))); }

  function pset(x, y, c) {
    x = Math.floor(x) + st.ox; y = Math.floor(y) + st.oy;
    if (x < st.cx0 || y < st.cy0 || x >= st.cx1 || y >= st.cy1) return;
    if (st.a < 16 && bayer(x, y) >= st.a) return;
    target[y * W + x] = c;
    if (target === glowBuf) {
      if (x < gx0) gx0 = x; if (x > gx1) gx1 = x;
      if (y < gy0) gy0 = y; if (y > gy1) gy1 = y;
    }
  }
  function pget(x, y) {
    x = Math.floor(x) + st.ox; y = Math.floor(y) + st.oy;
    if (x < 0 || y < 0 || x >= W || y >= H) return C.VOID;
    return fb[y * W + x];
  }

  // Dither pick: returns c2 with probability ~t (ordered), else c1.
  // Uses absolute screen coords so patterns don't crawl when translated.
  function dith(x, y, t, c1, c2) {
    const X = Math.floor(x) + st.ox, Y = Math.floor(y) + st.oy;
    return bayer(X, Y) < t * 16 ? c2 : c1;
  }
  // Multi-stop ramp: t in [0,1] across colors[], dithered between neighbors.
  function ramp(x, y, t, colors) {
    t = Math.max(0, Math.min(1, t)) * (colors.length - 1);
    const i = Math.min(colors.length - 2, Math.floor(t));
    return dith(x, y, t - i, colors[i], colors[i + 1]);
  }

  // ---- primitives --------------------------------------------------------
  function clear(c) { fb.fill(c); }
  function rect(x, y, w, h, c) {
    x = Math.floor(x); y = Math.floor(y);
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) pset(x + i, y + j, c);
  }
  function rectO(x, y, w, h, c) {
    x = Math.floor(x); y = Math.floor(y); w = Math.floor(w); h = Math.floor(h);
    hline(x, x + w - 1, y, c); hline(x, x + w - 1, y + h - 1, c);
    vline(x, y, y + h - 1, c); vline(x + w - 1, y, y + h - 1, c);
  }
  // Flat 2-color dithered fill (t = fraction of c2).
  function rectD(x, y, w, h, c1, c2, t) {
    x = Math.floor(x); y = Math.floor(y);
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) pset(x + i, y + j, dith(x + i, y + j, t, c1, c2));
  }
  // Vertical / horizontal Bayer gradients between two (or more) colors.
  function gradV(x, y, w, h, colors) {
    x = Math.floor(x); y = Math.floor(y);
    for (let j = 0; j < h; j++) {
      const t = h > 1 ? j / (h - 1) : 0;
      for (let i = 0; i < w; i++) pset(x + i, y + j, ramp(x + i, y + j, t, colors));
    }
  }
  function gradH(x, y, w, h, colors) {
    x = Math.floor(x); y = Math.floor(y);
    for (let i = 0; i < w; i++) {
      const t = w > 1 ? i / (w - 1) : 0;
      for (let j = 0; j < h; j++) pset(x + i, y + j, ramp(x + i, y + j, t, colors));
    }
  }
  function hline(x0, x1, y, c) {
    if (x1 < x0) [x0, x1] = [x1, x0];
    for (let x = Math.floor(x0); x <= x1; x++) pset(x, y, c);
  }
  function vline(x, y0, y1, c) {
    if (y1 < y0) [y0, y1] = [y1, y0];
    for (let y = Math.floor(y0); y <= y1; y++) pset(x, y, c);
  }
  // Bresenham. `dash` (optional) = [on, off, offset] for dashed lines.
  function line(x0, y0, x1, y1, c, dash) {
    x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
    const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
    let err = dx + dy, n = 0;
    for (;;) {
      if (!dash) pset(x0, y0, c);
      else {
        const period = dash[0] + dash[1];
        if ((((n + (dash[2] | 0)) % period) + period) % period < dash[0]) pset(x0, y0, c);
      }
      n++;
      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * err;
      if (e2 >= dy) { err += dy; x0 += sx; }
      if (e2 <= dx) { err += dx; y0 += sy; }
    }
  }
  function polyline(pts, c, dash) {
    for (let i = 1; i < pts.length; i++) line(pts[i - 1][0], pts[i - 1][1], pts[i][0], pts[i][1], c, dash);
  }
  // Midpoint circle outline.
  function circle(cx, cy, r, c) {
    cx = Math.round(cx); cy = Math.round(cy); r = Math.round(r);
    if (r <= 0) { pset(cx, cy, c); return; }
    let x = r, y = 0, e = 1 - r;
    while (x >= y) {
      pset(cx + x, cy + y, c); pset(cx - x, cy + y, c); pset(cx + x, cy - y, c); pset(cx - x, cy - y, c);
      pset(cx + y, cy + x, c); pset(cx - y, cy + x, c); pset(cx + y, cy - x, c); pset(cx - y, cy - x, c);
      y++;
      if (e < 0) e += 2 * y + 1; else { x--; e += 2 * (y - x) + 1; }
    }
  }
  function disc(cx, cy, r, c) {
    cx = Math.round(cx); cy = Math.round(cy);
    const rr = (r + 0.5) * (r + 0.5);
    for (let y = -Math.ceil(r); y <= Math.ceil(r); y++)
      for (let x = -Math.ceil(r); x <= Math.ceil(r); x++)
        if (x * x + y * y <= rr) pset(cx + x, cy + y, typeof c === 'function' ? c(cx + x, cy + y, x, y) : c);
  }
  // Circle outline restricted to an angle range [a0, a1] (radians, 0 = +x,
  // clockwise because screen y points down). Uses the midpoint points.
  function arc(cx, cy, r, a0, a1, c) {
    cx = Math.round(cx); cy = Math.round(cy); r = Math.round(r);
    const TAU = Math.PI * 2;
    const span = a1 - a0;
    const inRange = (px, py) => {
      if (span >= TAU) return true;
      let a = Math.atan2(py, px) - a0;
      a = ((a % TAU) + TAU) % TAU;
      return a <= span;
    };
    let x = r, y = 0, e = 1 - r;
    const pts = [];
    while (x >= y) {
      pts.push([x, y], [-x, y], [x, -y], [-x, -y], [y, x], [-y, x], [y, -x], [-y, -x]);
      y++;
      if (e < 0) e += 2 * y + 1; else { x--; e += 2 * (y - x) + 1; }
    }
    for (const [px, py] of pts) if (inRange(px, py)) pset(cx + px, cy + py, c);
  }
  // Generic per-pixel shader over a box: fn(x, y) -> palette index or -1.
  function shade(x, y, w, h, fn) {
    x = Math.floor(x); y = Math.floor(y);
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
      const c = fn(x + i, y + j);
      if (c >= 0) pset(x + i, y + j, c);
    }
  }

  // ---- neon glow ---------------------------------------------------------
  // Draw calls inside fn go to a side layer; on composite every covered pixel
  // gets its core color and every uncovered 4-neighbor gets HALO[core].
  function glow(fn) {
    const prev = target;
    target = glowBuf;
    gx0 = W; gy0 = H; gx1 = -1; gy1 = -1;
    fn();
    target = prev;
    if (gx1 < 0) return;
    const x0 = Math.max(0, gx0 - 1), x1 = Math.min(W - 1, gx1 + 1);
    const y0 = Math.max(0, gy0 - 1), y1 = Math.min(H - 1, gy1 + 1);
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      const i = y * W + x;
      if (glowBuf[i] !== 255) continue;
      if (x < st.cx0 - 1 || y < st.cy0 - 1 || x > st.cx1 || y > st.cy1) continue;
      let n = 255;
      if (x > 0 && glowBuf[i - 1] !== 255) n = glowBuf[i - 1];
      else if (x < W - 1 && glowBuf[i + 1] !== 255) n = glowBuf[i + 1];
      else if (y > 0 && glowBuf[i - W] !== 255) n = glowBuf[i - W];
      else if (y < H - 1 && glowBuf[i + W] !== 255) n = glowBuf[i + W];
      if (n !== 255 && (st.a >= 16 || bayer(x, y) < st.a)) fb[i] = HALO[n];
    }
    for (let y = gy0; y <= gy1; y++) for (let x = gx0; x <= gx1; x++) {
      const i = y * W + x;
      if (glowBuf[i] !== 255) { fb[i] = glowBuf[i]; glowBuf[i] = 255; }
    }
  }

  // Remap a screen region through a color map (e.g. LIGHT) on a dithered
  // fraction of pixels. Operates in absolute screen coords.
  function remap(x, y, w, h, map, t) {
    for (let j = Math.max(0, y); j < Math.min(H, y + h); j++)
      for (let i = Math.max(0, x); i < Math.min(W, x + w); i++)
        if (bayer(i, j) < t * 16) fb[j * W + i] = map[fb[j * W + i]];
  }

  // ---- 3x5 pixel font ----------------------------------------------------
  // Each glyph is 5 rows of 3 bits. Lowercase falls back to uppercase; the
  // small unit letters live on subscript code points (use G.UM / G.NM).
  const GLYPHS = {
    A: '010101111101101', B: '110101110101110', C: '011100100100011', D: '110101101101110',
    E: '111100110100111', F: '111100110100100', G: '011100101101011', H: '101101111101101',
    I: '111010010010111', J: '001001001101010', K: '101101110101101', L: '100100100100111',
    M: '101111101101101', N: '110101101101101', O: '010101101101010', P: '110101110100100',
    Q: '010101101110011', R: '110101110101101', S: '011100010001110', T: '111010010010010',
    U: '101101101101111', V: '101101101101010', W: '101101111111101', X: '101101010101101',
    Y: '101101010010010', Z: '111001010100111',
    0: '111101101101111', 1: '010110010010111', 2: '110001010100111', 3: '110001010001110',
    4: '101101111001001', 5: '111100110001110', 6: '011100110101010', 7: '111001010010010',
    8: '010101010101010', 9: '010101011001110',
    ' ': '000000000000000', '.': '000000000000010', ',': '000000000010100', "'": '010010000000000',
    '"': '101101000000000', ':': '000010000010000', ';': '000010000010100', '+': '000010111010000',
    '-': '000000111000000', '/': '001001010100100', '(': '010100100100010', ')': '010001001001010',
    '!': '010010010000010', '?': '110001010000010', '%': '101001010100101', '|': '010010010010010',
    '>': '100010001010100', '<': '001010100010001', '_': '000000000000111', '=': '000111000111000',
    '#': '101111101111101', '[': '110100100100110', ']': '011001001001011', '~': '000011110000000',
    '×': '000101010101000', 'µ': '101101101111100', 'ₘ': '000000111111101', 'ₙ': '000000110101101',
    '█': '111111111111111', '*': '000101010101000', '&': '010101010101011', '^': '010101000000000',
  };
  const GW = 4, GH = 6; // advance, line height

  function glyph(ch) {
    return GLYPHS[ch] || GLYPHS[ch.toUpperCase()] || GLYPHS['?'];
  }
  function text(str, x, y, c) {
    x = Math.floor(x); y = Math.floor(y);
    for (let k = 0; k < str.length; k++) {
      const g = glyph(str[k]);
      for (let r = 0; r < 5; r++) for (let q = 0; q < 3; q++)
        if (g.charCodeAt(r * 3 + q) === 49) pset(x + k * GW + q, y + r, c);
    }
    return str.length * GW;
  }
  // Text on a solid 1px-padded backing so it stays legible over the grid.
  function textBg(str, x, y, c, bg) {
    rect(Math.floor(x) - 1, Math.floor(y) - 1, textW(str) + 2, 7, bg == null ? C.VOID : bg);
    return text(str, x, y, c);
  }
  function textCBg(str, cx, y, c, bg) { return textBg(str, Math.round(cx - textW(str) / 2), y, c, bg); }
  function textW(str) { return Math.max(0, str.length * GW - 1); }
  function textC(str, cx, y, c) { return text(str, Math.round(cx - textW(str) / 2), y, c); }
  function wrap(str, maxChars) {
    const out = [];
    for (const para of str.split('\n')) {
      let cur = '';
      for (const w of para.split(' ')) {
        if (cur && (cur + ' ' + w).length > maxChars) { out.push(cur); cur = w; }
        else cur = cur ? cur + ' ' + w : w;
      }
      out.push(cur);
    }
    return out;
  }
  // CRT typewriter: reveals `cps` chars/second, block cursor that is solid
  // while typing and blinks at 2 Hz after. Returns true when fully typed.
  function typeText(str, x, y, c, t, opts) {
    opts = opts || {};
    const cps = opts.cps || 30, lh = opts.lineH || GH + 1;
    const lines = opts.maxChars ? wrap(str, opts.maxChars) : str.split('\n');
    let n = Math.max(0, Math.floor(t * cps));
    const total = lines.reduce((s, l) => s + l.length, 0);
    let cx = x, cy = y;
    for (let i = 0; i < lines.length; i++) {
      const shown = lines[i].slice(0, Math.max(0, n));
      text(shown, x, y + i * lh, c);
      if (n >= 0) { cx = x + shown.length * GW; cy = y + i * lh; }
      n -= lines[i].length;
      if (n < 0) break;
    }
    const done = Math.floor(t * cps) >= total;
    const blinkOn = !done || Math.floor(t * 2) % 2 === 0;
    if (opts.cursor !== false && t >= 0 && blinkOn) rect(cx, cy, 3, 5, opts.cursorC == null ? c : opts.cursorC);
    return done;
  }
  // Glitchy text reveal: characters scramble before settling.
  function glitchText(str, x, y, c, t, dur) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+-/#%';
    let s = '';
    for (let i = 0; i < str.length; i++) {
      const settle = (dur || 0.4) * (i + 1) / str.length;
      s += t >= settle || str[i] === ' ' ? str[i] : chars[hash(i, Math.floor(t * 30)) % chars.length];
    }
    return text(s, x, y, c);
  }

  // ---- math / timing -----------------------------------------------------
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  // Progress of t through [a, b] as 0..1.
  const seg = (t, a, b) => clamp((t - a) / (b - a), 0, 1);
  const ease = {
    inOut: (t) => t * t * (3 - 2 * t),
    out: (t) => 1 - (1 - t) * (1 - t),
    in: (t) => t * t,
    back: (t) => { const s = 1.7; t -= 1; return t * t * ((s + 1) * t + s) + 1; },
  };
  function hash(x, y) {
    let h = (x * 374761393 + y * 668265263) | 0;
    h = (h ^ (h >>> 13)) * 1274126177;
    return (h ^ (h >>> 16)) >>> 0;
  }
  const rnd = (x, y) => hash(x, y) / 4294967296;

  // Signed distance from p to a capsule (segment a->b, radius r).
  function sdCapsule(px, py, ax, ay, bx, by, r) {
    const pax = px - ax, pay = py - ay, bax = bx - ax, bay = by - ay;
    const h = clamp((pax * bax + pay * bay) / (bax * bax + bay * bay || 1), 0, 1);
    return Math.hypot(pax - bax * h, pay - bay * h) - r;
  }

  // Resample a polyline into points `step` px apart (for travelling heads,
  // partial strokes, etc.). Returns {pts, len}.
  function resample(pts, step) {
    step = step || 1;
    const out = [[pts[0][0], pts[0][1]]];
    let len = 0, carry = 0;
    for (let i = 1; i < pts.length; i++) {
      const [x0, y0] = pts[i - 1], [x1, y1] = pts[i];
      const d = Math.hypot(x1 - x0, y1 - y0);
      let s = step - carry;
      while (s <= d) { out.push([x0 + (x1 - x0) * s / d, y0 + (y1 - y0) * s / d]); s += step; }
      carry = d - (s - step);
      len += d;
    }
    return { pts: out, len };
  }
  // Draw the portion of a polyline between arc-length fractions f0..f1.
  function partial(pts, f0, f1, c, dash) {
    const r = resample(pts, 1).pts;
    const i0 = Math.round(f0 * (r.length - 1)), i1 = Math.round(f1 * (r.length - 1));
    if (i1 <= i0) return null;
    polyline(r.slice(i0, i1 + 1), c, dash);
    return r[i1];
  }

  // ---- present -----------------------------------------------------------
  const off = document.createElement('canvas');
  off.width = W; off.height = H;
  const offCtx = off.getContext('2d');
  const img = offCtx.createImageData(W, H);
  const img32 = new Uint32Array(img.data.buffer);
  const LUT = new Uint32Array(256);
  RGB.forEach(([r, g, b], i) => { LUT[i] = (255 << 24) | (b << 16) | (g << 8) | r; });

  function present(ctx, scale) {
    for (let i = 0; i < W * H; i++) img32[i] = LUT[fb[i]];
    offCtx.putImageData(img, 0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(off, 0, 0, W * scale, H * scale);
  }
  function resetState() { st = { ox: 0, oy: 0, cx0: 0, cy0: 0, cx1: W, cy1: H, a: 16 }; stack.length = 0; target = fb; }

  global.G = {
    W, H, C, HALO, LIGHT, RGB, fb,
    save, restore, translate, clip, alpha, resetState,
    pset, pget, dith, ramp, bayer,
    clear, rect, rectO, rectD, gradV, gradH, hline, vline, line, polyline,
    circle, disc, arc, shade, glow, remap,
    UM: 'µₘ', NM: 'ₙₘ',
    text, textBg, textCBg, textW, textC, wrap, typeText, glitchText, GW, GH,
    clamp, lerp, seg, ease, hash, rnd, sdCapsule, resample, partial,
    present,
  };
})(window);
