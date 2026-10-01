// Render the full loop frame-by-frame to an MP4 (1280x720, 30 fps,
// nearest-neighbour 4x). Needs Playwright and an ffmpeg with libx264.
//   node tools/export_video.js out.mp4 [ffmpeg path] [page, default index.html]
const path = require('path');
const { spawn, execSync } = require('child_process');
let chromium;
try { ({ chromium } = require('playwright')); }
catch { ({ chromium } = require(path.join(execSync('npm root -g').toString().trim(), 'playwright'))); }

const OUT = process.argv[2] || 'ms2-lifecycle.mp4';
const FFMPEG = process.argv[3] || 'ffmpeg';
const PAGE = process.argv[4] || 'index.html';
const FPS = 30, W = 320, H = 180;

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('file://' + path.resolve(__dirname, '..', PAGE) + '?export=1');
  const { durations, palette } = await page.evaluate(() => ({ durations: EXPLAINER.durations, palette: PALETTE }));
  const lut = palette.map((h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)));

  const ff = spawn(FFMPEG, ['-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', `${W}x${H}`,
    '-r', String(FPS), '-i', '-', '-vf', 'scale=1280:720:flags=neighbor', '-c:v', 'libx264',
    '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', OUT], { stdio: ['pipe', 'inherit', 'inherit'] });

  let gt = 0, frames = 0;
  for (let i = 0; i < durations.length; i++) {
    const n = Math.round(durations[i] * FPS);
    for (let f = 0; f < n; f++, frames++) {
      const b64 = await page.evaluate(([a, b, c]) => EXPLAINER.renderAt(a, b, c), [i, f / FPS, gt + f / FPS]);
      const idx = Buffer.from(b64, 'base64');
      const rgb = Buffer.alloc(W * H * 3);
      for (let p = 0; p < idx.length; p++) { const c = lut[idx[p]]; rgb[p * 3] = c[0]; rgb[p * 3 + 1] = c[1]; rgb[p * 3 + 2] = c[2]; }
      if (!ff.stdin.write(rgb)) await new Promise((r) => ff.stdin.once('drain', r));
    }
    gt += n / FPS;
    process.stdout.write(`scene ${i} done (${frames} frames)\n`);
  }
  ff.stdin.end();
  await new Promise((r) => ff.on('close', r));
  await browser.close();
  console.log('wrote', OUT);
})();
