// Teacher story edits ("overrides") on top of the built-in story in src/data/scenes.js.
// Shape: { title?: string, scenes?: { s1: { field: string }, ... } }
// All values are stored as strings (lists joined by ", " or new lines) so Firebase never drops empty arrays.
// The host keeps them in localStorage and publishes them to rooms/{code}/public/story; phones apply the same overrides.
import { SCENES, STORY_TITLE, setStoryTitle } from '../data/scenes.js';
import { VOCAB_BY_ID } from '../data/vocab.js';

const ORIGINAL = JSON.parse(JSON.stringify(SCENES));
const ORIGINAL_TITLE = STORY_TITLE;
export const LS_KEY = 'csd-story-edits';

/** [key, label, kind, help] — kind: text | area | lines | list | mode | image */
export const FIELDS = [
  ['title', 'Scene title', 'text'],
  ['time', 'Time tag', 'text', 'e.g. Fri 7 p.m.'],
  ['image', 'Picture', 'image'],
  ['mode', 'Scene type', 'mode', 'clue = any passive sentence about the picture · phrase = must also use a target phrase'],
  ['targetPhrases', 'Target phrases (phrase scenes)', 'list', 'phrase ids, comma separated'],
  ['bonusPhrases', 'Bonus phrases (🐟 fish)', 'list', 'phrase ids, comma separated'],
  ['prompt', 'Prompt on the phone', 'area', 'short: 1-2 sentences'],
  ['intro', 'Story on the big screen', 'area', 'read before the student sentence'],
  ['previously', '"Last time" line', 'text', 'optional'],
  ['verb', 'Verb tip', 'text', 'e.g. give → given'],
  ['frame', 'Sentence frame (advice)', 'text'],
  ['hints', 'Hints 1-3 (one per line)', 'lines'],
  ['modelAnswers', 'Model answers (one per line)', 'lines', 'the first one is used for a restored clue'],
  ['keywords', 'Keywords the checker accepts', 'list', 'the sentence must mention one of these'],
  ['acceptedVerbs', 'Accepted verbs (base form)', 'list', 'empty = any verb'],
  ['reaction', 'Chó reaction (after a correct clue)', 'area', 'use [[text|phrase-id]] for a phrase chip'],
  ['bridge', 'Bridge to the next scene', 'area'],
  ['failLine', 'Fail line (clue lost)', 'area'],
];
const KIND = Object.fromEntries(FIELDS.map(([k, , kind]) => [k, kind]));

export const originalScene = (n) => ORIGINAL.find((s) => s.n === n);
export const originalTitle = () => ORIGINAL_TITLE;

/** scene value -> editable string */
export function toText(key, v) {
  if (v == null) return '';
  const kind = KIND[key];
  if (kind === 'lines') return (v || []).join('\n');
  if (kind === 'list') return (v || []).join(', ');
  return String(v);
}
/** editable string -> scene value */
export function fromText(key, t) {
  const kind = KIND[key];
  t = String(t ?? '');
  if (kind === 'lines') return t.split('\n').map((x) => x.trim()).filter(Boolean);
  if (kind === 'list') return t.split(',').map((x) => x.trim()).filter(Boolean);
  if (kind === 'mode') return t === 'phrase' ? 'phrase' : 'clue';
  return t.trim();
}

/** Reset every scene to the built-in story, then apply the overrides (mutates SCENES in place). */
export function applyStory(ov) {
  SCENES.forEach((s, i) => {
    for (const k of Object.keys(s)) delete s[k];
    Object.assign(s, JSON.parse(JSON.stringify(ORIGINAL[i])));
    const o = ov?.scenes?.[`s${s.n}`];
    if (o) for (const [k, t] of Object.entries(o)) if (KIND[k]) s[k] = fromText(k, t);
  });
  setStoryTitle(ov?.title?.trim() || ORIGINAL_TITLE);
}

/** Only keep fields that differ from the built-in story. */
export function sceneDiff(n, texts) {
  const orig = originalScene(n);
  const out = {};
  for (const [k] of FIELDS) {
    if (!(k in texts)) continue;
    if (JSON.stringify(fromText(k, texts[k])) !== JSON.stringify(fromText(k, toText(k, orig[k])))) out[k] = String(texts[k]);
  }
  return out;
}

/** Problems that would break the game (not language level). */
export function validateScene(s) {
  const errs = [];
  if (!s.title) errs.push('The title is empty.');
  if (!s.prompt) errs.push('The phone prompt is empty.');
  if (!s.image) errs.push('There is no picture.');
  if (!s.keywords?.length) errs.push('Add at least one keyword, or every sentence fails the relevance check.');
  if (s.mode === 'phrase' && !s.targetPhrases?.length) errs.push('A phrase scene needs at least one target phrase.');
  for (const id of [...(s.targetPhrases || []), ...(s.bonusPhrases || [])]) if (!VOCAB_BY_ID[id]) errs.push(`Unknown phrase id "${id}".`);
  if (!s.modelAnswers?.length) errs.push('Add one model answer (used when a clue is restored).');
  return errs;
}

export function loadSaved() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || 'null'); } catch { return null; }
}
export function saveLocal(ov) {
  try {
    if (!ov || (!ov.title && !Object.keys(ov.scenes || {}).length)) localStorage.removeItem(LS_KEY);
    else localStorage.setItem(LS_KEY, JSON.stringify(ov));
  } catch { /* private mode: edits last for this session only */ }
}
export const isEmpty = (ov) => !ov || (!ov.title && !Object.keys(ov.scenes || {}).length);
