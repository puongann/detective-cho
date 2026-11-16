// Make the white background of a PNG transparent (flood fill from the edges, soft anti-aliased edge).
// No dependencies. Usage: node scripts/png-transparent.js in.png out.png
import fs from 'node:fs';
import zlib from 'node:zlib';

const [inp, out] = process.argv.slice(2);
const buf = fs.readFileSync(inp);
let pos = 8; let w; let h; let bitDepth; let colorType; const idat = [];
while (pos < buf.length) {
  const len = buf.readUInt32BE(pos); const type = buf.toString('ascii', pos + 4, pos + 8);
  const data = buf.subarray(pos + 8, pos + 8 + len);
  if (type === 'IHDR') { w = data.readUInt32BE(0); h = data.readUInt32BE(4); bitDepth = data[8]; colorType = data[9]; if (data[12]) throw new Error('interlaced PNG not supported'); }
  if (type === 'IDAT') idat.push(data);
  pos += 12 + len;
}
const bpp = { 6: 4, 2: 3 }[colorType];
if (bitDepth !== 8 || !bpp) throw new Error(`unsupported PNG (depth ${bitDepth}, type ${colorType})`);
const raw = zlib.inflateSync(Buffer.concat(idat));
const stride = w * bpp; const px = Buffer.alloc(w * h * 4);
let prev = Buffer.alloc(stride);
for (let y = 0; y < h; y++) {
  const f = raw[y * (stride + 1)]; const line = Buffer.from(raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1)));
  for (let i = 0; i < stride; i++) {
    const a = i >= bpp ? line[i - bpp] : 0; const b = prev[i]; const c = i >= bpp ? prev[i - bpp] : 0;
    let p = 0;
    if (f === 1) p = a; else if (f === 2) p = b; else if (f === 3) p = (a + b) >> 1;
    else if (f === 4) { const q = a + b - c; const pa = Math.abs(q - a); const pb = Math.abs(q - b); const pc = Math.abs(q - c); p = pa <= pb && pa <= pc ? a : pb <= pc ? b : c; }
    line[i] = (line[i] + p) & 255;
  }
  for (let x = 0; x < w; x++) { const s = x * bpp; const d = (y * w + x) * 4; px[d] = line[s]; px[d + 1] = line[s + 1]; px[d + 2] = line[s + 2]; px[d + 3] = bpp === 4 ? line[s + 3] : 255; }
  prev = line;
}
// how "background-like" a pixel is: light and grey (not the orange fur / pink bow)
const light = (i) => Math.min(px[i], px[i + 1], px[i + 2]);
const sat = (i) => Math.max(px[i], px[i + 1], px[i + 2]) - Math.min(px[i], px[i + 1], px[i + 2]);
const isBg = (i) => px[i + 3] < 20 || (light(i) >= 228 && sat(i) <= 22);
const bg = new Uint8Array(w * h); const stack = [];
for (let x = 0; x < w; x++) { stack.push(x, (h - 1) * w + x); }
for (let y = 0; y < h; y++) { stack.push(y * w, y * w + w - 1); }
while (stack.length) {
  const k = stack.pop(); if (bg[k] || !isBg(k * 4)) continue;
  bg[k] = 1; const x = k % w; const y = (k / w) | 0;
  if (x > 0) stack.push(k - 1); if (x < w - 1) stack.push(k + 1); if (y > 0) stack.push(k - w); if (y < h - 1) stack.push(k + w);
}
// enclosed white areas (e.g. between a paw and the tail) are background too, if they are not tiny highlights
const seen = new Uint8Array(w * h);
for (let k0 = 0; k0 < w * h; k0++) {
  if (bg[k0] || seen[k0] || !isBg(k0 * 4)) continue;
  const comp = []; const st = [k0]; seen[k0] = 1;
  while (st.length) {
    const k = st.pop(); comp.push(k); const x = k % w; const y = (k / w) | 0;
    for (const n of [x > 0 ? k - 1 : -1, x < w - 1 ? k + 1 : -1, y > 0 ? k - w : -1, y < h - 1 ? k + w : -1]) {
      if (n >= 0 && !seen[n] && !bg[n] && isBg(n * 4)) { seen[n] = 1; st.push(n); }
    }
  }
  if (comp.length >= 40) for (const k of comp) bg[k] = 1;
}
let cleared = 0; let soft = 0;
for (let k = 0; k < w * h; k++) {
  const i = k * 4;
  if (bg[k]) { px[i + 3] = 0; cleared++; continue; }
  // soft edge: a light pixel touching the background becomes partly transparent
  const x = k % w; const y = (k / w) | 0;
  const near = (x > 0 && bg[k - 1]) || (x < w - 1 && bg[k + 1]) || (y > 0 && bg[k - w]) || (y < h - 1 && bg[k + w]);
  if (near && sat(i) <= 40 && light(i) > 150) { px[i + 3] = Math.round(px[i + 3] * Math.min(1, (255 - light(i)) / 105)); soft++; }
}
// write RGBA PNG (filter 0)
const rows = Buffer.alloc(h * (w * 4 + 1));
for (let y = 0; y < h; y++) { rows[y * (w * 4 + 1)] = 0; px.copy(rows, y * (w * 4 + 1) + 1, y * w * 4, (y + 1) * w * 4); }
const crcTable = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
const crc = (b) => { let c = 0xffffffff; for (const x of b) c = crcTable[(c ^ x) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
const chunk = (type, data) => { const l = Buffer.alloc(4); l.writeUInt32BE(data.length); const td = Buffer.concat([Buffer.from(type, 'ascii'), data]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([l, td, c]); };
const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 6;
fs.writeFileSync(out, Buffer.concat([buf.subarray(0, 8), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(rows, { level: 9 })), chunk('IEND', Buffer.alloc(0))]));
console.log(`${w}x${h}: ${cleared} background pixels removed (${Math.round(cleared / (w * h) * 100)}%), ${soft} edge pixels softened -> ${out}`);
