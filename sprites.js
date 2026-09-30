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

  // ---- virus scale -------------------------------------------------------

  // Light direction for faceted shading (from upper-left, toward viewer).
  const LX = -0.5, LY = -0.6, LZ = 0.62;
  function shellRamp() { return [C.NAVY2, C.BLUE, C.BLUE2, C.AZURE, C.SKY, C.CYAN_L]; }

  // Facet id for a point on a disc of radius r: a pentagonal cap, a ring of
  // 5 and an offset ring of 10 — reads as an icosahedron at 12-30 px.
  function facet(dx, dy, r, rot) {
    const d = Math.hypot(dx, dy) / r;
    // Small shells: cap + 5 + 10 facets. Large shells get a fourth ring.
    const big = r >= 16;
    const bounds = big ? [0.24, 0.5, 0.76] : [0.36, 0.74];
    const counts = big ? [1, 5, 10, 20] : [1, 5, 10];
    const offs = big ? [0, 0, Math.PI / 10, Math.PI / 20] : [0, 0, Math.PI / 10];
    const rcs = big ? [0, 0.37, 0.63, 0.9] : [0, 0.56, 0.88];
    let ring = 0;
    while (ring < bounds.length && d >= bounds[ring]) ring++;
    if (ring === 0) return { id: 0, ring, a: 0, rc: 0 };
    const n = counts[ring];
    const a = Math.atan2(dy, dx) - rot - offs[ring];
    const sec = ((Math.floor(a / (Math.PI * 2) * n) % n) + n) % n;
    return { id: ring * 32 + sec, ring, a: (sec + 0.5) / n * Math.PI * 2 + rot + offs[ring], rc: rcs[ring] };
  }

  // MS2 capsid: faceted pixel sphere, no tail.
  //   o.mat    : angle of the single maturation protein (magenta), or null
  //   o.rot    : facet rotation (radians)
  //   o.reveal : 0..1 fraction of facets present (assembly); missing facets
  //              show whatever was drawn underneath (e.g. the RNA)
  //   o.empty  : dim, hollow shell (after genome ejection)
  function capsid(cx, cy, r, o) {
    o = o || {};
    cx = Math.round(cx); cy = Math.round(cy);
    const rot = o.rot || 0, reveal = o.reveal == null ? 1 : o.reveal;
    const ramp = o.empty ? [C.VOID, C.NAVY, C.NAVY2, C.BLUE] : shellRamp();
    const present = (f) => reveal >= 1 || G.rnd(f.id + 3, 11) < reveal;
    const at = (x, y) => facet(x + 0.5 - cx, y + 0.5 - cy, r, rot);
    const inside = (x, y) => (x + 0.5 - cx) ** 2 + (y + 0.5 - cy) ** 2 <= r * r;

    if (reveal > 0) {
      G.glow(() => G.shade(cx - r - 1, cy - r - 1, 2 * r + 2, 2 * r + 2, (x, y) => {
        if (!inside(x, y)) return -1;
        const edge = !inside(x + 1, y) || !inside(x - 1, y) || !inside(x, y + 1) || !inside(x, y - 1);
        if (!edge) return -1;
        return present(at(x, y)) ? (o.empty ? C.BLUE2 : C.CYAN_D) : -1;
      }));
    }
    G.shade(cx - r, cy - r, 2 * r, 2 * r, (x, y) => {
      if (!inside(x, y)) return -1;
      if (!inside(x + 1, y) || !inside(x - 1, y) || !inside(x, y + 1) || !inside(x, y - 1)) return -1;
      const f = at(x, y);
      if (!present(f)) return -1;
      // facet edge: neighbour belongs to a different facet
      const fr = at(x + 1, y), fd = at(x, y + 1);
      if (fr.id !== f.id || fd.id !== f.id) return o.empty ? C.NAVY : C.BLUE;
      const nx = Math.cos(f.a) * f.rc, ny = Math.sin(f.a) * f.rc, nz = Math.sqrt(1 - f.rc * f.rc);
      const b = G.clamp(nx * LX + ny * LY + nz * LZ, 0, 1);
      return G.ramp(x, y, b, ramp);
    });
    if (o.mat != null && reveal >= 1) {
      const mx = Math.round(cx + Math.cos(o.mat) * (r - 1.5) - 0.5);
      const my = Math.round(cy + Math.sin(o.mat) * (r - 1.5) - 0.5);
      G.glow(() => G.rect(mx, my, 2, 2, C.MAGENTA));
    }
  }

  // Tiny MS2 for cell-scale views: 3x3 bright particle with one magenta
  // edge pixel (the maturation protein). dir: 0=right,1=down,2=left,3=up.
  function ms2Dot(x, y, dir) {
    x = Math.round(x); y = Math.round(y);
    const arms = [[1, 0], [0, 1], [-1, 0], [0, -1]];
    G.glow(() => {
      G.rect(x - 1, y - 1, 3, 3, C.PINK);
      G.pset(x, y, C.WHITE);
      arms.forEach(([dx, dy]) => G.pset(x + dx, y + dy, C.ICE));
      if (dir != null) G.pset(x + arms[dir][0], y + arms[dir][1], C.MAGENTA);
    });
  }

  // Folded genome tangle (for inside a capsid / free + strands in the
  // cytoplasm): random walk with hairpin hooks, deterministic per seed.
  function rnaKnot(cx, cy, r, seed, c) {
    let px = cx, py = cy, ang = G.rnd(seed, 0) * 6.28;
    const pts = [[Math.round(px), Math.round(py)]];
    const steps = Math.max(10, Math.round(r * 5));
    for (let k = 0; k < steps; k++) {
      ang += (G.rnd(seed, k + 1) - 0.5) * 1.8;
      let nx = px + Math.cos(ang) * 2.2, ny = py + Math.sin(ang) * 2.2;
      if (Math.hypot(nx - cx, ny - cy) > r) { ang = Math.atan2(cy - py, cx - px); nx = px + Math.cos(ang) * 2; ny = py + Math.sin(ang) * 2; }
      px = nx; py = ny;
      pts.push([Math.round(px), Math.round(py)]);
    }
    G.polyline(pts, c == null ? C.CYAN : c);
  }

  // Linear single-stranded RNA with hairpins. Backbone from x0..x1 at y.
  //   o.pins  : x positions of hairpins
  //   o.dir   : 1 = stems hang down, -1 = up
  //   o.stem  : stem length (default 4)
  //   o.c     : backbone color, o.rung: base-pair color
  //   o.open  : fn(x) -> true to draw that hairpin unfolded (ribosome on it)
  //   o.big   : fn(x) -> true for a highlighted hairpin
  function rna(x0, x1, y, o) {
    o = o || {};
    const c = o.c == null ? C.CYAN : o.c, rung = o.rung == null ? C.ICE : o.rung;
    const dir = o.dir || 1, stem = o.stem || 4;
    x0 = Math.round(x0); x1 = Math.round(x1); y = Math.round(y);
    if (x1 < x0) return;
    G.glow(() => {
      G.hline(x0, x1, y, c);
      for (const px of o.pins || []) {
        const x = Math.round(px);
        if (x < x0 || x + 2 > x1 || (o.open && o.open(x))) continue;
        const hc = o.big && o.big(x) ? C.MAGENTA : c;
        G.vline(x, y + dir, y + dir * stem, hc);
        G.vline(x + 2, y + dir, y + dir * stem, hc);
        G.pset(x + 1, y + dir * (stem + 1), hc);
      }
    });
    for (const px of o.pins || []) {
      const x = Math.round(px);
      if (x < x0 || x + 2 > x1 || (o.open && o.open(x))) continue;
      for (let k = 1; k < stem; k += 2) G.pset(x + 1, y + dir * (k + 1), rung);
    }
  }

  // Ribosome clamped on a horizontal strand at (x, y).
  function ribosome(x, y) {
    x = Math.round(x); y = Math.round(y);
    G.glow(() => { G.circle(x, y - 4, 3, C.PINK); G.hline(x - 3, x + 3, y + 2, C.PINK); });
    G.disc(x, y - 4, 2, (px, py) => G.dith(px, py, 0.4, C.PURPLE, C.MAGENTA));
    G.rect(x - 2, y + 1, 5, 1, C.PURPLE);
    G.pset(x - 1, y - 5, C.WHITE);
  }

  // Replicase holoenzyme: phage β subunit + host EF-Tu, EF-Ts, S1 lobes.
  function replicase(x, y) {
    x = Math.round(x); y = Math.round(y);
    G.glow(() => {
      G.circle(x, y, 4, C.MAGENTA);
      G.circle(x - 6, y - 3, 2, C.SKY);
      G.circle(x - 5, y + 4, 2, C.CYAN_D);
      G.circle(x + 5, y - 5, 2, C.PINK);
    });
    G.disc(x, y, 3, (px, py) => G.dith(px, py, 0.35, C.PURPLE, C.MAGENTA));
    G.pset(x - 6, y - 3, C.AZURE); G.pset(x - 5, y + 4, C.BLUE2); G.pset(x + 5, y - 5, C.PURPLE);
    G.pset(x - 1, y - 2, C.WHITE);
  }

  // Coat protein dimer: two 2x2 lobes.
  function dimer(x, y, hot) {
    x = Math.round(x); y = Math.round(y);
    G.glow(() => { G.rect(x, y, 2, 2, hot ? C.CYAN_L : C.SKY); G.rect(x + 2, y, 2, 2, hot ? C.ICE : C.CYAN_L); });
  }

  // Lipid bilayer, 4 rows: heads / tails / tails / heads.
  //   gaps: [[xa, xb], ...] ranges left open (lesions)
  function bilayer(x0, x1, y, gaps) {
    const open = (x) => (gaps || []).some(([a, b]) => x >= a && x <= b);
    for (let x = Math.round(x0); x <= x1; x++) {
      if (open(x)) continue;
      const head = x % 2 === 0 ? C.CYAN_D : C.SKY;
      G.pset(x, y, head); G.pset(x, y + 3, head);
      G.pset(x, y + 1, x % 2 === 0 ? C.BLUE2 : C.BLUE);
      G.pset(x, y + 2, x % 2 === 0 ? C.BLUE : C.BLUE2);
    }
  }

  // Cell envelope at virus scale: outer membrane, periplasm with
  // peptidoglycan mesh, inner membrane, cytoplasm below. Returns key rows.
  function envelope(x0, x1, y, gaps, cytoBottom) {
    const om = y, pg = y + 8, im = y + 12, cy = y + 16;
    G.shade(x0, cy, x1 - x0 + 1, (cytoBottom || cy + 20) - cy, (px, py) => G.ramp(px, py, (py - cy) / 20, [C.NAVY2, C.NAVY]));
    G.rect(x0, om + 4, x1 - x0 + 1, 8, C.VOID);
    for (let x = Math.round(x0); x <= x1; x++) {
      if ((gaps || []).some(([a, b]) => x >= a && x <= b)) continue;
      if ((x >> 1) % 2 === 0) G.pset(x, pg, C.PURPLE);
      if (x % 6 === 0) { G.pset(x, pg - 1, C.INDIGO); G.pset(x, pg + 1, C.INDIGO); }
    }
    bilayer(x0, x1, om, gaps);
    bilayer(x0, x1, im, gaps);
    return { om, pg, im, cy };
  }

  // Pilus at virus scale: vertical tube of helical subunits (scrolls).
  function pilusTube(x, yTop, yBot, w, scroll) {
    x = Math.round(x); yTop = Math.round(yTop);
    if (yBot <= yTop) return;
    G.glow(() => { G.vline(x, yTop, yBot, C.CYAN_D); G.vline(x + w - 1, yTop, yBot, C.CYAN_D); G.hline(x, x + w - 1, yTop, C.CYAN_D); });
    G.shade(x + 1, yTop + 1, w - 2, yBot - yTop, (px, py) =>
      (((py - Math.floor(scroll)) + (px - x)) >> 1) % 2 === 0 ? C.SKY : C.AZURE);
  }

  // L protein: one short membrane-spanning helix (not an enzyme).
  function lysisL(x, y) {
    x = Math.round(x); y = Math.round(y);
    G.glow(() => { for (let k = 0; k < 6; k++) G.pset(x + (k % 2), y + k, C.MAGENTA); });
  }

  global.S = { ecoli, plasmid, pilusPath, pilus, capsid, ms2Dot, rnaKnot, rna, ribosome, replicase, dimer, bilayer, envelope, pilusTube, lysisL };
})(window);
