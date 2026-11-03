# Panoramas

Equirectangular (2:1) 360° photos. File name = scene id (see `src/data/mall.ts`):

entrance, atrium, fashion, electronics, luxury, cafe, beauty, home, sports, dining, lounge

* `<id>.jpg`        — panorama, 4096×2048
* `<id>-thumb.jpg`  — thumbnail, 480×300

The files here are **real CC0 photographs from Poly Haven** (see `scripts/panorama-sources.json` and
`public/asset-manifest.json` for the exact asset, author and link of each). They are generic real interiors
(airport hall, cruise-ship atrium, covered market, phone shop, …) standing in for the mall's spaces; the fictional
stores are overlaid as hotspots. Some show incidental real-world signage from the original location.

To use your own photography: drop 2:1 JPGs here with the same names, then re-place the hotspots
(`/experience?debug=1`, or edit `scripts/real-anchors.mjs` and run `node scripts/real-anchors.mjs`).
Do not run `npm run assets` afterwards — it regenerates the old procedural demos over these files.
