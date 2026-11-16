import { test } from 'node:test';
import assert from 'node:assert/strict';
import { check, agreement } from '../src/lib/checker.js';
import { SCENE_BY_N } from '../src/data/scenes.js';
import { isWord } from './speller.js';

const run = (text, n) => check(text, SCENE_BY_N[n], { isWord });

// ---------------- 30+ GOOD sentences ----------------
const GOOD = [
  [1, 'A big banner was hung on the wall.'],
  [1, 'The hall was decorated with balloons and flowers.'],
  [1, 'Many balloons were put in the hall.'],
  [2, 'A ring was given to Panda by Penguin.'],
  [2, 'A diamond ring was bought by Penguin.'],
  [2, 'Panda was given a shiny ring.'],
  [3, 'A giant cake was made by Monkey.'],
  [3, 'A love song was sung by Flamingo.'],
  [3, 'The banana cake was baked by Monkey.'],
  [4, 'Chó was asked for advice by Panda.'],
  [4, 'Cho was asked for advice by Panda.'],
  [5, 'The ring was stolen from the box.'],
  [5, 'The window was opened at night.'],
  [5, 'The ring was taken at night.'],
  [6, 'A banana peel was found on the floor.'],
  [6, 'A banana peel was left near the window.'],
  [7, 'Monkey was blamed by everybody.'],
  [7, 'Monkey was blamed for the missing ring.'],
  [8, 'A surprise video was made by Monkey.'],
  [8, 'The video was recorded at midnight.'],
  [9, 'Wet footprints were left on the floor.'],
  [9, 'Small footprints were found near the pool.'],
  [10, "A pink feather was found in Penguin's jacket."],
  [10, 'A long feather was hidden in the pocket.'],
  [11, 'A photo was taken by Giraffe.'],
  [11, 'Penguin and Flamingo were photographed by Giraffe.'],
  [12, 'A love letter was dropped in the pool.'],
  [12, 'The letter was written by somebody.'],
  [13, 'Flamingo was called a casual acquaintance by Penguin.'],
  [14, 'Panda was lied to by Penguin.'],
  [14, 'Panda was let down by Penguin.'],
  [15, 'The ring was worn by Flamingo.'],
  [15, 'The missing ring was found on the stage.'],
  [5, 'The ring has been stolen.'],
  [5, 'The ring will be found soon.'],
  [9, 'The footprints were quickly found by Chó.'],
  [3, 'A song is being sung by Flamingo.'],
];
for (const [n, s] of GOOD) {
  test(`GOOD #${n}: ${s}`, () => {
    const r = run(s, n);
    assert.equal(r.ok, true, `${s} -> ${r.reasons.join('; ')}`);
  });
}

// ---------------- 30+ BAD sentences ----------------
const BAD = [
  [5, 'The ring was stole from the box.', /wrong participle: stole → stolen/],
  [12, 'The letter was wrote by somebody.', /wrong participle: wrote → written/],
  [11, 'A photo was took by Giraffe.', /wrong participle: took → taken/],
  [6, 'A banana peel was find on the floor.', /wrong participle: find → found/],
  [6, 'A banana peel was founded on the floor.', /wrong participle: founded → found/],
  [3, 'A giant cake was maked by Monkey.', /spelling|wrong participle/],
  [7, 'Monkey was blame by everybody.', /wrong participle: blame → blamed/],
  [5, 'The ring stolen from the box.', /not passive: no form of be/],
  [5, 'Somebody stole the ring from the box.', /not passive/],
  [7, 'Everybody blamed Monkey.', /not passive/],
  [5, 'The ring is gold and shiny.', /not passive: be \+ adjective/],
  [7, 'Monkey is eating a banana.', /be \+ -ing is active/],
  [9, 'Wet footprints was left on the floor.', /agreement: was → were/],
  [1, 'The balloons was put in the hall.', /agreement: was → were/],
  [5, 'The ring were stolen from the box.', /agreement: were → was/],
  [11, 'Penguin and Flamingo was photographed by Giraffe.', /agreement: was → were/],
  [5, 'The rign was stolen from the box.', /spelling: rign/],
  [6, 'A banana peal was found on the flor.', /spelling: flor/],
  [5, 'the ring was stolen from the box.', /capital letter at the start/],
  [5, 'The ring was stolen from the box', /no full stop/],
  [5, 'The ring was stolen from the Box.', /capital letter: Box/],
  [2, 'A ring was given to panda by Penguin.', /capital letter: Panda/],
  [4, 'cho was asked for advice by Panda.', /capital letter at the start/],
  [5, 'The ring was  stolen from the box.', /double space/],
  [5, 'The ring was stolen!!!', /junk punctuation|too short/],
  [5, 'Ring stolen.', /too short/],
  [5, 'The ring was stolen from the box :)', /junk|full stop/],
  [5, 'A cake was eaten by Monkey.', /off-topic/],
  [4, 'Panda was helped by Chó.', /phrase missing/],
  [4, 'Chó was asked about advice by Panda.', /wrong preposition: ask sb FOR advice/],
  [13, 'Flamingo was called a casual friend by Penguin.', /phrase missing/],
  [5, 'The ring was stolen by Penguin.', /spoil the ending/],
  [14, 'Panda was lied by Penguin.', /phrase missing|lie TO/],
  [4, 'Chó asked Panda for advice.', /not passive/],
];
for (const [n, s, re] of BAD) {
  test(`BAD #${n}: ${s}`, () => {
    const r = run(s, n);
    assert.equal(r.ok, false, `${s} should fail`);
    assert.match(r.reasons.join(' | '), re);
  });
}

test('every scene: all model answers pass', () => {
  for (let n = 1; n <= 15; n++) for (const m of SCENE_BY_N[n].modelAnswers) assert.equal(run(m, n).ok, true, `${n}: ${m} -> ${run(m, n).reasons}`);
});
test('fish bonus when a correct sentence uses a phrase', () => {
  const r = run('Chó was asked for advice by Panda.', 4);
  assert.equal(r.fish, true);
  assert.ok(r.phrases.includes('ask-advice'));
  assert.equal(run('The ring was stolen from the box.', 5).fish, false);
});
test('a pair of / a bunch of takes a singular verb', () => {
  assert.equal(agreement('A bunch of flowers was given to Panda.'), null);
  assert.equal(agreement('A pair of shoes was found.'), null);
  assert.match(agreement('A bunch of flowers were given to Panda.'), /were → was/);
});
test('quoted words are ignored for agreement', () => {
  assert.equal(agreement('The words "Miss you" were repeated by Flamingo.'), null);
});
test('empty input', () => { assert.equal(run('', 5).ok, false); });
