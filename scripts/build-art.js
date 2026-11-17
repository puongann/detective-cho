// Builds every SVG picture into public/assets/ from the character kit in src/art/chars.js.
// Run: npm run art   (also runs before every build)
import fs from 'node:fs';
import path from 'node:path';
import {
  C, cho, hoa, nam, long, linh, vy, banana, sunflower, ringBox, ringShape, sparkle, balloon,
  heartBalloon, heartPath, flowers, sunbed, sign, feather, bubble, timeTag, label, glass, camera, ANIM_CSS, anim,
} from '../src/art/chars.js';

const OUT = path.resolve('public/assets');
const L = C.line;
const svg = (inner, w = 1600, h = 1000) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}"><style>${ANIM_CSS.replace(/\n/g, '')}</style>${inner}</svg>`;
// standalone hearts beat, music notes float
const heart = (x, y, s, fill) => anim('beat', heartPath(x, y, s, fill), -((x % 13) / 10));
const write = (rel, content) => { const f = path.join(OUT, rel); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, content); };

// ---------------- backgrounds ----------------
function hall({ night = false, stage = false } = {}) {
  return `<rect width="1600" height="1000" fill="${night ? '#5b3f6e' : '#ffe9c2'}"/>
  <rect y="720" width="1600" height="280" fill="${night ? '#6e4a2e' : '#c98f55'}"/>
  ${Array.from({ length: 9 }, (_, i) => `<path d="M${i * 200} 720 L ${i * 200 - 60} 1000" stroke="${night ? '#5a3a22' : '#b07a44'}" stroke-width="4"/>`).join('')}
  <path d="M0 110 Q 200 170 400 110 Q 600 170 800 110 Q 1000 170 1200 110 Q 1400 170 1600 110" fill="none" stroke="#e46f9f" stroke-width="6"/>
  ${Array.from({ length: 16 }, (_, i) => `<path class="flutter" style="--d:${-(i % 5) * 0.4}s" d="M${50 + i * 100} ${130 + (i % 2) * 18} l 18 34 l -36 0 z" fill="${['#ff6b8b', '#ffd84d', '#5fb6e8', '#7ac36a'][i % 4]}" stroke="${L}" stroke-width="3"/>`).join('')}
  ${stage ? `<rect x="900" y="200" width="700" height="520" fill="#2b1c3a"/><path d="M900 200 Q 960 460 900 720 L 900 200Z M1600 200 Q 1540 460 1600 720Z" fill="#b8243a"/><path d="M900 200 L 1600 200 L 1600 250 Q 1250 300 900 250 Z" fill="#c92f45" stroke="${L}" stroke-width="4"/><rect x="880" y="700" width="740" height="40" fill="#8a5a2b" stroke="${L}" stroke-width="5"/>${[1000, 1250, 1500].map((x) => `<path class="glow" style="animation-delay:${-(x % 7) / 3}s" d="M${x} 250 L ${x - 80} 700 L ${x + 80} 700 Z" fill="#fff6a8" opacity=".16"/>`).join('')}` : ''}`;
}
function room({ window: win = true, curtainsBlow = false, morning = true } = {}) {
  return `<rect width="1600" height="1000" fill="#dfeefc"/>
  <rect width="1600" height="700" fill="#f7e3c4"/>
  ${Array.from({ length: 20 }, (_, i) => `<path d="M${i * 80} 0 L ${i * 80} 700" stroke="#efd5ae" stroke-width="10"/>`).join('')}
  <rect y="700" width="1600" height="300" fill="#b98a5a"/>
  ${Array.from({ length: 6 }, (_, i) => `<path d="M0 ${740 + i * 50} L 1600 ${740 + i * 50}" stroke="#a87a4c" stroke-width="3"/>`).join('')}
  ${win ? `<rect x="1080" y="140" width="380" height="380" fill="${morning ? '#9fd6ff' : '#253064'}" stroke="${L}" stroke-width="10"/>
    <circle cx="1380" cy="230" r="40" fill="#ffe38a"/>
    <path d="M1080 330 L 1460 330 M1270 140 L 1270 520" stroke="${L}" stroke-width="8"/>
    <path d="M1060 120 Q ${curtainsBlow ? '980 330 900 520' : '1100 330 1060 540'} L 1040 540 Q ${curtainsBlow ? '1000 330 1060 120' : '1080 330 1060 120'}" fill="#f58bb0" stroke="${L}" stroke-width="5"/>
    <path d="M1480 120 Q ${curtainsBlow ? '1560 330 1600 520' : '1440 330 1480 540'} L 1500 540 Q ${curtainsBlow ? '1540 330 1480 120' : '1460 330 1480 120'}" fill="#f58bb0" stroke="${L}" stroke-width="5"/>` : ''}`;
}
function garden() {
  return `<rect width="1600" height="1000" fill="#bfe6ff"/><circle cx="200" cy="140" r="70" fill="#ffe38a"/>
  <path d="M0 640 Q 400 560 800 640 T 1600 620 L 1600 1000 L 0 1000Z" fill="#8fd17a"/>
  <rect x="1360" y="300" width="60" height="380" fill="#8a5a2b" stroke="${L}" stroke-width="6"/>
  <circle cx="1390" cy="280" r="150" fill="#5fae55" stroke="${L}" stroke-width="6"/>
  ${[80, 300, 520, 1100].map((x) => sunflower(x, 700, 1.4)).join('')}
  ${[80, 300, 520, 1100].map((x) => `<path d="M${x} 726 L ${x} 860" stroke="#3f8a3a" stroke-width="8"/>`).join('')}`;
}
function pool({ night = false } = {}) {
  return `<rect width="1600" height="1000" fill="${night ? '#1d2340' : '#bfe6ff'}"/>
  ${night ? `<circle cx="1300" cy="150" r="70" fill="#fff4c2"/>${Array.from({ length: 30 }, (_, i) => `<circle class="glow" style="animation-delay:${-(i % 6) * 0.45}s" cx="${(i * 197) % 1600}" cy="${(i * 89) % 420}" r="3" fill="#fff"/>`).join('')}` : '<circle cx="220" cy="140" r="70" fill="#ffe38a"/>'}
  <rect y="480" width="1600" height="520" fill="${night ? '#57616e' : '#e7dccb'}"/>
  <rect x="120" y="560" width="1360" height="380" rx="40" fill="${night ? '#1f5d8a' : '#4cb7e8'}" stroke="${L}" stroke-width="10"/>
  ${Array.from({ length: 7 }, (_, i) => `<path class="ripple" style="--d:${-i * 0.4}s" d="M${200 + i * 180} ${650 + (i % 2) * 120} q 40 -20 80 0 t 80 0" fill="none" stroke="#fff" stroke-width="5" opacity=".6"/>`).join('')}`;
}

// ---------------- scenes ----------------
const S = {};

S[1] = () => svg(`${hall()}
  <g transform="rotate(-3 800 260)"><rect x="300" y="200" width="1000" height="130" rx="10" fill="#fff8e7" stroke="${L}" stroke-width="6"/>${label(800, 290, 'HOA ♥ NAM', 78, '#e46f9f')}</g>
  ${linh({ x: 420, y: 900, s: 1.35, mood: 'happy' })}
  <path d="M1360 430 L 1300 900 M1480 430 L 1540 900" stroke="#8a5a2b" stroke-width="14"/>${[500, 600, 700, 800].map((y) => `<path d="M${1355 - (y - 430) * 0.13 + 5} ${y} L ${1485 + (y - 430) * 0.13 - 5} ${y}" stroke="#8a5a2b" stroke-width="12"/>`).join('')}
  ${long({ x: 1420, y: 560, s: 1.05, mood: 'happy', arms: 'up' })}
  ${balloon(560, 470, '#ff6b8b', 0.9)}${balloon(660, 440, '#5fb6e8', 0.9)}${balloon(1040, 450, '#ffd84d', 0.9)}${balloon(1140, 480, '#7ac36a', 0.9)}
  ${flowers(800, 690, 0.9)}
  ${hoa({ x: 640, y: 960, s: 0.85, mood: 'happy' })}${nam({ x: 960, y: 960, s: 0.85, mood: 'happy' })}
  ${heart(800, 600, 26)}
  ${sunbed(190, 975, 0.85)}${cho({ x: 110, y: 950, s: 0.7, mood: 'sleep', lying: true })}${sign(150, 760, 'ON HOLIDAY', 0.85)}
  ${timeTag('Fri 5 p.m.')}`);

S[2] = () => svg(`${hall()}
  ${hoa({ x: 520, y: 900, s: 1.35, mood: 'love', arms: 'cheeks' })}
  ${nam({ x: 960, y: 940, s: 1.15, mood: 'happy', wings: 'give' })}
  <g transform="translate(1110 760)">${ringBox(0, 0, 1.3)}</g>
  ${sparkle(1050, 620, 2)}${sparkle(1190, 640, 1.4)}${sparkle(1120, 560, 1.1)}
  ${heart(420, 380, 30)}${heart(620, 340, 22)}${heart(520, 300, 16)}
  ${long({ x: 1380, y: 940, s: 0.9, mood: 'happy', arms: 'up' })}${label(1320, 560, 'CLAP CLAP!', 40, '#e46f9f')}
  ${linh({ x: 180, y: 960, s: 1.1, mood: 'happy' })}
  ${cho({ x: 1520, y: 980, s: 0.45, mood: 'happy' })}
  ${timeTag('Fri 7 p.m.', true)}`);

S[3] = () => svg(`${hall({ night: true, stage: true })}
  ${vy({ x: 1270, y: 700, s: 1.25, mood: 'happy', mic: true })}
  ${['♪', '♫', '♪', '♥'].map((n, i) => anim('float', label(1000 + i * 140, 300 + (i % 2) * 60, n, 70, i === 3 ? '#ff6b8b' : '#ffd84d'), -i * 0.7)).join('')}
  <g transform="translate(470 880)">${[0, 1, 2, 3, 4].map((i) => `<rect x="${-200 + i * 25}" y="${-90 - i * 90}" width="${400 - i * 50}" height="90" rx="12" fill="${i % 2 ? '#fff8e7' : '#ffd6e5'}" stroke="${L}" stroke-width="6"/>`).join('')}${[-60, 0, 60].map((x) => banana(x, -490, 0.9)).join('')}</g>
  ${long({ x: 160, y: 960, s: 1.0, mood: 'happy', arms: 'up' })}
  ${nam({ x: 820, y: 960, s: 0.95, mood: 'love' })}
  ${hoa({ x: 690, y: 980, s: 0.7, mood: 'happy' })}
  ${timeTag('Fri 9 p.m.', true)}`);

S[4] = () => svg(`${room()}
  ${sunbed(1060, 920, 1.25)}${cho({ x: 980, y: 880, s: 0.9, mood: 'shock', lying: true })}
  ${hoa({ x: 520, y: 960, s: 1.4, mood: 'cry', pyjamas: true, arms: 'hold' })}
  <g transform="translate(640 720)">${ringBox(0, 0, 0.9, { empty: true })}</g>
  <path d="M820 600 l 30 -10 M830 640 l 34 0 M820 680 l 30 10" stroke="${L}" stroke-width="6" stroke-linecap="round"/>
  ${bubble(140, 120, 720, 190, 'Chó! Help!\nWhat do I do?', { tx: 470, ty: 380, size: 54 })}
  ${label(1200, 640, '? ? ?', 70, '#e46f9f')}
  ${timeTag('Sat 7 a.m.')}`);

S[5] = () => svg(`${room({ curtainsBlow: true })}
  ${[0, 1, 2].map((i) => `<path d="M1000 ${240 + i * 80} q -80 -30 -160 0 t -160 0" fill="none" stroke="#8fb9df" stroke-width="7" stroke-linecap="round"/>`).join('')}
  <rect x="220" y="560" width="760" height="40" rx="10" fill="#8a5a2b" stroke="${L}" stroke-width="6"/><path d="M270 600 L 270 900 M930 600 L 930 900" stroke="#8a5a2b" stroke-width="22"/>
  <g transform="translate(600 520)">${ringBox(0, 0, 2.6, { empty: true })}</g>
  ${label(600, 250, '?', 200, C.red)}
  ${label(300, 440, 'EMPTY!', 64, C.red)}
  ${timeTag('Sat 7:10 a.m.')}`);

S[6] = () => svg(`${room({ curtainsBlow: true })}
  ${banana(640, 830, 2.6, true)}
  <path d="M960 560 L 760 760" stroke="${C.red}" stroke-width="10" stroke-dasharray="20 14"/><path d="M760 760 l 10 -44 l 34 30 z" fill="${C.red}"/>
  ${cho({ x: 1320, y: 980, s: 1.0, mood: 'shock', wave: false, glass: true })}
  ${label(520, 520, 'Fresh!', 60, '#8a6a1a')}
  ${timeTag('Sat 7:20 a.m.')}`);

S[7] = () => svg(`${garden()}
  ${long({ x: 800, y: 900, s: 1.35, mood: 'sweat', arms: 'hold', banana: true })}
  ${hoa({ x: 260, y: 960, s: 1.1, mood: 'angry', arms: 'point' })}
  ${linh({ x: 1240, y: 980, s: 1.05, mood: 'angry', flip: true })}
  ${nam({ x: 520, y: 990, s: 0.85, mood: 'sly', wings: 'point', flip: true })}
  ${bubble(380, 80, 760, 150, 'YOU took the ring!', { tx: 600, ty: 330, size: 66 })}
  ${[0, 1, 2].map((i) => `<path d="M${690 - i * 20} ${560 + i * 30} l -40 0 M${910 + i * 20} ${560 + i * 30} l 40 0" stroke="${L}" stroke-width="6"/>`).join('')}
  ${timeTag('Sat 8 a.m.')}`);

S[8] = () => svg(`${room({ window: false })}
  <rect x="380" y="60" width="840" height="860" rx="70" fill="#222" stroke="${L}" stroke-width="10"/>
  <rect x="420" y="130" width="760" height="700" rx="20" fill="#1d2340"/>
  <circle cx="1080" cy="220" r="44" fill="#fff4c2"/>
  <rect x="460" y="180" width="320" height="300" fill="#2b3a74" stroke="#555" stroke-width="8"/>
  <g opacity=".85"><path d="M600 470 L 606 390 Q 655 370 704 390 L 710 470 Z" fill="#000"/><circle cx="655" cy="345" r="40" fill="#000"/><path d="M640 392 l 15 8 l 15 -8 l 0 14 l -15 -8 l -15 8 z" fill="${C.red}"/></g>
  ${label(620, 520, '??', 40, '#ffd84d')}
  ${long({ x: 950, y: 830, s: 1.05, mood: 'happy', arms: 'up' })}
  ${['♪', '♫', '♪'].map((n, i) => anim('float', label(820 + i * 90, 300 + i * 40, n, 60, '#ffd84d'), -i * 0.8)).join('')}
  ${label(800, 790, '"Happy Party, Hoa!"', 44, '#fff')}
  <rect x="440" y="140" width="190" height="56" rx="12" fill="#c92f2f"/>${label(535, 180, '● 12:00', 36, '#fff')}
  <circle cx="800" cy="880" r="22" fill="#444"/>
  ${cho({ x: 1420, y: 980, s: 0.85, mood: 'shock', wave: false, glass: true })}
  ${hoa({ x: 200, y: 990, s: 0.95, mood: 'love' })}
  ${timeTag('Sat 9 a.m.')}`);

// a long party-shoe print: pointy front, small heel
const flatFoot = (x, y, r = 0, s = 1) => `<g transform="translate(${x} ${y}) rotate(${r}) scale(${s})" fill="#6bb6ea" stroke="#2d79b8" stroke-width="4" stroke-linejoin="round"><path d="M0 -52 Q 22 -30 18 0 Q 14 14 0 14 Q -14 14 -18 0 Q -22 -30 0 -52 Z"/><rect x="-14" y="22" width="28" height="22" rx="8"/></g>`;
const flipFlop = `<g fill="#c99a6b" stroke="${L}" stroke-width="5"><path d="M-80 70 Q -110 -10 -90 -60 Q -60 -90 -30 -60 Q -10 -10 -40 70 Q -60 84 -80 70 Z"/></g><path d="M-60 -50 L -80 -10 M-60 -50 L -40 -10" stroke="#5fb6e8" stroke-width="8" stroke-linecap="round"/>`;
S[9] = () => svg(`${room({ curtainsBlow: true })}
  <rect x="80" y="260" width="300" height="440" fill="#8a5a2b" stroke="${L}" stroke-width="8"/><rect x="110" y="290" width="240" height="410" fill="#4cb7e8"/>${label(230, 250, 'POOL →', 40)}
  ${Array.from({ length: 9 }, (_, i) => flatFoot(1150 - i * 105, 760 + (i % 2) * 70, -100, 1.2)).join('')}
  ${[0, 1, 2, 3].map((i) => `<path d="M${1000 - i * 200} ${700 + (i % 2) * 70} q -6 14 0 20 q 6 -6 0 -20z" fill="#9fd6ff"/>`).join('')}
  <g transform="translate(1290 640)"><rect x="-150" y="-110" width="300" height="250" rx="20" fill="#fff8e7" stroke="${L}" stroke-width="6"/>
    ${flipFlop}
    ${label(-55, 125, 'Long', 26)}${label(-55, -60, '', 20)}
    <path d="M-110 -70 L 0 80 M0 -70 L -110 80" stroke="${C.red}" stroke-width="10"/>
    ${flatFoot(80, 10, 0, 1.4)}${label(80, 125, '???', 26)}</g>
  ${label(800, 950, 'big • wet • party shoes', 50, '#2d79b8')}
  ${timeTag('Sat 10 a.m.')}`);

S[10] = () => svg(`${hall()}
  <path d="M520 940 L 540 560 L 860 560 L 880 940 M560 760 L 840 760" stroke="#8a5a2b" stroke-width="22" fill="none"/>
  <path d="M520 340 L 880 340 L 900 560 L 500 560 Z" fill="#8a5a2b" stroke="${L}" stroke-width="6"/>
  <path d="M560 300 Q 700 260 840 300 L 880 720 L 760 720 L 700 420 L 640 720 L 520 720 Z" fill="#25262e" stroke="${L}" stroke-width="6"/>
  <path d="M640 300 L 700 420 L 760 300" fill="#fbfbf7" stroke="${L}" stroke-width="4"/>
  <rect x="740" y="560" width="110" height="60" rx="6" fill="#1a1b22" stroke="#555" stroke-width="4"/>
  ${feather(800, 570, 1.5, 18)}
  ${label(600, 640, 'N', 54, '#ffd84d')}
  ${cho({ x: 1200, y: 960, s: 1.15, mood: 'shock', wave: false, glass: true })}
  ${label(1000, 260, 'PINK?!', 90, C.flamingoD)}
  ${timeTag('Sat 11 a.m.')}`);

S[11] = () => svg(`${hall()}
  <g transform="rotate(-4 860 420)"><rect x="440" y="90" width="840" height="640" fill="#fff" stroke="${L}" stroke-width="8"/>
  <rect x="480" y="130" width="760" height="520" fill="#1d2340"/><circle cx="1130" cy="200" r="40" fill="#fff4c2"/>
  <rect x="480" y="520" width="760" height="130" fill="#1f5d8a"/>
  ${nam({ x: 760, y: 590, s: 0.95, mood: 'love', wings: 'give' })}${vy({ x: 1000, y: 600, s: 0.95, mood: 'love', flip: true, wing: 'up' })}
  ${heart(860, 230, 34)}${heart(780, 180, 20)}${heart(950, 170, 24)}
  ${label(860, 700, 'Sat 12:00 a.m. • pool', 34, L)}</g>
  ${linh({ x: 230, y: 980, s: 1.25, mood: 'happy', camera: true })}
  ${cho({ x: 1420, y: 980, s: 0.9, mood: 'shock', wave: false })}
  ${timeTag('Sat 1 p.m.')}`);

S[12] = () => svg(`${pool()}
  <g transform="translate(780 740) rotate(-6)"><rect x="-240" y="-150" width="480" height="300" rx="10" fill="#fdf6e3" stroke="${L}" stroke-width="6"/>
  ${label(0, -80, 'My pink star,', 40, '#2a4ea0', 'middle', 700)}${label(0, -20, 'see you at midnight.', 40, '#2a4ea0', 'middle', 700)}${label(40, 60, 'Love, N', 46, '#2a4ea0', 'middle', 700)}${heart(150, 50, 22, '#ff6b8b')}
  ${[0, 1, 2].map((i) => `<path d="M${-200 + i * 140} 120 q 10 20 0 34" stroke="#7cc3ff" stroke-width="6" fill="none"/>`).join('')}</g>
  <ellipse cx="780" cy="900" rx="330" ry="30" fill="none" stroke="#fff" stroke-width="5" opacity=".7"/>
  ${cho({ x: 1360, y: 560, s: 0.85, mood: 'shock', wave: true })}
  ${label(300, 420, 'N = ?', 80, L)}
  ${timeTag('Sat 3 p.m.')}`);

S[13] = () => svg(`${hall()}
  ${nam({ x: 1100, y: 960, s: 1.5, mood: 'sweat', wings: 'up' })}
  ${cho({ x: 420, y: 960, s: 1.1, mood: 'grumpy', wave: true })}
  ${feather(520, 810, 1.3, 20)}
  <g transform="translate(300 830) rotate(-10)"><rect x="-80" y="-50" width="160" height="100" fill="#fdf6e3" stroke="${L}" stroke-width="5"/>${label(0, 10, 'Love, N', 28, '#2a4ea0')}</g>
  ${bubble(640, 70, 900, 220, 'Vy? She is only\na casual acquaintance!', { tx: 1060, ty: 380, size: 54 })}
  ${timeTag('Sat 5 p.m.')}`);

S[14] = () => svg(`${hall()}
  ${nam({ x: 560, y: 960, s: 1.3, mood: 'sly', wings: 'give', longNose: true })}
  ${flowers(830, 650, 1.3)}
  ${hoa({ x: 1230, y: 960, s: 1.3, mood: 'happy', arms: 'hold' })}
  ${bubble(120, 70, 760, 170, 'I slept all night,\nmy love!', { tx: 520, ty: 400, size: 54 })}
  ${label(330, 520, 'grow... grow...', 40, C.red)}
  ${cho({ x: 1500, y: 990, s: 0.55, mood: 'grumpy', wave: false })}
  ${timeTag('Sat 7 p.m.', true)}`);

S[15] = () => svg(`${hall({ night: true, stage: true })}
  ${vy({ x: 1240, y: 700, s: 1.3, mood: 'love', wing: 'up', ring: true })}
  ${heartBalloon(1460, 330, 0.9, 'N + V')}
  ${sparkle(1100, 330, 2.4)}${sparkle(1180, 420, 1.4)}
  ${hoa({ x: 300, y: 960, s: 1.15, mood: 'shock', arms: 'cheeks' })}
  ${long({ x: 580, y: 980, s: 0.85, mood: 'shock' })}
  ${nam({ x: 820, y: 990, s: 0.8, mood: 'sweat', flip: true })}${label(760, 660, '← sneak...', 34, '#fff')}
  ${cho({ x: 90, y: 990, s: 0.5, mood: 'shock', wave: false })}
  ${bubble(700, 110, 560, 120, 'Nam gave it to me!', { tx: 1100, ty: 330, size: 42 })}
  ${timeTag('Sat 9 p.m.', true)}`);

const court = () => svg(`<rect width="1600" height="1000" fill="#e9d2a6"/><rect y="760" width="1600" height="240" fill="#8a5a2b"/>
  ${[200, 600, 1000, 1400].map((x) => `<rect x="${x - 40}" y="80" width="80" height="680" fill="#f3e4c4" stroke="${L}" stroke-width="5"/>`).join('')}
  <rect x="520" y="420" width="560" height="340" fill="#7a4b22" stroke="${L}" stroke-width="8"/>${label(800, 600, 'COURT OF FISH', 44, '#ffd84d')}
  ${cho({ x: 800, y: 470, s: 0.9, mood: 'grumpy', wave: false, wig: true })}
  <g transform="translate(960 300) rotate(-30)"><rect x="-8" y="0" width="16" height="120" fill="#6b4b2b"/><path d="M-60 -20 Q 0 -60 60 -20 L 80 -40 L 80 20 L 60 0 Q 0 40 -60 0 Z" fill="#7fb7e6" stroke="${L}" stroke-width="5"/><circle cx="-36" cy="-12" r="5" fill="${L}"/></g>
  <rect x="1180" y="620" width="300" height="160" fill="#a87a4c" stroke="${L}" stroke-width="6"/>
  ${nam({ x: 1330, y: 660, s: 0.9, mood: 'sad' })}
  ${hoa({ x: 140, y: 980, s: 0.75, mood: 'angry' })}${vy({ x: 400, y: 980, s: 0.65, mood: 'angry' })}${long({ x: 1020, y: 990, s: 0.6, mood: 'happy' })}${linh({ x: 1540, y: 990, s: 0.55, mood: 'happy', flip: true })}
  `);

const lose = () => svg(`${pool({ night: false })}
  <rect y="480" width="1600" height="520" fill="#4cb7e8"/>
  ${Array.from({ length: 8 }, (_, i) => `<path d="M${i * 220} ${620 + (i % 3) * 90} q 40 -20 80 0 t 80 0" fill="none" stroke="#fff" stroke-width="5" opacity=".6"/>`).join('')}
  <g transform="translate(1050 640)"><path d="M-330 0 L 330 0 L 260 120 L -260 120 Z" fill="#fff" stroke="${L}" stroke-width="8"/>${label(0, 80, 'HONEYMOON EXPRESS', 40, '#e46f9f')}
  ${nam({ x: -120, y: 0, s: 0.8, mood: 'happy', wings: 'up' })}${vy({ x: 120, y: 0, s: 0.8, mood: 'love', wing: 'up', ring: true })}${heartBalloon(250, -380, 0.6, 'N + V')}</g>
  <rect x="0" y="660" width="460" height="60" fill="#8a5a2b" stroke="${L}" stroke-width="6"/>
  ${hoa({ x: 220, y: 680, s: 0.75, mood: 'cry', arms: 'up' })}
  ${sunbed(300, 980, 0.8)}${cho({ x: 120, y: 980, s: 0.55, mood: 'angry' })}
  ${bubble(40, 760, 260, 80, 'GRR!', { size: 40 })}
  ${label(1050, 180, 'Bye bye!', 80, '#e46f9f')}`);

// ---------------- portraits ----------------
const portrait = (body, bg = '#f3e4c4') => svg(`<rect width="400" height="400" rx="40" fill="${bg}"/>${body}`, 400, 400);
const P = {
  hoa: () => portrait(hoa({ x: 200, y: 520, s: 1.3, mood: 'happy' })),
  nam: () => portrait(nam({ x: 200, y: 490, s: 1.25, mood: 'sly' })),
  long: () => portrait(long({ x: 200, y: 500, s: 1.3, mood: 'happy', banana: true })),
  linh: () => portrait(linh({ x: 200, y: 560, s: 1.1, mood: 'happy' })),
  vy: () => portrait(vy({ x: 250, y: 500, s: 1.1, mood: 'happy' })),
  cho: () => portrait(cho({ x: 200, y: 440, s: 1.25, mood: 'happy' })),
  nobody: () => portrait(`${heart(200, 190, 110, '#ff8fb1')}${label(200, 215, 'HUG!', 60, '#fff')}${label(200, 360, '?', 70, L)}`),
};

// ---------------- write ----------------
for (const [n, fn] of Object.entries(S)) write(`scenes/scene-${String(n).padStart(2, '0')}.svg`, fn());
write('scenes/court.svg', court());
write('scenes/lose.svg', lose());
for (const [id, fn] of Object.entries(P)) {
  write(`characters/${id}.svg`, fn());
  if (id !== 'vy' && id !== 'cho') write(`suspects/${id}.svg`, fn());
}
console.log('Art written to public/assets/ (15 scenes, court, lose, characters, suspects).');
void ringShape; void glass; void camera;
