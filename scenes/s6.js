// Scene 6 — Assembly: 90 coat dimers (180 copies) + 1 maturation protein
// close around each + strand.
(function (global) {
  'use strict';
  const { C, seg, ease, lerp } = G;

  const CX = 160, CY = 84, R = 24;
  const MAT_A = -0.7;
  const SIDE = [[50, 104, 10, 1.8, 7.0, 2.1], [272, 58, 10, 2.4, 7.6, -1.2], [262, 110, 9, 3.0, 8.0, 0.5]];

  function matBlock(cx, cy, r, a, sz) {
    const mx = Math.round(cx + Math.cos(a) * (r - sz / 2 - 0.5) - sz / 2);
    const my = Math.round(cy + Math.sin(a) * (r - sz / 2 - 0.5) - sz / 2);
    G.glow(() => G.rect(mx, my, sz, sz, C.MAGENTA));
    return [mx, my];
  }

  const scene = {
    title: 'ASSEMBLY',
    mag: '×2M',
    dur: 9,
    caption: '90 coat dimers (180 copies) assemble around each + strand, plus one maturation protein, forming new capsids.',
    captionAt: 0.4,
    draw(t) {
      const rev = ease.inOut(seg(t, 1.2, 6.5));

      // Neighbouring assemblies at other stages.
      SIDE.forEach(([x, y, r, a, b, m], i) => {
        const v = seg(t, a, b);
        if (v < 1) S.rnaKnot(x, y, r - 2, 80 + i);
        S.capsid(x, y, r, { reveal: v, rot: i, mat: m });
        if (v < 1) matBlock(x, y, r, m, 2);
      });

      // Central assembly: RNA first, maturation protein docks, then shell.
      if (rev < 1) {
        G.glow(() => S.rnaKnot(CX, CY, R - 4, 7));
      }
      S.capsid(CX, CY, R, { reveal: rev, rot: 0.2 });
      const md = ease.out(seg(t, 0.3, 1.1));
      const mpos = [lerp(CX + 80, CX, md), lerp(CY - 50, CY, md)];
      let mx, my;
      if (md < 1) {
        mx = Math.round(mpos[0] + Math.cos(MAT_A) * (R - 2)); my = Math.round(mpos[1] + Math.sin(MAT_A) * (R - 2));
        G.glow(() => G.rect(mx, my, 3, 3, C.MAGENTA));
      } else [mx, my] = matBlock(CX, CY, R, MAT_A, 3);

      // Dimers streaming in while the shell is open.
      if (t > 1.0 && t < 6.4) {
        for (let i = 0; i < 26; i++) {
          const ph = t * 0.9 + i / 26;
          const cyc = Math.floor(ph), u = ph - cyc;
          const ang = G.rnd(i, cyc) * Math.PI * 2;
          const rr = lerp(96, R + 1, ease.in(u));
          const x = CX + Math.cos(ang) * rr, y = CY + Math.sin(ang) * rr * 0.8;
          if (x < 8 || x > 310 || y < 20 || y > 140) continue;
          S.dimer(x - 2, y - 1, u > 0.8);
        }
      }
      if (t >= 6.5 && t < 6.8) G.glow(() => G.circle(CX, CY, R + 3, C.WHITE));

      // Tally.
      const n = Math.round(90 * rev);
      HUD.panel(8, 21, 108, 38, 'CAPSID BUILD', C.CYAN);
      G.text('COAT DIMERS ' + String(n).padStart(2, '0') + '/90', 12, 31, C.CYAN_L);
      G.text('= ' + String(n * 2).padStart(3, '0') + '/180 COPIES', 12, 38, C.SKY);
      G.text('MATURATION  ' + (md >= 1 ? '1' : '0') + '/1', 12, 45, C.PINK);
      G.rect(12, 52, 100, 3, C.NAVY);
      G.rect(12, 52, Math.round(100 * rev), 3, C.CYAN);

      // Labels.
      if (t < 5) HUD.label('(+) STRAND', 200, 118, CX + 8, CY + 12, C.CYAN_L, C.SKY);
      if (md >= 1) HUD.label('MATURATION PROTEIN', 196, 38, mx + 3, my, C.PINK, C.PURPLE);
      if (t > 1.2 && t < 6.4) HUD.label('COAT DIMERS', 36, 128, CX - 30, CY + 26, C.SKY, C.BLUE2);
      if (t >= 6.6) G.textCBg('NEW MS2 VIRION', CX, CY + R + 8, C.ICE, C.VOID);
    },
  };

  (global.SCENES = global.SCENES || [])[6] = scene;
})(window);
