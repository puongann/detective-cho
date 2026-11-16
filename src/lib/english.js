// Small English helpers shared by the checker, the phrase matcher and the level lint.
// Everything is bundled locally: no network calls.

// base | past simple | past participle
const IRREGULAR_RAW = `
arise arose arisen|awake awoke awoken|be was/were been|bear bore born/borne|beat beat beaten|become became become
begin began begun|bend bent bent|bet bet bet|bind bound bound|bite bit bitten|bleed bled bled|blow blew blown
break broke broken|bring brought brought|build built built|burn burnt/burned burnt/burned|burst burst burst
buy bought bought|catch caught caught|choose chose chosen|cling clung clung|come came come|cost cost cost
creep crept crept|cut cut cut|deal dealt dealt|dig dug dug|do did done|draw drew drawn|dream dreamt/dreamed dreamt/dreamed
drink drank drunk|drive drove driven|eat ate eaten|fall fell fallen|feed fed fed|feel felt felt|fight fought fought
find found found|flee fled fled|fly flew flown|forbid forbade forbidden|forget forgot forgotten|forgive forgave forgiven
freeze froze frozen|get got got/gotten|give gave given|go went gone|grind ground ground|grow grew grown|hang hung hung
have had had|hear heard heard|hide hid hidden|hit hit hit|hold held held|hurt hurt hurt|keep kept kept|kneel knelt knelt
know knew known|lay laid laid|lead led led|lean leant/leaned leant/leaned|learn learnt/learned learnt/learned|leave left left
lend lent lent|let let let|lie lay lain|light lit lit|lose lost lost|make made made|mean meant meant|meet met met
mistake mistook mistaken|overhear overheard overheard|pay paid paid|prove proved proven/proved|put put put|quit quit quit
read read read|ride rode ridden|ring rang rung|rise rose risen|run ran run|say said said|see saw seen|seek sought sought
sell sold sold|send sent sent|set set set|sew sewed sewn|shake shook shaken|shine shone shone|shoot shot shot
show showed shown|shrink shrank shrunk|shut shut shut|sing sang sung|sink sank sunk|sit sat sat|sleep slept slept
slide slid slid|smell smelt/smelled smelt/smelled|speak spoke spoken|spell spelt/spelled spelt/spelled|spend spent spent
spill spilt/spilled spilt/spilled|spin spun spun|split split split|spread spread spread|stand stood stood|steal stole stolen
stick stuck stuck|sting stung stung|strike struck struck|swear swore sworn|sweep swept swept|swim swam swum|swing swung swung
take took taken|teach taught taught|tear tore torn|tell told told|think thought thought|throw threw thrown
understand understood understood|wake woke woken|wear wore worn|weep wept wept|win won won|wind wound wound
write wrote written|upset upset upset|withdraw withdrew withdrawn|overtake overtook overtaken
`;

export const IRREGULAR = {}; // base -> {past:[], pp:[]}
export const PP_TO_BASE = {}; // participle -> base
export const PAST_TO_BASE = {}; // past simple -> base
for (const entry of IRREGULAR_RAW.split(/[|\n]/).map((s) => s.trim()).filter(Boolean)) {
  const [base, past, pp] = entry.split(/\s+/);
  IRREGULAR[base] = { past: past.split('/'), pp: pp.split('/') };
  for (const p of pp.split('/')) PP_TO_BASE[p] = PP_TO_BASE[p] || base;
  for (const p of past.split('/')) PAST_TO_BASE[p] = PAST_TO_BASE[p] || base;
}

// Common regular verbs (base form). Used to spot "was ask" (base form after be)
// and to build regular inflections for the phrase matcher.
export const REGULAR_VERBS = `
accept add admire agree allow answer apologize apologise appear arrive ask attack bake believe borrow call carry change
chase cheat check clean climb close collect comb cook copy count cover cross cry dance decide deliver describe destroy
discover drop dress enjoy enter escape explain fail fill finish fix follow guess hate help hope hug hurry imagine invite
jump kick kill kiss knock laugh like listen live look love marry miss move name need notice open order paint pass phone
pick plan play point pour pray prefer prepare present promise propose pull push rain reach receive remember remove repeat
reply report rescue return save scream share shout smile sneak spot start stay stop study surprise talk taste thank
touch trust try turn use visit wait walk want warn wash watch wave whisper wish worry yell question solve call text
engage date marry tiptoe accuse suspect blame describe drop hide lie point record film photograph
`.split(/\s+/).filter(Boolean);
const REGULAR_SET = new Set(REGULAR_VERBS);

// Words that end in -ed but are adjectives in normal use. "be + one of these" is NOT
// counted as passive unless a "by" agent follows or the scene lists the verb.
export const PARTICIPLE_ADJECTIVES = new Set(`
tired bored worried excited interested surprised shocked scared married engaged pleased confused amazed embarrassed
annoyed frightened satisfied disappointed relaxed delighted crowded closed excited stressed upset hurt lost broken
`.split(/\s+/).filter(Boolean));

// -ed words that are not verb forms.
const NOT_PARTICIPLE_ED = new Set('red bed need seed speed feed weed shed sled bleed breed greed hundred naked wicked sacred ted fred bred shred'.split(' '));

// Over-regularised forms learners write, mapped to the right participle.
export const WRONG_PARTICIPLES = {
  founded: 'found', finded: 'found', losed: 'lost', teached: 'taught', buyed: 'bought', catched: 'caught',
  leaved: 'left', putted: 'put', hided: 'hidden', falled: 'fallen', seed: 'seen', sended: 'sent',
  telled: 'told', writed: 'written', taked: 'taken', gived: 'given', maked: 'made', sayed: 'said', breaked: 'broken',
  bringed: 'brought', thinked: 'thought', speaked: 'spoken', heared: 'heard', choosed: 'chosen', stealed: 'stolen',
  knowed: 'known', drinked: 'drunk', eated: 'eaten', forgived: 'forgiven', hearded: 'heard', striked: 'struck',
};

/** Regular -ed form of a base verb: love->loved, stop->stopped, carry->carried. */
export function regularEd(base) {
  if (base.endsWith('e')) return base + 'd';
  if (/[^aeiou]y$/.test(base)) return base.slice(0, -1) + 'ied';
  if (/^[^aeiou]*[aeiou][bdgklmnprt]$/.test(base) && base.length <= 4) return base + base.slice(-1) + 'ed';
  if (base === 'prefer') return 'preferred';
  return base + 'ed';
}
export function regularIng(base) {
  if (base === 'lie') return 'lying';
  if (base === 'be') return 'being';
  if (/[^e]e$/.test(base)) return base.slice(0, -1) + 'ing';
  if (/^[^aeiou]*[aeiou][bdgklmnprt]$/.test(base) && base.length <= 4) return base + base.slice(-1) + 'ing';
  return base + 'ing';
}
export function regularS(base) {
  if (base === 'have') return 'has';
  if (base === 'be') return 'is';
  if (/(s|sh|ch|x|z|o)$/.test(base)) return base + 'es';
  if (/[^aeiou]y$/.test(base)) return base.slice(0, -1) + 'ies';
  return base + 's';
}

/** All verb forms of a base: base, -s, past, pp, -ing. */
export function verbForms(base) {
  const forms = new Set([base, regularS(base), regularIng(base)]);
  const irr = IRREGULAR[base];
  if (irr) {
    irr.past.forEach((f) => forms.add(f));
    irr.pp.forEach((f) => forms.add(f));
  } else {
    forms.add(regularEd(base));
  }
  if (base === 'be') ['am', 'is', 'are', 'was', 'were', 'been', 'being', 'be'].forEach((f) => forms.add(f));
  if (base === 'apologize') verbForms('apologise').forEach((f) => forms.add(f));
  if (base === 'lie') { forms.add('lied'); forms.add('lies'); }
  return [...forms];
}

/**
 * Is this word a past participle? Returns {ok, base, wrong?}.
 * wrong = the correct participle when the learner used past simple / base / over-regularised form.
 */
export function participleInfo(word) {
  const w = word.toLowerCase();
  if (WRONG_PARTICIPLES[w]) return { ok: false, wrong: WRONG_PARTICIPLES[w] };
  if (PP_TO_BASE[w]) return { ok: true, base: PP_TO_BASE[w] };
  if (PAST_TO_BASE[w] && !PP_TO_BASE[w]) {
    const base = PAST_TO_BASE[w];
    return { ok: false, wrong: IRREGULAR[base].pp[0], base };
  }
  if (IRREGULAR[w] && !PP_TO_BASE[w]) return { ok: false, wrong: IRREGULAR[w].pp[0], base: w };
  if (REGULAR_SET.has(w)) return { ok: false, wrong: regularEd(w), base: w };
  if (w.length > 3 && w.endsWith('ed') && !NOT_PARTICIPLE_ED.has(w)) return { ok: true, base: guessBaseFromEd(w) };
  return { ok: false };
}

export function guessBaseFromEd(w) {
  for (const b of REGULAR_VERBS) if (regularEd(b) === w) return b;
  if (w.endsWith('ied')) return w.slice(0, -3) + 'y';
  if (/([bdgklmnprt])\1ed$/.test(w)) return w.slice(0, -3);
  return w.slice(0, -2);
}

export const BE_FORMS = new Set(['am', 'is', 'are', 'was', 'were', 'be', 'been', 'being']);
export const MODALS = new Set(['will', 'would', 'can', 'could', 'may', 'might', 'must', 'should', 'shall']);
export const ADVERBS = new Set(`not never also just really secretly often always quickly still already then soon
finally suddenly quietly slowly clearly probably maybe even only first again later easily carefully happily sadly
completely totally nearly almost all both everywhere once immediately`.split(/\s+/).filter(Boolean));

const SINGULAR_S = new Set('news bus glass boss dress class kiss mess grass gas this is was his its yes us lens series species chess christmas always perhaps'.split(' '));
const IRREGULAR_PLURALS = new Set('people children men women mice teeth feet geese police pyjamas trousers jeans glasses clothes'.split(' '));
const EITHER_NUMBER = new Set('fish sheep deer'.split(' '));

/** 'sg' | 'pl' | '?' for a noun head word. */
export function nounNumber(word) {
  const w = word.toLowerCase().replace(/'s$/, '');
  if (EITHER_NUMBER.has(w)) return '?';
  if (IRREGULAR_PLURALS.has(w)) return 'pl';
  if (['i'].includes(w)) return 'i';
  if (['you', 'we', 'they', 'both', 'these', 'those', 'many', 'few', 'several'].includes(w)) return 'pl';
  if (['he', 'she', 'it', 'this', 'that', 'everybody', 'everyone', 'somebody', 'someone', 'nobody', 'nothing', 'something', 'one', 'each'].includes(w)) return 'sg';
  if (SINGULAR_S.has(w) || /(ss|us|is)$/.test(w)) return 'sg';
  if (/s$/.test(w) && w.length > 2) return 'pl';
  return 'sg';
}

/** Rough lemmatiser for the level lint. Returns a list of candidate base words. */
export function lemmaCandidates(word) {
  const w = word.toLowerCase();
  const out = new Set([w]);
  if (PP_TO_BASE[w]) out.add(PP_TO_BASE[w]);
  if (PAST_TO_BASE[w]) out.add(PAST_TO_BASE[w]);
  const irregularNouns = { people: 'person', children: 'child', men: 'man', women: 'woman', mice: 'mouse', teeth: 'tooth', feet: 'foot', better: 'good', best: 'good', worse: 'bad', worst: 'bad', am: 'be', is: 'be', are: 'be', was: 'be', were: 'be', been: 'be', being: 'be', has: 'have', does: 'do', lying: 'lie', dying: 'die', wives: 'wife', knives: 'knife', lives: 'life', leaves: 'leaf', ladies: 'lady', parties: 'party', stories: 'story' };
  if (irregularNouns[w]) out.add(irregularNouns[w]);
  const add = (s) => s && s.length > 1 && out.add(s);
  if (w.endsWith("'s")) add(w.slice(0, -2));
  if (w.endsWith('s')) add(w.slice(0, -1));
  if (w.endsWith('es')) add(w.slice(0, -2));
  if (w.endsWith('ies')) add(w.slice(0, -3) + 'y');
  if (w.endsWith('ied')) add(w.slice(0, -3) + 'y');
  if (w.endsWith('ed')) { add(w.slice(0, -2)); add(w.slice(0, -1)); if (/([bdgklmnprt])\1ed$/.test(w)) add(w.slice(0, -3)); }
  if (w.endsWith('ing')) { add(w.slice(0, -3)); add(w.slice(0, -3) + 'e'); if (/([bdgklmnprt])\1ing$/.test(w)) add(w.slice(0, -4)); }
  if (w.endsWith('er')) { add(w.slice(0, -2)); add(w.slice(0, -1)); if (/([bdgt])\1er$/.test(w)) add(w.slice(0, -3)); if (w.endsWith('ier')) add(w.slice(0, -3) + 'y'); }
  if (w.endsWith('est')) { add(w.slice(0, -3)); add(w.slice(0, -2)); if (/([bdgt])\1est$/.test(w)) add(w.slice(0, -4)); if (w.endsWith('iest')) add(w.slice(0, -4) + 'y'); }
  if (w.endsWith('ly')) { add(w.slice(0, -2)); if (w.endsWith('ily')) add(w.slice(0, -3) + 'y'); }
  if (w.endsWith("n't")) add(w.slice(0, -3));
  return [...out];
}

/** Split text into word tokens (letters, apostrophes inside words, digits). */
export function words(text) {
  return (text.match(/[A-Za-zÀ-ỹ0-9]+(?:['’][A-Za-z]+)*/g) || []).map((t) => t.replace(/’/g, "'"));
}
