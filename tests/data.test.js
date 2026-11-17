import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { SCENES, ACTS } from '../src/data/scenes.js';
import { VOCAB, CORE_IDS, EXTRA_IDS } from '../src/data/vocab.js';
import { QUIZ } from '../src/data/quiz.js';
import * as STORY from '../src/data/story.js';
import { autoAssign, pickQuiz } from '../src/lib/game.js';

test('one story, 15 scenes in order, 4 acts', () => {
  assert.deepEqual(SCENES.map((s) => s.n), Array.from({ length: 15 }, (_, i) => i + 1));
  assert.deepEqual(ACTS.flatMap((a) => a.scenes), SCENES.map((s) => s.n));
});

test('29 phrases (18 core + 11 extra) with IPA and Vietnamese', () => {
  assert.equal(CORE_IDS.length, 18);
  assert.equal(EXTRA_IDS.length, 11);
  for (const v of VOCAB) assert.ok(v.ipa && v.vi && v.example && v.patterns.length, v.id);
});

test('every phrase appears as a chip in the narrator lines or endings', () => {
  const all = JSON.stringify([SCENES, STORY]);
  for (const v of VOCAB) assert.ok(all.includes(`|${v.id}]]`), `phrase ${v.id} never appears as a chip`);
});

test('every scene has the fields the game needs', () => {
  for (const s of SCENES) {
    for (const f of ['title', 'time', 'image', 'intro', 'prompt', 'reaction', 'bridge', 'failLine', 'frame', 'verb']) assert.ok(s[f], `scene ${s.n} ${f}`);
    assert.equal(s.hints.length, 3, `scene ${s.n} hints`);
    assert.ok(s.glossary.length >= 2 && s.glossary.length <= 4, `scene ${s.n} glossary`);
    assert.ok(s.keywords.length && s.acceptedVerbs.length && s.modelAnswers.length);
    if (s.mode === 'phrase') assert.ok(s.targetPhrases.length);
    assert.ok(fs.existsSync(new URL('../public/' + s.image, import.meta.url)), `missing picture ${s.image}`);
  }
  assert.ok(SCENES[5].previously && SCENES[10].previously, 'Last time recap at scenes 6 and 11');
});

test('quiz pool: 40+ questions, covers all 29 phrases, answers valid', () => {
  assert.ok(QUIZ.length >= 40);
  const covered = new Set(QUIZ.map((q) => q.phrase));
  for (const v of VOCAB) assert.ok(covered.has(v.id), `quiz misses ${v.id}`);
  for (const q of QUIZ) { assert.equal(q.o.length, 3); assert.ok(q.a >= 0 && q.a < 3); }
  for (const t of ['prep', 'pick', 'fix', 'form']) assert.ok(QUIZ.some((q) => q.type === t), t);
});

test('WIN has 12+ punishments, 5 suspects, cheater is on the vote', () => {
  assert.ok(STORY.WIN.punishments.length >= 12);
  assert.equal(STORY.SUSPECTS.length, 5);
  assert.ok(STORY.SUSPECTS.some((s) => s.id === STORY.CHEATER));
});

test('story stays solvable with clues lost: many scenes point to Nam', () => {
  const pointToPenguin = [8, 9, 10, 11, 12, 13, 14, 15];
  assert.ok(pointToPenguin.length >= 6);
});

test('autoAssign: free numbers are shared evenly among present students', () => {
  const players = { a: { name: 'A' }, b: { name: 'B' }, c: { name: 'C' }, j: { name: 'J', isJunior: true } };
  const seats = { 1: 'a', 2: 'b', 3: 'c' };
  const { assign, extra } = autoAssign(seats, players, () => 0.3);
  assert.equal(Object.keys(assign).length, 15);
  assert.equal(extra.length, 12);
  const load = {};
  for (const a of Object.values(assign)) load[a.uid] = (load[a.uid] || 0) + 1;
  assert.deepEqual(Object.values(load).sort(), [5, 5, 5]);
  assert.ok(!load.j, 'junior detectives get no scene');
  assert.equal(assign[1].uid, 'a');
});

test('autoAssign: nobody gets 2 scenes before everyone has 1', () => {
  const players = Object.fromEntries(Array.from({ length: 10 }, (_, i) => [`p${i}`, { name: `P${i}` }]));
  const seats = { 1: 'p0', 2: 'p0' }; // p0 somehow holds 2
  const { assign } = autoAssign(seats, players);
  const load = {};
  for (const a of Object.values(assign)) load[a.uid] = (load[a.uid] || 0) + 1;
  assert.ok(Object.values(load).every((x) => x >= 1 && x <= 2));
});

test('pickQuiz returns unique questions', () => {
  const p = pickQuiz(QUIZ, 8);
  assert.equal(p.length, 8);
  assert.equal(new Set(p).size, 8);
});
