// Shared game helpers: room codes, paths, auto-assignment, quiz picking.
export const NUM_SCENES = 15;

export function newRoomCode() {
  const L = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // no I/O (look like 1/0)
  let c = '';
  for (let i = 0; i < 4; i++) c += L[Math.floor(Math.random() * L.length)];
  return c;
}

export const P = (code) => ({
  root: `rooms/${code}`,
  host: `rooms/${code}/host`,
  pub: `rooms/${code}/public`,
  seats: `rooms/${code}/seats`,
  players: `rooms/${code}/players`,
  subs: `rooms/${code}/subs`,
  hostData: `rooms/${code}/hostData`,
  answers: `rooms/${code}/answers`,
  votes: `rooms/${code}/votes`,
});

/**
 * Assign the 15 scenes. seats: {n: uid}; players: {uid: {name, number, isJunior}}.
 * Free numbers go to present seated players, as evenly as possible
 * (nobody gets a second scene until everyone has one). Returns {assign: {n:{uid,name}}, extra: [{n, uid, name}]}.
 */
export function autoAssign(seats, players, rand = Math.random) {
  const assign = {};
  const load = {};
  const uids = Object.keys(players || {});
  const seated = uids.filter((u) => !players[u].isJunior);
  const pool = seated.length ? seated : uids;
  for (const u of pool) load[u] = 0;
  for (let n = 1; n <= NUM_SCENES; n++) {
    const u = seats?.[n];
    if (u && players[u]) { assign[n] = { uid: u, name: players[u].name }; load[u] = (load[u] || 0) + 1; }
  }
  const extra = [];
  if (!pool.length) return { assign, extra };
  for (let n = 1; n <= NUM_SCENES; n++) {
    if (assign[n]) continue;
    const min = Math.min(...pool.map((u) => load[u]));
    const cands = pool.filter((u) => load[u] === min);
    const u = cands[Math.floor(rand() * cands.length)];
    load[u]++;
    assign[n] = { uid: u, name: players[u].name };
    extra.push({ n, uid: u, name: players[u].name });
  }
  return { assign, extra };
}

export function shuffle(arr, rand = Math.random) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

/** Pick `count` quiz questions, preferring different phrases. Returns indexes into QUIZ. */
export function pickQuiz(quiz, count, rand = Math.random) {
  const order = shuffle(quiz.map((_, i) => i), rand);
  const seen = new Set();
  const out = [];
  for (const i of order) if (out.length < count && !seen.has(quiz[i].phrase)) { out.push(i); seen.add(quiz[i].phrase); }
  for (const i of order) if (out.length < count && !out.includes(i)) out.push(i);
  return out;
}

export const fmtTime = (ms) => {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

export const pick = (arr, rand = Math.random) => arr[Math.floor(rand() * arr.length)];
