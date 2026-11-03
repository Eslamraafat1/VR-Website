// Hotspot anchors for the REAL (CC0 Poly Haven) panoramas, placed by hand against yaw/pitch-annotated previews.
// Output replaces src/data/generated/anchors.json (same keys the data layer already reads).
//   yaw: 0 = image centre, +right.  pitch: +up.
// Run: node scripts/real-anchors.mjs   (the procedural generator `npm run assets` writes the old file; don't run both)
import fs from "node:fs";

const spread = (y, d = 8) => [y - d, y, y + d];

// nav/info points: key -> [yaw, pitch]. bays: key -> { y, sign, prod: [pitch], d }
const SPEC = {
  entrance: { pts: { front: [100, -8], back: [0, -8] }, bays: {} },
  atrium: {
    pts: { front: [-52, -6], back: [165, -8], lift: [-125, -38], "fashion-gate": [25, -6], "electronics-gate": [130, -8], ped0: [-68, 30] },
    bays: {},
  },
  fashion: { pts: { front: [0, -6], back: [-178, -4], ped0: [0, 22] }, bays: { "atelier-noir": { y: -122, sign: 18, prod: 2 }, "haute-line": { y: -50, sign: 20, prod: 2 } } },
  electronics: { pts: { front: [0, -8], back: [0, -10], ped0: [-125, 6] }, bays: { "orbit-tech": { y: 90, sign: 12, prod: -12, d: 20 }, "aura-audio": { y: -56, sign: 10, prod: -4, d: 10 } } },
  luxury: { pts: { front: [0, -8], back: [170, -8], "cafe-gate": [-76, -10], ped0: [116, 32] }, bays: { velora: { y: -14, sign: 20, prod: -10, d: 12 }, "velora-lounge": { y: 86, sign: 22, prod: -2, d: 10 } } },
  cafe: { pts: { front: [0, -8], back: [70, -6], ped0: [36, 30], ped1: [-56, 6] }, bays: { "cafe-lumen": { y: 34, sign: 14, prod: 0, d: 14 }, "cafe-seat": { y: -140, sign: 14, prod: -22, d: 12 } } },
  beauty: { pts: { front: [-34, -4], back: [-34, -4], "lift-1": [160, -4], ped0: [-150, -20] }, bays: { "maison-eclat": { y: -92, sign: 18, prod: 0, d: 8 } } },
  home: { pts: { front: [125, -12], back: [-160, -8], ped0: [-113, 8] }, bays: { "form-living": { y: -20, sign: 16, prod: -6, d: 12 } } },
  sports: { pts: { front: [-56, -18], back: [150, -22], ped0: [-98, 4] }, bays: { kinetic: { y: 48, sign: 4, prod: -18, d: 8 } } },
  dining: { pts: { front: [40, -10], back: [-130, -12], ped0: [-168, 5], ped1: [110, 24] }, bays: { "nomad-table": { y: -20, sign: 16, prod: -12, d: 16 } } },
  lounge: { pts: { front: [0, -8], back: [-104, -4], ped0: [-81, 14] }, bays: { "pulse-arcade": { y: 44, sign: 24, prod: -8, d: 14 } } },
};

// keys the old generated file carried that nothing reads any more are still emitted so nothing breaks
const old = JSON.parse(fs.readFileSync("src/data/generated/anchors.json", "utf8"));
const out = {};
const r = (n) => +n.toFixed(2);
for (const [scene, spec] of Object.entries(SPEC)) {
  const o = (out[scene] = {});
  for (const [k, [yaw, pitch]] of Object.entries(spec.pts)) o[k] = { yaw, pitch };
  for (const [k, b] of Object.entries(spec.bays)) {
    o[k] = { yaw: b.y, pitch: b.prod };
    o[`${k}@sign`] = { yaw: b.y, pitch: b.sign };
    spread(b.y, b.d ?? 8).forEach((yy, i) => (o[`${k}#${i}`] = { yaw: r(yy), pitch: b.prod }));
  }
  // legacy keys (unused bays/gates of the procedural rooms): park them at the scene's front anchor
  for (const k of Object.keys(old[scene] ?? {})) if (!(k in o)) o[k] = { ...(o.front ?? { yaw: 0, pitch: -8 }) };
}
fs.writeFileSync("src/data/generated/anchors.json", JSON.stringify(out, null, 2));
console.log("wrote anchors for", Object.keys(out).length, "scenes");
