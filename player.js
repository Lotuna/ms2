// player.js — shared playback loop: scene timing, controls, URL params and
// the frame-exact export hook. Each page loads its SCENES, then calls
// Player.start({ header }).
(function (global) {
  'use strict';
  function start(opts) {
    const canvas = document.getElementById('screen');
    const ctx = canvas.getContext('2d');
    document.body.style.background = PALETTE[G.C.VOID];

    // 4x nearest-neighbour; drop to a smaller integer only if the window is too small.
    let scale = 4;
    function resize() {
      const fit = Math.floor(Math.min(innerWidth / G.W, innerHeight / G.H));
      scale = Math.max(1, Math.min(4, fit));
      canvas.width = G.W * scale;
      canvas.height = G.H * scale;
      ctx.imageSmoothingEnabled = false;
    }
    addEventListener('resize', resize);
    resize();

    // URL params for review / screenshots: ?scene=0&t=4.2 freezes a frame.
    const params = new URLSearchParams(location.search);
    let index = Math.min(SCENES.length - 1, Math.max(0, parseInt(params.get('scene') || '0', 10) || 0));
    const frozenT = params.has('t') ? parseFloat(params.get('t')) : null;

    let clock = 0, sceneT = 0, paused = false, last = null;

    function render(gt, st) {
      const sc = SCENES[index];
      G.resetState();
      HUD.frameBack(gt);
      G.save();
      G.clip(HUD.VIEW.x, HUD.VIEW.y, HUD.VIEW.w, HUD.VIEW.h);
      sc.draw(st, gt);
      if (sc.notToScale !== false) HUD.tag('NOT TO SCALE', 257, 132);
      // Scene-change tear: a few bright scanlines + static for 0.25 s.
      if (st < 0.25) {
        for (let k = 0; k < 6; k++) {
          const y = HUD.VIEW.y + (G.hash(k, Math.floor(st * 40)) % HUD.VIEW.h);
          G.remap(HUD.VIEW.x, y, HUD.VIEW.w, 1 + (k & 1), G.LIGHT, 0.6);
        }
      }
      G.restore();
      HUD.frameFront(gt, {
        index, count: SCENES.length, title: sc.title, mag: sc.mag,
        progress: st / sc.dur,
        caption: sc.caption, captionT: st - (sc.captionAt || 0), header: opts.header,
      });
      G.present(ctx, scale);
    }

    function tick(now) {
      const dt = last == null ? 0 : Math.min(0.1, (now - last) / 1000);
      last = now;
      if (!paused) {
        clock += dt;
        sceneT += dt;
        if (sceneT >= SCENES[index].dur) { sceneT = 0; index = (index + 1) % SCENES.length; }
      }
      render(clock, sceneT);
      requestAnimationFrame(tick);
    }

    function go(d) { index = (index + d + SCENES.length) % SCENES.length; sceneT = 0; }
    addEventListener('keydown', (e) => {
      if (e.key === ' ') { paused = !paused; e.preventDefault(); }
      else if (e.key === 'ArrowRight') go(1);
      else if (e.key === 'ArrowLeft') go(-1);
      else if (e.key === 'r' || e.key === 'R') sceneT = 0;
    });
    canvas.addEventListener('click', () => { paused = !paused; });

    // Frame-exact hook for tools/export_video.js: draw scene i at scene time
    // st (global time gt drives the ambient loops) and return the indexed frame.
    window.EXPLAINER = {
      renderAt(i, st, gt) {
        index = i; render(gt, st);
        let s = '';
        for (let k = 0; k < G.fb.length; k += 8192) s += String.fromCharCode.apply(null, G.fb.subarray(k, k + 8192));
        return btoa(s); // base64 of palette indices
      },
      durations: SCENES.map((s) => s.dur),
    };

    if (params.has('export')) { /* driven externally */ }
    else if (frozenT != null) { render(frozenT, frozenT); }
    else requestAnimationFrame(tick);

  }
  global.Player = { start };
})(window);
