// Product photos: real Pexels photographs (Pexels licence: free for commercial use, no attribution required).
// PICK maps product id -> Pexels photo id, chosen by hand from search results (no visible brand logos).
// Run: node scripts/real-products.mjs   (needs network). Writes public/images/products/<id>.jpg (800x800).
import fs from "node:fs";
import sharp from "sharp";

export const PICK = {
  "noir-wool-coat": 21835288, "noir-leather-tote": 23223861, "noir-court-sneaker": 13536939,
  "haute-silk-scarf": 36455711, "haute-crossbody": 27174548, "haute-loafer": 8159478,
  "orbit-phone-x": 27544694, "orbit-watch-s": 11700618, "orbit-book-air": 5793947,
  "aura-halo-headphones": 5269752, "aura-orb-speaker": 14309809, "aura-studio-headphones": 3394665,
  "velora-solitaire-ring": 32988751, "velora-pearl-necklace": 36854160, "velora-chrono": 5058216,
  "lumen-signature-latte": 459489, "lumen-pastry-box": 17939260, "lumen-cold-brew": 28901490,
  "eclat-glow-serum": 7796500, "eclat-noir-perfume": 16239693, "eclat-velvet-cream": 4735904,
  "form-arc-chair": 29508374, "form-halo-lamp": 32168984, "form-stone-vase": 7119222,
  "kinetic-velocity-runner": 23491456, "kinetic-pro-bottle": 7814989, "kinetic-trail-pack": 30829443,
  "nomad-tasting-menu": 29220390, "nomad-saffron-bowl": 16474894, "nomad-spiced-tea": 38958677,
  "pulse-vr-headset": 4523065, "pulse-game-pad": 18223728, "pulse-day-pass": 1293260,
};

if (process.argv[1].endsWith("real-products.mjs")) {
  const out = {};
  for (const [id, pid] of Object.entries(PICK)) {
    let buf = null;
    for (let t = 0; t < 5 && !buf; t++) {
      try { const r = await fetch(`https://images.pexels.com/photos/${pid}/pexels-photo-${pid}.jpeg?auto=compress&cs=tinysrgb&w=1400`, { headers: { "User-Agent": "Mozilla/5.0" } }); if (r.ok) buf = Buffer.from(await r.arrayBuffer()); } catch { await new Promise((ok) => setTimeout(ok, 1000)); }
    }
    if (!buf) { console.log("FAIL", id, pid); continue; }
    await sharp(buf).resize(800, 800, { fit: "cover", position: "attention" }).jpeg({ quality: 86, mozjpeg: true }).toFile(`public/images/products/${id}.jpg`);
    out[id] = `https://www.pexels.com/photo/${pid}/`;
    console.log("ok", id);
  }
  fs.writeFileSync("scripts/product-sources.json", JSON.stringify(out, null, 2));
}
