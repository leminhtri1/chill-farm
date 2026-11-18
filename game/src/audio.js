// Every sound in Chill Farm is synthesised here with WebAudio: soft plucks, pops, splashes and a
// gentle music-box tune. Nothing is loaded from a file.

let ctx = null;
let master = null;
let musicGain = null;
let sfxGain = null;
let muted = false;
let musicTimer = 0;
let musicStep = 0;

export function initAudio() {
  if (ctx) {
    if (ctx.state === 'suspended') ctx.resume();
    return;
  }
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return;
  ctx = new AudioCtx();
  master = ctx.createGain();
  master.gain.value = muted ? 0 : 0.8;
  master.connect(ctx.destination);
  sfxGain = ctx.createGain();
  sfxGain.gain.value = 0.55;
  sfxGain.connect(master);
  musicGain = ctx.createGain();
  musicGain.gain.value = 0.16;
  musicGain.connect(master);
}

export function toggleMute() {
  muted = !muted;
  if (master) master.gain.value = muted ? 0 : 0.8;
  return muted;
}

export function isMuted() {
  return muted;
}

/** One soft tone with a quick attack and a gentle fade. */
function tone(freq, start, length, { type = 'triangle', volume = 0.5, slide = 0, out = sfxGain } = {}) {
  if (!ctx) return;
  const t = ctx.currentTime + start;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), t + length);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(volume, t + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + length);
  osc.connect(gain);
  gain.connect(out);
  osc.start(t);
  osc.stop(t + length + 0.05);
}

/** A burst of filtered noise: soil, splashes, rain and wings. */
function noise(start, length, { volume = 0.3, freq = 1200, q = 1, type = 'bandpass', sweep = 0 } = {}) {
  if (!ctx) return;
  const t = ctx.currentTime + start;
  const frames = Math.floor(ctx.sampleRate * length);
  const buffer = ctx.createBuffer(1, frames, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < frames; i += 1) data[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = type;
  filter.frequency.setValueAtTime(freq, t);
  if (sweep) filter.frequency.exponentialRampToValueAtTime(Math.max(60, freq + sweep), t + length);
  filter.Q.value = q;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(volume, t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + length);
  src.connect(filter);
  filter.connect(gain);
  gain.connect(sfxGain);
  src.start(t);
}

const SOUNDS = {
  till: () => {
    noise(0, 0.12, { volume: 0.5, freq: 380, q: 0.8, type: 'lowpass' });
    tone(110, 0, 0.12, { type: 'sine', volume: 0.35, slide: -50 });
  },
  plant: () => {
    tone(520, 0, 0.09, { type: 'sine', volume: 0.35, slide: 260 });
    tone(880, 0.06, 0.1, { type: 'sine', volume: 0.2 });
  },
  water: () => {
    noise(0, 0.32, { volume: 0.25, freq: 2400, q: 1.5, sweep: -1700 });
    tone(700, 0.02, 0.08, { type: 'sine', volume: 0.12, slide: 500 });
    tone(950, 0.12, 0.08, { type: 'sine', volume: 0.1, slide: 400 });
  },
  harvest: () => {
    tone(523, 0, 0.12, { volume: 0.35 });
    tone(784, 0.07, 0.16, { volume: 0.3 });
  },
  perfect: () => {
    tone(659, 0, 0.12, { volume: 0.3 });
    tone(880, 0.07, 0.12, { volume: 0.3 });
    tone(1319, 0.14, 0.28, { type: 'sine', volume: 0.28 });
  },
  combo: () => tone(1047 + Math.random() * 200, 0, 0.12, { type: 'sine', volume: 0.18, slide: 300 }),
  golden: () => [1319, 1568, 2093, 2637].forEach((f, i) => tone(f, i * 0.06, 0.3, { type: 'sine', volume: 0.2 })),
  sell: () => {
    [988, 1319, 1568].forEach((f, i) => tone(f, i * 0.06, 0.22, { type: 'square', volume: 0.07 }));
    tone(1976, 0.2, 0.35, { type: 'sine', volume: 0.18 });
  },
  buy: () => {
    tone(660, 0, 0.1, { type: 'square', volume: 0.06 });
    tone(990, 0.08, 0.18, { type: 'sine', volume: 0.2 });
  },
  upgrade: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.08, 0.25, { volume: 0.25 })),
  order: () => [784, 988, 1175, 1568].forEach((f, i) => tone(f, i * 0.07, 0.3, { type: 'sine', volume: 0.25 })),
  refill: () => {
    noise(0, 0.4, { volume: 0.22, freq: 600, q: 2, sweep: 900 });
    tone(300, 0.05, 0.3, { type: 'sine', volume: 0.12, slide: 300 });
  },
  error: () => tone(220, 0, 0.16, { type: 'square', volume: 0.06, slide: -60 }),
  note: () => tone(440, 0, 0.07, { type: 'sine', volume: 0.12 }),
  ripe: () => tone(1568, 0, 0.12, { type: 'sine', volume: 0.07 }),
  caw: () => {
    tone(720, 0, 0.14, { type: 'sawtooth', volume: 0.06, slide: -320 });
    tone(680, 0.18, 0.12, { type: 'sawtooth', volume: 0.05, slide: -300 });
  },
  shoo: () => {
    noise(0, 0.25, { volume: 0.25, freq: 1800, q: 0.7, sweep: 1500 });
    tone(500, 0, 0.18, { type: 'triangle', volume: 0.2, slide: 600 });
  },
  eaten: () => [392, 330, 262].forEach((f, i) => tone(f, i * 0.1, 0.18, { volume: 0.18 })),
  place: () => {
    tone(330, 0, 0.1, { type: 'square', volume: 0.06 });
    noise(0.05, 0.2, { volume: 0.15, freq: 3000, q: 1 });
  },
  sprinkle: () => noise(0, 0.5, { volume: 0.07, freq: 3200, q: 0.6 }),
  click: () => tone(880, 0, 0.05, { type: 'sine', volume: 0.12 }),
  late: () => [659, 523].forEach((f, i) => tone(f, i * 0.2, 0.4, { type: 'sine', volume: 0.18 })),
  goal: () => [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, i) => tone(f, i * 0.1, 0.35, { volume: 0.25 })),
  rush: () => [1175, 1568, 1175, 1568].forEach((f, i) => tone(f, i * 0.09, 0.14, { type: 'triangle', volume: 0.16 })),
  daily: () => [659, 784, 988, 1319].forEach((f, i) => tone(f, i * 0.07, 0.28, { type: 'sine', volume: 0.22 })),
  night: () => [784, 659, 523, 392].forEach((f, i) => tone(f, i * 0.18, 0.5, { type: 'sine', volume: 0.2 })),
  morning: () => [392, 523, 659, 784].forEach((f, i) => tone(f, i * 0.12, 0.4, { type: 'sine', volume: 0.2 })),
  fanfare: () => [523, 523, 659, 784, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.13, 0.4, { volume: 0.28 })),
};

export function play(name) {
  const sound = SOUNDS[name];
  if (sound && ctx && !muted) sound();
}

// A slow music-box tune in a major pentatonic scale, with a soft bass every bar.
const MELODY = [0, 2, 4, 7, 4, 2, 4, -1, 2, 4, 7, 9, 7, 4, 2, -1, 4, 7, 9, 12, 9, 7, 4, 2, 0, 2, 4, 2, 0, -1, -1, -1];
const BASS = [0, 0, 5, 5, 7, 7, 5, 0];
const ROOT = 392;
const NIGHT_ROOT = 330;

/** Called every frame: schedules the next notes of the tune. `night` makes it softer and lower. */
export function updateMusic(dt, playing, night) {
  if (!ctx || muted || !playing) return;
  musicTimer -= dt;
  if (musicTimer > 0) return;
  const beat = night ? 0.5 : 0.36;
  musicTimer += beat;
  const root = night ? NIGHT_ROOT : ROOT;
  const step = MELODY[musicStep % MELODY.length];
  if (step >= 0) tone(root * 2 ** (step / 12), 0, beat * 2.2, { type: 'sine', volume: 0.35, out: musicGain });
  if (musicStep % 4 === 0) {
    const bass = BASS[Math.floor(musicStep / 4) % BASS.length];
    tone((root / 2) * 2 ** (bass / 12), 0, beat * 4, { type: 'triangle', volume: 0.3, out: musicGain });
  }
  musicStep += 1;
}
