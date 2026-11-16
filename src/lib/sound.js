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
  drumroll(sec = 1.4) { for (let t = 0; t < sec; t += 0.05) noise(0.05, { vol: 0.08 + (t / sec) * 0.12, at: t }); },
  tada() { [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.35, { type: 'triangle', vol: 0.25, at: i * 0.11 })); },
  sad() { [392, 370, 349, 262].forEach((f, i) => tone(f, 0.45, { type: 'sawtooth', vol: 0.12, at: i * 0.35 })); },
  gavel() { tone(180, 0.15, { type: 'square', vol: 0.4, slide: -120 }); noise(0.08, { vol: 0.5 }); },
  pop() { tone(660, 0.08, { type: 'sine', vol: 0.2, slide: 300 }); },
  tick() { tone(1200, 0.03, { type: 'square', vol: 0.05 }); },
  fish() { tone(880, 0.1, { vol: 0.2 }); tone(1320, 0.15, { vol: 0.2, at: 0.08 }); },
};
