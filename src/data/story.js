// Characters, suspects, endings and funny lines for "The Missing Ring at Sunflower Hotel".
// All player-facing text: A1-A2 words, short sentences (checked by scripts/lint-level.js).

export const CHEATER = 'nam';

export const CHARACTERS = [
  { id: 'cho', name: 'Chó', img: 'assets/cho.png', line: 'An orange cat detective. On holiday. Loves fish and fish pâté. Please do not ask about the name.' },
  { id: 'hoa', name: 'Hoa', img: 'assets/characters/hoa.svg', line: 'Kind and sweet. Today is her big party with Nam.' },
  { id: 'nam', name: 'Nam', img: 'assets/characters/nam.svg', line: 'Black jacket, big smile. Always has an excuse.' },
  { id: 'long', name: 'Long', img: 'assets/characters/long.svg', line: 'Nam\'s best friend. Loves bananas and silly jokes.' },
  { id: 'linh', name: 'Linh', img: 'assets/characters/linh.svg', line: 'Hoa\'s best friend. Very tall. She sees everything.' },
  { id: 'vy', name: 'Vy', img: 'assets/characters/vy.svg', line: 'The hotel singer. Loves pink and love songs.' },
];

export const SUSPECTS = [
  { id: 'nam', name: 'Nam', img: 'assets/suspects/nam.svg', line: 'Big smile. Wet shoes. Flowers for no reason.' },
  { id: 'long', name: 'Long', img: 'assets/suspects/long.svg', line: 'Banana peel. Big jokes. Up a tree.' },
  { id: 'linh', name: 'Linh', img: 'assets/suspects/linh.svg', line: 'Very tall. Sees everything. Too much?' },
  { id: 'hoa', name: 'Hoa', img: 'assets/suspects/hoa.svg', line: 'She lost her own ring? Strange...' },
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
  'Tip from Chó: Long only wears flip-flops. Who wore party shoes?',
  'Tip from Chó: Who in this hotel wears pink?',
  'Tip from Chó: "Love, N." Hoa never wears pink.',
  'Tip from Chó: Long was on his video at midnight. Who walked past?',
  'Tip from Chó: Who gave the ring to Hoa? Who can take it back?',
];

// Short true story for the final recap (4-5 lines).
export const RECAP = [
  'Two months ago, Nam [[struck up a conversation|strike-up]] with Vy, the hotel singer.',
  'It was not [[love at first sight|love-first-sight]]. It was love at first song.',
  'Nam [[lied to|lie-to]] Hoa. He told Vy, "I am single!"',
  'At midnight, he took the ring and gave it to Vy.',
  'Wet party shoes, a pink feather, a wet letter. Poor Long only made a video.',
];

// ---------------- WIN: the Sentencing Court ----------------
export const WIN = {
  banner: 'CASE SOLVED! All detectives are now Chief Inspectors!',
  court: 'Chó is the judge. He has a tiny wig and a fish hammer. Nam stands in front of him.',
  apologyIntro: 'Step 1: Nam must say sorry.',
  apologies: [
    'I [[apologize to|apologize]] Hoa for [[cheating on|cheat-on]] her.',
    'I apologize to Vy for [[lying to|lie-to]] her.',
    'I apologize to Long for the banana problem.',
  ],
  echo: 'Vy sings every line. Very loud. Very pink.',
  sentenceIntro: 'Step 2: The punishment. Boom, boom, boom!',
  // Passive on purpose: the students' target structure. {MUF} = make up for chip.
  punishments: [
    'To [[make up for|make-up-for]] his mistake, Nam was made to pay Hoa 2 million dollars.',
    'To make up for his mistake, Nam was ordered to carry Hoa\'s shopping bags for 100 days.',
    'To make up for his mistake, Nam was told to write "I will [[be faithful|faithful]]" 10,000 times.',
    'To make up for his mistake, Nam was made to say "Sorry, Hoa" in 50 languages.',
    'To make up for his mistake, Nam was ordered to wear a sign: "I [[let my fiancée down|let-down]]."',
    'To make up for his mistake, Nam was told to wash 500 cups with a toothbrush.',
    'To make up for his mistake, Nam was made to eat 100 bananas with Long.',
    'To make up for his mistake, Nam was ordered to clean the pool with a small cup.',
    'To make up for his mistake, Nam was told to sing 300 love songs for Hoa.',
    'To make up for his mistake, Nam was made to give Chó fish pâté for one year.',
    'To make up for his mistake, Nam was ordered to sleep on Chó\'s sun bed. Outside. In winter.',
    'To make up for his mistake, Nam was told to say sorry to every flower in the garden.',
    'To make up for his mistake, Nam was made to dance with Linh for 24 hours.',
  ],
  peaceIntro: 'Step 3: Friends again.',
  peace: [
    'Hoa [[breaks up with|break-up]] Nam. "You [[broke my heart|break-heart]]. Bye!"',
    'Hoa [[forgives|forgive]] Long for nothing. Long did nothing! They [[make up|make-up]] and hug.',
    'Hoa and Vy talk. Two ladies, one big mistake. Now they [[get on well with|get-on-well]] each other.',
    'Surprise! Long [[has feelings for|feelings-for]] Linh. They [[have a lot in common|lot-in-common]]: tall trees and bananas.',
    'Long [[proposes to|propose-to]] Linh with a banana ring. Linh [[falls in love with|fall-in-love]] him. Yes!',
    'Chó: "Make up = be friends again. Make up for = pay for a mistake."',
  ],
  epilogueIntro: 'Step 4: One month later...',
  epilogue: [
    'Vy [[has a crush on|crush-on]] Chó. Chó: "Sorry. I only love fish pâté."',
    'Nam [[goes out with|go-out-with]] his own face in the mirror. It does not talk back.',
    'Long and Linh are getting married next month. Chó brings the fish.',
    'Hoa [[has a good relationship with|good-relationship]] everybody. And a new ring: from herself!',
  ],
  challengeTitle: 'Class challenge: give Nam some advice!',
  challenge: [
    'You should apologize to ___ for ___ing.',
    'Nam must make up for ___.',
    'Hoa should (not) trust ___.',
    'Tell us your best advice for a good relationship. Use 3 phrases!',
  ],
};

// ---------------- LOSE ----------------
export const LOSE = {
  banner: 'All detectives have been fired.',
  lines: [
    'Nam and Vy run to the "Honeymoon Express" boat. With the ring!',
    'Hoa waves. She still [[trusts|trust]] him. "He will come back!"',
    'Nam and Vy [[have a rocky relationship|rocky-relationship]] from day one. Not our problem.',
    'Long and Linh [[fall out with|fall-out]] the whole class.',
    'Chó [[has an argument with|argument]] his sun bed. The sun bed wins.',
  ],
  last: 'Chó: "Trust is good. Checking the feet is better."',
};

export const FAIL_STAMP = 'CASE CLOSED: UNRESOLVED';
export const FAIL_SUB = 'All detectives have been fired.';
export const CLASSIFIED = '[CLASSIFIED: clue lost forever]';
