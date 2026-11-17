// Level check shared by scripts/lint-level.js (build) and the story editor (browser).
// makeLevelChecker(wordListText) -> { lintText(where, text, opts), problems: [] }
import { VOCAB } from '../data/vocab.js';
import { GLOSSARY } from '../data/glossary.js';
import { lemmaCandidates, BE_FORMS, ADVERBS, PARTICIPLE_ADJECTIVES, participleInfo } from './english.js';

export function makeLevelChecker(listText) {
const A2 = new Set(listText.split('\n').filter((l) => !l.startsWith('#')).join(' ').toLowerCase().split(/\s+/).filter(Boolean));
const NAMES = new Set(['sb', 'sth', 'chó', 'cho', 'hoa', 'nam', 'bin', 'linh', 'vy', 'sunflower', 'p', 's', 'f', 'n', 'v', 'flip', 'flops', 'a', 'pm', 'am', 'tv', 'ok', 'mariah', 'lan', 'nam', 'hanoi', 'pinocchio', 'chief', 'inspector', 'inspectors', 'express']);
const phraseWords = new Set(VOCAB.flatMap((v) => v.phrase.toLowerCase().replace(/\(.*?\)|sb|sth|someone|\//g, ' ').split(/[\s']+/)).filter(Boolean));
// target phrase words in their inflected forms are fine too
['struck', 'striking', 'apologise', 'apologised', 'proposes', 'proposed', 'engaged', 'married', 'feelings', 'cheating', 'cheated', 'lied', 'admires', 'forgives', 'trusts', 'broke', 'broken', 'acquaintances', 'faithful'].forEach((w) => phraseWords.add(w));
const glossWords = (extra = []) => new Set([...GLOSSARY, ...extra].flatMap((g) => g.en.toLowerCase().split(/\s+/)));

const problems = [];
const report = (where, msg) => problems.push(`${where}: ${msg}`);

function stripMarkup(s) {
  return String(s)
    .replace(/\[\[[^\]]+\]\]/g, ' PHRASE ') // chips are target phrases (exempt)
    .replace(/\{(name|n)\}/g, ' ')
    .replace(/\b([ap])\.m\./g, '$1m.')
    .replace(/_+\w*/g, ' ')
    .replace(/#\d+/g, ' ');
}
function sentences(s) {
  return stripMarkup(s).split(/(?<=[.!?])["”]?\s+|\n/).map((x) => x.trim()).filter(Boolean);
}
const tokens = (s) => (s.match(/[A-Za-zÀ-ỹ]+(?:['’][A-Za-z]+)*/g) || []).map((t) => t.replace(/’/g, "'"));

function lintText(where, text, { maxWords = 12, passive = true, glossary = [] } = {}) {
  if (!text) return;
  const gw = glossWords(glossary);
  for (const sent of sentences(text)) {
    const toks = tokens(sent);
    const count = toks.filter((t) => t !== 'PHRASE').length + (sent.match(/PHRASE/g) || []).length * 2;
    if (maxWords && count > maxWords) report(where, `sentence too long (${count} words): "${sent}"`);
    for (const t0 of toks) {
      if (t0 === 'PHRASE') continue;
      const t = t0.toLowerCase().replace(/'s$/, '');
      if (NAMES.has(t) || gw.has(t) || phraseWords.has(t)) continue;
      if (/n't$/.test(t) || ["i'm", "it's", "don't", "can't", "i'll", "let's", "you're", "that's", "he's", "she's", "what's", "doesn't", "isn't", "won't"].includes(t)) continue;
      const cands = lemmaCandidates(t);
      if (cands.some((c) => A2.has(c) || gw.has(c) || phraseWords.has(c))) continue;
      report(where, `word not in A1-A2 list: "${t0}"  (swap it, or add a glossary chip)`);
    }
    if (passive) {
      const low = toks.map((x) => x.toLowerCase());
      for (let i = 0; i < low.length; i++) {
        if (!BE_FORMS.has(low[i])) continue;
        let j = i + 1;
        while (j < low.length && ADVERBS.has(low[j])) j++;
        const info = low[j] ? participleInfo(low[j]) : {};
        if (info.ok && !PARTICIPLE_ADJECTIVES.has(low[j])) report(where, `passive voice in narrator text: "${sent}"`);
      }
    }
  }
}

return { lintText, problems };
}
