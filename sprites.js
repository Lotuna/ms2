// sprites.js — biology drawables (cell-scale for now; virus-scale later).
(function (global) {
  'use strict';
  const { C } = G;

  // E. coli: horizontal rounded rod with a double-line envelope
  // (outer membrane = neon line, dark periplasm gap, inner membrane line)
  // around a dithered cytoplasm with a faint nucleoid.
  //   o.flash  : 0..1, whitens the outer membrane (contact events)
  //   o.seed   : varies nucleoid squiggle
  function ecoli(cx, cy, len, r, o) {
    o = o || {};
    cx = Math.round(cx); cy = Math.round(cy);
    const ax = cx - len / 2 + r, bx = cx + len / 2 - r;
    const x0 = Math.floor(cx - len / 2) - 1, y0 = cy - r - 1;
    const w = len + 3, h = 2 * r + 3;
    const d = (x, y) => G.sdCapsule(x + 0.5, y + 0.5, ax, cy, bx, cy, r);
    const outer = o.flash > 0 ? (o.flash > 0.5 ? C.WHITE : C.ICE) : C.CYAN_D;

    G.glow(() => G.shade(x0, y0, w, h, (x, y) => {
      const v = d(x, y);
      return v <= 0 && v > -1 ? outer : -1;
    }));
    G.shade(x0, y0, w, h, (x, y) => {
      const v = d(x, y);
      if (v > -1) return -1;
      if (v > -2) return C.NAVY; // periplasm
      if (v > -3) return C.AZURE; // inner membrane
      // cytoplasm: brighter just under the membrane, dark core, lit from top
      const depth = G.ease.inOut(G.clamp((-v - 3) / (r * 0.6), 0, 1));
      const t = 0.2 + depth * 0.45 + G.clamp((y - cy) / r, -1, 1) * 0.3;
      if (v > -5 && y < cy - r + 6 && x < cx) return G.dith(x, y, 0.5, C.BLUE, C.BLUE2); // sheen
      return G.ramp(x, y, t, [C.BLUE, C.NAVY2, C.NAVY]);
    });

    // Nucleoid: a loose random-walk tangle, deterministic per seed.
    const seed = o.seed || 1;
    const hx = (len / 2 - r) * 0.8 + r * 0.3, hy = r * 0.45;
    let px = cx + (G.rnd(seed, 0) - 0.5) * hx, py = cy, ang = G.rnd(seed, 1) * 6.28;
    const pts = [[px, py]];
    for (let k = 0; k < 26; k++) {
      ang += (G.rnd(seed, k + 2) - 0.5) * 2.2;
      let nx = px + Math.cos(ang) * 4, ny = py + Math.sin(ang) * 3;
      if (((nx - cx) / hx) ** 2 + ((ny - cy) / hy) ** 2 > 1) { ang += Math.PI; nx = px; ny = py; }
      px = nx; py = ny;
      pts.push([px, py]);
    }
    G.polyline(pts, C.INDIGO);
  }

  // Plasmid: small neon DNA ring with the tra region highlighted.
  //   o.tra      : [a0, a1] angle range of tra genes (magenta)
  //   o.build    : 0..1, fraction of ring present (for a forming copy)
  //   o.buildA   : start angle of the forming ring
  //   o.roll     : angle of a bright "rolling circle" marker, or null
  //   o.pulse    : 0..1 brightens the tra region
  function plasmid(cx, cy, r, o) {
    o = o || {};
    const build = o.build == null ? 1 : o.build;
    if (build <= 0) return;
    const a0 = o.buildA || 0, span = build * Math.PI * 2;
    G.glow(() => {
      G.arc(cx, cy, r, a0, a0 + span, C.CYAN);
      if (o.tra && build >= 1) G.arc(cx, cy, r, o.tra[0], o.tra[1], o.pulse > 0.5 ? C.PINK : C.MAGENTA);
      if (o.roll != null) {
        G.pset(Math.round(cx + Math.cos(o.roll) * r), Math.round(cy + Math.sin(o.roll) * r), C.WHITE);
      }
    });
  }

  // Pilus path: a thin filament from anchor (ax,ay) to tip (bx,by) with a
  // lazy sine wobble tapered to zero at both ends (so it stays attached).
  function pilusPath(ax, ay, bx, by, amp, phase) {
    const L = Math.hypot(bx - ax, by - ay);
    if (L < 1) return [[ax, ay]];
    const ux = (bx - ax) / L, uy = (by - ay) / L;
    const pts = [];
    const n = Math.max(1, Math.ceil(L / 2));
    for (let i = 0; i <= n; i++) {
      const s = (i / n) * L;
      const off = amp * Math.sin(s * 0.28 + phase) * Math.sin(Math.PI * s / L);
      pts.push([Math.round(ax + ux * s - uy * off), Math.round(ay + uy * s + ux * off)]);
    }
    return pts;
  }
  function pilus(pts, c) {
    G.glow(() => G.polyline(pts, c == null ? C.ICE : c));
  }

  global.S = { ecoli, plasmid, pilusPath, pilus };
})(window);
