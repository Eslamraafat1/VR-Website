// Tiny analytic raytracer that renders original equirectangular panoramas and
// rectilinear "photographs" of the procedural VISTRA demo mall.
import { SCENES } from "./scenes.mjs";

const hash = (x, y) => {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
};
const mix = (a, b, t) => a.map((v, i) => v * (1 - t) + b[i] * t);
const mul = (a, k) => a.map((v) => v * k);
const add = (a, b) => a.map((v, i) => v + b[i]);
const GOLD = [0.78, 0.66, 0.42];
const EYE = 1.6;

function trace(S, o, d, depth = 0) {
  const { hw, hb, hf, H } = S;
  // box exit
  const tx = d[0] > 1e-6 ? (hw - o[0]) / d[0] : d[0] < -1e-6 ? (-hw - o[0]) / d[0] : 1e9;
  const tz = d[2] > 1e-6 ? (hf - o[2]) / d[2] : d[2] < -1e-6 ? (-hb - o[2]) / d[2] : 1e9;
  const ty = d[1] > 1e-6 ? (H - o[1]) / d[1] : d[1] < -1e-6 ? (0 - o[1]) / d[1] : 1e9;
  let t = Math.min(tx, tz, ty);
  let face = t === ty ? (d[1] > 0 ? "C" : "F") : t === tx ? (d[0] > 0 ? "R" : "L") : d[2] > 0 ? "N" : "S";

  // cylinders (columns + pedestals)
  let cyl = null;
  const cyls = [
    ...(S.cols || []).map(([x, z]) => ({ x, z, r: 0.5, h: H - 0.0, col: S.stone, ped: false })),
    ...(S.pedestals || []).map(([x, z, r, h]) => ({ x, z, r, h, col: [0.1, 0.1, 0.12], ped: true })),
  ];
  for (const c of cyls) {
    const ox = o[0] - c.x, oz = o[2] - c.z;
    const a = d[0] * d[0] + d[2] * d[2];
    if (a < 1e-9) continue;
    const b = ox * d[0] + oz * d[2];
    const cc = ox * ox + oz * oz - c.r * c.r;
    const disc = b * b - a * cc;
    if (disc < 0) continue;
    const ts = (-b - Math.sqrt(disc)) / a;
    if (ts > 0.01 && ts < t) {
      const y = o[1] + d[1] * ts;
      if (y >= 0 && y <= c.h) { t = ts; cyl = c; face = "Y"; }
    }
    if (c.ped && d[1] < 0) {
      const tt = (c.h - o[1]) / d[1];
      if (tt > 0.01 && tt < t) {
        const px = o[0] + d[0] * tt - c.x, pz = o[2] + d[2] * tt - c.z;
        if (px * px + pz * pz < c.r * c.r) { t = tt; cyl = c; face = "T"; }
      }
    }
  }

  const p = [o[0] + d[0] * t, o[1] + d[1] * t, o[2] + d[2] * t];
  let col;

  if (face === "T") {
    col = mix([0.9, 0.85, 0.75], S.accent, 0.5).map((v) => v * 2.2);
  } else if (face === "Y") {
    const y = p[1];
    if (cyl.ped) {
      col = mul(add(cyl.col, [0.03, 0.03, 0.04]), 0.9 + 0.5 * Math.pow(Math.max(0, 1 - y / cyl.h), 2));
      if (y > cyl.h - 0.06) col = mul(S.accent, 2);
    } else {
      const band = Math.abs(y - 0.35) < 0.07 || Math.abs(y - 3.3) < 0.05;
      const shade = 0.55 + 0.5 * Math.cos(Math.atan2(p[0] - cyl.x, p[2] - cyl.z) * 1.0 + 0.8);
      col = band ? mul(GOLD, 1.4) : mul(cyl.col, 0.3 + 0.4 * shade * (0.6 + 0.4 * (y / H)));
    }
  } else if (face === "F") {
    const gx = p[0] / 2.4, gz = p[2] / 2.4;
    const fx = Math.abs(gx - Math.round(gx)), fz = Math.abs(gz - Math.round(gz));
    const grout = fx < 0.012 || fz < 0.012;
    const n = 0.9 + 0.1 * hash(Math.floor(gx + 100), Math.floor(gz + 100));
    let base = mul(mix(S.stone, [0.02, 0.02, 0.03], 0.8), n);
    if (grout) base = mul(base, 0.5);
    col = base;
    if (depth === 0) {
      const rd = [d[0], -d[1], d[2]];
      const r = trace(S, p, rd, 1);
      const fres = 0.12 + 0.45 * Math.pow(1 - Math.min(1, Math.abs(d[1])), 3);
      col = add(mul(col, 1 - fres), mul(r, fres * 0.9));
    }
  } else if (face === "C") {
    const ax = Math.abs(p[0]);
    let e = 0.06;
    col = mul(mix(S.stone, [0.01, 0.01, 0.02], 0.9), 0.5 + 0.4 * hash(Math.floor(p[0] / 2), Math.floor(p[2] / 2)));
    const stripe = (Math.abs(ax - hw * 0.5) < 0.18 || ax < 0.18) && Math.sin(p[2] * 0.9) > -0.6;
    if (stripe) col = [3.6, 3.4, 3.0];
    const coffer = Math.abs(((p[2] / 3) % 1) - 0.5) < 0.02;
    if (coffer) col = mul(col, 1.6);
    if (S.skylight && ax < hw * 0.55 && p[2] > 0 && p[2] < hf * 0.75) {
      const g = 0.7 + 0.3 * Math.sin(p[2] * 0.6) * Math.cos(p[0] * 0.5);
      col = mix([2.6, 3.0, 3.4], [1.6, 2.4, 3.2], g);
      const mull = Math.abs(((p[0] / 2.2) % 1) - 0.5) < 0.03 || Math.abs(((p[2] / 2.2) % 1) - 0.5) < 0.03;
      if (mull) col = [0.1, 0.1, 0.12];
    }
    col = add(col, [e, e, e]);
  } else {
    // walls
    const side = face; // L R N S
    const a = side === "L" || side === "R" ? p[2] : p[0];
    const y = p[1];
    const lvl = Math.floor(y / 5);
    const ly = y - lvl * 5;
    let shadeUp = 0.55 + 0.45 * Math.min(1, y / H);
    col = mul(S.stone, 0.26 * shadeUp);
    const fin = Math.abs(((a / 0.9) % 1) - 0.5) < 0.04;
    if (fin) col = mul(col, 0.55);
    if (side === "L" || side === "R") {
      const bay = (S.bays || []).find((b) => b.side === side && Math.abs(a - b.z) < b.w / 2);
      if (bay && lvl === 0) {
        const u = a - (bay.z - bay.w / 2);
        const frame = u < 0.14 || u > bay.w - 0.14 || ly < 0.12 || (ly > 3.2 && ly < 3.34) || Math.abs(((u / 3.0) % 1)) < 0.02;
        if (ly < 3.3) {
          if (frame) col = mul(GOLD, 0.7);
          else {
            const shelf = Math.abs(((ly / 0.55) % 1) - 0.5) < 0.03;
            const blk = hash(Math.floor(u * 3), Math.floor(ly * 3) + bay.z * 7);
            let g = mul(bay.color, 0.8 + 1.4 * Math.pow(1 - ly / 3.3, 0.7));
            if (blk > 0.62 && ly > 0.3) g = mul(add(g, mix(bay.color, S.accent, 0.6)), 1.15);
            if (shelf) g = mul(g, 0.55);
            col = g;
          }
        } else if (ly < 4.1) {
          const inset = u > 0.3 && u < bay.w - 0.3 && ly > 3.5 && ly < 3.95;
          col = inset ? mul(add(S.accent, bay.color), 1.7) : mul(S.stone, 0.3);
          if (inset && Math.abs(ly - 3.72) < 0.03) col = mul(col, 0.4);
        }
      } else if (lvl === 0) {
        if (ly < 0.15 || (ly > 3.2 && ly < 3.3)) col = mul(GOLD, 0.8);
        else if (ly < 3.3 && ((S.accent && fin) || false)) col = mul(S.accent, 0.5);
      }
      if (lvl >= 1) {
        // upper-level windows + balcony rail
        const win = ly > 0.8 && ly < 3.6 && Math.abs(((a / 3.0) % 1) - 0.5) < 0.38;
        if (win) col = mul(mix([0.55, 0.7, 0.9], S.accent, 0.4), 0.28 + 0.4 * hash(Math.floor(a / 3), lvl));
        if (ly < 0.15) col = mul(GOLD, 1.3);
      }
    } else {
      // end walls with a portal door
      const door = Math.abs(p[0]) < 1.7 && y < 3.7 && (y < 2.4 || Math.hypot(p[0], y - 2.4) < 1.7);
      if (door) {
        const k = 1 - Math.hypot(p[0] / 1.7, (y - 1.8) / 2.2) * 0.4;
        col = mul(mix([0.7, 0.9, 1.0], S.accent, 0.45), 3.0 * Math.max(0.5, k));
      } else if (Math.abs(p[0]) < 2.0 && y < 4.0 && (y < 2.4 || Math.hypot(p[0], y - 2.4) < 2.0)) {
        col = mul(GOLD, 1.3);
      } else if (Math.abs(p[0]) < hw * 0.8 && y > 4.5 && y < H - 1 && Math.abs(((p[0] / 1.6) % 1) - 0.5) < 0.06) {
        col = mul(S.accent, 2.4);
      }
    }
  }
  // distance haze
  const k = Math.exp(-t * 0.012);
  return mix([0.02, 0.025, 0.04], col, k);
}

const tone = (c, noise) => c.map((v) => {
  v = 1 - Math.exp(-v * 0.95); v = v * v * (3 - 2 * v) * 0.6 + v * 0.4;
  v = Math.pow(Math.max(0, v), 1 / 2.2) + noise;
  return Math.max(0, Math.min(255, Math.round(v * 255)));
});

export function renderEquirect(sceneId, w, h, pos = [0, EYE, 0]) {
  const S = SCENES[sceneId];
  const buf = Buffer.alloc(w * h * 3);
  for (let j = 0; j < h; j++) {
    const pitch = (0.5 - (j + 0.5) / h) * Math.PI;
    const cp = Math.cos(pitch), sp = Math.sin(pitch);
    for (let i = 0; i < w; i++) {
      const yaw = ((i + 0.5) / w - 0.5) * 2 * Math.PI;
      const d = [Math.sin(yaw) * cp, sp, Math.cos(yaw) * cp];
      const [r, g, b] = tone(trace(S, pos, d), (hash(i, j) - 0.5) * 0.012);
      const k = (j * w + i) * 3;
      buf[k] = r; buf[k + 1] = g; buf[k + 2] = b;
    }
  }
  return buf;
}

export function renderView(sceneId, w, h, fovDeg, yawDeg, pitchDeg, pos = [0, EYE, 0]) {
  const S = SCENES[sceneId];
  const buf = Buffer.alloc(w * h * 3);
  const f = 1 / Math.tan((fovDeg * Math.PI) / 360);
  const yaw = (yawDeg * Math.PI) / 180, pit = (pitchDeg * Math.PI) / 180;
  const fwd = [Math.sin(yaw) * Math.cos(pit), Math.sin(pit), Math.cos(yaw) * Math.cos(pit)];
  const right = [Math.cos(yaw), 0, -Math.sin(yaw)];
  const up = [fwd[1] * right[2] - fwd[2] * right[1], fwd[2] * right[0] - fwd[0] * right[2], fwd[0] * right[1] - fwd[1] * right[0]];
  const upv = up;
  for (let j = 0; j < h; j++) {
    for (let i = 0; i < w; i++) {
      const sx = ((i + 0.5) / w - 0.5) * 2 * (w / h);
      const sy = (0.5 - (j + 0.5) / h) * 2;
      let d = [fwd[0] * f + right[0] * sx + upv[0] * sy, fwd[1] * f + right[1] * sx + upv[1] * sy, fwd[2] * f + right[2] * sx + upv[2] * sy];
      const n = Math.hypot(...d);
      d = d.map((v) => v / n);
      const vig = 1 - 0.35 * (sx * sx / ((w / h) * (w / h)) + sy * sy) * 0.6;
      const [r, g, b] = tone(mul(trace(S, pos, d), vig), (hash(i, j) - 0.5) * 0.012);
      const k = (j * w + i) * 3;
      buf[k] = r; buf[k + 1] = g; buf[k + 2] = b;
    }
  }
  return buf;
}

export function anchors(sceneId) {
  const S = SCENES[sceneId];
  const out = {};
  const ang = (x, y, z) => ({
    yaw: +((Math.atan2(x, z) * 180) / Math.PI).toFixed(2),
    pitch: +((Math.atan2(y - EYE, Math.hypot(x, z)) * 180) / Math.PI).toFixed(2),
  });
  out.front = ang(0, 1.6, S.hf);
  out.back = ang(0, 1.6, -S.hb);
  for (const b of S.bays || []) {
    const x = b.side === "L" ? -S.hw : S.hw;
    out[b.id] = ang(x, 1.6, b.z);
    for (let i = 0; i < 3; i++) out[`${b.id}#${i}`] = ang(x, 1.3 + (i === 1 ? 0.5 : 0), b.z + (i - 1) * (b.w / 3.2));
    out[`${b.id}@sign`] = ang(x, 3.7, b.z);
  }
  (S.pedestals || []).forEach(([x, z, , h], i) => (out[`ped${i}`] = ang(x, h + 0.2, z)));
  return out;
}
