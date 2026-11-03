// Renders rectilinear "photos" (mall / store covers / campaign banners) out of the real CC0 panoramas.
// Needs the full-resolution sources downloaded by the pano step into RAW (default: ./.panorama-src/<scene>.jpg).
import path from "node:path";
import sharp from "sharp";

const RAW = process.env.PANO_SRC ?? ".panorama-src";
const OUT = "public/images";
const rad = Math.PI / 180;

async function load(scene) {
  const { data, info } = await sharp(path.join(RAW, `${scene}.jpg`)).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  return { data, w: info.width, h: info.height };
}

function render(img, W, H, yawDeg, pitchDeg, hfovDeg) {
  const out = Buffer.alloc(W * H * 3);
  const f = W / 2 / Math.tan((hfovDeg * rad) / 2);
  const cy = Math.cos(yawDeg * rad), sy = Math.sin(yawDeg * rad), cp = Math.cos(pitchDeg * rad), sp = Math.sin(pitchDeg * rad);
  for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
    // camera ray (x right, y up, z forward) -> pitch -> yaw
    let x = i + 0.5 - W / 2, y = H / 2 - (j + 0.5), z = f;
    const y2 = y * cp + z * sp, z2 = z * cp - y * sp;
    const x3 = x * cy + z2 * sy, z3 = z2 * cy - x * sy;
    const lon = Math.atan2(x3, z3), lat = Math.atan2(y2, Math.hypot(x3, z3));
    const u = ((lon / (2 * Math.PI) + 0.5) * img.w) - 0.5, v = (0.5 - lat / Math.PI) * img.h - 0.5;
    const u0 = Math.floor(u), v0 = Math.max(0, Math.min(img.h - 2, Math.floor(v))), fu = u - u0, fv = v - v0;
    const a = ((u0 % img.w) + img.w) % img.w, b = (a + 1) % img.w;
    const o = (j * W + i) * 3;
    for (let c = 0; c < 3; c++) {
      const p00 = img.data[(v0 * img.w + a) * 3 + c], p10 = img.data[(v0 * img.w + b) * 3 + c];
      const p01 = img.data[((v0 + 1) * img.w + a) * 3 + c], p11 = img.data[((v0 + 1) * img.w + b) * 3 + c];
      out[o + c] = (p00 * (1 - fu) + p10 * fu) * (1 - fv) + (p01 * (1 - fu) + p11 * fu) * fv;
    }
  }
  return out;
}

// [file, scene, W, H, yaw, pitch, hfov]
const VIEWS = [
  ["mall/hero.jpg", "beauty", 1920, 1080, -20, 10, 100],
  ["mall/atrium.jpg", "atrium", 1600, 1000, -68, 16, 85],
  ["mall/entrance.jpg", "entrance", 1600, 1000, 20, 6, 85],
  ["mall/detail-gallery.jpg", "beauty", 1200, 1500, -34, 28, 62],
  ["mall/detail-skylight.jpg", "entrance", 1200, 1500, 30, 40, 70],
  ["mall/dining-boulevard.jpg", "dining", 1600, 1000, 10, -8, 100],
  ["mall/fashion-district.jpg", "fashion", 1600, 1000, 20, 6, 90],
  ["mall/lifestyle-gallery.jpg", "home", 1600, 1000, -30, 6, 95],
  ["mall/luxury-avenue.jpg", "luxury", 1600, 1000, 30, 8, 90],
  ["mall/technology-zone.jpg", "electronics", 1600, 1000, 100, 6, 90],
  ["campaigns/gold-hour.jpg", "luxury", 1400, 1000, 44, 14, 60],
  ["campaigns/seasonal-edit.jpg", "fashion", 1800, 1000, 120, 20, 70],
  ["campaigns/sound-season.jpg", "electronics", 1400, 1000, -20, 4, 60],
  ["campaigns/winter-tailoring.jpg", "luxury", 1400, 1000, -22, 8, 45],
  ["stores/atelier-noir.jpg", "fashion", 1600, 900, 20, 6, 60],
  ["stores/haute-line.jpg", "fashion", 1600, 900, -130, 6, 65],
  ["stores/orbit-tech.jpg", "electronics", 1600, 900, -22, 6, 70],
  ["stores/aura-audio.jpg", "electronics", 1600, 900, 104, 0, 65],
  ["stores/velora.jpg", "luxury", 1600, 900, -22, 8, 65],
  ["stores/cafe-lumen.jpg", "cafe", 1600, 900, 34, 4, 70],
  ["stores/form-living.jpg", "home", 1600, 900, -20, 4, 70],
  ["stores/kinetic.jpg", "sports", 1600, 900, 40, 0, 75],
  ["stores/maison-eclat.jpg", "beauty", 1600, 900, -92, 6, 65],
  ["stores/nomad-table.jpg", "dining", 1600, 900, -20, 6, 75],
  ["stores/pulse-arcade.jpg", "lounge", 1600, 900, 44, 4, 75],
];

const cache = new Map();
for (const [file, scene, W, H, yaw, pitch, fov] of VIEWS) {
  if (!cache.has(scene)) cache.set(scene, await load(scene));
  const buf = render(cache.get(scene), W, H, yaw, pitch, fov);
  await sharp(buf, { raw: { width: W, height: H, channels: 3 } }).jpeg({ quality: 86, mozjpeg: true }).toFile(path.join(OUT, file));
  console.log("wrote", file);
}
