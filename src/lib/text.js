// Rich text: phrase chips [[shown|id]] and glossary chips, with a tap/hover popover.
import { VOCAB_BY_ID } from '../data/vocab.js';
import { GLOSSARY } from '../data/glossary.js';

export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/** Remove chip markup: "[[fell out with|fall-out]]" -> "fell out with". */
export const plain = (s) => String(s ?? '').replace(/\[\[([^|\]]+)\|[^\]]+\]\]/g, '$1');

export function rich(text, glossary = []) {
  const all = [...glossary, ...GLOSSARY].sort((a, b) => b.en.length - a.en.length);
  const parts = String(text ?? '').split(/(\[\[[^\]]+\]\])/g);
  return parts.map((part) => {
    const m = part.match(/^\[\[([^|\]]+)\|([^\]]+)\]\]$/);
    if (m) {
      return `<button type="button" class="chip phrase" data-phrase="${esc(m[2])}">${esc(m[1])}</button>`;
    }
    let html = esc(part);
    const used = new Set();
    for (const g of all) {
      const key = g.en.toLowerCase();
      if (used.has(key)) continue;
      const re = new RegExp(`(^|[^\\p{L}>])(${escapeRe(esc(g.en))}(?:s|es)?)(?=[^\\p{L}]|$)`, 'iu');
      if (re.test(html)) {
        html = html.replace(re, `$1<button type="button" class="chip gloss" data-en="${esc(g.en)}" data-vi="${esc(g.vi)}">$2</button>`);
        used.add(key);
      }
    }
    return html;
  }).join('');
}
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export function phraseCard(id) {
  const v = VOCAB_BY_ID[id];
  if (!v) return '';
  return `<div class="pc-phrase">${esc(v.phrase)}</div><div class="pc-ipa">${esc(v.ipa)}</div><div class="pc-vi">${esc(v.vi)}</div><div class="pc-ex">“${esc(v.example)}”</div>`;
}

/** Install one global popover for chips. */
export function installChipPopover(root = document) {
  let pop = document.getElementById('chip-pop');
  if (!pop) {
    pop = document.createElement('div');
    pop.id = 'chip-pop';
    pop.className = 'chip-pop';
    pop.hidden = true;
    document.body.appendChild(pop);
  }
  const show = (el) => {
    if (el.dataset.phrase) pop.innerHTML = phraseCard(el.dataset.phrase);
    else pop.innerHTML = `<div class="pc-phrase">${esc(el.dataset.en)}</div><div class="pc-vi">${esc(el.dataset.vi)}</div>`;
    pop.hidden = false;
    const r = el.getBoundingClientRect();
    const w = Math.min(360, window.innerWidth - 24);
    pop.style.width = w + 'px';
    pop.style.left = Math.max(12, Math.min(window.innerWidth - w - 12, r.left + r.width / 2 - w / 2)) + 'px';
    const below = r.bottom + 8;
    pop.style.top = (below + 160 > window.innerHeight ? Math.max(8, r.top - 8 - pop.offsetHeight) : below) + 'px';
  };
  root.addEventListener('click', (e) => {
    const chip = e.target.closest('.chip');
    if (chip) { e.preventDefault(); show(chip); return; }
    if (!e.target.closest('#chip-pop')) pop.hidden = true;
  });
}
