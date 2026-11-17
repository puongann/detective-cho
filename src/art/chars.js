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

// ---------- Chibi people (Vietnamese names): big head, small body ----------
// opts as before: { x, y, s, flip, mood, arms: down|up|cheeks|point|hold|give, sweat, ... }
const SKIN = '#ffdcbf';
const SKIN_D = '#e9b48f';
const HAIR = '#2f2320';
const limb = (d, color, w = 24) => `<path d="${d}" fill="none" stroke="${L}" stroke-width="${w + 10}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
const hand = (x, y, r = 14) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${SKIN}" stroke="${L}" stroke-width="5"/>`;

/** Arm paths for one side (sx = -1 left, 1 right). Returns { d, hx, hy } */
function armPose(pose, sx, top, cy) {
  const sh = [sx * 40, top + 16];
  const P = {
    down: [[sx * 66, top + 56], [sx * 60, top + 92]],
    up: [[sx * 78, top - 22], [sx * 86, top - 84]],
    cheeks: [[sx * 86, top + 26], [sx * 56, cy + 40]],
    point: [[sx * 92, top + 4], [sx * 142, top - 6]],
    hold: [[sx * 70, top + 66], [sx * 74, top + 22]],
    give: [[sx * 84, top + 36], [sx * 136, top + 12]],
  }[pose] || [[sx * 66, top + 56], [sx * 60, top + 92]];
  const [[ex, ey], [hx, hy]] = P;
  return { d: `M${sh[0]} ${sh[1]} Q ${ex} ${ey} ${hx} ${hy}`, hx, hy };
}

function person(o, look, kind) {
  const m = o.mood || 'happy';
  const legH = look.legH || 70;
  const top = -legH - 92;            // shoulders
  const cy = top - 66;               // head centre
  const R = 76;
  const arms = o.arms || (o.wings === 'up' || o.wing === 'up' ? 'up' : o.wings === 'give' ? 'give' : o.wings === 'point' ? 'point' : 'down');
  const armL = armPose(arms === 'point' || arms === 'give' || arms === 'hold' ? 'down' : arms, -1, top, cy);
  const armR = armPose(arms, 1, top, cy);
  const sleeve = look.sleeve || look.top;
  const legs = look.skirt
    ? `${limb(`M-20 ${-legH + 10} L -22 -14`, SKIN, 18)}${limb(`M20 ${-legH + 10} L 22 -14`, SKIN, 18)}`
    : `${limb(`M-22 ${-legH - 6} L -24 -16`, look.legs || SKIN, 26)}${limb(`M22 ${-legH - 6} L 24 -16`, look.legs || SKIN, 26)}`;
  const shoes = look.flipflops
    ? `<ellipse cx="-30" cy="-6" rx="24" ry="9" fill="#5fb6e8" stroke="${L}" stroke-width="4"/><ellipse cx="30" cy="-6" rx="24" ry="9" fill="#5fb6e8" stroke="${L}" stroke-width="4"/><path d="M-30 -14 l -8 -8 M-30 -14 l 8 -8 M30 -14 l -8 -8 M30 -14 l 8 -8" stroke="${L}" stroke-width="4"/>`
    : `<path d="M-48 -2 Q -48 -24 -26 -24 L -14 -24 Q -8 -2 -14 0 Z" fill="${look.shoes || '#5a3a2a'}" stroke="${L}" stroke-width="5" stroke-linejoin="round"/><path d="M48 -2 Q 48 -24 26 -24 L 14 -24 Q 8 -2 14 0 Z" fill="${look.shoes || '#5a3a2a'}" stroke="${L}" stroke-width="5" stroke-linejoin="round"/>${look.shiny ? '<path d="M-38 -16 l 10 -3 M30 -19 l 10 3" stroke="#fff" stroke-width="4" stroke-linecap="round"/>' : ''}`;
  const torso = look.skirt
    ? `<path d="M-40 ${top} Q 0 ${top - 12} 40 ${top} L 48 ${top + 50} Q 84 ${-legH + 20} 90 ${-legH + 40} Q 0 ${-legH + 62} -90 ${-legH + 40} Q -84 ${-legH + 20} -48 ${top + 50} Z" fill="${look.top}" stroke="${L}" stroke-width="${W}" stroke-linejoin="round"/>`
    : `<path d="M-42 ${top} Q 0 ${top - 12} 42 ${top} L 50 ${-legH + 4} Q 0 ${-legH + 16} -50 ${-legH + 4} Z" fill="${look.top}" stroke="${L}" stroke-width="${W}" stroke-linejoin="round"/>`;
  const face = `
    <circle cx="0" cy="${cy}" r="${R}" fill="${SKIN}" stroke="${L}" stroke-width="${W}"/>
    <ellipse cx="${-R + 4}" cy="${cy + 10}" rx="12" ry="16" fill="${SKIN}" stroke="${L}" stroke-width="5"/><ellipse cx="${R - 4}" cy="${cy + 10}" rx="12" ry="16" fill="${SKIN}" stroke="${L}" stroke-width="5"/>
    <circle cx="0" cy="${cy}" r="${R - 3}" fill="${SKIN}"/>`;
  const nose = o.longNose
    ? `<path d="M-4 ${cy + 18} L 220 ${cy + 4} Q 232 ${cy + 12} 220 ${cy + 22} L -4 ${cy + 30} Z" fill="${SKIN}" stroke="${L}" stroke-width="5" stroke-linejoin="round"/>`
    : `<path d="M-3 ${cy + 22} q 4 4 8 0" fill="none" stroke="${SKIN_D}" stroke-width="4" stroke-linecap="round"/>`;
  const inner = `
  ${look.back ? look.back(cy, R) : ''}
  ${legs}${shoes}
  ${limb(armL.d, sleeve)}${hand(armL.hx, armL.hy)}
  ${torso}
  ${look.outfit ? look.outfit(top, legH) : ''}
  ${limb(armR.d, sleeve)}${hand(armR.hx, armR.hy)}
  ${look.held ? look.held(armR.hx, armR.hy, arms) : ''}
  ${face}
  ${eyes(m, 0, cy + 6, 30, 8)}
  ${mouth(m, 0, cy + 38, 12)}
  ${blush(-46, cy + 30, 12)}${blush(46, cy + 30, 12)}
  ${nose}
  ${look.hair(cy, R)}
  ${look.glasses ? `<g fill="rgba(220,240,255,.35)" stroke="${L}" stroke-width="5"><circle cx="-30" cy="${cy + 6}" r="22"/><circle cx="30" cy="${cy + 6}" r="22"/></g><path d="M-8 ${cy + 4} L 8 ${cy + 4}" stroke="${L}" stroke-width="5"/>` : ''}
  ${look.extra ? look.extra(cy, R, top) : ''}
  ${o.sweat || m === 'sweat' ? sweat(-R - 6, cy - 30) + sweat(R + 4, cy) : ''}`;
  return wrap(inner, o, kind);
}

// ---------- Hoa: kind and sweet, sunflower clip, yellow dress ----------
export function hoa(o = {}) {
  return person(o, {
    top: o.pyjamas ? '#bcd7ff' : '#ffd967', skirt: true, shoes: '#e9a23b',
    outfit: o.pyjamas ? (top) => `<path d="M-60 ${top + 40} L 60 ${top + 40} M-70 ${top + 80} L 70 ${top + 80}" stroke="#fff" stroke-width="8"/>` : (top) => `<path d="M-40 ${top + 4} Q 0 ${top + 30} 40 ${top + 4}" fill="none" stroke="#fff" stroke-width="7"/>`,
    back: (cy, R) => `<path d="M${-R + 2} ${cy} Q ${-R - 18} ${cy + 130} -40 ${cy + 150} L 40 ${cy + 150} Q ${R + 18} ${cy + 130} ${R - 2} ${cy} Z" fill="${HAIR}" stroke="${L}" stroke-width="5"/>`,
    hair: (cy, R) => `<path d="M${-R - 4} ${cy + 10} Q ${-R - 4} ${cy - R - 14} 0 ${cy - R - 8} Q ${R + 4} ${cy - R - 14} ${R + 4} ${cy + 10} Q ${R - 8} ${cy - 30} 30 ${cy - 34} Q 10 ${cy - 22} -6 ${cy - 40} Q -30 ${cy - 22} -56 ${cy - 30} Q ${-R + 4} ${cy - 20} ${-R - 4} ${cy + 10} Z" fill="${HAIR}" stroke="${L}" stroke-width="5" stroke-linejoin="round"/>${sunflower(-50, cy - 56, 0.75)}`,
  }, 'hoa');
}
export function sunflower(x, y, s = 1) {
  return `<g transform="translate(${x} ${y}) scale(${s})">${Array.from({ length: 10 }, (_, i) => `<ellipse cx="0" cy="-20" rx="9" ry="18" fill="#ffd23f" stroke="#d29a1c" stroke-width="2" transform="rotate(${i * 36})"/>`).join('')}<circle r="13" fill="#7a4b22" stroke="#4a2f16" stroke-width="2"/></g>`;
}

// ---------- Nam: black jacket, red bow tie, shiny party shoes, always an excuse ----------
export function nam(o = {}) {
  return person(o, {
    top: '#2b2c35', sleeve: '#2b2c35', legs: '#2b2c35', shoes: '#1a1a1f', shiny: true,
    outfit: (top) => `<path d="M-16 ${top - 4} L 0 ${top + 44} L 16 ${top - 4} Z" fill="#fbfbf7" stroke="${L}" stroke-width="4" stroke-linejoin="round"/><path d="M-18 ${top + 4} L 0 ${top + 14} L 18 ${top + 4} L 18 ${top + 24} L 0 ${top + 14} L -18 ${top + 24} Z" fill="${C.red}" stroke="${L}" stroke-width="3"/>`,
    hair: (cy, R) => `<path d="M${-R - 2} ${cy + 4} Q ${-R} ${cy - R - 16} 0 ${cy - R - 12} Q ${R + 10} ${cy - R - 10} ${R + 2} ${cy + 4} Q ${R - 6} ${cy - 34} 46 ${cy - 40} Q -10 ${cy - 30} -40 ${cy - 56} Q ${-R + 10} ${cy - 30} ${-R - 2} ${cy + 4} Z" fill="${HAIR}" stroke="${L}" stroke-width="5" stroke-linejoin="round"/><path d="M-30 ${cy - R + 4} q 30 -14 60 -4" fill="none" stroke="#6a5550" stroke-width="5" stroke-linecap="round"/>`,
  }, 'nam');
}

// ---------- Bin: bananas and jokes, orange cap, flip-flops ----------
export function bin(o = {}) {
  return person(o, {
    top: '#7ac36a', legs: SKIN, flipflops: true,
    outfit: (top, legH) => `<path d="M-50 ${-legH + 4} L -52 ${-legH + 30} L -6 ${-legH + 30} L 0 ${-legH + 14} L 6 ${-legH + 30} L 52 ${-legH + 30} L 50 ${-legH + 4} Z" fill="#4a7bd9" stroke="${L}" stroke-width="5" stroke-linejoin="round"/>${banana(0, top + 44, 0.45)}`,
    held: o.banana ? (hx, hy) => banana(hx + 6, hy - 26, 0.8) : null,
    hair: (cy, R) => `<path d="M${-R} ${cy - 6} L ${-R + 6} ${cy - 40} L ${-R + 26} ${cy - 30} L ${-R + 30} ${cy - 62} L -10 ${cy - 44} L 10 ${cy - 70} L 30 ${cy - 44} L ${R - 18} ${cy - 56} L ${R - 10} ${cy - 30} L ${R} ${cy - 6} Z" fill="#7a4b2a" stroke="${L}" stroke-width="5" stroke-linejoin="round"/><path d="M${-R + 4} ${cy - 30} Q 0 ${cy - R - 40} ${R - 4} ${cy - 30} Z" fill="#ff9f43" stroke="${L}" stroke-width="${W}" stroke-linejoin="round"/><path d="M${-R + 10} ${cy - 30} Q ${-R - 40} ${cy - 30} ${-R - 46} ${cy - 18} L ${-R + 6} ${cy - 18} Z" fill="#ff9f43" stroke="${L}" stroke-width="5" stroke-linejoin="round"/><circle cx="0" cy="${cy - R - 10}" r="7" fill="#ff9f43" stroke="${L}" stroke-width="4"/>`,
  }, 'bin');
}
export function banana(x, y, s = 1, peel = false) {
  if (peel) {
    return `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 0 Q -10 -40 0 -50 Q 10 -40 0 0Z M0 -10 Q -50 0 -60 30 Q -30 10 0 0Z M0 -10 Q 50 0 60 30 Q 30 10 0 0Z M0 -6 Q -10 30 -30 50 Q 4 30 6 -4Z" fill="#ffd84d" stroke="#8a6a1a" stroke-width="5" stroke-linejoin="round"/><path d="M0 -50 l0 -10" stroke="#5a4210" stroke-width="7"/></g>`;
  }
  return `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-10 -40 Q -40 10 10 40 Q 30 46 34 38 Q -10 20 4 -36 Z" fill="#ffd84d" stroke="#8a6a1a" stroke-width="5" stroke-linejoin="round"/><path d="M-10 -40 l -2 -10" stroke="#5a4210" stroke-width="7"/></g>`;
}

// ---------- Linh: very tall, glasses, camera, sees everything ----------
export function linh(o = {}) {
  return person(o, {
    legH: 150, top: '#a97de0', legs: '#4a6fa8', shoes: '#f4f1ea', glasses: true,
    back: (cy, R) => `<path d="M${R - 10} ${cy - 40} Q ${R + 70} ${cy - 30} ${R + 40} ${cy + 70} Q ${R + 30} ${cy + 20} ${R - 10} ${cy - 10} Z" fill="#4a2f22" stroke="${L}" stroke-width="5" stroke-linejoin="round"/>`,
    hair: (cy, R) => `<path d="M${-R - 2} ${cy + 6} Q ${-R} ${cy - R - 14} 0 ${cy - R - 10} Q ${R} ${cy - R - 14} ${R + 2} ${cy + 6} Q ${R - 10} ${cy - 40} 20 ${cy - 46} Q -30 ${cy - 44} ${-R - 2} ${cy + 6} Z" fill="#4a2f22" stroke="${L}" stroke-width="5" stroke-linejoin="round"/><circle cx="${R - 6}" cy="${cy - 40}" r="9" fill="#ff6b8b" stroke="${L}" stroke-width="3"/>`,
    extra: o.camera ? (cy, R, top) => camera(0, top + 70, 0.8) : null,
  }, 'linh');
}
export function camera(x, y, s = 1) {
  return `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-20 -120 Q -50 -60 -30 -20 M20 -120 Q 50 -60 30 -20" stroke="#333" stroke-width="4" fill="none"/><rect x="-42" y="-26" width="84" height="56" rx="10" fill="#444" stroke="${L}" stroke-width="5"/><circle cx="0" cy="2" r="18" fill="#7fb7e6" stroke="#222" stroke-width="5"/><rect x="18" y="-34" width="16" height="10" fill="#444"/></g>`;
}

// ---------- Vy: the hotel singer, pink dress, pink feather boa ----------
export function vy(o = {}) {
  return person(o, {
    top: C.flamingo, skirt: true, shoes: C.flamingoD,
    back: (cy, R) => `<path d="M${-R} ${cy - 10} Q ${-R - 40} ${cy + 60} ${-R - 10} ${cy + 130} Q -30 ${cy + 110} -20 ${cy + 60} L 20 ${cy + 60} Q 30 ${cy + 110} ${R + 10} ${cy + 130} Q ${R + 40} ${cy + 60} ${R} ${cy - 10} Z" fill="#5b2f3a" stroke="${L}" stroke-width="5" stroke-linejoin="round"/>`,
    outfit: (top) => `<g fill="#ffb8d0" stroke="${C.flamingoD}" stroke-width="3">${[-46, -30, -14, 2, 18, 34, 50].map((x, i) => `<circle cx="${x}" cy="${top + 6 + (i % 2) * 8}" r="13"/>`).join('')}</g>`,
    held: o.mic ? (hx, hy) => `<path d="M${hx} ${hy} L ${hx + 4} ${hy - 40}" stroke="#333" stroke-width="8"/><circle cx="${hx + 5}" cy="${hy - 50}" r="14" fill="${C.gold}" stroke="${L}" stroke-width="4"/>` : o.ring ? (hx, hy) => `<g transform="translate(${hx} ${hy - 30})">${ringShape(0, 0, 1.2)}${sparkle(22, -24, 1.2)}</g>` : null,
    hair: (cy, R) => `<path d="M${-R - 4} ${cy + 14} Q ${-R - 6} ${cy - R - 14} 0 ${cy - R - 10} Q ${R + 6} ${cy - R - 14} ${R + 4} ${cy + 14} Q ${R - 4} ${cy - 30} 20 ${cy - 40} Q -20 ${cy - 20} -50 ${cy - 34} Q ${-R + 2} ${cy - 10} ${-R - 4} ${cy + 14} Z" fill="#5b2f3a" stroke="${L}" stroke-width="5" stroke-linejoin="round"/><g transform="translate(${-R + 14} ${cy - 50})">${Array.from({ length: 5 }, (_, i) => `<ellipse cx="0" cy="-12" rx="9" ry="14" fill="${C.flamingo}" stroke="${C.flamingoD}" stroke-width="3" transform="rotate(${i * 72})"/>`).join('')}<circle r="7" fill="${C.gold}"/></g><circle cx="${R - 2}" cy="${cy + 34}" r="6" fill="${C.gold}" stroke="${L}" stroke-width="2"/>`,
  }, 'vy');
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
