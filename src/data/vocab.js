// The phrases students must learn to USE.
// pattern DSL (see src/lib/phrase-matcher.js):
//   {verb}   any form of the verb (get/gets/got/getting/gotten)
//   a|an     one of several words
//   *N       0..N free words (adjectives, names, "very" ...)
// Order of checks: patterns (full phrase) -> wrong (classic mistakes) -> loose (phrase without its object).
// `wrong` patterns catch the classic wrong-preposition mistakes and give the teacher a reason.

export const VOCAB = [
  // ---------- CORE (18) ----------
  {
    id: 'get-on-well', core: true, phrase: 'Get on well with sb', ipa: '/get ɒn wel wɪð/', vi: 'có mối quan hệ tốt với ai',
    example: 'Bear gets on well with everybody at the lake.',
    patterns: ['{get} on *1 well with'],
    wrong: [{ p: '{get} on *1 well to|for|at|from', why: 'wrong preposition: get on well WITH' }, { p: '{get} *1 well with', why: 'missing word: get ON well with' }],
  },
  {
    id: 'good-relationship', core: true, phrase: 'Have a good relationship with sb', ipa: '/hæv ə gʊd rɪˈleɪʃənʃɪp wɪð/', vi: 'có mối quan hệ tốt với ai',
    example: 'Rabbit has a good relationship with her mum.',
    patterns: ['{have} a *1 good relationship with'], loose: ['{have} a *1 good relationship'],
    wrong: [{ p: '{have} a *1 good relationship to|for|at', why: 'wrong preposition: a good relationship WITH' }],
  },
  {
    id: 'lot-in-common', core: true, phrase: 'Have a lot in common', ipa: '/hæv ə lɒt ɪn ˈkɒmən/', vi: 'có nhiều điểm chung',
    example: 'Bear and Fox have a lot in common: they both love fishing.',
    patterns: ['{have} a lot *2 in common'],
    wrong: [{ p: '{have} a lot *2 on|at common', why: 'wrong preposition: a lot IN common' }, { p: '{have} lot *2 in common', why: 'missing word: A lot in common' }, { p: '{have} a lot *2 common', why: 'missing word: a lot IN common' }],
  },
  {
    id: 'fall-out', core: true, phrase: 'Fall out with sb', ipa: '/fɔːl aʊt wɪð/', vi: 'cãi nhau với ai',
    example: 'I fell out with my brother about the TV.',
    patterns: ['{fall} out with'],
    wrong: [{ p: '{fall} out to|for|at', why: 'wrong preposition: fall out WITH' }],
  },
  {
    id: 'rocky-relationship', core: true, phrase: 'Have a rocky relationship with sb', ipa: '/hæv ə ˈrɒki rɪˈleɪʃənʃɪp wɪð/', vi: 'có mối quan hệ không ổn định',
    example: 'They have a rocky relationship: happy one day, angry the next.',
    patterns: ['{have} a *1 rocky relationship with'], loose: ['{have} a *1 rocky relationship'],
    wrong: [{ p: '{have} a *1 rocky relationship to|for|at', why: 'wrong preposition: a rocky relationship WITH' }, { p: '{have} a *1 rock relationship', why: 'wrong word: ROCKY relationship' }],
  },
  {
    id: 'argument', core: true, phrase: 'Have an argument with sb', ipa: '/hæv ən ˈɑːgjumənt wɪð/', vi: 'cãi nhau với ai',
    example: 'Mum had an argument with the taxi driver.',
    patterns: ['{have} a|an *1 argument with'],
    wrong: [{ p: '{have} a|an *1 argument to|for|at|on|from', why: 'wrong preposition: an argument WITH' }, { p: '{have} *1 argument with', why: 'missing article: AN argument with' }, { p: '{have} a|an *1 argument', why: 'phrase incomplete: an argument WITH sb' }],
  },
  {
    id: 'make-up', core: true, phrase: 'Make up', ipa: '/meɪk ʌp/', vi: 'làm hòa',
    example: 'After the fight, the two friends made up.',
    patterns: ['{make} up'],
    wrong: [],
  },
  {
    id: 'admire', core: true, phrase: 'Admire sb for sth/doing sth', ipa: '/ədˈmaɪə ... fɔː .../', vi: 'ngưỡng mộ ai vì điều gì',
    example: 'I admire my teacher for her kind heart.',
    patterns: ['{admire} *4 for'],
    wrong: [{ p: '{admire} *4 about|because', why: 'wrong preposition: admire sb FOR sth' }],
  },
  {
    id: 'ask-advice', core: true, phrase: 'Ask sb for advice', ipa: '/ɑːsk ... fə ədˈvaɪs/', vi: 'hỏi ai xin lời khuyên',
    example: 'When I have a problem, I ask my dad for advice.',
    patterns: ['{ask} *4 for *1 advice'],
    wrong: [{ p: '{ask} *4 about|to|from|of *1 advice', why: 'wrong preposition: ask sb FOR advice' }, { p: '{ask} *4 advice', why: 'missing preposition: ask sb FOR advice' }, { p: '{ask} *4 for *1 advices', why: 'advice has no -s' }],
  },
  {
    id: 'feelings-for', core: true, phrase: 'Have feelings for sb', ipa: '/hæv ˈfiːlɪŋz fɔː/', vi: 'có tình cảm với ai',
    example: 'He has feelings for the new girl in class.',
    patterns: ['{have} *2 feelings for'],
    wrong: [{ p: '{have} *2 feelings with|to|on|about', why: 'wrong preposition: feelings FOR' }, { p: '{have} *2 feeling for', why: 'feelings needs -s' }],
  },
  {
    id: 'fall-in-love', core: true, phrase: 'Fall in love with sb', ipa: '/fɔːl ɪn lʌv wɪð/', vi: 'yêu ai',
    example: 'She fell in love with a boy from Hanoi.',
    patterns: ['{fall} in love with'], loose: ['{fall} in love'],
    wrong: [{ p: '{fall} in love to|for|on|at', why: 'wrong preposition: fall in love WITH' }, { p: '{fall} on|into love', why: 'wrong preposition: fall IN love' }],
  },
  {
    id: 'break-up', core: true, phrase: 'Break up with someone', ipa: '/breɪk ʌp wɪð/', vi: 'chia tay với ai',
    example: 'She broke up with him by text message.',
    patterns: ['{break} up with'], loose: ['{break} up'],
    wrong: [{ p: '{break} up to|for|from|at', why: 'wrong preposition: break up WITH' }],
  },
  {
    id: 'casual-acquaintance', core: true, phrase: 'Casual acquaintance', ipa: '/ˈkæʒ.ju.əl əˈkweɪn.təns/', vi: 'người quen xã giao',
    example: 'Casual acquaintances are often formed through social interactions at events.',
    patterns: ['casual acquaintance|acquaintances'],
    wrong: [{ p: 'casually acquaintance|acquaintances', why: 'wrong form: CASUAL acquaintance' }, { p: 'casual acquaintant|aquaintance|acquaintence|acquaintant', why: 'spelling: acquaintance' }],
  },
  {
    id: 'strike-up', core: true, phrase: 'Strike up a conversation / a friendship', ipa: '/straɪk ʌp/', vi: 'bắt chuyện / làm quen, kết bạn',
    example: 'She decided to strike up a friendship with her new colleague by inviting her to join a lunch.',
    patterns: ['{strike} up a *1 conversation|friendship', 'conversation|friendship {be} *1 struck up'],
    wrong: [{ p: '{strike} up a *1 conversation|friendship to|for|at', why: 'wrong preposition: strike up a conversation WITH' }, { p: '{strike} a *1 conversation|friendship', why: 'missing word: strike UP a conversation' }],
  },
  {
    id: 'apologize', core: true, phrase: 'Apologize to sb for sth/doing sth', ipa: '/əˈpɒl.ə.dʒaɪz/', vi: 'xin lỗi ai về điều gì',
    example: 'I had to apologize to my buddy for hurting her feelings with my thoughtless comments.',
    patterns: ['{apologize} *1 to *5 for'],
    wrong: [{ p: '{apologize} *1 with|at|for *5 for', why: 'wrong preposition: apologize TO sb FOR sth' }, { p: '{apologize} *1 with|at', why: 'wrong preposition: apologize TO sb' }, { p: '{apologize} *1 to *5 about|because', why: 'wrong preposition: apologize to sb FOR sth' }, { p: '{apologize} *1 to', why: 'phrase incomplete: apologize to sb FOR sth' }, { p: '{apologize} *1 for', why: 'missing preposition: apologize TO sb for sth' }],
  },
  {
    id: 'love-first-sight', core: true, phrase: 'Love at first sight', ipa: '/saɪt/', vi: 'tình yêu sét đánh',
    example: 'Love at first sight is considered to be unrealistic by many people.',
    patterns: ['love at first sight'],
    wrong: [{ p: 'love in|on|from first sight', why: 'wrong preposition: love AT first sight' }, { p: 'love at the first sight', why: 'no "the": love at first sight' }, { p: 'love at first site|sigh', why: 'spelling: SIGHT' }],
  },
  {
    id: 'get-married', core: true, phrase: 'Get married to sb', ipa: '/ˈmær.id/', vi: 'kết hôn với ai',
    example: 'Next month, Mariah is getting married to her fiancé.',
    patterns: ['{get} married to'], loose: ['{get} married'],
    wrong: [{ p: '{get} married with', why: 'wrong preposition: married TO' }],
  },
  {
    id: 'make-up-for', core: true, phrase: 'Make up for (sth)', ipa: '/meɪk ʌp fɔː/', vi: 'đền bù, bù đắp cho (lỗi lầm)',
    example: 'He cooked dinner to make up for being late.',
    patterns: ['{make} up for'],
    wrong: [{ p: '{make} up to|with *3 mistake|mistakes', why: 'wrong preposition: make up FOR' }],
  },

  // ---------- EXTRA (11) ----------
  {
    id: 'cheat-on', core: false, phrase: 'Cheat on sb', ipa: '/tʃiːt ɒn/', vi: 'lừa dối, ngoại tình với ai',
    example: 'He cheated on his girlfriend, and she found out.',
    patterns: ['{cheat} on'],
    wrong: [{ p: '{cheat} with|to', why: 'wrong preposition: cheat ON sb' }],
  },
  {
    id: 'lie-to', core: false, phrase: 'Lie to sb (about sth)', ipa: '/laɪ tuː/', vi: 'nói dối ai (về điều gì)',
    example: 'Please don\'t lie to me about your homework.',
    patterns: ['{lie} to'],
    wrong: [{ p: 'lying|lied|lies with|at', why: 'wrong preposition: lie TO sb' }],
  },
  {
    id: 'trust', core: false, phrase: 'Trust sb', ipa: '/trʌst/', vi: 'tin tưởng ai',
    example: 'I trust my best friend with all my secrets.',
    patterns: ['{trust}'],
    wrong: [],
  },
  {
    id: 'faithful', core: false, phrase: 'Be faithful to sb', ipa: '/ˈfeɪθfʊl tuː/', vi: 'chung thủy với ai',
    example: 'A good dog is faithful to its owner.',
    patterns: ['{be} *1 faithful to'], loose: ['{be} *1 faithful'],
    wrong: [{ p: 'faithful with|for', why: 'wrong preposition: faithful TO' }],
  },
  {
    id: 'forgive', core: false, phrase: 'Forgive sb for sth', ipa: '/fəˈɡɪv/', vi: 'tha thứ cho ai vì điều gì',
    example: 'Can you forgive me for breaking your cup?',
    patterns: ['{forgive} *4 for'], loose: ['{forgive}'],
    wrong: [{ p: '{forgive} *4 about|because', why: 'wrong preposition: forgive sb FOR sth' }],
  },
  {
    id: 'crush-on', core: false, phrase: 'Have a crush on sb', ipa: '/hæv ə krʌʃ ɒn/', vi: 'phải lòng, thích thầm ai',
    example: 'My sister has a crush on a singer.',
    patterns: ['{have} a *1 crush on'],
    wrong: [{ p: '{have} a *1 crush with|to|for|at', why: 'wrong preposition: a crush ON' }],
  },
  {
    id: 'go-out-with', core: false, phrase: 'Go out with sb', ipa: '/ɡəʊ aʊt wɪð/', vi: 'hẹn hò với ai',
    example: 'Is Nam going out with Lan?',
    patterns: ['{go} out with'],
    wrong: [{ p: '{go} out to|for', why: 'wrong preposition: go out WITH' }],
  },
  {
    id: 'propose-to', core: false, phrase: 'Propose to sb', ipa: '/prəˈpəʊz tuː/', vi: 'cầu hôn ai',
    example: 'He proposed to her on the beach.',
    patterns: ['{propose} to'],
    wrong: [{ p: '{propose} with|for', why: 'wrong preposition: propose TO' }],
  },
  {
    id: 'get-engaged', core: false, phrase: 'Get engaged to sb', ipa: '/ɡet ɪnˈɡeɪdʒd tuː/', vi: 'đính hôn với ai',
    example: 'My cousin got engaged to her boyfriend last week.',
    patterns: ['{get} engaged to', '{be} engaged to'], loose: ['{get} engaged'],
    wrong: [{ p: 'engaged with', why: 'wrong preposition: engaged TO' }],
  },
  {
    id: 'let-down', core: false, phrase: 'Let sb down', ipa: '/let daʊn/', vi: 'làm ai thất vọng',
    example: 'Don\'t let your team down: come to the game!',
    patterns: ['{let} *3 down'],
    wrong: [],
  },
  {
    id: 'break-heart', core: false, phrase: "Break sb's heart", ipa: '/breɪk hɑːt/', vi: 'làm ai đau lòng',
    example: 'The sad film broke my heart.',
    patterns: ['{break} *2 heart', 'heart {be} *1 {break}'],
    wrong: [],
  },
];

export const VOCAB_BY_ID = Object.fromEntries(VOCAB.map((v) => [v.id, v]));
export const CORE_IDS = VOCAB.filter((v) => v.core).map((v) => v.id);
export const EXTRA_IDS = VOCAB.filter((v) => !v.core).map((v) => v.id);
