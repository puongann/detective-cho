import test from 'node:test';
import assert from 'node:assert/strict';
import { SCENE_BY_N, STORY_TITLE } from '../src/data/scenes.js';
import * as scenes from '../src/data/scenes.js';
import { applyStory, sceneDiff, toText, FIELDS, validateScene, originalScene } from '../src/lib/story-edit.js';
import { check } from '../src/lib/checker.js';

test('story edits apply and reset', () => {
  const origTitle = STORY_TITLE;
  applyStory({ title: 'My Case', scenes: { s2: { title: 'The Big Ring', keywords: 'ring, box', hints: 'one\ntwo' } } });
  assert.equal(scenes.STORY_TITLE, 'My Case');
  assert.equal(SCENE_BY_N[2].title, 'The Big Ring');
  assert.deepEqual(SCENE_BY_N[2].keywords, ['ring', 'box']);
  assert.deepEqual(SCENE_BY_N[2].hints, ['one', 'two']);
  applyStory(null);
  assert.equal(scenes.STORY_TITLE, origTitle);
  assert.equal(SCENE_BY_N[2].title, originalScene(2).title);
});

test('edited keywords change what the checker accepts', () => {
  applyStory({ scenes: { s1: { keywords: 'kite' } } });
  assert.equal(check('A big banner was hung on the wall.', SCENE_BY_N[1]).ok, false);
  assert.equal(check('A big kite was hung on the wall.', SCENE_BY_N[1]).ok, true);
  applyStory(null);
  assert.equal(check('A big banner was hung on the wall.', SCENE_BY_N[1]).ok, true);
});

test('sceneDiff keeps only changed fields', () => {
  const texts = Object.fromEntries(FIELDS.map(([k]) => [k, toText(k, SCENE_BY_N[3][k])]));
  assert.deepEqual(sceneDiff(3, texts), {});
  texts.prompt = 'New prompt.';
  assert.deepEqual(sceneDiff(3, texts), { prompt: 'New prompt.' });
});

test('validateScene catches broken scenes', () => {
  assert.deepEqual(validateScene(SCENE_BY_N[4]), []);
  const bad = { ...SCENE_BY_N[4], keywords: [], targetPhrases: ['nope'] };
  const errs = validateScene(bad);
  assert.ok(errs.some((e) => /keyword/.test(e)));
  assert.ok(errs.some((e) => /nope/.test(e)));
});
