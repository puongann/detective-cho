// Inflection-aware phrase matcher. Patterns come from src/data/vocab.js.
import { verbForms, words } from './english.js';
import { VOCAB, VOCAB_BY_ID } from '../data/vocab.js';

const cache = new Map();

/** Compile 'get on *1 well with' into slots. */
export function compile(pattern) {
  if (cache.has(pattern)) return cache.get(pattern);
  const slots = pattern.trim().split(/\s+/).map((tok) => {
    const gap = tok.match(/^\*(\d+)$/);
    if (gap) return { gap: Number(gap[1]) };
    const set = new Set();
    for (const alt of tok.split('|')) {
      const v = alt.match(/^\{(\w+)\}$/);
      if (v) verbForms(v[1]).forEach((f) => set.add(f));
      else set.add(alt.toLowerCase());
    }
    return { set };
  });
  cache.set(pattern, slots);
  return slots;
}

function matchAt(slots, toks, si, ti) {
  if (si === slots.length) return ti;
  const s = slots[si];
  if (s.gap !== undefined) {
    for (let k = 0; k <= s.gap && ti + k <= toks.length; k++) {
      const end = matchAt(slots, toks, si + 1, ti + k);
      if (end !== -1) return end;
    }
    return -1;
  }
  if (ti < toks.length && s.set.has(toks[ti])) return matchAt(slots, toks, si + 1, ti + 1);
  return -1;
}

/** Returns {start, end} of the first match or null. */
export function matchPattern(pattern, text) {
  const toks = Array.isArray(text) ? text : tokens(text);
  const slots = compile(pattern);
  for (let i = 0; i < toks.length; i++) {
    if (slots[0].gap === undefined && !slots[0].set.has(toks[i])) continue;
    const end = matchAt(slots, toks, 0, i);
    if (end !== -1) return { start: i, end };
  }
  return null;
}

export function tokens(text) {
  return words(text).map((w) => w.toLowerCase());
}

/**
 * Check one phrase in a text.
 * -> { found: true } | { found: false, why: 'wrong preposition: ...' } | { found: false, why: null }
 */
export function checkPhrase(id, text) {
  const v = VOCAB_BY_ID[id];
  if (!v) throw new Error('Unknown phrase ' + id);
  const toks = tokens(text);
  for (const p of v.patterns) if (matchPattern(p, toks)) return { found: true, id };
  for (const w of v.wrong || []) if (matchPattern(w.p, toks)) return { found: false, id, why: w.why };
  for (const p of v.loose || []) if (matchPattern(p, toks)) return { found: true, id };
  return { found: false, id, why: null };
}

/** All vocab phrases found in a text (for the fish bonus). */
export function findPhrases(text) {
  return VOCAB.filter((v) => checkPhrase(v.id, text).found).map((v) => v.id);
}
