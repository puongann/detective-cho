// Student phone (/play). Light: no checker, no dictionary. Mobile-first, one-handed.
import '../shared.css';
import './play.css';
import { connect } from '../lib/sync.js';
import { P, fmtTime, NUM_SCENES, pick } from '../lib/game.js';
import { esc, rich, installChipPopover, phraseCard } from '../lib/text.js';
import { assetUrl, preload } from '../lib/assets.js';
import { SCENE_BY_N, STORY_TITLE } from '../data/scenes.js';
import { applyStory } from '../lib/story-edit.js';
import { VOCAB_BY_ID } from '../data/vocab.js';
import { QUIZ } from '../data/quiz.js';
import { SUSPECTS, PHONE_WAITING, CHO_GAGS } from '../data/story.js';

const params = new URLSearchParams(location.search);
const $app = document.getElementById('app');
const S = {
  code: (params.get('room') || localStorage.getItem('csd-play-room') || '').toUpperCase(),
  pub: {}, players: {}, seats: {}, mySubs: {}, me: null,
  view: '', idx: 0, myVote: null, quizAns: {}, connected: true, alerted: {},
};
let db; let paths;
const subOffs = {};

installChipPopover(document);
start().catch((e) => { console.error(e); $app.innerHTML = `<div class="card center"><h2>😿 Oops</h2><p>${esc(e.message)}</p></div>`; });

async function start() {
  $app.innerHTML = '<div class="card center"><img class="cho-sm bob" src="' + assetUrl('assets/cho.png') + '" alt=""><p>Chó is coming...</p></div>';
  db = await connect({ local: params.has('local') });
  db.onConnected((c) => { S.connected = c; drawConn(); });
  if (!S.code) return viewCode();
  await enterRoom(S.code);
}

function viewCode(msg = '') {
  S.view = 'code';
  $app.innerHTML = `<div class="card center">
    <img class="cho-md" src="${assetUrl('assets/cho.png')}" alt="Chó">
    <h1>Crime Scene Detective</h1>
    <label class="lbl" for="codeIn">Room code</label>
    <input id="codeIn" class="big-in code-in" maxlength="4" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="ABCD">
    ${msg ? `<p class="err">${esc(msg)}</p>` : ''}
    <button class="btn" id="go">Join 🔎</button></div>`;
  const go = () => { const c = document.getElementById('codeIn').value.trim().toUpperCase(); if (c.length === 4) enterRoom(c); };
  document.getElementById('go').onclick = go;
  document.getElementById('codeIn').onkeydown = (e) => { if (e.key === 'Enter') go(); };
}

async function enterRoom(code) {
  const host = await db.get(P(code).host);
  if (!host) { localStorage.removeItem('csd-play-room'); return viewCode(`Room ${code} does not exist.`); }
  S.code = code; paths = P(code);
  localStorage.setItem('csd-play-room', code);
  db.on(paths.pub, (v) => { S.pub = v || {}; onPub(); });
  db.on(paths.seats, (v) => { S.seats = v || {}; if (S.view === 'join') drawSeats(); });
  db.on(`${paths.players}/${db.uid}`, (v) => { S.me = v; render(); });
  db.on(`${paths.votes}/${db.uid}`, (v) => { S.myVote = v; if (S.view === 'vote') drawVote(); });
  setInterval(tickTimers, 250);
  wakeLock();
}

// subscribe to my own submissions (I can only read my own)
function syncMySubs() {
  const mine = myScenes();
  for (const n of mine) {
    if (subOffs[n]) continue;
    subOffs[n] = db.on(`${paths.subs}/${n}`, (v) => { S.mySubs[n] = v; refreshStatus(); });
  }
}

const myScenes = () => Object.entries(S.pub.assign || {}).filter(([, a]) => a.uid === db.uid).map(([n]) => Number(n)).sort((a, b) => a - b);

let storyJson = 'null';
function onPub() {
  const sj = JSON.stringify(S.pub.story || null);
  if (sj !== storyJson) { storyJson = sj; applyStory(S.pub.story); } // teacher's story edits (lobby only)
  if ((S.pub.state || 'lobby') === 'lobby') resetGame();
  if (S.pub.assign) syncMySubs();
  // "Your scene is next!" alert
  if (S.pub.state === 'revealing' || S.pub.state === 'paused') {
    const next = (S.pub.currentScene || 0) + 1;
    if (myScenes().includes(next) && !S.alerted[next]) { S.alerted[next] = true; buzz([100, 80, 100]); }
  }
  render();
}

// The teacher stopped the game (or it has not started): forget last game's votes, answers and drafts.
function resetGame() {
  S.myVote = null; S.quizAns = {}; S.alerted = {};
  try {
    for (let i = localStorage.length - 1; i >= 0; i--) { const k = localStorage.key(i); if (k?.startsWith(`csd-draft-${S.code}-`)) localStorage.removeItem(k); }
    sessionStorage.removeItem('csd-idx');
  } catch { /* storage blocked */ }
}

// ------------------------------------------------------------------ render dispatcher
function render() {
  if (!paths) return;
  const st = S.pub.state || 'lobby';
  if (!S.me) {
    if (st === 'lobby') return viewJoin();
    return viewJoin(true); // late: junior only
  }
  const mine = myScenes();
  if (st === 'lobby' || st === 'assigning') return show('lobby', viewLobby);
  if (st === 'writing') return mine.length ? show('writing:' + mine.join(','), viewWriting) : show('junior-wait', () => viewWait('You are a Junior Detective! 🕵️ Watch the big screen. You will play the quiz and vote.'));
  if (st === 'written') return show('written', () => viewWait('⏰ Time is up! Chó is collecting the case files...'));
  if (st === 'fixing' && S.pub.fix?.mode === 'student' && mine.includes(Number(S.pub.fix.scene))) return show('fix:' + S.pub.fix.scene + ':' + S.pub.fix.since, viewFix);
  if (['revealing', 'paused', 'fixing'].includes(st)) return show('reveal:' + S.pub.currentScene, viewReveal, true);
  if (st === 'board') return show('board', () => viewWait('🗂️ All the clues are on the board. Look at the big screen!'));
  if (st === 'quiz') return show('quiz:' + (S.pub.quiz?.i ?? -1) + ':' + (S.pub.quiz?.phase || ''), viewQuiz);
  if (st === 'voting') return show('vote', viewVote);
  if (st === 'revealed') return show('end:' + S.pub.outcome, viewEnd);
  return show('wait', () => viewWait('...'));
}

function show(key, fn, always = false) {
  if (S.view === key && !always) { refreshStatus(); return; }
  if (S.view === key && always) { fn(true); return; }
  S.view = key;
  fn(false);
  drawConn();
}

function header(extra = '') {
  const n = S.me?.number ? `#${S.me.number}` : 'Junior';
  return `<header class="ph-head"><span class="who">Detective ${n} · ${esc(S.me?.name || '')}</span>${extra}<span class="conn" id="conn"></span></header>`;
}
function drawConn() {
  const el = document.getElementById('conn');
  if (el) el.innerHTML = S.connected ? '🟢' : '🟠 <small>Don\'t panic, Chó is reconnecting.</small>';
}

// ------------------------------------------------------------------ join
function viewJoin(late = false) {
  if (S.view === 'join') return drawSeats();
  S.view = 'join';
  const saved = localStorage.getItem('csd-play-name') || '';
  $app.innerHTML = `<div class="card">
    <div class="join-top"><img class="cho-sm" src="${assetUrl('assets/cho.png')}" alt=""><div><h1>Room ${esc(S.code)}</h1><p class="muted">${esc(STORY_TITLE)}</p></div></div>
    <label class="lbl" for="nameIn">Your name</label>
    <input id="nameIn" class="big-in" maxlength="16" value="${esc(saved)}" autocomplete="off" autocorrect="off" spellcheck="false" placeholder="e.g. Lan">
    <label class="lbl">${late ? 'The case has started. Join as a Junior Detective:' : 'Pick ONE number'}</label>
    <div class="nums" id="nums"></div>
    <button class="btn ghost" id="junior">🧒 Junior Detective (no number)</button>
    <p class="err" id="joinErr"></p></div>`;
  if (late) document.getElementById('nums').hidden = true;
  drawSeats();
  document.getElementById('junior').onclick = () => join(null);
}

function drawSeats() {
  const box = document.getElementById('nums');
  if (!box) return;
  box.innerHTML = Array.from({ length: NUM_SCENES }, (_, i) => {
    const n = i + 1; const taken = S.seats[n] && S.seats[n] !== db.uid;
    return `<button class="num ${taken ? 'taken' : ''}" data-n="${n}" ${taken ? 'disabled' : ''}>${n}</button>`;
  }).join('');
  box.querySelectorAll('[data-n]').forEach((b) => b.onclick = () => join(Number(b.dataset.n)));
}

async function join(n) {
  const name = document.getElementById('nameIn').value.trim().replace(/\s+/g, ' ');
  const err = document.getElementById('joinErr');
  if (!name) { err.textContent = 'Please write your name first.'; document.getElementById('nameIn').focus(); return; }
  localStorage.setItem('csd-play-name', name);
  if (n) {
    if (S.seats[n] && S.seats[n] !== db.uid) { err.textContent = 'Too slow! Pick another number.'; return; }
    try { await db.set(`${paths.seats}/${n}`, db.uid); } catch { err.textContent = 'Too slow! Pick another number.'; return; }
    const check = await db.get(`${paths.seats}/${n}`);
    if (check !== db.uid) { err.textContent = 'Too slow! Pick another number.'; return; }
  }
  await db.set(`${paths.players}/${db.uid}`, { name, number: n || null, isJunior: !n, joinedAt: Date.now() });
  buzz(40);
}

function viewLobby() {
  const n = S.me.number;
  $app.innerHTML = `${header()}<div class="card center">
    <img class="cho-md bob" src="${assetUrl('assets/cho.png')}" alt="">
    <h1>${n ? `You are Detective #${n}!` : 'You are a Junior Detective!'}</h1>
    <p>Wait for the teacher to start the case.</p>
    <p class="tip">Remember: <b>was / were + V3</b> 🔍</p>
    <button class="btn ghost small" id="leave">Change number</button></div>`;
  document.getElementById('leave').onclick = async () => {
    if (S.pub.state !== 'lobby') return;
    if (S.me.number) await db.remove(`${paths.seats}/${S.me.number}`);
    await db.remove(`${paths.players}/${db.uid}`);
  };
}

function viewWait(msg) {
  $app.innerHTML = `${header()}<div class="card center"><img class="cho-md bob" src="${assetUrl('assets/cho.png')}" alt=""><h2>${esc(msg)}</h2><p class="muted" id="waitTip">${esc(pick(PHONE_WAITING))}</p></div>`;
}

// ------------------------------------------------------------------ writing (Phase 1)
const draftKey = (n) => `csd-draft-${S.code}-${n}`;
let draftTimers = {};

function viewWriting() {
  const mine = myScenes();
  preload(mine.map((n) => SCENE_BY_N[n].image));
  S.idx = Math.min(S.idx, mine.length - 1);
  const saved = Number(sessionStorage.getItem('csd-idx') || 0);
  if (saved < mine.length) S.idx = saved;
  drawWriting();
}

function drawWriting() {
  const mine = myScenes();
  const n = mine[S.idx];
  const sc = SCENE_BY_N[n];
  const sub = S.mySubs[n] || {};
  const draft = localStorage.getItem(draftKey(n)) ?? sub.draft ?? sub.text ?? '';
  const phrase = sc.mode === 'phrase' ? sc.targetPhrases.map((id) => `<button class="chip phrase" data-phrase="${id}">${esc(VOCAB_BY_ID[id].phrase)}</button>`).join(' or ') : '';
  const hintLvl = S.pub.hints?.[n] || 0;
  $app.innerHTML = `${header(`<span class="timer" id="timer">--:--</span>`)}
  <main class="write ${mine.length > 1 ? 'two' : ''}" id="write">
    ${mine.length > 1 ? `<div class="scene-of">Scene ${S.idx + 1} of ${mine.length} · Clue #${n}</div>` : `<div class="scene-of">Clue #${n}</div>`}
    <button class="pic" id="pic" aria-label="Zoom picture"><img src="${assetUrl(sc.image)}" alt="${esc(sc.title)}"><span class="pic-time">${esc(sc.time)}</span><span class="zoom">🔍</span></button>
    <p class="prompt">${rich(sc.prompt, sc.glossary)}</p>
    ${phrase ? `<p class="use">Use: ${phrase}</p>` : '<p class="use muted">Write ONE passive sentence: was / were + V3</p>'}
    <div class="advice" id="advice" ${sub.usedAdvice ? '' : 'hidden'}>🐟 <b>Chó's advice:</b><br>${esc(sc.verb)}<br>${esc(sc.frame)}</div>
    ${hintLvl ? `<div class="advice hint">💡 Hint from the teacher:<br>${sc.hints.slice(0, hintLvl).map(esc).join('<br>')}</div>` : ''}
    <div class="actions" id="actions">
      <textarea id="txt" rows="2" maxlength="220" autocorrect="off" autocomplete="off" autocapitalize="off" spellcheck="false" enterkeyhint="send" placeholder="${esc(pick(['Write your passive sentence...', 'The ___ was ___ ...', 'was / were + V3 ...']))}">${esc(draft)}</textarea>
      <button class="btn submit" id="submit">Submit 🔍</button>
      <div class="row-btns">
        <button class="link" id="askCho">Ask Chó for advice 🐟</button>
        <span class="status" id="status"></span>
      </div>
      ${mine.length > 1 ? `<div class="steps">${mine.map((m, i) => `<button class="step ${i === S.idx ? 'on' : ''}" data-i="${i}"><span class="st-ic" data-st="${m}"></span> Scene ${i + 1}</button>`).join('')}</div><button class="btn ghost" id="nextScene" hidden>Next scene →</button>` : ''}
      <p class="warn2" id="warn2" hidden>Scene 2 is waiting for you!</p>
    </div>
  </main>`;
  const txt = document.getElementById('txt');
  autoGrow(txt);
  txt.addEventListener('input', () => { autoGrow(txt); saveDraft(n, txt.value); refreshStatus(); });
  txt.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); submit(n); } });
  document.getElementById('submit').onclick = () => submit(n);
  document.getElementById('askCho').onclick = () => { document.getElementById('advice').hidden = false; db.update(`${paths.subs}/${n}`, { uid: db.uid, usedAdvice: true }); buzz(20); };
  document.getElementById('pic').onclick = () => zoom(sc);
  document.querySelectorAll('.step').forEach((b) => b.onclick = () => goScene(Number(b.dataset.i)));
  const ns = document.getElementById('nextScene');
  if (ns) ns.onclick = () => goScene((S.idx + 1) % mine.length);
  swipe(document.getElementById('write'), (dir) => goScene(Math.max(0, Math.min(mine.length - 1, S.idx + dir))));
  refreshStatus();
  tickTimers();
}

function goScene(i) {
  const txt = document.getElementById('txt');
  if (txt) saveDraft(myScenes()[S.idx], txt.value, true);
  S.idx = i; sessionStorage.setItem('csd-idx', String(i));
  drawWriting();
}

function autoGrow(t) { t.style.height = 'auto'; t.style.height = Math.min(160, t.scrollHeight) + 'px'; }

function clean(s) { return s.replace(/[\r\n]+/g, ' ').replace(/\s+$/, '').replace(/^\s+/, ''); }

function saveDraft(n, value, now = false) {
  try { localStorage.setItem(draftKey(n), value); } catch { /* full */ }
  clearTimeout(draftTimers[n]);
  const push = () => { if (S.pub.state === 'writing') db.update(`${paths.subs}/${n}`, { uid: db.uid, draft: clean(value) }).catch(() => {}); };
  if (now) push(); else draftTimers[n] = setTimeout(push, 900);
}

async function submit(n, auto = false) {
  const txt = document.getElementById('txt');
  const value = clean(txt ? txt.value : localStorage.getItem(draftKey(n)) || '');
  if (!value) { if (!auto) { txt?.focus(); flash('Write a sentence first 🙂'); } return; }
  if (txt) txt.value = value;
  try {
    await db.update(`${paths.subs}/${n}`, { uid: db.uid, text: value, draft: value, submittedAt: db.now() });
  } catch { if (!auto) flash('Not sent. Try again!'); return; }
  if (!auto) {
    buzz(60);
    const b = document.getElementById('submit');
    if (b) { b.classList.remove('sent'); void b.offsetWidth; b.classList.add('sent'); }
    txt?.blur();
  }
  refreshStatus();
}

function subState(n) {
  const sub = S.mySubs[n] || {};
  const draft = localStorage.getItem(draftKey(n));
  if (sub.text && sub.submittedAt && (draft == null || clean(draft) === sub.text)) return 'submitted';
  if (draft && draft.trim()) return 'draft';
  return 'empty';
}

function refreshStatus() {
  const mine = myScenes();
  document.querySelectorAll('[data-st]').forEach((el) => { el.textContent = { submitted: '✅', draft: '📝', empty: '✍️' }[subState(Number(el.dataset.st))]; });
  const n = mine[S.idx];
  const st = document.getElementById('status');
  if (st && n) {
    const s = subState(n);
    st.textContent = s === 'submitted' ? '✅ Submitted! Waiting for the other detectives... (you can still edit)' : s === 'draft' ? '📝 Not sent yet' : '';
    const ns = document.getElementById('nextScene');
    if (ns) ns.hidden = s !== 'submitted';
  }
}

function tickTimers() {
  if (S.pub.state === 'writing' && S.view.startsWith('writing')) {
    const left = (S.pub.timerEndsAt || 0) - db.now();
    const el = document.getElementById('timer');
    if (el) { el.textContent = fmtTime(left); el.className = 'timer' + (left < 20000 ? ' red' : left < 60000 ? ' orange' : ''); }
    const mine = myScenes();
    const w = document.getElementById('warn2');
    if (w && mine.length > 1) w.hidden = !(left < 30000 && mine.some((m) => subState(m) === 'empty'));
    // auto-submit unsent text just before time is up
    if (left < 1500 && !S.autoSent) {
      S.autoSent = true;
      const txt = document.getElementById('txt');
      if (txt) saveDraft(mine[S.idx], txt.value, true);
      for (const m of mine) if (subState(m) === 'draft') submit(m, true);
    }
  } else S.autoSent = false;
  if (S.pub.state === 'quiz' && S.view.startsWith('quiz')) {
    const el = document.getElementById('qtimer');
    if (el && S.pub.quiz?.endsAt) el.textContent = Math.max(0, Math.ceil((S.pub.quiz.endsAt - db.now()) / 1000));
  }
}

function zoom(sc) {
  const z = document.createElement('div');
  z.className = 'zoombox';
  z.innerHTML = `<img src="${assetUrl(sc.image)}" alt="${esc(sc.title)}"><button class="btn small">Close ✕</button>`;
  z.querySelector('button').onclick = () => z.remove();
  document.body.appendChild(z);
}

function swipe(el, cb) {
  if (!el) return;
  let x0 = null; let y0 = null;
  el.addEventListener('touchstart', (e) => { if (e.target.closest('textarea')) return; x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
  el.addEventListener('touchend', (e) => {
    if (x0 == null) return;
    const dx = e.changedTouches[0].clientX - x0; const dy = e.changedTouches[0].clientY - y0;
    if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.5) cb(dx < 0 ? 1 : -1);
    x0 = null;
  });
}

// ------------------------------------------------------------------ reveal (Phase 2)
function viewReveal(update) {
  const cur = S.pub.currentScene || 1;
  const mine = myScenes();
  const a = S.pub.assign?.[cur];
  let msg; let cls = '';
  if (mine.includes(cur)) { msg = '👀 Your scene is on the big screen!'; cls = 'me'; }
  else if (mine.includes(cur + 1)) { msg = '⚡ Your scene is next!'; cls = 'next'; }
  else msg = `Detective #${cur}${a ? ` (${esc(a.name)})` : ''} is on the case...`;
  const html = `${header()}<div class="card center reveal ${cls}">
    <div class="mag">🔍</div>
    <h2>${msg}</h2>
    <p class="muted">${S.pub.state === 'paused' ? 'Uh-oh... a problem with this clue!' : S.pub.state === 'fixing' ? '🥺 Second chance! Help the class fix it.' : esc(pick(PHONE_WAITING))}</p>
    <p class="mini">Clue ${cur} of 15</p></div>`;
  if (update && document.querySelector('.reveal')) { $app.innerHTML = html; drawConn(); return; }
  $app.innerHTML = html;
}

function viewFix() {
  const n = Number(S.pub.fix.scene);
  const sc = SCENE_BY_N[n];
  const last = S.mySubs[n]?.text || '';
  const hintLvl = S.pub.hints?.[n] || 0;
  $app.innerHTML = `${header()}
  <main class="write fix">
    <div class="scene-of fixing">🥺 Second chance! Clue #${n}</div>
    <button class="pic" id="pic"><img src="${assetUrl(sc.image)}" alt=""><span class="pic-time">${esc(sc.time)}</span></button>
    <p class="prompt">Listen to your teacher. Fix your sentence!</p>
    ${hintLvl ? `<div class="advice hint">💡 ${sc.hints.slice(0, hintLvl).map(esc).join('<br>')}</div>` : ''}
    <div class="actions">
      <textarea id="txt" rows="2" maxlength="220" autocorrect="off" autocomplete="off" autocapitalize="off" spellcheck="false" enterkeyhint="send">${esc(last)}</textarea>
      <button class="btn submit" id="submit">Send the fix 🔍</button>
      <span class="status" id="status"></span>
    </div>
  </main>`;
  const txt = document.getElementById('txt');
  autoGrow(txt);
  txt.addEventListener('input', () => autoGrow(txt));
  const send = async () => {
    const v = clean(txt.value);
    if (!v) return;
    await db.update(`${paths.subs}/${n}`, { uid: db.uid, text: v, submittedAt: db.now() });
    buzz(60);
    document.getElementById('status').textContent = '✅ Sent! Look at the big screen.';
  };
  txt.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); send(); } });
  document.getElementById('submit').onclick = send;
  document.getElementById('pic').onclick = () => zoom(sc);
}

// ------------------------------------------------------------------ quiz
function viewQuiz() {
  const q = S.pub.quiz || {};
  if (q.i == null || q.i < 0 || q.qi == null) return viewWait('🕵️ Chó\'s Lie Detector Test is coming!');
  const item = QUIZ[q.qi];
  const mine = S.quizAns[q.i];
  if (q.phase === 'result' || q.phase === 'done') {
    const right = mine === item.a;
    $app.innerHTML = `${header()}<div class="card center"><h1>${mine == null ? '⏰ No answer' : right ? '✅ Correct!' : '❌ Not this time'}</h1>
      <p class="q-big">${esc(item.q)}</p><p>Answer: <b>${esc(item.o[item.a])}</b></p></div>`;
    return;
  }
  $app.innerHTML = `${header('<span class="timer" id="qtimer">20</span>')}<div class="card quiz">
    <p class="q-n">Question ${q.i + 1} of ${q.total}</p>
    <p class="q-big">${esc(item.q)}</p>
    <div class="opts">${item.o.map((o, k) => `<button class="opt ${mine === k ? 'on' : ''}" data-k="${k}" ${mine != null ? 'disabled' : ''}><b>${'ABC'[k]}</b> ${esc(o)}</button>`).join('')}</div>
    <p class="status">${mine != null ? '🔒 Locked in!' : ''}</p></div>`;
  document.querySelectorAll('.opt').forEach((b) => b.onclick = async () => {
    const k = Number(b.dataset.k);
    S.quizAns[q.i] = k;
    await db.set(`${paths.answers}/${q.i}/${db.uid}`, { choice: k, at: db.now() });
    buzz(30);
    S.view = ''; render();
  });
}

// ------------------------------------------------------------------ vote
function viewVote() {
  $app.innerHTML = `${header()}<div class="card vote"><h1>Who is the cheater?!</h1><p class="muted">Tap one. You can change it until the teacher closes the vote.</p><div class="sus" id="sus"></div></div>`;
  drawVote();
}
function drawVote() {
  const box = document.getElementById('sus');
  if (!box) return;
  box.innerHTML = SUSPECTS.map((s) => `<button class="sus-card ${S.myVote === s.id ? 'on' : ''}" data-id="${s.id}"><img src="${assetUrl(s.img)}" alt=""><span><b>${esc(s.name)}</b><br><small>${esc(s.line)}</small></span>${S.myVote === s.id ? '<i>✔</i>' : ''}</button>`).join('');
  box.querySelectorAll('.sus-card').forEach((b) => b.onclick = async () => { S.myVote = b.dataset.id; drawVote(); buzz(30); await db.set(`${paths.votes}/${db.uid}`, b.dataset.id); });
}

function viewEnd() {
  const win = S.pub.outcome === 'win';
  $app.innerHTML = `${header()}<div class="card center end ${win ? 'win' : 'lose'}"><img class="cho-md bob" src="${assetUrl('assets/cho.png')}" alt="">
    <h1>${win ? '🏆 CASE SOLVED!' : '🪦 All detectives have been fired.'}</h1>
    <p>${win ? 'You are a Chief Inspector now!' : esc(pick(CHO_GAGS))}</p><p class="muted">Look at the big screen 👀</p></div>`;
}

// ------------------------------------------------------------------ comfort
function buzz(p) { try { navigator.vibrate?.(p); } catch { /* no vibration */ } }
function flash(msg) {
  const f = document.createElement('div'); f.className = 'flash'; f.textContent = msg;
  document.body.appendChild(f); setTimeout(() => f.remove(), 2000);
}
let lock = null;
async function wakeLock() {
  const req = async () => { try { if ('wakeLock' in navigator && document.visibilityState === 'visible') lock = await navigator.wakeLock.request('screen'); } catch { /* not allowed */ } };
  req();
  document.addEventListener('visibilitychange', req);
  document.addEventListener('click', () => { if (!lock) req(); }, { once: true });
}
// Keyboard: keep the text box + Submit above the keyboard (--vvh = visible height).
if (window.visualViewport) {
  const vv = window.visualViewport;
  const onVV = () => {
    document.documentElement.style.setProperty('--vvh', vv.height + 'px');
    document.body.classList.toggle('kb-open', vv.height < window.innerHeight * 0.78 || (document.activeElement?.tagName === 'TEXTAREA' && vv.height < screen.height * 0.6));
  };
  vv.addEventListener('resize', onVV); onVV();
}
// Typing: the whole writing screen fits above the keyboard (see body.typing in play.css), so keep the page at the top:
// the picture stays big and visible instead of scrolling away.
const headH = () => document.documentElement.style.setProperty('--headh', (document.querySelector('.ph-head')?.offsetHeight || 50) + 'px');
const toTop = () => { if (document.body.classList.contains('typing') && innerWidth < 600) window.scrollTo(0, 0); };
document.addEventListener('focusin', (e) => {
  if (e.target.tagName !== 'TEXTAREA') return;
  document.body.classList.add('typing'); headH();
  if (innerWidth < 600) [80, 300, 600].forEach((ms) => setTimeout(toTop, ms));
  else setTimeout(() => e.target.scrollIntoView({ block: 'center', behavior: 'smooth' }), 250);
});
window.visualViewport?.addEventListener('resize', () => setTimeout(toTop, 50));
document.addEventListener('focusout', (e) => { if (e.target.tagName === 'TEXTAREA') document.body.classList.remove('typing'); });
void CHO_GAGS; void phraseCard;
