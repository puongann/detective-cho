// Tiny synthesized sound effects (no audio files): stamp thud, drumroll, ta-da, gavel, buzz.
let ctx = null;
let muted = false;
export function setMuted(m) { muted = m; }
export function isMuted() { return muted; }
function ac() {
  if (!ctx) { try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch { return null; } }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}
function tone(freq, dur, { type = 'sine', vol = 0.3, at = 0, slide = 0 } = {}) {
  const c = ac(); if (!c || muted) return;
  const t = c.currentTime + at;
  const o = c.createOscillator(); const g = c.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, t);
  if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, freq + slide), t + dur);
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  o.connect(g).connect(c.destination); o.start(t); o.stop(t + dur + 0.02);
}
function noise(dur, { vol = 0.3, at = 0 } = {}) {
  const c = ac(); if (!c || muted) return;
  const b = c.createBuffer(1, Math.floor(c.sampleRate * dur), c.sampleRate);
  const d = b.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
  const s = c.createBufferSource(); const g = c.createGain();
  s.buffer = b; g.gain.value = vol; s.connect(g).connect(c.destination); s.start(c.currentTime + at);
}
export const sfx = {
  stamp() { tone(90, 0.3, { type: 'square', vol: 0.35, slide: -50 }); noise(0.12, { vol: 0.4 }); },
  /** A heavy rubber stamp: whoosh down, THUNK, small rattle. `at` = delay in seconds. */
  stampHit(at = 0) {
    noise(0.14, { vol: 0.06, at: Math.max(0, at - 0.14) });
    tone(70, 0.35, { type: 'square', vol: 0.5, slide: -40, at });
    tone(140, 0.12, { type: 'triangle', vol: 0.35, slide: -90, at });
    noise(0.09, { vol: 0.75, at });
    noise(0.05, { vol: 0.25, at: at + 0.11 });
  },
  drumroll(sec = 1.4) { for (let t = 0; t < sec; t += 0.05) noise(0.05, { vol: 0.08 + (t / sec) * 0.12, at: t }); },
  /** One soft keyboard key: a quiet high "tick" plus a tiny low "clack" (a little different every time). */
  key() {
    const c = ac(); if (!c || muted) return;
    const t = c.currentTime;
    const len = Math.floor(c.sampleRate * 0.025);
    const b = c.createBuffer(1, len, c.sampleRate);
    const d = b.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (len / 7));
    const src = c.createBufferSource(); src.buffer = b;
    const f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 2600 + Math.random() * 1400; f.Q.value = 1.4;
    const g = c.createGain(); g.gain.value = 0.11 + Math.random() * 0.04;
    src.connect(f).connect(g).connect(c.destination); src.start(t);
    tone(150 + Math.random() * 50, 0.03, { type: 'triangle', vol: 0.05 });
  },
  tada() { [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.35, { type: 'triangle', vol: 0.25, at: i * 0.11 })); },
  sad() { [392, 370, 349, 262].forEach((f, i) => tone(f, 0.45, { type: 'sawtooth', vol: 0.12, at: i * 0.35 })); },
  gavel() { tone(180, 0.15, { type: 'square', vol: 0.4, slide: -120 }); noise(0.08, { vol: 0.5 }); },
  pop() { tone(660, 0.08, { type: 'sine', vol: 0.2, slide: 300 }); },
  tick() { tone(1200, 0.03, { type: 'square', vol: 0.05 }); },
  fish() { tone(880, 0.1, { vol: 0.2 }); tone(1320, 0.15, { vol: 0.2, at: 0.08 }); },
};
