// Scene 3 — Translation: the + strand is mRNA; ribosomes translate its
// four genes, coat protein most of all.
(function (global) {
  'use strict';
  const { C, seg, ease, lerp } = G;
  const { GENES } = HUD;

  const MAP_X = 22, MAP_W = 276; // gene map and strand share one nt->x scale
  const STRAND_Y = 76;
  const x = (nt) => HUD.ntX(nt, MAP_X, MAP_W);
  const PINS = [40, 700, 1000, 1290, 1500, 1745, 2300, 2800, 3200, 3470].map(x);

  // Ribosome runs: gene, start time, duration. Coat is loaded densely.
  const GENE_C = { MAT: C.MAGENTA, COAT: C.CYAN_L, REP: C.PINK, LYS: C.ICE };
  const RUNS = [{ g: 'MAT', t0: 0.9, d: 4.2 }, { g: 'REP', t0: 2.2, d: 4.8 }, { g: 'LYS', t0: 4.6, d: 1.2 }];
  for (let k = 0; k < 11; k++) RUNS.push({ g: 'COAT', t0: 0.8 + k * 0.62, d: 1.5 });

  const scene = {
    title: 'TRANSLATION',
    mag: '×2M',
    dur: 9,
    caption: 'The RNA is itself mRNA (+ strand). Ribosomes latch on and translate its four genes; coat protein is made in the largest amounts.',
    captionAt: 0.6,
    draw(t) {
      // Gene map panel.
      HUD.panel(8, 21, 304, 30, 'MS2 GENOME  3569 NT  (+) SSRNA', C.CYAN);
      HUD.geneMap(MAP_X, 31, MAP_W, {});

      // Where is each active ribosome?
      const ribos = [];
      const made = { MAT: 0, COAT: 0, REP: 0, LYS: 0 };
      const released = [];
      for (const r of RUNS) {
        const u = (t - r.t0) / r.d;
        const a = x(GENES[r.g][0]), b = x(GENES[r.g][1]);
        if (u >= 1) { made[r.g]++; released.push({ r, age: t - r.t0 - r.d, x: b }); continue; }
        if (u < 0) continue;
        ribos.push({ g: r.g, x: lerp(a, b, u), u, len: (b - a) * u, lys: r.g === 'LYS' });
      }

      // + strand (hairpins melt where a ribosome sits).
      S.rna(MAP_X, MAP_X + MAP_W, STRAND_Y, {
        pins: PINS, dir: 1, stem: 5,
        open: (px) => ribos.some((r) => Math.abs(r.x - px) < 6),
      });
      G.text("5'", MAP_X - 9, STRAND_Y - 2, C.SKY);
      G.text("3'", MAP_X + MAP_W + 3, STRAND_Y - 2, C.SKY);

      // Ribosomes + nascent chains.
      for (const r of ribos) {
        const lx = Math.round(r.x);
        const n = Math.min(10, Math.round(r.u * 10) + 1);
        const pts = [];
        for (let k = 0; k < n; k++) pts.push([lx + Math.round(Math.sin(k * 1.3 + r.u * 6) * 1.5), STRAND_Y - 9 - k]);
        G.glow(() => G.polyline(pts, GENE_C[r.g]));
        S.ribosome(lx, STRAND_Y);
      }

      // Released proteins drift up and fade.
      for (const p of released) {
        if (p.age > 1.4) continue;
        const k = p.age / 1.4;
        G.save(); G.alpha(1 - k);
        const px = p.x + Math.sin(p.age * 5 + p.x) * 2, py = STRAND_Y - 12 - k * 12;
        if (p.r.g === 'COAT') S.dimer(px - 2, py, false);
        else G.glow(() => G.rect(Math.round(px) - 1, Math.round(py), 3, 2, GENE_C[p.r.g]));
        G.restore();
      }

      // Protein tally.
      HUD.panel(8, 94, 150, 44, 'PROTEIN MADE (RELATIVE)', C.CYAN);
      const rows = [['COAT', 'COAT'], ['MAT', 'MATURATION'], ['REP', 'REPLICASE'], ['LYS', 'LYSIS (L)']];
      rows.forEach(([g, name], i) => {
        const y = 104 + i * 8;
        G.text(name, 12, y, C.ICE);
        const w = Math.min(96, made[g] * 9);
        G.rect(54, y, 98, 5, C.NAVY);
        if (w > 0) G.rect(54, y, w, 5, GENE_C[g]);
      });

      // Labels.
      if (ribos.length) {
        const tgt = ribos.reduce((m, r) => (Math.abs(r.x - 176) < Math.abs(m.x - 176) ? r : m));
        HUD.label('RIBOSOME', 176, 96, Math.round(tgt.x) + 2, STRAND_Y + 3, C.PINK, C.PURPLE);
      }
      if (t > 1.2) G.textBg('(+) STRAND = MRNA', 176, 106, C.CYAN_L, C.VOID);
      if (t > 4.6 && t < 6.2) G.textBg('L GENE OVERLAPS COAT/REP', 176, 116, C.ICE, C.VOID);

      HUD.zoomReveal(t, 0.6, [120, 118, 11, 11], 'INTO CYTOPLASM');
    },
  };

  (global.SCENES = global.SCENES || [])[3] = scene;
})(window);
