# VISTRA® — Enter the experience

A virtual-mall / 360° shopping platform built with **Next.js 16 (App Router) · React 19 · TypeScript · Tailwind 4 · Photo Sphere Viewer · React Three Fiber · GSAP**.
Bilingual (English LTR / Arabic RTL), light + dark themes, fully responsive.

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
npm run assets     # OLD procedural demo imagery — overwrites the real photos, do not run (see below)
```

## Routes
`/` home · `/experience` 360° explorer · `/stores` · `/stores/[slug]` · `/products` · `/products/[slug]` · `/offers` · `/about` · `/contact` · `/privacy` · `/terms`

## Architecture
```
src/
  app/                    routes (the (site) group adds header/footer; /experience is full-screen)
  components/
    experience/           pano-viewer (PSV), floor-map (SVG), panels, hotspot-editor, experience-app (state)
    home/                 intro (R3F), hero, sections, pano-strip
    pages/                client views for directory, store, product, offers, static pages
    ui/ …                 icons, logo, dialog (native <dialog>), magnetic
    providers.tsx         locale, theme, favourites, search state
  data/
    types.ts              Mall, Floor, Scene, Store, Product, Offer, Hotspot types
    mall.ts               ALL demo content + the scene graph (single source of truth)
    service.ts            the only module UI code reads data from (swap for an API later)
    generated/anchors.json  yaw/pitch of shop-fronts & doors (produced by scripts/)
  i18n/dict.ts            UI strings  [en, ar]
scripts/                  real-anchors.mjs (hotspot placement), real-views.mjs (crops from the panoramas), panorama-sources.json; gen-assets.mjs = legacy procedural generator (product illustrations)
```
* **One source of truth.** `SCENES` in `src/data/mall.ts` declares scene links once. Navigation hotspots, the floor map's corridors, the BFS route finder and arrival camera direction are all derived from it, so the viewer, map, thumbnails and store panels always show the same state.
* **Viewer.** `@photo-sphere-viewer/core` + `markers-plugin` (+ `gyroscope-plugin` for optional motion control). The *Virtual Tour* plugin was evaluated but not used: it would hold a second copy of the graph, and the app needs its own state to drive the map, panels and routing. The viewer is loaded with `dynamic(..., { ssr: false })`, only on `/experience`; it is created once and `setPanorama()` is used for scene changes; the current scene's neighbours are pre-fetched.
* **Safety.** Hotspots are built with DOM APIs / `textContent` — no untrusted HTML is injected. Forms validate locally and are clearly marked as demo (nothing is sent).

## Replacing the demo panoramas with real client photography
1. Put equirectangular (2:1) JPGs in **`public/panoramas/`** named after the scene id: `entrance.jpg`, `atrium.jpg`, `fashion.jpg`, `electronics.jpg`, `luxury.jpg`, `cafe.jpg`, `beauty.jpg`, `home.jpg`, `sports.jpg`, `dining.jpg`, `lounge.jpg` (+ `<id>-thumb.jpg` 480×300). 4096×2048 is a good size for desktop; keep files < 3 MB. Don't use ordinary photos — they must be true 360° captures.
2. Or point a scene at any other file by editing `panorama` / `thumbnail` in `scene()` inside `src/data/mall.ts`.
3. Hotspot positions come from `src/data/generated/anchors.json`, produced by `scripts/real-anchors.mjs` (hand-placed against the current real panoramas; edit the SPEC table and re-run, or use the `?debug=1` editor). `npm run assets` would overwrite panoramas and anchors with the old procedural ones — don't run it.

## Adjusting hotspot coordinates (developer mode)
Open **`/experience?debug=1`**. A *Hotspot editor* appears (hidden for normal visitors): add a hotspot at the view centre, choose its type, titles (EN/AR), link it to a store/product/scene, set yaw/pitch numerically or tick **place by click** and click the panorama. **Copy JSON** exports the draft. Paste final values into `getHotspots()` overrides / `anchors.json`. (Nothing is persisted — there is no backend.)
Yaw/pitch are in **degrees**; yaw 0 is the horizontal centre of the image, positive to the right.

## Assets & licensing
* **Panoramas (22 files), mall, store and campaign images (25)** are real photography: CC0 equirectangular HDRIs from [Poly Haven](https://polyhaven.com) (asset, author and link per file in `scripts/panorama-sources.json` and `public/asset-manifest.json`). Store/mall/campaign images are rectilinear crops rendered from those panoramas by `scripts/real-views.mjs` (needs the full-resolution sources in `.panorama-src/`, git-ignored/not deployed).
* They are generic real interiors standing in for the mall (airport hall, cruise-ship atrium, covered market, phone shop, gym, …) — the fictional stores are overlays. Some show incidental real-world signage from the original location (e.g. shop fronts in the fashion scene); replace with client photography before a public launch.
* **Product images (33)** are real Pexels photographs ([Pexels licence](https://www.pexels.com/license/): free for commercial use, no attribution required), picked by hand for having no visible brand logos; per-file Pexels links in `scripts/product-sources.json`, re-fetch with `node scripts/real-products.mjs`. They are generic stand-ins for the fictional products (e.g. the "Orbit Phone X" photo is just a phone). Replace with real catalogue shots when available.

## Known limitations
* Product and panorama photos are real but generic stand-ins, not photos of the actual products or an actual mall.
* No backend: favourites live in `localStorage`; contact forms, “Contact store” and purchases are demo-only (no email/CRM/payments).
* Ambient sound is synthesised with WebAudio (no audio files) and was not auditioned in a headless browser. Floor-plan SVGs are rendered from data at runtime (no static files in `public/floor-plans/`).
* Admin: data structures and `service.ts` are admin-ready, but no admin UI exists; the hotspot editor exports JSON only.
* Gyroscope control needs HTTPS and a device that exposes motion sensors; it is untested on real hardware.
