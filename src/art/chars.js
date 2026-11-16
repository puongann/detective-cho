// Hand-written SVG characters (original designs). Each function returns an SVG <g> string.
// Local coordinates: (0,0) = between the feet, the character goes UP (negative y), ~300 units tall.
// opts: { x, y, s (scale), flip, mood, ...props }

export const C = {
  line: '#4a3428', fur: '#efae5f', stripe: '#b8682c', belly: '#f6d6a8', blush: '#f4a3b5', bow: '#e46f9f',
  pandaW: '#fdfdfb', pandaB: '#2d2a2e', peng: '#25262e', pengBelly: '#fbfbf7', beak: '#f39a2b',
  monkey: '#9a6038', monkeyFace: '#f1cfa0', giraffe: '#f6c44d', spot: '#c97b2c', flamingo: '#f58bb0', flamingoD: '#d8638e',
  red: '#d84a4a', blue: '#4a7bd9', gold: '#f7c531', green: '#5bb36b',
};
const L = C.line;
const W = 6; // outline width

function wrap(inner, { x = 0, y = 0, s = 1, flip = false, rot = 0, mood = 'happy', still = false } = {}, kind = 'x') {
  // Outer <g> holds the placement transform; inner <g> is free for CSS animation (a CSS transform would replace the attribute).
  const d = -((Math.abs(x * 7 + y * 3) % 2900) / 1000).toFixed(2);
  return `<g transform="translate(${x} ${y}) scale(${flip ? -s : s} ${s})${rot ? ` rotate(${rot})` : ''}"><g class="${still ? '' : `ch ch-${kind} m-${mood}`}" style="--d:${d}s">${inner}</g></g>`;
}

// CSS animations embedded in every generated SVG (they run inside <img> too).
export const ANIM_CSS = `
.ch{animation:breathe 3.4s ease-in-out infinite;animation-delay:var(--d,0s);transform-box:fill-box;transform-origin:50% 100%}
.m-happy,.m-love{animation-name:hop;animation-duration:2.8s}
.m-shock{animation-name:shiver;animation-duration:2.4s}
.m-angry{animation-name:puff;animation-duration:1.3s}
.m-sad,.m-cry{animation-name:droop;animation-duration:4s}
.m-sleep{animation-name:snore;animation-duration:3.8s}
.m-sly,.m-sweat,.m-grumpy{animation-name:shifty;animation-duration:2.4s}
@keyframes breathe{50%{transform:scale(1.015,.985)}}
@keyframes hop{0%,58%,100%{transform:none}68%{transform:translateY(-16px) scale(.98,1.03)}78%{transform:scale(1.035,.965)}86%{transform:none}}
@keyframes shiver{0%,30%,100%{transform:none}4%{transform:translateX(-7px) rotate(-1.5deg)}8%{transform:translateX(7px) rotate(1.5deg)}12%{transform:translateX(-6px)}16%{transform:translateX(6px)}20%{transform:translateX(-3px)}}
@keyframes puff{50%{transform:scale(1.045,.965) translateY(2px)}}
@keyframes droop{50%{transform:scale(1.01,.97) rotate(-1.2deg)}}
@keyframes snore{50%{transform:scale(1.035,.965)}}
@keyframes shifty{0%,100%{transform:rotate(-2deg)}50%{transform:rotate(2deg)}}
.blink{animation:blink 4.6s infinite;animation-delay:var(--d,0s);transform-box:fill-box;transform-origin:50% 50%}
@keyframes blink{0%,91%,100%{transform:none}94%{transform:scaleY(.1)}}
.drip{animation:drip 1.8s ease-in infinite;animation-delay:var(--d,0s)}
.drip+.drip{animation-delay:calc(var(--d,0s) - .9s)}
@keyframes drip{0%{transform:translateY(-8px);opacity:0}25%{opacity:1}100%{transform:translateY(34px);opacity:0}}
.zz{animation:zz 3s ease-in-out infinite}
@keyframes zz{0%{transform:translate(0,14px);opacity:0}30%{opacity:1}100%{transform:translate(24px,-34px);opacity:0}}
.twinkle{animation:tw 1.8s ease-in-out infinite;animation-delay:var(--d,0s);transform-box:fill-box;transform-origin:50% 50%}
@keyframes tw{0%,100%{transform:scale(.7) rotate(0);opacity:.75}50%{transform:scale(1.18) rotate(45deg);opacity:1}}
.sway{animation:sway 3.4s ease-in-out infinite;animation-delay:var(--d,0s);transform-box:fill-box;transform-origin:50% 100%}
@keyframes sway{0%,100%{transform:rotate(-3deg) translateY(0)}50%{transform:rotate(3deg) translateY(-14px)}}
.beat{animation:beat 1.3s ease-in-out infinite;animation-delay:var(--d,0s);transform-box:fill-box;transform-origin:50% 50%}
@keyframes beat{0%,60%,100%{transform:scale(1)}12%{transform:scale(1.16)}24%{transform:scale(.96)}36%{transform:scale(1.08)}}
.tail{animation:wag 1.7s ease-in-out infinite;transform-origin:60px -40px}
@keyframes wag{50%{transform:rotate(10deg)}}
.paw{animation:paw 1s ease-in-out infinite;transform-origin:56px -112px}
@keyframes paw{50%{transform:rotate(-18deg)}}
.float{animation:float 3.2s ease-in-out infinite;animation-delay:var(--d,0s)}
@keyframes float{50%{transform:translateY(-18px)}}
.ripple{animation:ripple 2.8s ease-in-out infinite;animation-delay:var(--d,0s)}
@keyframes ripple{50%{transform:translateX(26px);opacity:.3}}
.flutter{animation:flutter 2.4s ease-in-out infinite;animation-delay:var(--d,0s);transform-box:fill-box;transform-origin:50% 0}
@keyframes flutter{50%{transform:rotate(9deg)}}
.glow{animation:glow 2.6s ease-in-out infinite}
@keyframes glow{50%{opacity:.35}}
@media (prefers-reduced-motion:reduce){*{animation:none!important}}
`;
/** Wrap any piece in an animation group: anim('float', svg, -1.2) */
export const anim = (cls, inner, d = 0) => `<g class="${cls}"${d ? ` style="--d:${d}s"` : ''}>${inner}</g>`;

// ---------- faces ----------
export function eyes(mood, cx, cy, gap, r = 7) {
  const e = eyesRaw(mood, cx, cy, gap, r);
  if (mood === 'love') return `<g class="beat">${e}</g>`;
  if (['happy', 'sleep', 'cry'].includes(mood)) return e;
  return `<g class="blink">${e}</g>`;
}
function eyesRaw(mood, cx, cy, gap, r) {
  const xs = [cx - gap, cx + gap];
  switch (mood) {
    case 'happy': return xs.map((x) => `<path d="M${x - 12} ${cy + 3} Q ${x} ${cy - 11} ${x + 12} ${cy + 3}" fill="none" stroke="${L}" stroke-width="5" stroke-linecap="round"/>`).join('');
    case 'sleep': return xs.map((x) => `<path d="M${x - 11} ${cy} Q ${x} ${cy + 7} ${x + 11} ${cy}" fill="none" stroke="${L}" stroke-width="5" stroke-linecap="round"/>`).join('');
    case 'shock': return xs.map((x) => `<circle cx="${x}" cy="${cy}" r="${r + 5}" fill="#fff" stroke="${L}" stroke-width="4"/><circle cx="${x}" cy="${cy}" r="${r - 2}" fill="${L}"/>`).join('');
    case 'angry': return xs.map((x, i) => `<circle cx="${x}" cy="${cy + 2}" r="${r}" fill="${L}"/><path d="M${x - 14} ${cy - 14 + (i ? 6 : 0)} L ${x + 14} ${cy - 14 + (i ? 0 : 6)}" stroke="${L}" stroke-width="6" stroke-linecap="round"/>`).join('');
    case 'sad': return xs.map((x, i) => `<circle cx="${x}" cy="${cy + 2}" r="${r}" fill="${L}"/><path d="M${x - 12} ${cy - 10 + (i ? 0 : 6)} L ${x + 12} ${cy - 10 + (i ? 6 : 0)}" stroke="${L}" stroke-width="5" stroke-linecap="round"/>`).join('');
    case 'cry': return xs.map((x) => `<path d="M${x - 11} ${cy} Q ${x} ${cy + 8} ${x + 11} ${cy}" fill="none" stroke="${L}" stroke-width="5" stroke-linecap="round"/><path d="M${x} ${cy + 8} q -8 16 0 26 q 8 -10 0 -26z" fill="#7cc3ff" stroke="#3d8fd6" stroke-width="2"/>`).join('');
    case 'love': return xs.map((x) => heartPath(x, cy - 2, 13, C.red)).join('');
    case 'sly': return xs.map((x) => `<path d="M${x - 12} ${cy} L ${x + 12} ${cy}" stroke="${L}" stroke-width="5" stroke-linecap="round"/><circle cx="${x + 5}" cy="${cy + 3}" r="4" fill="${L}"/>`).join('');
    default: return xs.map((x) => `<circle cx="${x}" cy="${cy}" r="${r}" fill="${L}"/><circle cx="${x + 2.5}" cy="${cy - 2.5}" r="2.4" fill="#fff"/>`).join('');
  }
}
export function mouth(mood, cx, cy, w = 14) {
  switch (mood) {
    case 'happy': case 'love': return `<path d="M${cx - w} ${cy - 2} Q ${cx} ${cy + w * 1.3} ${cx + w} ${cy - 2} Z" fill="#c9505f" stroke="${L}" stroke-width="4" stroke-linejoin="round"/>`;
    case 'shock': return `<ellipse cx="${cx}" cy="${cy + 4}" rx="${w * 0.6}" ry="${w * 0.8}" fill="#7a2b36" stroke="${L}" stroke-width="4"/>`;
    case 'angry': return `<path d="M${cx - w} ${cy + 6} Q ${cx} ${cy - 6} ${cx + w} ${cy + 6}" fill="none" stroke="${L}" stroke-width="5" stroke-linecap="round"/><path d="M${cx - w + 4} ${cy + 3} L ${cx + w - 4} ${cy + 3}" stroke="#fff" stroke-width="3"/>`;
    case 'sad': case 'cry': return `<path d="M${cx - w} ${cy + 6} Q ${cx} ${cy - 4} ${cx + w} ${cy + 6}" fill="none" stroke="${L}" stroke-width="5" stroke-linecap="round"/>`;
    case 'sleep': return `<ellipse cx="${cx}" cy="${cy + 2}" rx="5" ry="4" fill="#c9505f" stroke="${L}" stroke-width="3"/>`;
    case 'sly': return `<path d="M${cx - w} ${cy} Q ${cx + 2} ${cy + 10} ${cx + w + 4} ${cy - 6}" fill="none" stroke="${L}" stroke-width="5" stroke-linecap="round"/>`;
    case 'sweat': return `<path d="M${cx - w} ${cy + 2} q ${w / 2} -6 ${w} 0 q ${w / 2} 6 ${w} 0" fill="none" stroke="${L}" stroke-width="5" stroke-linecap="round"/>`;
    default: return `<path d="M${cx - w * 0.8} ${cy} Q ${cx} ${cy + w} ${cx + w * 0.8} ${cy}" fill="none" stroke="${L}" stroke-width="5" stroke-linecap="round"/>`;
  }
}
export function heartPath(x, y, s, fill = C.red, stroke = L) {
  return `<path d="M${x} ${y + s * 0.9} C ${x - s * 1.6} ${y - s * 0.2} ${x - s * 0.9} ${y - s * 1.4} ${x} ${y - s * 0.5} C ${x + s * 0.9} ${y - s * 1.4} ${x + s * 1.6} ${y - s * 0.2} ${x} ${y + s * 0.9} Z" fill="${fill}" stroke="${stroke}" stroke-width="${Math.max(2, s / 6)}" stroke-linejoin="round"/>`;
}
const blush = (x, y, r = 11) => `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 0.6}" fill="${C.blush}" opacity=".8"/>`;
const sweat = (x, y) => `<path class="drip" d="M${x} ${y} q -9 16 0 22 q 9 -6 0 -22z" fill="#9fd6ff" stroke="#3d8fd6" stroke-width="2.5"/>`;

// ---------- Chó: orange cat, pink bow (based on the teacher's picture) ----------
export function cho(o = {}) {
  const m = o.mood || 'happy';
  const wave = o.wave !== false && !o.lying;
  const inner = o.lying
    ? choLying(m)
    : `
  <path class="tail" d="M60 -40 C 120 -50 120 -150 86 -170 C 76 -176 70 -168 78 -160 C 100 -140 98 -80 58 -70" fill="${C.fur}" stroke="${L}" stroke-width="${W}" stroke-linejoin="round"/>
  <ellipse cx="0" cy="-62" rx="66" ry="68" fill="${C.fur}" stroke="${L}" stroke-width="${W}"/>
  <ellipse cx="2" cy="-48" rx="32" ry="30" fill="${C.belly}"/>
  <ellipse cx="-34" cy="-4" rx="30" ry="16" fill="${C.fur}" stroke="${L}" stroke-width="${W}"/>
  <ellipse cx="34" cy="-4" rx="30" ry="16" fill="${C.fur}" stroke="${L}" stroke-width="${W}"/>
  <ellipse cx="-62" cy="-56" rx="18" ry="30" fill="${C.fur}" stroke="${L}" stroke-width="${W}" transform="rotate(-12 -62 -56)"/>
  ${wave ? `<g class="paw"><ellipse cx="74" cy="-150" rx="20" ry="32" fill="${C.fur}" stroke="${L}" stroke-width="${W}" transform="rotate(-14 74 -150)"/></g>` : `<ellipse cx="62" cy="-60" rx="18" ry="30" fill="${C.fur}" stroke="${L}" stroke-width="${W}" transform="rotate(12 62 -60)"/>`}
  ${choHead(m, -170)}
  ${o.glass ? glass(70, -140, 1) : ''}
  ${o.hat ? `<path d="M-70 -228 Q 0 -262 70 -228 L 56 -218 Q 0 -240 -56 -218 Z" fill="#7a5a3a" stroke="${L}" stroke-width="5"/><path d="M-44 -232 Q 0 -300 44 -232 Z" fill="#8a6a48" stroke="${L}" stroke-width="5"/>` : ''}
  ${o.wig ? `<g fill="#f4f1ea" stroke="${L}" stroke-width="4">${[-118, 118].map((x) => `<circle cx="${x}" cy="-176" r="20"/><circle cx="${x}" cy="-140" r="18"/><circle cx="${x}" cy="-106" r="16"/>`).join('')}<path d="M-110 -200 Q 0 -300 110 -200 Q 0 -250 -110 -200Z"/></g>` : ''}
  ${m === 'sleep' ? `<text class="zz" x="80" y="-250" font-size="40" font-weight="900" fill="#6c7bd1" font-family="Arial">z Z</text>` : ''}`;
  return wrap(inner, o, 'cho');
}
function choHead(m, cy) {
  return `
  <path d="M-86 ${cy - 30} L -70 ${cy - 102} Q -64 ${cy - 112} -54 ${cy - 104} L -24 ${cy - 62} Z" fill="${C.fur}" stroke="${L}" stroke-width="${W}" stroke-linejoin="round"/>
  <path d="M-72 ${cy - 46} L -64 ${cy - 90} L -40 ${cy - 62} Z" fill="${C.blush}"/>
  <path d="M86 ${cy - 30} L 70 ${cy - 102} Q 64 ${cy - 112} 54 ${cy - 104} L 24 ${cy - 62} Z" fill="${C.fur}" stroke="${L}" stroke-width="${W}" stroke-linejoin="round"/>
  <path d="M72 ${cy - 46} L 64 ${cy - 90} L 40 ${cy - 62} Z" fill="${C.blush}"/>
  <ellipse cx="0" cy="${cy}" rx="104" ry="76" fill="${C.fur}" stroke="${L}" stroke-width="${W}"/>
  <path d="M-22 ${cy - 74} l 3 26 M0 ${cy - 76} l 0 28 M22 ${cy - 74} l -3 26" stroke="${C.stripe}" stroke-width="8" stroke-linecap="round"/>
  <path d="M-104 ${cy - 4} l 26 4 M-102 ${cy + 16} l 24 -2 M104 ${cy - 4} l -26 4 M102 ${cy + 16} l -24 -2" stroke="${C.stripe}" stroke-width="7" stroke-linecap="round"/>
  ${eyes(m, 0, cy - 4, 40)}
  ${mouth(m === 'happy' ? 'happy' : m === 'sleep' ? 'sleep' : m, 0, cy + 22, 10)}
  ${blush(-62, cy + 24, 13)}${blush(62, cy + 24, 13)}
  <g transform="translate(66 ${cy - 86}) rotate(18)"><path d="M0 0 L -34 -20 Q -42 0 -34 20 Z M0 0 L 34 -20 Q 42 0 34 20 Z" fill="${C.bow}" stroke="#a83e6c" stroke-width="4" stroke-linejoin="round"/><circle r="10" fill="${C.bow}" stroke="#a83e6c" stroke-width="4"/></g>
  ${m === 'grumpy' ? `<path d="M-58 ${cy - 26} l 30 8 M58 ${cy - 26} l -30 8" stroke="${L}" stroke-width="6" stroke-linecap="round"/>` : ''}`;
}
function choLying(m) {
  return `
  <path d="M140 -30 C 210 -30 220 -90 190 -100" fill="none" stroke="${L}" stroke-width="22" stroke-linecap="round"/>
  <path d="M140 -30 C 210 -30 220 -90 190 -100" fill="none" stroke="${C.fur}" stroke-width="12" stroke-linecap="round"/>
  <ellipse cx="60" cy="-40" rx="100" ry="42" fill="${C.fur}" stroke="${L}" stroke-width="${W}"/>
  <ellipse cx="60" cy="-30" rx="60" ry="20" fill="${C.belly}"/>
  ${choHead(m, -76)}
  ${m === 'sleep' ? `<text class="zz" x="120" y="-190" font-size="44" font-weight="900" fill="#6c7bd1" font-family="Arial">z Z</text>` : ''}`;
}
export function glass(x, y, s = 1) {
  return `<g transform="translate(${x} ${y}) scale(${s})"><path d="M18 18 L 52 56" stroke="#6b4b2b" stroke-width="12" stroke-linecap="round"/><circle cx="0" cy="0" r="30" fill="rgba(200,235,255,.55)" stroke="#555" stroke-width="7"/></g>`;
}

// ---------- Panda: kind, sunflower on her head ----------
export function panda(o = {}) {
  const m = o.mood || 'happy';
  const cy = -190;
  const arms = o.arms || 'down';
  const armL = arms === 'up' ? `<ellipse cx="-74" cy="-160" rx="20" ry="40" fill="${C.pandaB}" transform="rotate(30 -74 -160)"/>` : arms === 'cheeks' ? `<ellipse cx="-60" cy="-150" rx="20" ry="40" fill="${C.pandaB}" transform="rotate(20 -60 -150)"/>` : arms === 'point' ? `<ellipse cx="-70" cy="-90" rx="20" ry="40" fill="${C.pandaB}" transform="rotate(20 -70 -90)"/>` : `<ellipse cx="-66" cy="-90" rx="20" ry="40" fill="${C.pandaB}" transform="rotate(14 -66 -90)"/>`;
  const armR = arms === 'up' ? `<ellipse cx="74" cy="-160" rx="20" ry="40" fill="${C.pandaB}" transform="rotate(-30 74 -160)"/>` : arms === 'cheeks' ? `<ellipse cx="60" cy="-150" rx="20" ry="40" fill="${C.pandaB}" transform="rotate(-20 60 -150)"/>` : arms === 'point' ? `<ellipse cx="96" cy="-118" rx="18" ry="46" fill="${C.pandaB}" transform="rotate(-70 96 -118)"/>` : arms === 'hold' ? `<ellipse cx="60" cy="-120" rx="20" ry="38" fill="${C.pandaB}" transform="rotate(-50 60 -120)"/>` : `<ellipse cx="66" cy="-90" rx="20" ry="40" fill="${C.pandaB}" transform="rotate(-14 66 -90)"/>`;
  const inner = `
  <ellipse cx="-30" cy="-10" rx="28" ry="18" fill="${C.pandaB}"/><ellipse cx="30" cy="-10" rx="28" ry="18" fill="${C.pandaB}"/>
  <ellipse cx="0" cy="-80" rx="66" ry="74" fill="${o.pyjamas ? '#bcd7ff' : C.pandaW}" stroke="${L}" stroke-width="${W}"/>
  ${o.pyjamas ? `<path d="M-60 -110 L 60 -110 M-64 -80 L 64 -80 M-60 -50 L 60 -50" stroke="#fff" stroke-width="8"/>` : ''}
  ${armL}${armR}
  <circle cx="-56" cy="${cy - 62}" r="26" fill="${C.pandaB}"/><circle cx="56" cy="${cy - 62}" r="26" fill="${C.pandaB}"/>
  <ellipse cx="0" cy="${cy}" rx="82" ry="70" fill="${C.pandaW}" stroke="${L}" stroke-width="${W}"/>
  <ellipse cx="-30" cy="${cy}" rx="22" ry="28" fill="${C.pandaB}" transform="rotate(25 -30 ${cy})"/>
  <ellipse cx="30" cy="${cy}" rx="22" ry="28" fill="${C.pandaB}" transform="rotate(-25 30 ${cy})"/>
  ${m === 'happy' || m === 'sleep' || m === 'cry' ? eyes(m, 0, cy, 30).replace(/stroke="#4a3428"/g, 'stroke="#fff"') : eyes(m, 0, cy, 30).replace(/fill="#4a3428"/g, 'fill="#fff"').replace(/stroke="#4a3428"/g, 'stroke="#fff"')}
  ${m === 'cry' ? '' : ''}
  <ellipse cx="0" cy="${cy + 22}" rx="10" ry="7" fill="${C.pandaB}"/>
  ${mouth(m, 0, cy + 38, 10)}
  ${blush(-52, cy + 30)}${blush(52, cy + 30)}
  ${sunflower(-48, cy - 54, 0.8)}
  ${o.sweat ? sweat(70, cy - 30) : ''}`;
  return wrap(inner, o, 'panda');
}
export function sunflower(x, y, s = 1) {
  return `<g transform="translate(${x} ${y}) scale(${s})">${Array.from({ length: 10 }, (_, i) => `<ellipse cx="0" cy="-20" rx="9" ry="18" fill="#ffd23f" stroke="#d29a1c" stroke-width="2" transform="rotate(${i * 36})"/>`).join('')}<circle r="13" fill="#7a4b22" stroke="#4a2f16" stroke-width="2"/></g>`;
}

// ---------- Penguin: black jacket look, red bow tie, always an excuse ----------
export function penguin(o = {}) {
  const m = o.mood || 'happy';
  const cy = -190;
  const beakLen = o.longBeak ? 300 : 26;
  const wings = o.wings || 'down';
  const wingL = wings === 'up' ? `<path d="M-58 -150 Q -120 -230 -96 -250 Q -80 -200 -50 -170 Z" fill="${C.peng}" stroke="${L}" stroke-width="5"/>` : wings === 'point' ? `<path d="M-58 -120 Q -150 -140 -160 -126 Q -110 -110 -56 -96 Z" fill="${C.peng}" stroke="${L}" stroke-width="5"/>` : `<path d="M-60 -140 Q -100 -90 -80 -50 Q -64 -80 -54 -110 Z" fill="${C.peng}" stroke="${L}" stroke-width="5"/>`;
  const wingR = wings === 'up' ? `<path d="M58 -150 Q 120 -230 96 -250 Q 80 -200 50 -170 Z" fill="${C.peng}" stroke="${L}" stroke-width="5"/>` : wings === 'give' ? `<path d="M58 -130 Q 130 -130 150 -120 Q 110 -100 54 -100 Z" fill="${C.peng}" stroke="${L}" stroke-width="5"/>` : `<path d="M60 -140 Q 100 -90 80 -50 Q 64 -80 54 -110 Z" fill="${C.peng}" stroke="${L}" stroke-width="5"/>`;
  const inner = `
  <ellipse cx="-26" cy="-6" rx="26" ry="11" fill="${C.beak}" stroke="${L}" stroke-width="4"/><ellipse cx="26" cy="-6" rx="26" ry="11" fill="${C.beak}" stroke="${L}" stroke-width="4"/>
  <path d="M0 -270 C 80 -270 80 -110 66 -60 C 56 -10 -56 -10 -66 -60 C -80 -110 -80 -270 0 -270 Z" fill="${C.peng}" stroke="${L}" stroke-width="${W}"/>
  <path d="M0 -200 C 50 -200 52 -100 44 -60 C 36 -26 -36 -26 -44 -60 C -52 -100 -50 -200 0 -200 Z" fill="${C.pengBelly}"/>
  ${wingL}${wingR}
  <path d="M-22 -184 L 0 -174 L 22 -184 L 22 -160 L 0 -170 L -22 -160 Z" fill="${C.red}" stroke="${L}" stroke-width="3"/>
  <ellipse cx="-24" cy="${cy - 36}" rx="17" ry="19" fill="#fff"/><ellipse cx="24" cy="${cy - 36}" rx="17" ry="19" fill="#fff"/>
  ${eyes(m, 0, cy - 36, 24, 6)}
  <path d="M-14 ${cy - 14} L ${beakLen > 30 ? 0 : 0} ${cy - 14 + 0} L 14 ${cy - 14} L 0 ${cy - 14 + beakLen * 0.5} Z" fill="${C.beak}" stroke="${L}" stroke-width="4" stroke-linejoin="round" ${o.longBeak ? `transform="rotate(-70 0 ${cy - 14})"` : ''}/>
  ${blush(-40, cy - 6, 9)}${blush(40, cy - 6, 9)}
  ${m === 'sly' || m === 'sweat' ? `<path d="M-10 ${cy + 6} q 10 8 20 0" fill="none" stroke="${L}" stroke-width="4"/>` : ''}
  ${o.sweat || m === 'sweat' ? sweat(-60, cy - 50) + sweat(58, cy - 20) : ''}`;
  return wrap(inner, o, 'penguin');
}

// ---------- Monkey: bananas and jokes ----------
export function monkey(o = {}) {
  const m = o.mood || 'happy';
  const cy = -180;
  const inner = `
  <path d="M40 -40 C 120 -40 130 -140 90 -150 C 70 -154 70 -130 86 -130" fill="none" stroke="${L}" stroke-width="18" stroke-linecap="round"/>
  <path d="M40 -40 C 120 -40 130 -140 90 -150 C 70 -154 70 -130 86 -130" fill="none" stroke="${C.monkey}" stroke-width="9" stroke-linecap="round"/>
  <ellipse cx="-24" cy="-8" rx="22" ry="12" fill="${C.monkey}" stroke="${L}" stroke-width="5"/><ellipse cx="24" cy="-8" rx="22" ry="12" fill="${C.monkey}" stroke="${L}" stroke-width="5"/>
  <ellipse cx="0" cy="-70" rx="52" ry="62" fill="${C.monkey}" stroke="${L}" stroke-width="${W}"/>
  <ellipse cx="0" cy="-60" rx="30" ry="38" fill="${C.monkeyFace}"/>
  ${o.arms === 'up' ? `<path d="M-46 -100 Q -90 -160 -80 -200" stroke="${L}" stroke-width="26" stroke-linecap="round" fill="none"/><path d="M-46 -100 Q -90 -160 -80 -200" stroke="${C.monkey}" stroke-width="16" stroke-linecap="round" fill="none"/><path d="M46 -100 Q 90 -160 80 -200" stroke="${L}" stroke-width="26" stroke-linecap="round" fill="none"/><path d="M46 -100 Q 90 -160 80 -200" stroke="${C.monkey}" stroke-width="16" stroke-linecap="round" fill="none"/>`
    : `<path d="M-46 -100 Q -86 -70 -70 -36" stroke="${L}" stroke-width="26" stroke-linecap="round" fill="none"/><path d="M-46 -100 Q -86 -70 -70 -36" stroke="${C.monkey}" stroke-width="16" stroke-linecap="round" fill="none"/><path d="M46 -100 Q ${o.arms === 'hold' ? '90 -130 84 -150' : '86 -70 70 -36'}" stroke="${L}" stroke-width="26" stroke-linecap="round" fill="none"/><path d="M46 -100 Q ${o.arms === 'hold' ? '90 -130 84 -150' : '86 -70 70 -36'}" stroke="${C.monkey}" stroke-width="16" stroke-linecap="round" fill="none"/>`}
  <circle cx="-74" cy="${cy}" r="26" fill="${C.monkeyFace}" stroke="${L}" stroke-width="${W}"/><circle cx="74" cy="${cy}" r="26" fill="${C.monkeyFace}" stroke="${L}" stroke-width="${W}"/>
  <circle cx="0" cy="${cy}" r="68" fill="${C.monkey}" stroke="${L}" stroke-width="${W}"/>
  <path d="M-50 ${cy + 10} C -50 ${cy - 50} -6 ${cy - 30} 0 ${cy - 14} C 6 ${cy - 30} 50 ${cy - 50} 50 ${cy + 10} C 50 ${cy + 60} -50 ${cy + 60} -50 ${cy + 10} Z" fill="${C.monkeyFace}"/>
  ${eyes(m, 0, cy - 8, 22, 7)}
  <ellipse cx="-6" cy="${cy + 14}" rx="3" ry="2.5" fill="${L}"/><ellipse cx="6" cy="${cy + 14}" rx="3" ry="2.5" fill="${L}"/>
  ${mouth(m, 0, cy + 28, 18)}
  ${o.banana ? banana(o.arms === 'hold' ? 84 : 70, o.arms === 'hold' ? -165 : -40, 0.9) : ''}
  ${o.sweat || m === 'sweat' ? sweat(-56, cy - 50) + sweat(60, cy - 40) : ''}`;
  return wrap(inner, o, 'monkey');
}
export function banana(x, y, s = 1, peel = false) {
  if (peel) {
    return `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 0 Q -10 -40 0 -50 Q 10 -40 0 0Z M0 -10 Q -50 0 -60 30 Q -30 10 0 0Z M0 -10 Q 50 0 60 30 Q 30 10 0 0Z M0 -6 Q -10 30 -30 50 Q 4 30 6 -4Z" fill="#ffd84d" stroke="#8a6a1a" stroke-width="5" stroke-linejoin="round"/><path d="M0 -50 l0 -10" stroke="#5a4210" stroke-width="7"/></g>`;
  }
  return `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-10 -40 Q -40 10 10 40 Q 30 46 34 38 Q -10 20 4 -36 Z" fill="#ffd84d" stroke="#8a6a1a" stroke-width="5" stroke-linejoin="round"/><path d="M-10 -40 l -2 -10" stroke="#5a4210" stroke-width="7"/></g>`;
}

// ---------- Giraffe: long neck, sees everything, camera ----------
export function giraffe(o = {}) {
  const m = o.mood || 'happy';
  const top = -380;
  const inner = `
  <rect x="-40" y="-60" width="20" height="60" rx="8" fill="${C.giraffe}" stroke="${L}" stroke-width="5"/><rect x="20" y="-60" width="20" height="60" rx="8" fill="${C.giraffe}" stroke="${L}" stroke-width="5"/>
  <ellipse cx="0" cy="-90" rx="58" ry="52" fill="${C.giraffe}" stroke="${L}" stroke-width="${W}"/>
  <path d="M-22 -120 L -26 ${top + 40} L 22 ${top + 40} L 22 -120 Z" fill="${C.giraffe}" stroke="${L}" stroke-width="${W}" stroke-linejoin="round"/>
  ${[[-8, -150], [8, -200], [-10, -250], [6, -300]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="9" fill="${C.spot}"/>`).join('')}
  <circle cx="-28" cy="-96" r="12" fill="${C.spot}"/><circle cx="24" cy="-80" r="10" fill="${C.spot}"/>
  ${o.arms === 'point' ? `<path d="M30 -100 Q 90 -140 110 -150" stroke="${L}" stroke-width="18" stroke-linecap="round" fill="none"/><path d="M30 -100 Q 90 -140 110 -150" stroke="${C.giraffe}" stroke-width="9" stroke-linecap="round" fill="none"/>` : ''}
  <path d="M-16 ${top} l -4 -34 M16 ${top} l 4 -34" stroke="${L}" stroke-width="7"/><circle cx="-20" cy="${top - 36}" r="8" fill="${C.spot}" stroke="${L}" stroke-width="4"/><circle cx="20" cy="${top - 36}" r="8" fill="${C.spot}" stroke="${L}" stroke-width="4"/>
  <ellipse cx="-46" cy="${top + 2}" rx="20" ry="9" fill="${C.giraffe}" stroke="${L}" stroke-width="4" transform="rotate(-20 -46 ${top + 2})"/><ellipse cx="46" cy="${top + 2}" rx="20" ry="9" fill="${C.giraffe}" stroke="${L}" stroke-width="4" transform="rotate(20 46 ${top + 2})"/>
  <ellipse cx="0" cy="${top + 20}" rx="42" ry="48" fill="${C.giraffe}" stroke="${L}" stroke-width="${W}"/>
  <ellipse cx="0" cy="${top + 46}" rx="30" ry="22" fill="#f8dc8c"/>
  ${eyes(m, 0, top + 10, 18, 6)}
  ${m === 'happy' || m === 'default' || !o.mood ? `<path d="M-30 ${top + 2} l -6 -6 M-24 ${top - 2} l -3 -8 M30 ${top + 2} l 6 -6 M24 ${top - 2} l 3 -8" stroke="${L}" stroke-width="3"/>` : ''}
  ${mouth(m, 0, top + 50, 10)}
  ${o.camera ? camera(0, -150, 0.9) : ''}`;
  return wrap(inner, o, 'giraffe');
}
export function camera(x, y, s = 1) {
  return `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-20 -120 Q -50 -60 -30 -20 M20 -120 Q 50 -60 30 -20" stroke="#333" stroke-width="4" fill="none"/><rect x="-42" y="-26" width="84" height="56" rx="10" fill="#444" stroke="${L}" stroke-width="5"/><circle cx="0" cy="2" r="18" fill="#7fb7e6" stroke="#222" stroke-width="5"/><rect x="18" y="-34" width="16" height="10" fill="#444"/></g>`;
}

// ---------- Flamingo: pink hotel singer ----------
export function flamingo(o = {}) {
  const m = o.mood || 'happy';
  const inner = `
  <path d="M-6 0 L -6 -120 M14 -60 L 14 -120" stroke="${C.flamingoD}" stroke-width="7" stroke-linecap="round"/>
  <path d="M14 -60 L 30 -70" stroke="${C.flamingoD}" stroke-width="7" stroke-linecap="round"/>
  <path d="M-20 0 L 8 0" stroke="${C.flamingoD}" stroke-width="7" stroke-linecap="round"/>
  <ellipse cx="0" cy="-160" rx="70" ry="48" fill="${C.flamingo}" stroke="${L}" stroke-width="${W}"/>
  <path d="M30 -170 Q 90 -200 70 -150 Q 60 -140 30 -150Z" fill="${C.flamingoD}" stroke="${L}" stroke-width="4"/>
  ${o.wing === 'up' ? `<path d="M-40 -170 Q -110 -230 -100 -270 Q -70 -220 -30 -190Z" fill="${C.flamingoD}" stroke="${L}" stroke-width="5"/>` : `<path d="M-50 -170 Q -20 -130 30 -150 Q 0 -190 -50 -170Z" fill="${C.flamingoD}" stroke="${L}" stroke-width="4"/>`}
  <path d="M-46 -180 C -90 -240 -20 -270 -26 -320 C -30 -350 -70 -350 -60 -310" fill="none" stroke="${L}" stroke-width="30" stroke-linecap="round"/>
  <path d="M-46 -180 C -90 -240 -20 -270 -26 -320 C -30 -350 -70 -350 -60 -310" fill="none" stroke="${C.flamingo}" stroke-width="19" stroke-linecap="round"/>
  <circle cx="-40" cy="-332" r="34" fill="${C.flamingo}" stroke="${L}" stroke-width="${W}"/>
  <path d="M-72 -330 Q -100 -320 -96 -290 Q -86 -300 -74 -312 Z" fill="#fff" stroke="${L}" stroke-width="4"/><path d="M-96 -290 Q -94 -282 -88 -296Z" fill="${L}"/>
  ${eyes(m, -34, -340, 0, 5)}
  <path d="M-58 -352 l -6 -6 M-50 -358 l -2 -8" stroke="${L}" stroke-width="3"/>
  ${blush(-24, -322, 8)}
  <circle cx="-14" cy="-314" r="5" fill="${C.gold}" stroke="${L}" stroke-width="2"/>
  ${o.mic ? `<g><path d="M-100 -280 L -80 -230" stroke="#333" stroke-width="8"/><circle cx="-104" cy="-290" r="14" fill="#666" stroke="#222" stroke-width="4"/></g>` : ''}
  ${o.ring ? `<g transform="translate(-100 -275)">${ringShape(0, 0, 1.2)}${sparkle(20, -24, 1.2)}</g>` : ''}`;
  return wrap(inner, o, 'flamingo');
}

// ---------- props ----------
export function ringShape(x, y, s = 1) {
  return `<g transform="translate(${x} ${y}) scale(${s})"><circle r="14" fill="none" stroke="${C.gold}" stroke-width="6"/><circle r="14" fill="none" stroke="#a87c10" stroke-width="1.5"/><path d="M-10 -14 L 0 -32 L 10 -14 Z" fill="#bfefff" stroke="#3d8fd6" stroke-width="3" stroke-linejoin="round"/></g>`;
}
export function sparkle(x, y, s = 1, fill = '#fff6a8') {
  const d = -((Math.abs(x * 13 + y * 7) % 1800) / 1000).toFixed(2);
  return `<g transform="translate(${x} ${y}) scale(${s})"><path class="twinkle" style="--d:${d}s" d="M0 -18 L 5 -5 L 18 0 L 5 5 L 0 18 L -5 5 L -18 0 L -5 -5 Z" fill="${fill}" stroke="#d8a400" stroke-width="2"/></g>`;
}
export function ringBox(x, y, s = 1, { empty = false } = {}) {
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <path d="M-50 -10 L -40 -70 L 40 -70 L 50 -10 Z" fill="#b8243a" stroke="${L}" stroke-width="5"/>
    <rect x="-50" y="-10" width="100" height="50" rx="8" fill="#c92f45" stroke="${L}" stroke-width="5"/>
    <ellipse cx="0" cy="-6" rx="36" ry="10" fill="#7a1424"/>
    ${empty ? '' : `${ringShape(0, -20, 1.4)}${sparkle(30, -60, 1)}${sparkle(-34, -50, .7)}`}</g>`;
}
export function balloon(x, y, color = C.red, s = 1, label = '') {
  const d = -((Math.abs(x * 11) % 3400) / 1000).toFixed(2);
  return `<g transform="translate(${x} ${y}) scale(${s})"><g class="sway" style="--d:${d}s"><path d="M0 60 Q 10 120 -6 180" stroke="#555" stroke-width="3" fill="none"/><ellipse cx="0" cy="0" rx="46" ry="56" fill="${color}" stroke="${L}" stroke-width="5"/><ellipse cx="-16" cy="-22" rx="10" ry="16" fill="#fff" opacity=".45"/><path d="M-8 56 L 8 56 L 0 66Z" fill="${color}" stroke="${L}" stroke-width="3"/>${label ? `<text x="0" y="8" text-anchor="middle" font-size="20" font-weight="900" fill="#fff" font-family="Arial">${label}</text>` : ''}</g></g>`;
}
export function heartBalloon(x, y, s = 1, label = '') {
  return `<g transform="translate(${x} ${y}) scale(${s})"><g class="sway"><path d="M0 60 Q 14 130 -8 200" stroke="#555" stroke-width="3" fill="none"/>${heartPath(0, 0, 70, '#ff5f8a')}${label ? `<text x="0" y="0" text-anchor="middle" font-size="24" font-weight="900" fill="#fff" font-family="Arial">${label}</text>` : ''}</g></g>`;
}
export function flowers(x, y, s = 1) {
  const cols = ['#ff6b8b', '#ffd84d', '#ff9f43', '#c56cf0', '#ff6b8b', '#ffffff', '#ffd84d'];
  return `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-20 0 L 0 120 L 20 0 Z" fill="#7ac36a" stroke="${L}" stroke-width="4"/>${cols.map((c, i) => { const a = (i / cols.length) * Math.PI - Math.PI; const fx = Math.cos(a) * 60; const fy = Math.sin(a) * 40 - 10; return `<g transform="translate(${fx} ${fy})">${Array.from({ length: 6 }, (_, k) => `<circle cx="${Math.cos(k) * 12}" cy="${Math.sin(k) * 12}" r="11" fill="${c}" stroke="${L}" stroke-width="2"/>`).join('')}<circle r="8" fill="#ffd84d" stroke="${L}" stroke-width="2"/></g>`; }).join('')}<path d="M-22 30 L 22 30 L 0 46 Z" fill="${C.red}" stroke="${L}" stroke-width="3"/></g>`;
}
export function sunbed(x, y, s = 1) {
  return `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-170 0 L 120 0 L 170 -90" stroke="#8a5a2b" stroke-width="12" fill="none" stroke-linecap="round"/><path d="M-160 -12 L 110 -12 L 160 -96" stroke="#5fb6e8" stroke-width="22" fill="none" stroke-linecap="round"/><path d="M-140 0 L -150 40 M100 0 L 110 40" stroke="#8a5a2b" stroke-width="10"/></g>`;
}
export function sign(x, y, text, s = 1, color = '#fff8e7') {
  return `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 0 L 0 90" stroke="#8a5a2b" stroke-width="10"/><rect x="-90" y="-50" width="180" height="56" rx="8" fill="${color}" stroke="${L}" stroke-width="5"/><text x="0" y="-12" text-anchor="middle" font-size="26" font-weight="900" fill="${L}" font-family="Arial">${text}</text></g>`;
}
export function feather(x, y, s = 1, rot = 0) {
  return `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})"><path d="M0 0 C 30 -40 20 -110 0 -140 C -20 -110 -30 -40 0 0 Z" fill="${C.flamingo}" stroke="${C.flamingoD}" stroke-width="4"/><path d="M0 10 L 0 -130" stroke="${C.flamingoD}" stroke-width="3"/>${[-30, -60, -90].map((yy) => `<path d="M0 ${yy} l 14 -16 M0 ${yy} l -14 -16" stroke="${C.flamingoD}" stroke-width="2"/>`).join('')}</g>`;
}
export function bubble(x, y, w, h, text, { tx, ty, size = 34, fill = '#fff', color = L, think = false } = {}) {
  const lines = String(text).split('\n');
  const tail = tx != null ? (think
    ? `<circle cx="${tx}" cy="${ty}" r="8" fill="${fill}" stroke="${L}" stroke-width="4"/><circle cx="${(tx + x + w / 2) / 2}" cy="${(ty + y + h) / 2}" r="13" fill="${fill}" stroke="${L}" stroke-width="4"/>`
    : `<path d="M${x + w * 0.35} ${y + h - 4} L ${tx} ${ty} L ${x + w * 0.55} ${y + h - 4} Z" fill="${fill}" stroke="${L}" stroke-width="5" stroke-linejoin="round"/>`) : '';
  return `<g>${tail}<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${think ? h / 2 : 26}" fill="${fill}" stroke="${L}" stroke-width="5"/>${tx != null && !think ? `<path d="M${x + w * 0.35 + 4} ${y + h - 5} L ${x + w * 0.55 - 4} ${y + h - 5}" stroke="${fill}" stroke-width="8"/>` : ''}${lines.map((l, i) => `<text x="${x + w / 2}" y="${y + h / 2 + (i - (lines.length - 1) / 2) * size * 1.15 + size * 0.36}" text-anchor="middle" font-size="${size}" font-weight="900" fill="${color}" font-family="'Baloo 2', 'Trebuchet MS', Arial">${l}</text>`).join('')}</g>`;
}
export function timeTag(text, night = false) {
  return `<g transform="translate(1290 24)"><rect width="290" height="74" rx="18" fill="${night ? '#1d2340' : '#fff8e7'}" stroke="${L}" stroke-width="5"/>${night ? `<path d="M48 18 a 22 22 0 1 0 20 34 a 18 18 0 1 1 -20 -34z" fill="#ffe38a"/>` : `<circle cx="48" cy="37" r="17" fill="#ffd23f" stroke="#d29a1c" stroke-width="3"/>${Array.from({ length: 8 }, (_, i) => `<path d="M48 37 m ${Math.cos(i * 0.785) * 22} ${Math.sin(i * 0.785) * 22} l ${Math.cos(i * 0.785) * 7} ${Math.sin(i * 0.785) * 7}" stroke="#d29a1c" stroke-width="4"/>`).join('')}`}<text x="172" y="49" text-anchor="middle" font-size="34" font-weight="900" fill="${night ? '#fff' : L}" font-family="Arial">${text}</text></g>`;
}
export function label(x, y, text, size = 30, color = L, anchor = 'middle', weight = 900) {
  return `<text x="${x}" y="${y}" text-anchor="${anchor}" font-size="${size}" font-weight="${weight}" fill="${color}" font-family="'Baloo 2', 'Trebuchet MS', Arial">${text}</text>`;
}
