// Scene 1 — Recognition: MS2 ignores the F- cell and binds the side of the
// F pilus via its maturation protein.
(function (global) {
  'use strict';
  const { C, seg, ease, lerp } = G;

  const CY = 112, LEN = 96, R = 16;
  const FP_X = 80, FM_X = 245;
  const PIL_A = [110, 96], PIL_B = [178, 34];

  // Particles that end up bound: fraction along pilus, bind time, start.
  const BINDERS = [
    { f: 0.45, tb: 2.2, from: [300, 64] },
    { f: 0.62, tb: 3.0, from: [206, 142] },
    { f: 0.78, tb: 3.8, from: [318, 40] },
    { f: 0.92, tb: 4.6, from: [236, 20] },
  ];
  // Particles that drift past (keyframes [t, x, y]).
  const PASSERS = [
    [[0, 330, 92], [2.8, 298, 104], [7, 334, 58]], // bumps the F- pole, leaves
    [[0, 322, 138], [4, 230, 136], [8, 150, 142]], // slides under F-
    [[0, 170, 18], [3.5, 176, 70], [8, 140, 146]], // falls between the cells
  ];
  function keyframe(kf, t) {
    for (let i = 1; i < kf.length; i++) {
      if (t <= kf[i][0]) {
        const u = ease.inOut(seg(t, kf[i - 1][0], kf[i][0]));
        return [lerp(kf[i - 1][1], kf[i][1], u), lerp(kf[i - 1][2], kf[i][2], u)];
      }
    }
    const l = kf[kf.length - 1];
    return [l[1], l[2]];
  }
  // Arm pointing from particle toward (dx, dy): 0=right,1=down,2=left,3=up.
  function armToward(dx, dy) {
    return Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 0 : 2) : (dy > 0 ? 1 : 3);
  }

  const scene = {
    title: 'RECOGNITION',
    mag: '×50K',
    dur: 8,
    caption: 'MS2 only infects F+ cells: the pilus is its receptor.',
    captionAt: 0.3,
    log: [
      { t: 0.3, s: 'MS2 PARTICLES DRIFTING' },
      { t: 2.2, s: 'BINDS SIDE OF F PILUS' },
      { t: 2.9, s: 'F- CELL: NO RECEPTOR' },
      { t: 4.9, s: 'VIA MATURATION PROTEIN' },
    ],
    draw(t) {
      S.ecoli(FP_X, CY, LEN, R, { seed: 3 });
      S.plasmid(56, 116, 4, { tra: [-1.9, -0.6] });
      S.ecoli(FM_X, CY, LEN, R, { seed: 9, flash: t > 2.8 && t < 3.0 ? 0.4 : 0 });

      const pts = S.pilusPath(PIL_A[0], PIL_A[1], PIL_B[0], PIL_B[1], 1.5, t * 0.8);
      S.pilus(pts);
      const ux = (PIL_B[0] - PIL_A[0]), uy = (PIL_B[1] - PIL_A[1]);
      const ul = Math.hypot(ux, uy), nx = -uy / ul, ny = ux / ul; // side normal

      // Drifting non-binders.
      PASSERS.forEach((kf, i) => {
        const [x, y] = keyframe(kf, t);
        S.ms2Dot(x + Math.sin(t * 3 + i) * 1.5, y + Math.cos(t * 2.3 + i * 2), null);
      });
      if (t > 2.8 && t < 4.2) {
        const blink = Math.floor(t * 6) % 2 === 0;
        if (blink) G.glow(() => { G.line(300, 97, 304, 101, C.MAGENTA); G.line(304, 97, 300, 101, C.MAGENTA); });
      }

      // Binders: wander in, then lock onto the side of the pilus.
      BINDERS.forEach((b, i) => {
        const p = pts[Math.round(b.f * (pts.length - 1))];
        const ax = p[0] + nx * 3, ay = p[1] + ny * 3;
        const u = ease.out(seg(t, 0.2, b.tb));
        const wob = 1 - u;
        const x = lerp(b.from[0], ax, u) + Math.sin(t * 3 + i) * 3 * wob;
        const y = lerp(b.from[1], ay, u) + Math.cos(t * 2.3 + i) * 3 * wob;
        S.ms2Dot(x, y, t >= b.tb ? armToward(p[0] - ax, p[1] - ay) : null);
        if (t >= b.tb && t < b.tb + 0.3) G.glow(() => G.circle(Math.round(ax), Math.round(ay), 3, C.WHITE));
      });

      // Labels.
      G.textCBg('F+ CELL', FP_X, 84, C.CYAN, C.VOID);
      G.textCBg('F- CELL', FM_X, 84, C.SKY, C.VOID);
      if (t > 2.9) G.textCBg('NO PILUS = NO ENTRY', FM_X, 91, C.PINK, C.VOID);
      HUD.label('F PILUS', 132, 26, 170, 40, C.ICE, C.SKY);

      HUD.log(10, 21, 112, 43, this.log, t, 'SENSOR LOG');

      // Virus-scale magnifier on the second bound particle.
      const b1 = pts[Math.round(BINDERS[1].f * (pts.length - 1))];
      HUD.inset({
        t,
        open: seg(t, 5.0, 5.6),
        src: [Math.round(b1[0]) - 4, Math.round(b1[1]) - 4, 11, 11],
        dst: [188, 21, 122, 58],
        title: 'VIRUS SCALE',
        zoom: '×40',
        draw(w, h) {
          S.pilusTube(34, -2, h + 2, 5, t * 2);
          S.capsid(47, 30, 8, { mat: Math.PI, rot: 0.3 });
          S.capsid(24, 9, 8, { mat: 0, rot: 1.1 });
          G.text('MS2 ~27 NM', 64, 3, C.SKY);
          G.text('NO TAIL', 64, 10, C.SKY);
          G.line(40, 31, 62, 26, C.PURPLE);
          G.text('MATURATION', 64, 22, C.PINK);
          G.text('PROTEIN GRIPS', 64, 29, C.PINK);
          G.text('PILUS SIDE', 64, 36, C.PINK);
          G.textBg('PILUS', 28, 43, C.ICE, C.VOID);
        },
      });
    },
  };

  (global.SCENES = global.SCENES || [])[1] = scene;
})(window);
