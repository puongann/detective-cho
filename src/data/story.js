// Characters, suspects, endings and funny lines for "The Missing Ring at Sunflower Hotel".
// All player-facing text: A1-A2 words, short sentences (checked by scripts/lint-level.js).

export const CHEATER = 'penguin';

export const CHARACTERS = [
  { id: 'cho', name: 'Chó', img: 'assets/cho.png', line: 'An orange cat detective. On holiday. Loves fish and fish pâté. Please do not ask about the name.' },
  { id: 'panda', name: 'Panda', img: 'assets/characters/panda.svg', line: 'Kind and sweet. Today is her big party with Penguin.' },
  { id: 'penguin', name: 'Penguin', img: 'assets/characters/penguin.svg', line: 'Black jacket, big smile. Always has an excuse.' },
  { id: 'monkey', name: 'Monkey', img: 'assets/characters/monkey.svg', line: 'Penguin\'s best friend. Loves bananas and silly jokes.' },
  { id: 'giraffe', name: 'Giraffe', img: 'assets/characters/giraffe.svg', line: 'Panda\'s best friend. Long neck. She sees everything.' },
  { id: 'flamingo', name: 'Flamingo', img: 'assets/characters/flamingo.svg', line: 'The pink hotel singer. Loves love songs.' },
];

export const SUSPECTS = [
  { id: 'penguin', name: 'Penguin', img: 'assets/suspects/penguin.svg', line: 'Big smile. Wet feet. Flowers for no reason.' },
  { id: 'monkey', name: 'Monkey', img: 'assets/suspects/monkey.svg', line: 'Banana peel. Big jokes. Up a tree.' },
  { id: 'giraffe', name: 'Giraffe', img: 'assets/suspects/giraffe.svg', line: 'Long neck. Sees everything. Too much?' },
  { id: 'panda', name: 'Panda', img: 'assets/suspects/panda.svg', line: 'She lost her own ring? Strange...' },
  { id: 'nobody', name: 'Nobody', img: 'assets/suspects/nobody.svg', line: 'It is a big mistake. Everybody needs a hug.' },
];

export const CHO_GAGS = [
  'Chó: "Yes, my name means dog. No, I am not a dog. Next question."',
  'Chó: "Wake me up for fish. Only for fish."',
  'Chó: "Why is a cat called Dog? Why is a hotel called Sunflower? Life is strange."',
  'Chó: "I am on holiday. This is my holiday face."',
  'Chó: "Fish pâté first. Grammar second."',
];

// Big screen, Phase 1 (everyone writes). {n} = detective number, {name} = student name.
export const WRITING_MESSAGES = [
  'Detective #{n} looks at the ceiling. Grammar, please come!',
  'Detective #{n} counts on their fingers. Was? Were? Hmm.',
  'Detective #{n} writes very fast. Chó is a little scared.',
  'Detective #{n} is thinking. Smoke comes out of their ears.',
  'Chó gives Detective #{n} one fish for luck.',
  'Detective #{n} checks the capital letter. Good detective!',
  'Detective #{n} looks at the picture again. Smart move.',
  'Detective #{n} needs a full stop. Do not forget it!',
  'Chó sleeps. Detective #{n} works. Everybody is happy.',
  'Detective #{n} found the past participle! Party time!',
];

// Assignment announcement when a number nobody picked goes to a present student.
export const ASSIGN_JOKES = [
  'Detective {name}, you also have #{n}. Detective #{n} is "sick". (We know: bubble tea shop.)',
  'Detective {name}, please take #{n} too. Detective #{n} is "at the doctor". (We know: video games.)',
  'Detective {name}, #{n} is yours too. Detective #{n} is "very busy". (We know: sleeping.)',
  'Detective {name}, you also get #{n}. Detective #{n} is "lost". (We know: in the canteen.)',
];

export const PHONE_WAITING = [
  'Chó is reading the case files...',
  'Chó is eating fish pâté. Please wait.',
  'The detectives look for clues...',
  'Chó looks under every sofa...',
];

export const REVEAL_PRAISE = ['CLUE FOUND!', 'GREAT WORK!', 'NICE PASSIVE!', 'TOP DETECTIVE!'];

export const QUIZ_REACTIONS = {
  pass: ['Chó: "The class knows it! One clue comes back!"', 'Chó: "Correct! Have a fish."', 'Chó: "Smart detectives. I am a little proud."'],
  fail: ['Chó: "Hmm. The lie detector says... no."', 'Chó: "Not this time. Practise, detectives!"', 'Chó: "Wrong! My fish is sad."'],
};

// Bonus tips when no clue is lost and a quiz question passes.
export const BONUS_TIPS = [
  'Tip from Chó: Penguins have flat feet. Monkeys have long toes.',
  'Tip from Chó: Who in this hotel is pink?',
  'Tip from Chó: "Love, P." Panda is not pink.',
  'Tip from Chó: Monkey was on his video at midnight. Who walked past?',
  'Tip from Chó: Who gave the ring to Panda? Who can take it back?',
];

// Short true story for the final recap (4-5 lines).
export const RECAP = [
  'Two months ago, Penguin [[struck up a conversation|strike-up]] with Flamingo, the hotel singer.',
  'It was not [[love at first sight|love-first-sight]]. It was love at first song.',
  'Penguin [[lied to|lie-to]] Panda. He told Flamingo, "I am single!"',
  'At midnight, he took the ring and gave it to Flamingo.',
  'Wet flat feet, a pink feather, a wet letter. Poor Monkey only made a video.',
];

// ---------------- WIN: the Sentencing Court ----------------
export const WIN = {
  banner: 'CASE SOLVED! All detectives are now Chief Inspectors!',
  court: 'Chó is the judge. He has a tiny wig and a fish hammer. Penguin stands in front of him.',
  apologyIntro: 'Step 1: Penguin must say sorry.',
  apologies: [
    'I [[apologize to|apologize]] Panda for [[cheating on|cheat-on]] her.',
    'I apologize to Flamingo for [[lying to|lie-to]] her.',
    'I apologize to Monkey for the banana problem.',
  ],
  echo: 'Flamingo sings every line. Very loud. Very pink.',
  sentenceIntro: 'Step 2: The punishment. Boom, boom, boom!',
  // Passive on purpose: the students' target structure. {MUF} = make up for chip.
  punishments: [
    'To [[make up for|make-up-for]] his mistake, Penguin was made to pay Panda 2 million dollars.',
    'To make up for his mistake, Penguin was ordered to carry Panda\'s shopping bags for 100 days.',
    'To make up for his mistake, Penguin was told to write "I will [[be faithful|faithful]]" 10,000 times.',
    'To make up for his mistake, Penguin was made to say "Sorry, Panda" in 50 languages.',
    'To make up for his mistake, Penguin was ordered to wear a sign: "I [[let my fiancée down|let-down]]."',
    'To make up for his mistake, Penguin was told to wash 500 cups with a toothbrush.',
    'To make up for his mistake, Penguin was made to eat 100 bananas with Monkey.',
    'To make up for his mistake, Penguin was ordered to clean the pool with his wings.',
    'To make up for his mistake, Penguin was told to sing 300 love songs for Panda.',
    'To make up for his mistake, Penguin was made to give Chó fish pâté for one year.',
    'To make up for his mistake, Penguin was ordered to sleep on Chó\'s sun bed. Outside. In winter.',
    'To make up for his mistake, Penguin was told to say sorry to the North Pole.',
    'To make up for his mistake, Penguin was made to dance with Giraffe for 24 hours.',
  ],
  peaceIntro: 'Step 3: Friends again.',
  peace: [
    'Panda [[breaks up with|break-up]] Penguin. "You [[broke my heart|break-heart]]. Bye!"',
    'Panda [[forgives|forgive]] Monkey for nothing. Monkey did nothing! They [[make up|make-up]] and hug.',
    'Panda and Flamingo talk. Two ladies, one big mistake. Now they [[get on well with|get-on-well]] each other.',
    'Surprise! Monkey [[has feelings for|feelings-for]] Giraffe. They [[have a lot in common|lot-in-common]]: tall trees and bananas.',
    'Monkey [[proposes to|propose-to]] Giraffe with a banana ring. Giraffe [[falls in love with|fall-in-love]] him. Yes!',
    'Chó: "Make up = be friends again. Make up for = pay for a mistake."',
  ],
  epilogueIntro: 'Step 4: One month later...',
  epilogue: [
    'Flamingo [[has a crush on|crush-on]] Chó. Chó: "Sorry. I only love fish pâté."',
    'Penguin [[goes out with|go-out-with]] his own face in the ice. It does not talk back.',
    'Monkey and Giraffe are getting married next month. Chó brings the fish.',
    'Panda [[has a good relationship with|good-relationship]] everybody. And a new ring: from herself!',
  ],
  challengeTitle: 'Class challenge: give Penguin some advice!',
  challenge: [
    'You should apologize to ___ for ___ing.',
    'Penguin must make up for ___.',
    'Panda should (not) trust ___.',
    'Tell us your best advice for a good relationship. Use 3 phrases!',
  ],
};

// ---------------- LOSE ----------------
export const LOSE = {
  banner: 'All detectives have been fired.',
  lines: [
    'Penguin and Flamingo run to the "Honeymoon Express" boat. With the ring!',
    'Panda waves. She still [[trusts|trust]] him. "He will come back!"',
    'Penguin and Flamingo [[have a rocky relationship|rocky-relationship]] from day one. Not our problem.',
    'Monkey and Giraffe [[fall out with|fall-out]] the whole class.',
    'Chó [[has an argument with|argument]] his sun bed. The sun bed wins.',
  ],
  last: 'Chó: "Trust is good. Checking the feet is better."',
};

export const FAIL_STAMP = 'CASE CLOSED: UNRESOLVED';
export const FAIL_SUB = 'All detectives have been fired.';
export const CLASSIFIED = '[CLASSIFIED: clue lost forever]';
