// Demo / test mode: /host/?demo=1  (add &outcome=lose for a LOSE run, &fast=1 for a short timer)
// Simulates 15 fake students on this device: they join, write (with random mistakes),
// fix their sentence in a second chance, answer the quiz and vote.
import { SCENES, SCENE_BY_N } from '../data/scenes.js';
import { QUIZ } from '../data/quiz.js';
import { SUSPECTS } from '../data/story.js';

const NAMES = ['Lan', 'An', 'Minh', 'Thảo', 'Tuấn', 'Phúc', 'Huy', 'Mai', 'Khoa', 'Quân', 'Long', 'Trang', 'Đức', 'Ngọc', 'Bảo'];

// Typical learner mistakes.
const MISTAKES = [
  (s) => s[0].toLowerCase() + s.slice(1), // lowercase start
  (s) => s.replace(/[.!?]$/, ''), // no full stop
  (s) => (/\bwas\b/.test(s) ? s.replace(/\bwas\b/, 'were') : s.replace(/\bwere\b/, 'was')), // agreement
  (s) => s.replace(/\b(was|were) /, ''), // missing be
  (s) => s.replace(/\bstolen\b/, 'stole').replace(/\btaken\b/, 'took').replace(/\bgiven\b/, 'gave').replace(/\bmade\b/, 'maked').replace(/\bfound\b/, 'founded').replace(/\bleft\b/, 'leaved').replace(/\bworn\b/, 'wore'),
  (s) => s.replace(/\bthe\b/, 'teh'), // spelling
];

export function startDemo({ db, paths, G, params }) {
  const outcome = params.get('outcome') || 'win';
  const mistakeRate = Number(params.get('mistakes') ?? 0.25);
  const fakes = NAMES.map((name, i) => ({ uid: 'fake' + (i + 1), name, number: i + 1 }));
  const fakeSet = new Set(fakes.map((f) => f.uid));
  const done = new Set();
  const speed = params.has('fast') ? 0.15 : 1;
  const rnd = (a, b) => (a + Math.random() * (b - a)) * speed;

  // join one by one (leave seat 13 empty sometimes so auto-assign is visible)
  fakes.forEach((f, i) => setTimeout(async () => {
    if (f.number === 13 && params.get('full') !== '1') return; // "sick" student
    await db.set(`${paths.players}/${f.uid}`, { name: f.name, number: f.number, isJunior: false, joinedAt: Date.now() });
    await db.set(`${paths.seats}/${f.number}`, f.uid);
  }, 200 + i * 120));

  const myScenes = (uid) => Object.entries(G.pub.assign || {}).filter(([, a]) => a.uid === uid).map(([n]) => Number(n));

  const tick = async () => {
    const pub = G.pub;
    if (pub.state === 'writing' && !done.has('write:' + pub.timerEndsAt)) {
      done.add('write:' + pub.timerEndsAt);
      for (const f of fakes) {
        for (const n of myScenes(f.uid)) {
          const sc = SCENE_BY_N[n];
          let text = sc.modelAnswers[Math.floor(Math.random() * sc.modelAnswers.length)];
          if (Math.random() < mistakeRate) text = MISTAKES[Math.floor(Math.random() * MISTAKES.length)](text);
          setTimeout(() => db.set(`${paths.subs}/${n}`, { uid: f.uid, draft: text, usedAdvice: Math.random() < 0.3 }), rnd(500, 2500));
          setTimeout(() => db.update(`${paths.subs}/${n}`, { text, submittedAt: db.now() }), rnd(2500, 6000));
        }
      }
    }
    if (pub.state === 'fixing' && pub.fix?.mode === 'student') {
      const n = Number(pub.fix.scene);
      const key = `fix:${n}:${pub.fix.since}`;
      if (!done.has(key) && fakeSet.has(pub.assign?.[n]?.uid)) {
        done.add(key);
        setTimeout(() => db.update(`${paths.subs}/${n}`, { text: SCENE_BY_N[n].modelAnswers[0], submittedAt: db.now() }), 2500 * speed);
      }
    }
    if (pub.state === 'quiz' && pub.quiz?.phase === 'ask') {
      const key = 'quiz:' + pub.quiz.i;
      if (!done.has(key)) {
        done.add(key);
        const q = QUIZ[pub.quiz.qi];
        for (const f of fakes) {
          if (!G.players[f.uid]) continue;
          const right = Math.random() < 0.72;
          const choice = right ? q.a : (q.a + 1 + Math.floor(Math.random() * 2)) % 3;
          setTimeout(() => db.set(`${paths.answers}/${pub.quiz.i}/${f.uid}`, { choice, at: db.now() }), rnd(1500, 9000));
        }
      }
    }
    if (pub.state === 'voting' && !done.has('vote:' + pub.state + (pub.tally ? 1 : 0))) {
      done.add('vote:' + pub.state + (pub.tally ? 1 : 0));
      const share = outcome === 'lose' ? 0.3 : 0.75;
      for (const f of fakes) {
        if (!G.players[f.uid]) continue;
        const v = Math.random() < share ? 'nam' : SUSPECTS[1 + Math.floor(Math.random() * 4)].id;
        setTimeout(() => db.set(`${paths.votes}/${f.uid}`, v), rnd(400, 3500));
      }
    }
    if (pub.state === 'lobby') { [...done].filter((k) => !k.startsWith('join')).forEach((k) => done.delete(k)); }
  };
  setInterval(tick, 400);
  void SCENES;
}
