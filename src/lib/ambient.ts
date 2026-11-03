/**
 * Procedural mall ambience (WebAudio, no asset files): a slow detuned chord pad,
 * filtered "air" noise and sparse soft chimes. Started only from a user gesture.
 */
let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let chimeTimer: number | null = null;
let nodes: AudioScheduledSourceNode[] = [];

const CHORD = [130.81, 196, 261.63, 329.63, 392]; // C3 G3 C4 E4 G4
const CHIME = [523.25, 659.25, 783.99, 987.77, 1174.66];

function chime() {
  if (!ctx || !master) return;
  const f = CHIME[Math.floor(Math.random() * CHIME.length)];
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = "sine"; o.frequency.value = f;
  const t = ctx.currentTime;
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(0.05, t + 0.03);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 3.2);
  o.connect(g).connect(master);
  o.start(t); o.stop(t + 3.3);
  chimeTimer = window.setTimeout(chime, 3500 + Math.random() * 6500);
}

export function ambientStart(): boolean {
  if (typeof window === "undefined") return false;
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return false;
  if (!ctx) ctx = new AC();
  void ctx.resume();
  if (master) return true;
  const c = ctx;
  master = c.createGain();
  master.gain.setValueAtTime(0, c.currentTime);
  master.gain.linearRampToValueAtTime(0.5, c.currentTime + 2.5);
  master.connect(c.destination);

  const lp = c.createBiquadFilter();
  lp.type = "lowpass"; lp.frequency.value = 900; lp.Q.value = 0.4;
  lp.connect(master);
  CHORD.forEach((f, i) => {
    for (const detune of [-6, 6]) {
      const o = c.createOscillator(), g = c.createGain();
      o.type = i < 2 ? "sine" : "triangle"; o.frequency.value = f; o.detune.value = detune;
      g.gain.value = 0.035;
      const lfo = c.createOscillator(), lg = c.createGain();
      lfo.frequency.value = 0.05 + i * 0.03; lg.gain.value = 0.02;
      lfo.connect(lg).connect(g.gain);
      o.connect(g).connect(lp);
      o.start(); lfo.start();
      nodes.push(o, lfo);
    }
  });

  // air: looping filtered noise
  const len = c.sampleRate * 3;
  const buf = c.createBuffer(1, len, c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource();
  src.buffer = buf; src.loop = true;
  const bp = c.createBiquadFilter();
  bp.type = "bandpass"; bp.frequency.value = 520; bp.Q.value = 0.6;
  const ng = c.createGain(); ng.gain.value = 0.012;
  src.connect(bp).connect(ng).connect(master);
  src.start();
  nodes.push(src);

  chimeTimer = window.setTimeout(chime, 2500);
  return true;
}

export function ambientStop() {
  if (!ctx || !master) return;
  const c = ctx, m = master;
  if (chimeTimer) window.clearTimeout(chimeTimer);
  chimeTimer = null;
  m.gain.cancelScheduledValues(c.currentTime);
  m.gain.setValueAtTime(m.gain.value, c.currentTime);
  m.gain.linearRampToValueAtTime(0, c.currentTime + 0.8);
  const old = nodes;
  nodes = []; master = null;
  window.setTimeout(() => { old.forEach((n) => { try { n.stop(); } catch {} }); m.disconnect(); }, 900);
}
