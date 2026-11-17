import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkPhrase, findPhrases } from '../src/lib/phrase-matcher.js';

const FOUND = [
  ['get-on-well', 'Hoa gets on well with Long.'],
  ['get-on-well', 'They got on really well with each other.'],
  ['get-on-well', 'The friends were seen getting on well with everybody.'],
  ['good-relationship', 'Hoa has a very good relationship with her mum.'],
  ['lot-in-common', 'Long and Linh have a lot in common.'],
  ['lot-in-common', 'They had a lot of things in common.'],
  ['fall-out', 'Long fell out with the class.'],
  ['fall-out', 'They have fallen out with each other.'],
  ['rocky-relationship', 'They have a very rocky relationship with each other.'],
  ['argument', 'Hoa had a big argument with Long.'],
  ['argument', 'Hoa is having an argument with Long.'],
  ['make-up', 'Hoa and Long made up.'],
  ['admire', 'Hoa admires Long for his big heart.'],
  ['admire', 'Long was admired for his song.'],
  ['ask-advice', 'Chó was asked for advice by Hoa.'],
  ['ask-advice', 'Hoa asked Chó for some advice.'],
  ['feelings-for', 'Long has strong feelings for Linh.'],
  ['fall-in-love', 'Linh fell in love with Long.'],
  ['fall-in-love', 'She has fallen in love with him.'],
  ['break-up', 'Hoa broke up with Nam.'],
  ['casual-acquaintance', 'She is only a casual acquaintance.'],
  ['strike-up', 'Nam struck up a conversation with Vy.'],
  ['strike-up', 'He is striking up a new friendship.'],
  ['apologize', 'Nam apologized to Hoa for lying.'],
  ['apologize', 'Fox was seen apologising to Hoa for coming home late.'],
  ['love-first-sight', 'It was love at first sight.'],
  ['get-married', 'Long is getting married to Linh.'],
  ['make-up-for', 'Flowers can not make up for lies.'],
  ['cheat-on', 'Nam cheated on Hoa.'],
  ['lie-to', 'Hoa was lied to by Nam.'],
  ['lie-to', 'Nam was caught lying to Hoa.'],
  ['trust', 'Nam was trusted by Hoa.'],
  ['faithful', 'Nam was not faithful to Hoa.'],
  ['forgive', 'Hoa forgave Long for the banana.'],
  ['crush-on', 'Vy has a big crush on Chó.'],
  ['go-out-with', 'Nam is going out with Vy.'],
  ['propose-to', 'Linh was proposed to by Long.'],
  ['get-engaged', 'Hoa got engaged to Nam.'],
  ['let-down', 'Hoa was let down by Nam.'],
  ['let-down', 'Nam let Hoa down.'],
  ['break-heart', "Nam broke Hoa's heart."],
  ['break-heart', "Hoa's heart was broken by Nam."],
];
for (const [id, s] of FOUND) test(`finds ${id}: ${s}`, () => assert.equal(checkPhrase(id, s).found, true));

const WRONG = [
  ['argument', 'Hoa had an argument to Long.', /argument WITH/],
  ['argument', 'Hoa had an argument at Long.', /argument WITH/],
  ['apologize', 'Nam apologized with Hoa for lying.', /apologize TO/],
  ['apologize', 'Nam apologized for lying.', /apologize TO/],
  ['ask-advice', 'Chó was asked about advice.', /FOR advice/],
  ['ask-advice', 'Chó was asked for advices.', /no -s/],
  ['get-married', 'They got married with each other.', /married TO/],
  ['fall-in-love', 'Linh fell in love to Long.', /love WITH/],
  ['love-first-sight', 'It was love in first sight.', /love AT first sight/],
  ['love-first-sight', 'It was love at the first sight.', /no "the"/],
  ['lot-in-common', 'They have a lot on common.', /IN common/],
  ['lot-in-common', 'They have lot in common.', /A lot/],
  ['crush-on', 'Long has a crush with Linh.', /crush ON/],
  ['get-engaged', 'Hoa got engaged with Nam.', /engaged TO/],
  ['casual-acquaintance', 'She is a casually acquaintance.', /CASUAL/],
  ['strike-up', 'He struck a conversation with her.', /strike UP/],
  ['cheat-on', 'Nam cheated to Hoa.', /cheat ON/],
  ['faithful', 'Be faithful with me.', /faithful TO/],
  ['break-up', 'Hoa broke up to Nam.', /break up WITH/],
  ['propose-to', 'Long proposed with Linh.', /propose TO/],
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
  const f = findPhrases('Hoa was lied to by Nam and her heart was broken.');
  assert.ok(f.includes('lie-to') && f.includes('break-heart'));
});
