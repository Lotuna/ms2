# Pixel-art biology explainers

Two animated explainers sharing one engine. Open either page in a browser
(no build step, works from `file://`):

- `index.html`: MS2 bacteriophage life cycle (8 scenes, ~72 s)
- `luria.html`: the Luria–Delbrück fluctuation test, 1943 (8 scenes, ~72 s)

- Internal 320x180 indexed framebuffer, shown at 4x nearest-neighbour.
- Colors: only the 16 in `palette.js`, extracted from the reference lab scene
  by `python3 tools/extract_palette.py <reference image> 16` (needs Pillow).

Controls: `Space` / click = pause, `←` `→` = previous/next scene, `R` = restart scene.
Review a still frame with `index.html?scene=0&t=4.5`.

Export an MP4 (1280x720, 30 fps): `node tools/export_video.js out.mp4 [path/to/ffmpeg] [page.html]`
(needs Playwright and an ffmpeg with libx264; `pip install imageio-ffmpeg` provides one).

| File | Contents |
| --- | --- |
| `palette.js` | generated palette |
| `draw.js` | framebuffer, primitives, Bayer dithering, neon glow, 3x5 font, typewriter |
| `sprites.js` | E. coli, plasmid, pilus, capsid, RNA, ribosome, replicase, coat dimer, membranes, L protein |
| `hud.js` | monitor frame, panels, event log, inset magnifier, zoom transition, gene map, ambient loops |
| `player.js` | shared playback loop, controls, export hook |
| `luria/` | Luria–Delbrück sprites, 1943 data, and scenes `l0.js` … `l7.js` |
| `scenes/s0.js` … `s7.js` | one file per scene (F+/F-, recognition, entry, translation, replication, regulation, assembly, lysis) |
