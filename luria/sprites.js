// luria/sprites.js — drawables for the Luria–Delbrück fluctuation test:
// T1 phage, small cells, test tubes, petri dishes, lineage trees, and the
// 1943 data. Builds on draw.js (G) and sprites.js (S).
(function (global) {
  'use strict';
  const { C } = G;

  // Resistant-colony counts as commonly cited from Luria & Delbrück (1943):
  // 20 independent parallel cultures (Experiment 23), and 10 samples taken
  // from one bulk culture (control).
  const DATA = {
    parallel: [1, 0, 3, 0, 0, 5, 0, 5, 0, 6, 107, 0, 0, 0, 1, 0, 0, 64, 0, 35],
    bulk: [14, 15, 13, 21, 15, 14, 26, 16, 20, 13],
  };
  function stats(a) {
    const m = a.reduce((s, v) => s + v, 0) / a.length;
    const v = a.reduce((s, x) => s + (x - m) ** 2, 0) / (a.length - 1); // sample variance
    return { mean: m, variance: v, zeros: a.filter((x) => x === 0).length };
  }

  const T1_RAMP = () => [C.INDIGO, C.PURPLE, C.MAGENTA, C.PINK, C.WHITE];

  // T1 at virus scale: icosahedral head plus a long, flexible,
  // non-contractile tail ending in a tip fibre. Tail leaves the head in
  // direction `ang`. Returns the tail tip [x, y].
  function t1(x, y, r, ang, len, wig) {
    const ux = Math.cos(ang), uy = Math.sin(ang), nx = -uy, ny = ux;
    const pts = [];
    for (let s = 0; s <= len; s += 2) {
      const off = Math.sin(s * 0.25 + (wig || 0)) * 1.2 * (s / len);
      pts.push([Math.round(x + ux * (r + s) + nx * off), Math.round(y + uy * (r + s) + ny * off)]);
    }
    G.glow(() => {
      G.polyline(pts, C.PINK);
      const [tx, ty] = pts[pts.length - 1];
      G.line(tx - Math.round(nx * 3), ty - Math.round(ny * 3), tx + Math.round(nx * 3), ty + Math.round(ny * 3), C.MAGENTA);
    });
    pts.forEach(([px, py], i) => { if (i % 2 === 1) G.pset(px, py, C.WHITE); }); // tail rings
    S.capsid(x, y, r, { ramp: T1_RAMP(), edge: C.PINK, seam: C.PURPLE, rot: 0.5 });
    return pts[pts.length - 1];
  }

  // T1 at cell scale: 2x2 head with a short tail.
  function t1Dot(x, y) {
    x = Math.round(x); y = Math.round(y);
    G.glow(() => { G.rect(x, y, 2, 2, C.PINK); G.pset(x, y + 2, C.MAGENTA); G.pset(x + 1, y + 3, C.MAGENTA); });
  }

  // Small rod-shaped cell (5 px tall). `mut` = resistant mutant.
  function rod(x, y, len, mut, flash) {
    x = Math.round(x); y = Math.round(y);
    const edge = flash ? C.WHITE : mut ? C.MAGENTA : C.CYAN_D;
    G.glow(() => {
      G.hline(x + 1, x + len - 2, y, edge); G.hline(x + 1, x + len - 2, y + 4, edge);
      G.vline(x, y + 1, y + 3, edge); G.vline(x + len - 1, y + 1, y + 3, edge);
    });
    G.shade(x + 1, y + 1, len - 2, 3, (px, py) => G.dith(px, py, 0.4, mut ? C.PURPLE : C.NAVY2, mut ? C.MAGENTA : C.BLUE));
  }

  // Test tube: 7 px wide, 27 tall. level 0..1, density 0..1 (turbidity).
  function tube(x, y, level, density, hot) {
    x = Math.round(x); y = Math.round(y);
    const H = 22;
    const top = y + 3 + Math.round(H * (1 - level));
    G.shade(x + 1, top, 5, y + 25 - top + 1, (px, py) => {
      if (py === y + 25 && (px === x + 1 || px === x + 5)) return -1;
      return G.dith(px, py, density, C.NAVY2, hot ? C.PINK : C.CYAN_D);
    });
    if (level > 0) G.hline(x + 1, x + 5, top, density > 0.5 ? C.ICE : C.SKY);
    G.glow(() => {
      G.vline(x, y + 1, y + 24, C.SKY); G.vline(x + 6, y + 1, y + 24, C.SKY);
      G.pset(x + 1, y + 25, C.SKY); G.pset(x + 5, y + 25, C.SKY); G.hline(x + 2, x + 4, y + 26, C.SKY);
      G.hline(x - 1, x + 7, y, C.ICE);
    });
  }

  // Petri dish (top view). `n` colonies (drawn up to the space available),
  // `phage` speckles the agar to show the T1 coating.
  function plate(cx, cy, r, n, seed, o) {
    o = o || {};
    cx = Math.round(cx); cy = Math.round(cy);
    G.disc(cx, cy, r - 1, (x, y) => {
      if (o.phage && G.rnd(x * 7 + seed, y) < 0.07) return C.PURPLE;
      return G.dith(x, y, 0.3, C.NAVY, C.NAVY2);
    });
    G.circle(cx, cy, r - 1, C.BLUE2);
    G.glow(() => G.circle(cx, cy, r, o.hot ? C.MAGENTA : C.CYAN_D));
    // Colony positions: deterministic, spread over the agar.
    let drawn = 0;
    for (let k = 0; drawn < n && k < n * 6 + 40; k++) {
      const a = G.rnd(seed, k) * Math.PI * 2, d = Math.sqrt(G.rnd(k, seed + 1)) * (r - 3);
      const x = Math.round(cx + Math.cos(a) * d), y = Math.round(cy + Math.sin(a) * d);
      if (G.pget(x, y) === C.ICE) continue;
      G.pset(x, y, C.ICE);
      if (n < 30) G.pset(x + 1, y, C.CYAN_L);
      drawn++;
    }
  }

  // Binary lineage tree, top to bottom. Generation g has 2^g cells.
  //   shown : generations drawn so far (fractional = children growing out)
  //   mut(g, k) -> true if that cell is a resistant mutant
  //   dead(g, k) -> true to draw that cell as killed (dim, no glow)
  function tree(x0, y0, w, gens, shown, mut, dy, dead) {
    dy = dy || 12;
    const pos = (g, k) => [x0 + (k + 0.5) * w / (1 << g), y0 + g * dy];
    for (let g = 0; g <= gens; g++) {
      if (shown < g - 1) break;
      const grow = G.clamp(shown - g + 1, 0, 1); // 0..1 for the newest generation
      const n = 1 << g;
      for (let k = 0; k < n; k++) {
        let [x, y] = pos(g, k);
        const m = mut(g, k);
        if (g > 0) {
          const [px, py] = pos(g - 1, k >> 1);
          x = G.lerp(px, x, grow); y = G.lerp(py, y, grow);
          G.line(px, py + 2, x, y - 1, m ? C.MAGENTA : C.AZURE);
        }
        if (g > 0 && grow < 1) continue;
        const len = g >= 4 ? 3 : 5;
        const rx = Math.round(x - len / 2), ry = Math.round(y - 1);
        if (dead && dead(g, k)) G.rect(rx, ry, len, 3, C.NAVY2);
        else if (g >= 5) G.rect(rx, ry, len, 3, m ? C.MAGENTA : C.CYAN_L); // too dense for halos
        else G.glow(() => G.rect(rx, ry, len, 3, m ? C.MAGENTA : C.CYAN_L));
      }
    }
    return pos;
  }

  // Tiny bar chart sketch (for predictions): values scaled to `h`.
  function bars(x, y, h, vals, max, c) {
    vals.forEach((v, i) => {
      const bh = Math.max(v > 0 ? 1 : 0, Math.round(v / max * h));
      G.rect(x + i * 5, y + h - bh, 3, bh, c);
      G.hline(x + i * 5, x + i * 5 + 2, y + h, C.BLUE2);
    });
  }

  global.L = { DATA, stats, t1, t1Dot, rod, tube, plate, tree, bars };
})(window);
