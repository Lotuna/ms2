// lewontin/sprites.js — drawables and the toy model for "Lewontin's
// fallacy": two groups, independent biallelic loci, 15% of each locus's
// variance between groups (F = 0.15).
(function (global) {
  'use strict';
  const { C } = G;

  // Toy model. At every locus one allele is more common in group A:
  // frequency 0.5 + d in A, 0.5 - d in B, with 4d^2 = F (share of variance
  // between groups when the pooled frequency is 0.5).
  const F = 0.15;
  const D = Math.sqrt(F / 4);
  const PA = 0.5 + D, PB = 0.5 - D; // ~0.694, ~0.306

  // Binomial pmf over k = 0..n, computed in log space.
  function pmf(n, p) {
    const out = new Array(n + 1);
    let lf = [0];
    for (let i = 1; i <= n; i++) lf[i] = lf[i - 1] + Math.log(i);
    for (let k = 0; k <= n; k++) out[k] = Math.exp(lf[n] - lf[k] - lf[n - k] + k * Math.log(p) + (n - k) * Math.log(1 - p));
    return out;
  }
  // Chance a group-A person is assigned to B by the best rule (score below
  // the midpoint; ties split evenly). Symmetric for B.
  function misclass(L) {
    const a = pmf(2 * L, PA);
    let e = 0;
    for (let k = 0; k < L; k++) e += a[k];
    return e + a[L] / 2;
  }
  function pct(x) {
    if (x < 0.00001) return '<0.001%';
    if (x < 0.001) return (x * 100).toFixed(3) + '%';
    if (x < 0.1) return (x * 100).toFixed(1) + '%';
    return Math.round(x * 100) + '%';
  }
  // Deterministic genotype: allele count (0..2) of the A-leaning allele.
  function geno(person, locus, p) {
    return (G.rnd(person * 7919 + locus, 1) < p ? 1 : 0) + (G.rnd(person * 7919 + locus, 2) < p ? 1 : 0);
  }

  // 5x8 person icon.
  function person(x, y, c, hi) {
    x = Math.round(x); y = Math.round(y);
    const draw = () => {
      G.hline(x + 1, x + 3, y, c); G.rect(x + 1, y + 1, 3, 2, c);
      G.hline(x, x + 4, y + 4, c); G.rect(x + 1, y + 5, 3, 3, c);
    };
    if (hi) G.glow(draw); else draw();
  }
  // Two allele squares under a person: lit = A-leaning allele.
  function genotype(x, y, g) {
    x = Math.round(x); y = Math.round(y);
    [0, 1].forEach((i) => {
      const on = i < g;
      G.rect(x + i * 3, y, 2, 2, on ? C.ICE : C.NAVY2);
      if (!on) G.rectO(x + i * 3, y, 2, 2, C.BLUE2);
    });
  }

  // Horizontal stacked share bar: parts = [[fraction, color, label], ...].
  function shareBar(x, y, w, parts, k) {
    let cx = x;
    parts.forEach(([f, c]) => {
      const pw = Math.round(w * f * (k == null ? 1 : k));
      if (pw > 0) G.rect(cx, y, pw, 6, c);
      cx += Math.round(w * f);
    });
    G.rectO(x - 1, y - 1, w + 2, 8, C.BLUE2);
  }

  global.W = { F, D, PA, PB, pmf, misclass, pct, geno, person, genotype, shareBar };
})(window);
