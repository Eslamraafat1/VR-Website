// Geometry of the demo mall scenes. Used ONLY by the procedural asset generator.
// Coordinates: camera at origin, +z = corridor front (yaw 0), +x = right (yaw 90°).
const c = (r, g, b) => [r / 255, g / 255, b / 255];

export const SCENES = {
  entrance: {
    hw: 9, hb: 10, hf: 20, H: 9, stone: c(190, 182, 168), accent: c(200, 169, 106), skylight: false,
    bays: [
      { id: "ent-l", side: "L", z: 6, w: 6, color: c(255, 214, 160) },
      { id: "ent-r", side: "R", z: 6, w: 6, color: c(190, 230, 255) },
    ],
    cols: [[-4, 4], [4, 4], [-4, 12], [4, 12]],
  },
  atrium: {
    hw: 15, hb: 17, hf: 28, H: 24, stone: c(205, 198, 184), accent: c(123, 231, 245), skylight: true,
    bays: [
      { id: "lift", side: "L", z: -4, w: 5, color: c(160, 220, 245) },
      { id: "atr-l", side: "L", z: 10, w: 7, color: c(255, 222, 170) },
      { id: "fashion-gate", side: "L", z: 22, w: 6, color: c(230, 200, 190) },
      { id: "electronics-gate", side: "R", z: 12, w: 7, color: c(150, 200, 255) },
      { id: "atr-r", side: "R", z: -6, w: 7, color: c(255, 210, 150) },
    ],
    cols: [[-7, 6], [7, 6], [-7, 18], [7, 18], [-7, -8], [7, -8]],
    pedestals: [[0, 12, 1.2, 0.9]],
  },
  fashion: {
    hw: 6, hb: 8, hf: 24, H: 7, stone: c(176, 168, 160), accent: c(235, 235, 235), skylight: false,
    bays: [
      { id: "atelier-noir", side: "L", z: 8, w: 9, color: c(235, 225, 215) },
      { id: "haute-line", side: "R", z: 10, w: 9, color: c(255, 190, 170) },
    ],
    cols: [[-3.2, 0], [3.2, 0], [-3.2, 16], [3.2, 16]],
    pedestals: [[0, 8, 0.9, 1.0]],
  },
  electronics: {
    hw: 6.5, hb: 8, hf: 24, H: 7, stone: c(120, 128, 140), accent: c(123, 231, 245), skylight: false,
    bays: [
      { id: "orbit-tech", side: "L", z: 9, w: 9, color: c(120, 190, 255) },
      { id: "aura-audio", side: "R", z: 10, w: 9, color: c(180, 150, 255) },
    ],
    cols: [[-3.5, 0], [3.5, 0], [-3.5, 17], [3.5, 17]],
    pedestals: [[0, 9, 0.9, 1.0]],
  },
  luxury: {
    hw: 5.5, hb: 9, hf: 22, H: 7.5, stone: c(40, 38, 40), accent: c(200, 169, 106), skylight: false,
    bays: [
      { id: "velora", side: "L", z: 8, w: 8, color: c(255, 200, 130) },
      { id: "velora-lounge", side: "R", z: 5, w: 6, color: c(255, 180, 120) },
      { id: "cafe-gate", side: "R", z: 15, w: 5, color: c(255, 220, 170) },
    ],
    cols: [[-3, 2], [3, 2], [-3, 14], [3, 14]],
    pedestals: [[0, 8, 0.8, 1.1]],
  },
  cafe: {
    hw: 9, hb: 9, hf: 18, H: 7, stone: c(150, 120, 92), accent: c(255, 190, 110), skylight: false,
    bays: [
      { id: "cafe-lumen", side: "R", z: 7, w: 9, color: c(255, 190, 120) },
      { id: "cafe-seat", side: "L", z: 8, w: 8, color: c(255, 220, 170) },
    ],
    cols: [[-3, 3], [3, 3], [-3, 12], [3, 12]],
    pedestals: [[-5, 6, 0.9, 0.75], [5, 12, 0.9, 0.75]],
  },
  beauty: {
    hw: 8, hb: 8, hf: 24, H: 8, stone: c(214, 190, 186), accent: c(240, 170, 190), skylight: true,
    bays: [
      { id: "maison-eclat", side: "L", z: 9, w: 9, color: c(255, 200, 215) },
      { id: "lift-1", side: "R", z: -3, w: 4, color: c(160, 220, 245) },
      { id: "beauty-r", side: "R", z: 12, w: 7, color: c(255, 230, 210) },
    ],
    cols: [[-4, 3], [4, 3], [-4, 15], [4, 15]],
    pedestals: [[0, 9, 1.0, 1.0]],
  },
  home: {
    hw: 8, hb: 8, hf: 22, H: 7, stone: c(196, 182, 160), accent: c(150, 180, 120), skylight: false,
    bays: [
      { id: "form-living", side: "R", z: 9, w: 11, color: c(255, 226, 180) },
      { id: "home-l", side: "L", z: 10, w: 8, color: c(230, 220, 200) },
    ],
    cols: [[-3.5, 3], [3.5, 3], [-3.5, 15], [3.5, 15]],
    pedestals: [[0, 9, 1.1, 0.5]],
  },
  sports: {
    hw: 8, hb: 8, hf: 22, H: 8, stone: c(70, 78, 90), accent: c(255, 106, 60), skylight: false,
    bays: [
      { id: "kinetic", side: "L", z: 9, w: 10, color: c(255, 140, 90) },
      { id: "sports-r", side: "R", z: 10, w: 8, color: c(170, 220, 255) },
    ],
    cols: [[-3.5, 3], [3.5, 3], [-3.5, 15], [3.5, 15]],
    pedestals: [[0, 9, 1.0, 0.6]],
  },
  dining: {
    hw: 9, hb: 8, hf: 22, H: 7.5, stone: c(86, 62, 50), accent: c(255, 170, 90), skylight: false,
    bays: [
      { id: "nomad-table", side: "R", z: 9, w: 11, color: c(255, 175, 100) },
      { id: "dining-l", side: "L", z: 8, w: 9, color: c(255, 205, 150) },
    ],
    cols: [[-4, 3], [4, 3], [-4, 15], [4, 15]],
    pedestals: [[-5, 10, 0.9, 0.75], [5, 6, 0.9, 0.75]],
  },
  lounge: {
    hw: 9, hb: 8, hf: 16, H: 7, stone: c(34, 30, 56), accent: c(255, 80, 200), skylight: false,
    bays: [
      { id: "pulse-arcade", side: "L", z: 7, w: 10, color: c(190, 90, 255) },
      { id: "lounge-r", side: "R", z: 7, w: 9, color: c(80, 220, 255) },
    ],
    cols: [[-3.5, 3], [3.5, 3], [-3.5, 11], [3.5, 11]],
    pedestals: [[0, 8, 1.2, 0.5]],
  },
};
