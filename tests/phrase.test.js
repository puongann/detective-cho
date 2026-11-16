import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkPhrase, findPhrases } from '../src/lib/phrase-matcher.js';

const FOUND = [
  ['get-on-well', 'Panda gets on well with Monkey.'],
  ['get-on-well', 'They got on really well with each other.'],
  ['get-on-well', 'The friends were seen getting on well with everybody.'],
  ['good-relationship', 'Panda has a very good relationship with her mum.'],
  ['lot-in-common', 'Monkey and Giraffe have a lot in common.'],
  ['lot-in-common', 'They had a lot of things in common.'],
  ['fall-out', 'Monkey fell out with the class.'],
  ['fall-out', 'They have fallen out with each other.'],
  ['rocky-relationship', 'They have a very rocky relationship with each other.'],
  ['argument', 'Panda had a big argument with Monkey.'],
  ['argument', 'Panda is having an argument with Monkey.'],
  ['make-up', 'Panda and Monkey made up.'],
  ['admire', 'Panda admires Monkey for his big heart.'],
  ['admire', 'Monkey was admired for his song.'],
  ['ask-advice', 'Chó was asked for advice by Panda.'],
  ['ask-advice', 'Panda asked Chó for some advice.'],
  ['feelings-for', 'Monkey has strong feelings for Giraffe.'],
  ['fall-in-love', 'Giraffe fell in love with Monkey.'],
  ['fall-in-love', 'She has fallen in love with him.'],
  ['break-up', 'Panda broke up with Penguin.'],
  ['casual-acquaintance', 'She is only a casual acquaintance.'],
  ['strike-up', 'Penguin struck up a conversation with Flamingo.'],
  ['strike-up', 'He is striking up a new friendship.'],
  ['apologize', 'Penguin apologized to Panda for lying.'],
  ['apologize', 'Fox was seen apologising to Panda for coming home late.'],
  ['love-first-sight', 'It was love at first sight.'],
  ['get-married', 'Monkey is getting married to Giraffe.'],
  ['make-up-for', 'Flowers can not make up for lies.'],
  ['cheat-on', 'Penguin cheated on Panda.'],
  ['lie-to', 'Panda was lied to by Penguin.'],
  ['lie-to', 'Penguin was caught lying to Panda.'],
  ['trust', 'Penguin was trusted by Panda.'],
  ['faithful', 'Penguin was not faithful to Panda.'],
  ['forgive', 'Panda forgave Monkey for the banana.'],
  ['crush-on', 'Flamingo has a big crush on Chó.'],
  ['go-out-with', 'Penguin is going out with Flamingo.'],
  ['propose-to', 'Giraffe was proposed to by Monkey.'],
  ['get-engaged', 'Panda got engaged to Penguin.'],
  ['let-down', 'Panda was let down by Penguin.'],
  ['let-down', 'Penguin let Panda down.'],
  ['break-heart', "Penguin broke Panda's heart."],
  ['break-heart', "Panda's heart was broken by Penguin."],
];
for (const [id, s] of FOUND) test(`finds ${id}: ${s}`, () => assert.equal(checkPhrase(id, s).found, true));

const WRONG = [
  ['argument', 'Panda had an argument to Monkey.', /argument WITH/],
  ['argument', 'Panda had an argument at Monkey.', /argument WITH/],
  ['apologize', 'Penguin apologized with Panda for lying.', /apologize TO/],
  ['apologize', 'Penguin apologized for lying.', /apologize TO/],
  ['ask-advice', 'Chó was asked about advice.', /FOR advice/],
  ['ask-advice', 'Chó was asked for advices.', /no -s/],
  ['get-married', 'They got married with each other.', /married TO/],
  ['fall-in-love', 'Giraffe fell in love to Monkey.', /love WITH/],
  ['love-first-sight', 'It was love in first sight.', /love AT first sight/],
  ['love-first-sight', 'It was love at the first sight.', /no "the"/],
  ['lot-in-common', 'They have a lot on common.', /IN common/],
  ['lot-in-common', 'They have lot in common.', /A lot/],
  ['crush-on', 'Monkey has a crush with Giraffe.', /crush ON/],
  ['get-engaged', 'Panda got engaged with Penguin.', /engaged TO/],
  ['casual-acquaintance', 'She is a casually acquaintance.', /CASUAL/],
  ['strike-up', 'He struck a conversation with her.', /strike UP/],
  ['cheat-on', 'Penguin cheated to Panda.', /cheat ON/],
  ['faithful', 'Be faithful with me.', /faithful TO/],
  ['break-up', 'Panda broke up to Penguin.', /break up WITH/],
  ['propose-to', 'Monkey proposed with Giraffe.', /propose TO/],
  ['go-out-with', 'He goes out to her.', /out WITH/],
  ['make-up-for', 'Flowers make up to his mistake.', /make up FOR/],
];
for (const [id, s, re] of WRONG) {
  test(`wrong ${id}: ${s}`, () => {
    const r = checkPhrase(id, s);
    assert.equal(r.found, false);
    assert.match(String(r.why), re);
  });
}

test('missing phrase gives no reason', () => assert.equal(checkPhrase('argument', 'The ring was stolen.').why, null));
test('findPhrases finds several', () => {
  const f = findPhrases('Panda was lied to by Penguin and her heart was broken.');
  assert.ok(f.includes('lie-to') && f.includes('break-heart'));
});
