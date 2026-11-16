// Chó's Lie Detector Test: question pool built around src/data/vocab.js.
// types: prep (pick the preposition), pick (pick the correct sentence), fix (which word is wrong),
//        form (right verb form), passive (right passive form)
// `a` = index of the correct option. Every vocab id is covered (see tests/data.test.js).

export const QUIZ = [
  // (a) prepositions
  { phrase: 'argument', type: 'prep', q: 'Panda had an argument ___ Monkey.', o: ['with', 'to', 'for'], a: 0 },
  { phrase: 'get-on-well', type: 'prep', q: 'Monkey gets on well ___ everybody.', o: ['to', 'with', 'at'], a: 1 },
  { phrase: 'good-relationship', type: 'prep', q: 'Panda has a good relationship ___ her mum.', o: ['with', 'for', 'on'], a: 0 },
  { phrase: 'fall-out', type: 'prep', q: 'I fell out ___ my brother about the TV.', o: ['to', 'on', 'with'], a: 2 },
  { phrase: 'rocky-relationship', type: 'prep', q: 'Penguin has a rocky relationship ___ Flamingo.', o: ['with', 'at', 'to'], a: 0 },
  { phrase: 'admire', type: 'prep', q: 'Panda admires Monkey ___ his big heart.', o: ['about', 'for', 'to'], a: 1 },
  { phrase: 'ask-advice', type: 'prep', q: 'Panda asked Chó ___ advice.', o: ['for', 'about', 'to'], a: 0 },
  { phrase: 'feelings-for', type: 'prep', q: 'Monkey has feelings ___ Giraffe.', o: ['with', 'on', 'for'], a: 2 },
  { phrase: 'fall-in-love', type: 'prep', q: 'Giraffe fell in love ___ Monkey.', o: ['with', 'to', 'for'], a: 0 },
  { phrase: 'break-up', type: 'prep', q: 'Panda broke up ___ Penguin.', o: ['to', 'with', 'from'], a: 1 },
  { phrase: 'apologize', type: 'prep', q: 'Penguin apologized ___ Panda for lying.', o: ['with', 'at', 'to'], a: 2 },
  { phrase: 'love-first-sight', type: 'prep', q: 'It was love ___ first sight.', o: ['at', 'in', 'on'], a: 0 },
  { phrase: 'get-married', type: 'prep', q: 'Monkey is getting married ___ Giraffe.', o: ['with', 'to', 'for'], a: 1 },
  { phrase: 'make-up-for', type: 'prep', q: 'Flowers can\'t make up ___ lies.', o: ['for', 'with', 'to'], a: 0 },
  { phrase: 'cheat-on', type: 'prep', q: 'Penguin cheated ___ Panda.', o: ['with', 'on', 'to'], a: 1 },
  { phrase: 'lie-to', type: 'prep', q: 'Don\'t lie ___ me!', o: ['to', 'with', 'at'], a: 0 },
  { phrase: 'faithful', type: 'prep', q: 'A good dog is faithful ___ its owner.', o: ['with', 'for', 'to'], a: 2 },
  { phrase: 'forgive', type: 'prep', q: 'Please forgive me ___ breaking your cup.', o: ['for', 'about', 'to'], a: 0 },
  { phrase: 'crush-on', type: 'prep', q: 'Flamingo has a crush ___ Chó.', o: ['with', 'on', 'to'], a: 1 },
  { phrase: 'go-out-with', type: 'prep', q: 'Is Penguin going out ___ Flamingo?', o: ['with', 'to', 'for'], a: 0 },
  { phrase: 'propose-to', type: 'prep', q: 'Monkey proposed ___ Giraffe with a banana ring.', o: ['with', 'for', 'to'], a: 2 },
  { phrase: 'get-engaged', type: 'prep', q: 'Panda got engaged ___ Penguin.', o: ['to', 'with', 'at'], a: 0 },
  { phrase: 'strike-up', type: 'prep', q: 'Penguin struck ___ a conversation with Flamingo.', o: ['on', 'up', 'out'], a: 1 },
  { phrase: 'let-down', type: 'prep', q: 'Penguin let Panda ___.', o: ['up', 'out', 'down'], a: 2 },

  // (b) pick the correct sentence
  { phrase: 'lot-in-common', type: 'pick', q: 'Which sentence is correct?', o: ['Monkey and Giraffe have a lot in common.', 'Monkey and Giraffe have a lot on common.', 'Monkey and Giraffe have lot in common.'], a: 0 },
  { phrase: 'casual-acquaintance', type: 'pick', q: 'Which sentence is correct?', o: ['She is only a casually acquaintance.', 'She is only a casual acquaintance.', 'She is only a casual acquaintances.'], a: 1 },
  { phrase: 'make-up', type: 'pick', q: 'Which sentence is correct?', o: ['Panda and Monkey made out.', 'Panda and Monkey made down.', 'Panda and Monkey made up.'], a: 2 },
  { phrase: 'break-heart', type: 'pick', q: 'Which sentence is correct?', o: ['Penguin broke Panda\'s heart.', 'Penguin broken Panda\'s heart.', 'Penguin break Panda heart.'], a: 0 },
  { phrase: 'trust', type: 'pick', q: 'Which sentence is correct?', o: ['Panda trusts on Penguin.', 'Panda trusts Penguin.', 'Panda trust to Penguin.'], a: 1 },
  { phrase: 'ask-advice', type: 'pick', q: 'Which sentence is correct?', o: ['Chó was asked for advice by Panda.', 'Chó was ask for advice by Panda.', 'Chó asked for advices by Panda.'], a: 0 },
  { phrase: 'casual-acquaintance', type: 'pick', q: 'Which sentence is correct?', o: ['Flamingo was call a casual acquaintance.', 'Flamingo is called a casual acquaintance.', 'Flamingo called a casual acquaintance by Penguin.'], a: 1 },
  { phrase: 'let-down', type: 'pick', q: 'Which sentence is correct?', o: ['Panda was let down by Penguin.', 'Panda was letted down by Penguin.', 'Panda let down by Penguin.'], a: 0 },

  // (c) fix the mistake: which word is wrong?
  { phrase: 'argument', type: 'fix', q: 'Which word is wrong? "Panda had an argument to Monkey."', o: ['had', 'argument', 'to'], a: 2 },
  { phrase: 'apologize', type: 'fix', q: 'Which word is wrong? "Penguin apologized with Panda for lying."', o: ['with', 'for', 'lying'], a: 0 },
  { phrase: 'get-married', type: 'fix', q: 'Which word is wrong? "They got married with each other."', o: ['got', 'with', 'each'], a: 1 },
  { phrase: 'love-first-sight', type: 'fix', q: 'Which word is wrong? "It was love in first sight."', o: ['was', 'in', 'first'], a: 1 },
  { phrase: 'crush-on', type: 'fix', q: 'Which word is wrong? "Monkey has a crush with Giraffe."', o: ['has', 'crush', 'with'], a: 2 },
  { phrase: 'feelings-for', type: 'fix', q: 'Which word is wrong? "He has feelings with her."', o: ['with', 'has', 'her'], a: 0 },
  { phrase: 'cheat-on', type: 'fix', q: 'Which word is wrong? "Penguin cheated to Panda."', o: ['Penguin', 'cheated', 'to'], a: 2 },

  // (d) right form
  { phrase: 'fall-in-love', type: 'form', q: 'Giraffe ___ in love with Monkey yesterday.', o: ['fall', 'fell', 'fallen'], a: 1 },
  { phrase: 'fall-out', type: 'form', q: 'They have ___ out with the whole class.', o: ['fell', 'falling', 'fallen'], a: 2 },
  { phrase: 'strike-up', type: 'form', q: 'Two months ago, Penguin ___ up a conversation with Flamingo.', o: ['struck', 'striked', 'strike'], a: 0 },
  { phrase: 'break-up', type: 'form', q: 'Panda ___ up with Penguin last night.', o: ['breaked', 'broke', 'broken'], a: 1 },
  { phrase: 'get-on-well', type: 'form', q: 'Now Panda and Flamingo are ___ on well.', o: ['get', 'got', 'getting'], a: 2 },
  { phrase: 'make-up-for', type: 'form', q: 'Penguin ___ up for his mistake with flowers. (past)', o: ['made', 'maked', 'make'], a: 0 },
  { phrase: 'forgive', type: 'form', q: 'Panda has ___ Monkey.', o: ['forgave', 'forgiven', 'forgived'], a: 1 },

  // passive practice (the main goal of the game)
  { phrase: 'trust', type: 'passive', q: 'Penguin was ___ by Panda.', o: ['trust', 'trusting', 'trusted'], a: 2 },
  { phrase: 'lie-to', type: 'passive', q: 'Panda was ___ to by Penguin.', o: ['lied', 'lying', 'lie'], a: 0 },
  { phrase: 'propose-to', type: 'passive', q: 'Giraffe was ___ to by Monkey.', o: ['propose', 'proposed', 'proposing'], a: 1 },
  { phrase: 'break-heart', type: 'passive', q: 'Panda\'s heart was ___ by Penguin.', o: ['broke', 'breaked', 'broken'], a: 2 },
  { phrase: 'go-out-with', type: 'passive', q: 'The ring ___ stolen at midnight.', o: ['was', 'were', 'is being'], a: 0 },
  { phrase: 'faithful', type: 'passive', q: 'Wet footprints ___ left on the floor.', o: ['was', 'were', 'is'], a: 1 },
  { phrase: 'get-engaged', type: 'passive', q: 'A ring was ___ to Panda by Penguin.', o: ['gave', 'give', 'given'], a: 2 },
  { phrase: 'admire', type: 'passive', q: 'A photo was ___ by Giraffe.', o: ['taken', 'took', 'take'], a: 0 },
];
