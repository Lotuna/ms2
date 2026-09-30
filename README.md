# MS2 phage life cycle — pixel-art explainer

Open `index.html` in a browser (no build step, works from `file://`).

- Internal 320x180 indexed framebuffer, shown at 4x nearest-neighbour.
- Colors: only the 16 in `palette.js`, extracted from the reference lab scene
  by `python3 tools/extract_palette.py <reference image> 16` (needs Pillow).

Controls: `Space` / click = pause, `←` `→` = previous/next scene, `R` = restart scene.
Review a still frame with `index.html?scene=0&t=4.5`.

| File | Contents |
| --- | --- |
| `palette.js` | generated palette |
| `draw.js` | framebuffer, primitives, Bayer dithering, neon glow, 3x5 font, typewriter |
| `sprites.js` | E. coli, plasmid, pilus |
| `hud.js` | monitor frame, panels, event log, inset magnifier, ambient loops |
| `scenes.js` | scene definitions |
