// Deterministic, client-side sentence checker. No API calls.
// check(text, scene, { isWord }) -> { ok, reasons[], fish, phrases[] }
import {
  BE_FORMS, MODALS, ADVERBS, PARTICIPLE_ADJECTIVES, participleInfo, nounNumber,
} from './english.js';
import { checkPhrase, findPhrases, tokens as phraseTokens } from './phrase-matcher.js';
import { VOCAB_BY_ID } from '../data/vocab.js';

// Proper names that are always allowed (spelling) and must be capitalised.
export const NAMES = ['Panda', 'Penguin', 'Monkey', 'Giraffe', 'Flamingo', 'Chó', 'Cho', 'Sunflower'];
const ANIMAL_NAMES = new Set(['panda', 'penguin', 'monkey', 'giraffe', 'flamingo']);
const ALWAYS_CAPITAL = new Set(['chó', 'cho', 'i', 'pinocchio', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday', 'vietnam', 'vietnamese', 'english', 'hanoi', 'mia']);
const CAPITAL_OK = new Set([...ALWAYS_CAPITAL, ...ANIMAL_NAMES, 'sunflower', 'hotel', 'mr', 'mrs', 'miss', 'dear', 'january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']);
// Story words that are fine even if the dictionary does not know them.
export const STORY_WHITELIST = new Set(['chó', 'cho', 'pâté', 'pate', 'café', 'cafe', 'ok', 'okay', 'pinocchio', 'hanoi', 'mia', 'tiptoe', 'tiptoes', 'tiptoed', 'tiptoeing', 'pyjamas', 'pajamas', 'jeweller', 'jeweler', 'jewellery', 'jewelry', 'apologise', 'apologised', 'apologising', 'apologize', 'apologized', 'apologizing']);
const DETERMINERS = new Set('the a an this that these those his her their our my your its every each one two some'.split(' '));
const PREPOSITIONS = new Set('of in on under from with at near behind by for inside into to about'.split(' '));

export function createChecker({ isWord }) {
  return (text, scene) => check(text, scene, { isWord });
}

/** Split into tokens keeping commas and quote marks as their own tokens. */
function lexTokens(text) {
  return text.match(/[A-Za-zÀ-ỹ0-9]+(?:['’][A-Za-z]+)*|[,"“”]/g) || [];
}

function removeQuoted(text) {
  return text.replace(/["“][^"”]*["”]/g, ' ');
}

export function check(raw, scene, { isWord = () => true } = {}) {
  const reasons = [];
  const text = String(raw ?? '').replace(/[\r\n]+/g, ' ').replace(/\s+$/, '').replace(/^\s+/, '');
  const add = (r) => { if (!reasons.includes(r)) reasons.push(r); };

  // ---- 1. Form ----
  if (!text) return { ok: false, reasons: ['empty'], fish: false, phrases: [] };
  if (!/^[A-ZÀ-Ỹ"“]/.test(text) || /^["“][a-z]/.test(text)) add('capital letter at the start');
  if (!/[.!?]["”]?$/.test(text)) add('no full stop at the end (. ! ?)');
  if (/ {2,}/.test(text)) add('double space');
  if (/[^A-Za-zÀ-ỹ0-9 ,'’"“”\-.!?:;]/.test(text)) add('junk characters');
  if (/[.!?,]{2,}|[.!?](?=.*[A-Za-z]{2,}.*[.!?]["”]?$)/.test(text.replace(/["“][^"”]*["”]/g, 'quote'))) add('junk punctuation');
  if (/\s[,.!?]/.test(text)) add('space before punctuation');
  const wordList = phraseTokens(text);
  const rawWords = (text.match(/[A-Za-zÀ-ỹ0-9]+(?:['’][A-Za-z]+)*/g) || []);
  if (rawWords.length < 4) add('too short (min 4 words)');
  if (rawWords.length > 25) add('too long (max 25 words)');

  // ---- 2. Spelling ----
  for (const w0 of rawWords) {
    if (/^\d+$/.test(w0)) continue;
    const w = w0.replace(/['’]s$/i, '');
    const parts = w.split('-');
    for (const p of parts) {
      if (!p) continue;
      if (STORY_WHITELIST.has(p.toLowerCase())) continue;
      if (/['’]/.test(p) && isWord(p.replace('’', "'"))) continue;
      if (!isWord(p) && !isWord(p.toLowerCase())) add(`spelling: ${w0}`);
    }
  }

  // ---- 2b. Capital letters ----
  const lex = lexTokens(text);
  let inQuote = false;
  let prevWords = [];
  for (let i = 0; i < lex.length; i++) {
    const t = lex[i];
    if (t === '"' || t === '“' || t === '”') { inQuote = t === '"' ? !inQuote : t === '“'; continue; }
    if (t === ',') continue;
    const lower = t.toLowerCase().replace(/['’]s$/, '');
    const isFirst = prevWords.length === 0;
    if (!inQuote && !isFirst) {
      if (/^[A-ZÀ-Ỹ]/.test(t) && !CAPITAL_OK.has(lower) && !/^[A-Z]$/.test(t)) add(`capital letter: ${t} should be small`);
      if (/^[a-zà-ỹ]/.test(t) && ALWAYS_CAPITAL.has(lower)) add(`capital letter: ${t[0].toUpperCase() + t.slice(1)}`);
      if (/^[a-z]/.test(t) && ANIMAL_NAMES.has(lower)) {
        const before = prevWords.slice(-3).map((x) => x.toLowerCase());
        if (!before.some((x) => DETERMINERS.has(x))) add(`capital letter: ${t[0].toUpperCase() + t.slice(1)} (name)`);
      }
    }
    prevWords.push(t);
  }

  // ---- 3. Passive structure ----
  const accepted = new Set(scene?.acceptedVerbs || []);
  const toks = wordList;
  let passive = null;
  let wrongPP = null;
  let progressive = false;
  let sawBe = false;
  for (let i = 0; i < toks.length; i++) {
    if (!BE_FORMS.has(toks[i])) continue;
    sawBe = true;
    let j = i + 1;
    while (j < toks.length && (ADVERBS.has(toks[j]) || toks[j] === "n't" || /ly$/.test(toks[j]) && !['fly', 'rely', 'reply', 'apply'].includes(toks[j]))) j++;
    if (toks[j] === 'being') { j++; while (j < toks.length && ADVERBS.has(toks[j])) j++; }
    const t = toks[j];
    if (!t) continue;
    const info = participleInfo(t);
    if (info.ok) {
      const adjLike = PARTICIPLE_ADJECTIVES.has(t) && !accepted.has(info.base) && !accepted.has(t) && toks[j + 1] !== 'by';
      if (!adjLike) { passive = { aux: i, pp: t, base: info.base }; break; }
    } else if (info.wrong) {
      wrongPP = wrongPP || `wrong participle: ${t} → ${info.wrong}`;
    } else if (/ing$/.test(t) && t.length > 4) {
      progressive = true;
    }
  }
  if (!passive) {
    if (wrongPP) add(wrongPP);
    else if (progressive) add('not passive: be + -ing is active');
    else if (sawBe) add('not passive: be + adjective/noun (no past participle)');
    else add('not passive: no form of be');
  }

  // ---- 4. Subject-verb agreement ----
  if (passive) {
    const agr = agreement(text);
    if (agr) add(agr);
  }
  // Double aux like "was were"
  for (let i = 0; i + 1 < toks.length; i++) {
    if (['am', 'is', 'are', 'was', 'were'].includes(toks[i]) && ['am', 'is', 'are', 'was', 'were', 'be'].includes(toks[i + 1])) add(`two verbs together: ${toks[i]} ${toks[i + 1]}`);
  }

  // ---- 5. Relevance ----
  const lowerText = ' ' + toks.join(' ') + ' ';
  const kws = (scene?.keywords || []).map((k) => k.toLowerCase());
  if (kws.length && !kws.some((k) => (k.includes(' ') ? lowerText.includes(' ' + k + ' ') : toks.some((t) => t === k || (t.startsWith(k) && t.length <= k.length + 3) || t.replace(/'s$/, '') === k)))) {
    add('off-topic: no word from this scene');
  }

  // ---- 6. Phrase rule ----
  const phrases = findPhrases(text);
  if (scene?.mode === 'phrase') {
    const results = (scene.targetPhrases || []).map((id) => checkPhrase(id, text));
    const good = results.find((r) => r.found);
    if (!good) {
      const why = results.find((r) => r.why)?.why;
      if (why) add(why);
      else add('phrase missing: use ' + (scene.targetPhrases || []).map((id) => `"${VOCAB_BY_ID[id].phrase}"`).join(' or '));
    } else if (!passive) {
      add('phrase used but sentence not passive');
    }
  }

  // ---- 7. Spoiler ----
  if (scene && scene.n <= 8 && toks.includes('penguin') && /cheat|thief|stole/.test(lowerText)) add("Too early, Chó! Don't spoil the ending.");

  const ok = reasons.length === 0;
  return { ok, reasons, fish: ok && phrases.length > 0, phrases };
}

/** Heuristic subject-verb agreement for the passive auxiliary. Returns a reason or null. */
export function agreement(text) {
  const cleaned = removeQuoted(text);
  const lex = lexTokens(cleaned).map((t) => t.toLowerCase());
  // find the first finite auxiliary
  let ai = -1;
  for (let i = 0; i < lex.length; i++) {
    const t = lex[i];
    if (MODALS.has(t)) return null; // will be / can be: no agreement on be
    if (['am', 'is', 'are', 'was', 'were', 'has', 'have', 'had'].includes(t)) { ai = i; break; }
  }
  if (ai <= 0) return null;
  const aux = lex[ai];
  if (aux === 'had') return null;
  let subj = lex.slice(0, ai);
  const lastComma = subj.lastIndexOf(',');
  if (lastComma >= 0) subj = subj.slice(lastComma + 1);
  subj = subj.filter((t) => t !== '"' && t !== '“' && t !== '”');
  if (!subj.length) return null;
  let num;
  if (subj.includes('and')) num = 'pl';
  else {
    const p = subj.findIndex((t, k) => k > 0 && PREPOSITIONS.has(t));
    const seg = p > 0 ? subj.slice(0, p) : subj;
    const head = seg[seg.length - 1];
    num = nounNumber(head);
    if (num === 'sg' && seg.length >= 2 && ['two', 'three', 'four', 'five', 'both', 'many', 'these', 'those', 'some'].includes(seg[seg.length - 2]) && !/s$/.test(head) && nounNumber(head) !== '?') num = 'pl-bad';
  }
  if (num === '?') return null;
  const want = {
    sg: ['is', 'was', 'has'], i: ['am', 'was', 'have'], pl: ['are', 'were', 'have'], 'pl-bad': ['are', 'were', 'have'],
  }[num];
  if (!want.includes(aux)) {
    const fix = { is: 'are', are: 'is', was: 'were', were: 'was', has: 'have', have: 'has', am: 'is' }[aux];
    return `agreement: ${aux} → ${num === 'i' ? (aux === 'is' || aux === 'are' ? 'am' : 'was') : fix}`;
  }
  return null;
}
