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
  [2, 'A ring was given to Hoa by Nam.'],
  [2, 'A diamond ring was bought by Nam.'],
  [2, 'Hoa was given a shiny ring.'],
  [3, 'A giant cake was made by Bin.'],
  [3, 'A love song was sung by Vy.'],
  [3, 'The banana cake was baked by Bin.'],
  [4, 'Chó was asked for advice by Hoa.'],
  [4, 'Cho was asked for advice by Hoa.'],
  [5, 'The ring was stolen from the box.'],
  [5, 'The window was opened at night.'],
  [5, 'The ring was taken at night.'],
  [6, 'A banana peel was found on the floor.'],
  [6, 'A banana peel was left near the window.'],
  [7, 'Bin was blamed by everybody.'],
  [7, 'Bin was blamed for the missing ring.'],
  [8, 'A surprise video was made by Bin.'],
  [8, 'The video was recorded at midnight.'],
  [9, 'Wet footprints were left on the floor.'],
  [9, 'Small footprints were found near the pool.'],
  [10, "A pink feather was found in Nam's jacket."],
  [10, 'A long feather was hidden in the pocket.'],
  [11, 'A photo was taken by Linh.'],
  [11, 'Nam and Vy were photographed by Linh.'],
  [12, 'A love letter was dropped in the pool.'],
  [12, 'The letter was written by somebody.'],
  [13, 'Vy was called a casual acquaintance by Nam.'],
  [14, 'Hoa was lied to by Nam.'],
  [14, 'Hoa was let down by Nam.'],
  [15, 'The ring was worn by Vy.'],
  [15, 'The missing ring was found on the stage.'],
  [5, 'The ring has been stolen.'],
  [5, 'The ring will be found soon.'],
  [9, 'The footprints were quickly found by Chó.'],
  [3, 'A song is being sung by Vy.'],
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
  [11, 'A photo was took by Linh.', /wrong participle: took → taken/],
  [6, 'A banana peel was find on the floor.', /wrong participle: find → found/],
  [6, 'A banana peel was founded on the floor.', /wrong participle: founded → found/],
  [3, 'A giant cake was maked by Bin.', /spelling|wrong participle/],
  [7, 'Bin was blame by everybody.', /wrong participle: blame → blamed/],
  [5, 'The ring stolen from the box.', /not passive: no form of be/],
  [5, 'Somebody stole the ring from the box.', /not passive/],
  [7, 'Everybody blamed Bin.', /not passive/],
  [5, 'The ring is gold and shiny.', /not passive: be \+ adjective/],
  [7, 'Bin is eating a banana.', /be \+ -ing is active/],
  [9, 'Wet footprints was left on the floor.', /agreement: was → were/],
  [1, 'The balloons was put in the hall.', /agreement: was → were/],
  [5, 'The ring were stolen from the box.', /agreement: were → was/],
  [11, 'Nam and Vy was photographed by Linh.', /agreement: was → were/],
  [5, 'The rign was stolen from the box.', /spelling: rign/],
  [6, 'A banana peal was found on the flor.', /spelling: flor/],
  [5, 'the ring was stolen from the box.', /capital letter at the start/],
  [5, 'The ring was stolen from the box', /no full stop/],
  [5, 'The ring was stolen from the Box.', /capital letter: Box/],
  [2, 'A ring was given to hoa by Nam.', /capital letter: Hoa/],
  [4, 'cho was asked for advice by Hoa.', /capital letter at the start/],
  [5, 'The ring was  stolen from the box.', /double space/],
  [5, 'The ring was stolen!!!', /junk punctuation|too short/],
  [5, 'Ring stolen.', /too short/],
  [5, 'The ring was stolen from the box :)', /junk|full stop/],
  [5, 'A cake was eaten by Bin.', /off-topic/],
  [4, 'Hoa was helped by Chó.', /phrase missing/],
  [4, 'Chó was asked about advice by Hoa.', /wrong preposition: ask sb FOR advice/],
  [13, 'Vy was called a casual friend by Nam.', /phrase missing/],
  [5, 'The ring was stolen by Nam.', /spoil the ending/],
  [14, 'Hoa was lied by Nam.', /phrase missing|lie TO/],
  [4, 'Chó asked Hoa for advice.', /not passive/],
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
  const r = run('Chó was asked for advice by Hoa.', 4);
  assert.equal(r.fish, true);
  assert.ok(r.phrases.includes('ask-advice'));
  assert.equal(run('The ring was stolen from the box.', 5).fish, false);
});
test('a pair of / a bunch of takes a singular verb', () => {
  assert.equal(agreement('A bunch of flowers was given to Hoa.'), null);
  assert.equal(agreement('A pair of shoes was found.'), null);
  assert.match(agreement('A bunch of flowers were given to Hoa.'), /were → was/);
});
test('quoted words are ignored for agreement', () => {
  assert.equal(agreement('The words "Miss you" were repeated by Vy.'), null);
});
test('empty input', () => { assert.equal(run('', 5).ok, false); });
