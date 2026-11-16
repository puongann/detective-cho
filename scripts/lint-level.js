// Level lint: every player-facing text must use A1-A2 words (or glossary words, names, target phrases),
// narrator sentences max 12 words, and NO passive voice in narrator text (students make the passive).
// Fails the build (exit code 1) on any problem.  Run: npm run lint:level
import fs from 'node:fs';
import { SCENES, ACTS } from '../src/data/scenes.js';
import * as STORY from '../src/data/story.js';
import { QUIZ } from '../src/data/quiz.js';
import { makeLevelChecker } from '../src/lib/level-check.js';

const listText = fs.readFileSync(new URL('./a1a2-words.txt', import.meta.url), 'utf8');

const { lintText, problems } = makeLevelChecker(listText);

// ---- scenes ----
for (const a of ACTS) { lintText(`act ${a.n} title`, a.title); lintText(`act ${a.n} sub`, a.sub); }
for (const s of SCENES) {
  const g = s.glossary || [];
  for (const f of ['title', 'prompt', 'intro', 'reaction', 'bridge', 'failLine', 'previously']) lintText(`scene ${s.n} ${f}`, s[f], { glossary: g });
  for (const [i, h] of s.hints.entries()) lintText(`scene ${s.n} hint ${i + 1}`, h.replace(/^[^:]+:/, '').replace(/\([^)]*\)/g, ' '), { maxWords: 0, passive: false, glossary: g });
}
// ---- story ----
const { CHARACTERS, SUSPECTS, CHO_GAGS, WRITING_MESSAGES, ASSIGN_JOKES, PHONE_WAITING, QUIZ_REACTIONS, BONUS_TIPS, RECAP, WIN, LOSE } = STORY;
CHARACTERS.forEach((c) => lintText(`character ${c.id}`, c.line));
SUSPECTS.forEach((c) => lintText(`suspect ${c.id}`, c.line));
[...CHO_GAGS, ...WRITING_MESSAGES, ...ASSIGN_JOKES, ...PHONE_WAITING, ...QUIZ_REACTIONS.pass, ...QUIZ_REACTIONS.fail, ...BONUS_TIPS].forEach((t, i) => lintText(`story line ${i}`, t));
RECAP.forEach((t, i) => lintText(`recap ${i}`, t));
for (const [k, v] of Object.entries(WIN)) {
  const arr = Array.isArray(v) ? v : [v];
  // The sentencing lines are passive ON PURPOSE (model sentences); the class challenge is a frame.
  arr.forEach((t, i) => lintText(`WIN.${k}[${i}]`, t, { passive: !['punishments', 'challenge'].includes(k), maxWords: k === 'punishments' ? 20 : 12 }));
}
// LOSE.banner is the required stamp text "All detectives have been fired."
for (const [k, v] of Object.entries(LOSE)) (Array.isArray(v) ? v : [v]).forEach((t, i) => lintText(`LOSE.${k}[${i}]`, t, { passive: k !== 'banner' }));
// ---- quiz ----
QUIZ.forEach((q, i) => { lintText(`quiz ${i}`, q.q, { maxWords: 14, passive: false }); q.o.forEach((o) => lintText(`quiz ${i} option`, o, { maxWords: 14, passive: false })); });

if (problems.length) {
  console.error(`\n✖ Level lint: ${problems.length} problem(s)\n` + problems.map((p) => '  - ' + p).join('\n'));
  process.exit(1);
}
console.log(`✔ Level lint passed: ${SCENES.length} scenes, endings, quiz. A1-A2 words, ≤12-word sentences, no passive in narrator text.`);
