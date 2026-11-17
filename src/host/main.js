// Teacher big screen (/host). The host is the only writer of game state and verdicts.
import '../shared.css';
import './host.css';
import qrcode from 'qrcode-generator';
import { connect, hasFirebase } from '../lib/sync.js';
import { P, newRoomCode, autoAssign, pickQuiz, fmtTime, pick, NUM_SCENES } from '../lib/game.js';
import { check } from '../lib/checker.js';
import { rich, esc, plain, installChipPopover } from '../lib/text.js';
import { sfx, setMuted, isMuted } from '../lib/sound.js';
import { assetUrl, preload } from '../lib/assets.js';
import { SCENES, SCENE_BY_N, ACTS, actOf, STORY_TITLE } from '../data/scenes.js';
import { VOCAB, VOCAB_BY_ID } from '../data/vocab.js';
import { QUIZ } from '../data/quiz.js';
import {
  SUSPECTS, CHEATER, WRITING_MESSAGES, ASSIGN_JOKES, QUIZ_REACTIONS, BONUS_TIPS, RECAP, WIN, LOSE,
  FAIL_STAMP, FAIL_SUB, CLASSIFIED, REVEAL_PRAISE, CHO_GAGS,
} from '../data/story.js';
import { startDemo } from './demo.js';
import { applyStory, loadSaved, saveLocal, isEmpty } from '../lib/story-edit.js';
import { openEditor } from './editor.js';

const params = new URLSearchParams(location.search);
const DEMO = params.has('demo');
const SPEED = params.has('fast') ? 0.08 : 1; // ?fast=1 for automated tests
const $stage = document.getElementById('stage');

// ------------------------------------------------------------------ state
let db; let code; let paths;
let isWord = () => true;
const G = {
  pub: {}, players: {}, seats: {}, subs: {}, votes: {}, answers: {}, verdicts: {},
  settings: { writeSecs: 180, pauseEvery: false, quizCount: 8, showReasons: false },
  fish: 0,
};
let overlay = null; // 'board' | 'vault' | 'help' | 'reassign' | null
let editor = null; // story editor (lobby only)
let storyOv = loadSaved();
applyStory(storyOv);

// ------------------------------------------------------------------ boot
fitStage();
addEventListener('resize', fitStage);
installChipPopover(document);
boot().catch((e) => { console.error(e); $stage.innerHTML = `<div class="center-msg">😿 ${esc(e.message)}</div>`; });

async function boot() {
  setMuted(false);
  $stage.innerHTML = '<div class="center-msg">Chó is waking up...</div>';
  db = await connect({ local: DEMO || params.has('local') });
  // Spelling dictionary: big, so load it lazily (host only).
  import('../lib/speller.js').then((m) => { isWord = m.getIsWord(); }).catch((e) => console.warn('speller', e));
  const saved = !DEMO && localStorage.getItem(`csd-host-room-${db.mode}`);
  code = params.get('room') || saved || null;
  if (code) {
    const host = await db.get(P(code).host);
    // Resume only a room this browser really hosts. A saved code can belong to someone else,
    // or to a local-mode room that never existed on Firebase: then make a new room.
    if (host !== db.uid) code = null;
  }
  if (!code || DEMO) {
    if (DEMO && db.resetAll) db.resetAll();
    code = DEMO ? 'DEMO' : await createRoom();
    if (DEMO) { await db.set(P(code).host, db.uid); await db.set(P(code).pub, freshPub()); }
  }
  localStorage.setItem(`csd-host-room-${db.mode}`, code);
  paths = P(code);
  const hd = (await db.get(paths.hostData)) || {};
  G.verdicts = hd.verdicts || {};
  G.settings = { ...G.settings, ...(hd.settings || {}) };
  G.pub = (await db.get(paths.pub)) || freshPub();
  G.fish = G.pub.fish || 0;
  await setPub({ story: isEmpty(storyOv) ? null : storyOv }); // phones apply the same story edits
  db.on(paths.players, (v) => { G.players = v || {}; onData('players'); });
  db.on(paths.seats, (v) => { G.seats = v || {}; onData('seats'); });
  db.on(paths.subs, (v) => { G.subs = v || {}; onData('subs'); });
  db.on(paths.votes, (v) => { G.votes = v || {}; onData('votes'); });
  db.on(paths.answers, (v) => { G.answers = v || {}; onData('answers'); });
  installKeys();
  preload(SCENES.slice(0, 3).map((s) => s.image));
  if (DEMO) startDemo({ db, code, paths, G, params, onPub: () => G.pub });
  resume();
}

function freshPub() { return { state: 'lobby', writeSecs: 180, fish: 0, createdAt: Date.now() }; }

async function createRoom() {
  for (let i = 0; i < 20; i++) {
    const c = newRoomCode();
    const exists = await db.get(P(c).host);
    if (!exists) { await db.set(P(c).host, db.uid); await db.set(P(c).pub, freshPub()); return c; }
  }
  throw new Error('Could not create a room. Try again.');
}

async function setPub(patch) {
  Object.assign(G.pub, patch);
  for (const k of Object.keys(patch)) if (patch[k] === undefined) patch[k] = null;
  await db.update(paths.pub, patch);
}
const saveVerdicts = () => db.update(paths.hostData, { verdicts: G.verdicts, settings: G.settings });

// The stage is always 1600 wide; its height follows the screen shape (900 for 16:9, up to 1200 for 4:3 / 16:10 laptops)
// so a laptop is filled edge to edge instead of letterboxed.
function fitStage() {
  const h = Math.round(Math.max(900, Math.min(1200, (1600 * innerHeight) / innerWidth)));
  $stage.style.height = `${h}px`;
  $stage.style.setProperty('--stage-h', `${h}px`);
  const s = Math.min(innerWidth / 1600, innerHeight / h);
  $stage.style.transform = `translate(-50%, -50%) scale(${s})`;
}

// Resume after a refresh of the big screen.
function resume() {
  const st = G.pub.state;
  if (st === 'lobby' || !st) return renderLobby();
  if (st === 'assigning') return renderAssigning();
  if (st === 'writing' || st === 'written') return renderWriting();
  if (st === 'revealing' || st === 'paused' || st === 'fixing') return runReveal(G.pub.currentScene || 1);
  if (st === 'board') return renderBoardEnd();
  if (st === 'quiz') return renderQuizIntro();
  if (st === 'voting') return renderVoting();
  if (st === 'revealed') return runEnding();
  return renderLobby();
}

function onData(what) {
  const st = G.pub.state;
  if ((st === 'lobby' || !st) && (what === 'players' || what === 'seats')) renderLobby(true);
  if ((st === 'writing' || st === 'written') && (what === 'subs' || what === 'players')) updateWriting();
  if (st === 'fixing' && what === 'subs') fixWatch?.();
  if (st === 'quiz' && what === 'answers') quizWatch?.();
  if (st === 'voting' && what === 'votes') updateVoting();
}

const playerList = () => Object.entries(G.players).map(([uid, p]) => ({ uid, ...p }));
const sceneNumbersOf = (uid) => Object.entries(G.pub.assign || {}).filter(([, a]) => a.uid === uid).map(([n]) => Number(n));

// ------------------------------------------------------------------ chrome
function topbar(extra = '') {
  return `<header class="topbar">
    <div class="brand"><img src="${assetUrl('assets/cho.png')}" alt=""><span>Crime Scene Detective</span></div>
    <div class="tb-mid">${extra}</div>
    <div class="tb-right">
      <span class="pill">Room <b>${esc(code)}</b></span>
      <span class="pill fish" title="Fish (vocab bonus)">🐟 <b id="fishCount">${G.fish}</b></span>
      <button class="tb-btn" data-act="vault" title="Vocab Vault (V)">📚</button>
      <button class="tb-btn" data-act="board" title="Case Board (B)">🗂️</button>
      <button class="tb-btn vi-btn ${showVi ? '' : 'off'}" data-act="vi" title="Vietnamese translation (L)">VI</button>
      <button class="tb-btn" data-act="mute" title="Sound (M)">${isMuted() ? '🔇' : '🔊'}</button>
      <button class="tb-btn" data-act="help" title="Keys (?)">?</button>
      <button class="tb-btn" data-act="story" title="Settings: edit the story (E)">⚙️</button>
      ${G.pub.state && G.pub.state !== 'lobby' ? '<button class="tb-btn restart" data-act="restart" title="Stop this game / start again">↺</button>' : ''}
    </div>
  </header>`;
}

function bindChrome(root = $stage) {
  root.querySelectorAll('[data-act]').forEach((b) => b.addEventListener('click', () => chromeAction(b.dataset.act)));
}
function chromeAction(a) {
  if (a === 'vault') toggleOverlay('vault');
  if (a === 'board') toggleOverlay('board');
  if (a === 'help') toggleOverlay('help');
  if (a === 'story') openStoryEditor();
  if (a === 'restart') toggleOverlay('restart');
  if (a === 'vi') toggleVi();
  if (a === 'mute') { setMuted(!isMuted()); document.querySelectorAll('[data-act=mute]').forEach((b) => { b.textContent = isMuted() ? '🔇' : '🔊'; }); }
}
function addFish(k = 1) {
  G.fish += k;
  setPub({ fish: G.fish });
  const el = document.getElementById('fishCount');
  if (el) { el.textContent = G.fish; el.parentElement.classList.remove('bump'); void el.offsetWidth; el.parentElement.classList.add('bump'); }
  sfx.fish();
}

function toast(msg, ms = 2600) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.innerHTML = msg;
  $stage.appendChild(t);
  setTimeout(() => t.remove(), ms);
}

// ------------------------------------------------------------------ story editor (settings)
function openStoryEditor() {
  if (editor?.isOpen) return;
  if (G.pub.state !== 'lobby') { toast('⚙️ You can edit the story in the lobby, before you press Start.'); return; }
  if (overlay) toggleOverlay(overlay);
  editor = openEditor({
    root: $stage,
    isWord: () => isWord,
    toast,
    onSave: async (ov) => {
      storyOv = isEmpty(ov) ? null : ov;
      applyStory(storyOv);
      saveLocal(storyOv);
      await setPub({ story: storyOv });
      preload(SCENES.map((x) => x.image));
      if (G.pub.state === 'lobby') renderLobby();
    },
    onClose: () => { editor = null; },
  });
}

// ------------------------------------------------------------------ overlays
function toggleOverlay(name) {
  document.querySelector('.overlay')?.remove();
  if (overlay === name) { overlay = null; return; }
  overlay = name;
  const o = document.createElement('div');
  o.className = 'overlay';
  toggleOverlay.el = o;
  let inner = '';
  if (name === 'vault') inner = vaultHTML();
  if (name === 'board') inner = boardHTML();
  if (name === 'help') inner = helpHTML();
  if (name === 'restart') inner = restartHTML();
  o.innerHTML = `<div class="overlay-card ${name}">${inner}<button class="close-x" aria-label="Close">✕</button></div>`;
  o.querySelector('.close-x').onclick = () => toggleOverlay(name);
  o.addEventListener('click', (e) => { if (e.target === o) toggleOverlay(name); });
  if (name === 'board') o.querySelectorAll('.panel[data-n]').forEach((el) => el.onclick = () => jumpTo(Number(el.dataset.n)));
  if (name === 'restart') {
    o.querySelector('#rsKeep').onclick = () => toggleOverlay('restart');
    o.querySelector('#rsGo').onclick = () => { toggleOverlay('restart'); replay(); };
    o.querySelector('#rsNew').onclick = () => { localStorage.removeItem(`csd-host-room-${db.mode}`); location.search = DEMO ? '?demo=1' : ''; };
  }
  $stage.appendChild(o);
}
// A scene change re-renders the whole stage; put an open overlay (board, vault, stop dialog...) back on top.
new MutationObserver(() => {
  if (!overlay || overlay === 'reassign') return;
  const o = overlayEl();
  if (o && !o.isConnected) { o.classList.add('still'); $stage.appendChild(o); }
}).observe($stage, { childList: true });
function overlayEl() { return toggleOverlay.el; }

function restartHTML() {
  return `<h2>↺ Stop this game?</h2>
  <p class="rs-text">All sentences, clues, votes and 🐟 are cleared. Students stay in the room and go back to the lobby.</p>
  <div class="rs-btns">
    <button class="big-btn alt" id="rsKeep">Keep playing</button>
    <button class="big-btn pulse" id="rsGo">↺ Start again from the beginning</button>
  </div>
  <button class="link-btn rs-new" id="rsNew">or open a new room (everyone joins again)</button>`;
}

function vaultHTML() {
  const row = (v) => `<tr><td><b>${esc(v.phrase)}</b></td><td class="ipa">${esc(v.ipa)}</td><td>${esc(v.vi)}</td><td class="ex">${esc(v.example)}</td></tr>`;
  return `<h2>📚 Vocab Vault</h2>
    <div class="vault-scroll"><table class="vault"><thead><tr><th>Phrase</th><th>IPA</th><th>Tiếng Việt</th><th>Example</th></tr></thead>
    <tbody><tr class="sep"><td colspan="4">Core phrases (18)</td></tr>${VOCAB.filter((v) => v.core).map(row).join('')}
    <tr class="sep"><td colspan="4">Extra phrases (11)</td></tr>${VOCAB.filter((v) => !v.core).map(row).join('')}</tbody></table></div>`;
}

function helpHTML() {
  return `<h2>⌨️ Teacher keys</h2><div class="keys">
  <div><kbd>Space</kbd> pause / skip / next</div>
  <div><kbd>G</kbd> Gotcha: stamp the clue UNRESOLVED</div>
  <div><kbd>X</kbd> Xin lỗi: accept a wrong rejection</div>
  <div><kbd>H</kbd> next hint</div>
  <div><kbd>R</kbd> reassign a scene / teacher types</div>
  <div><kbd>T</kbd> show / hide checker reasons (teacher only)</div>
  <div><kbd>B</kbd> Case Board · <kbd>V</kbd> Vocab Vault · <kbd>M</kbd> sound</div>
  <div><kbd>←</kbd> <kbd>→</kbd> (or <kbd>&lt;</kbd> <kbd>&gt;</kbd>) previous / next clue · click a number on the rail</div>
  <div><kbd>L</kbd> Vietnamese translation on / off</div>
  <div><kbd>E</kbd> ⚙️ edit the story (lobby only)</div>
  <div>↺ (top right) stop the game and start again from the lobby</div>
  </div>
  <p class="muted">${esc(pick(CHO_GAGS))}</p>`;
}

// Vietnamese translation under the English story (toggle: VI button / L key; remembered on this computer).
let showVi = (() => { try { return localStorage.getItem('csd-vi') !== 'off'; } catch { return true; } })();
document.body.classList.toggle('no-vi', !showVi);
const vi = (t, cls = '') => (t ? `<div class="vi-line ${cls}">${esc(t)}</div>` : '');
function toggleVi() {
  showVi = !showVi;
  document.body.classList.toggle('no-vi', !showVi);
  try { localStorage.setItem('csd-vi', showVi ? 'on' : 'off'); } catch { /* private mode */ }
  document.querySelectorAll('[data-act=vi]').forEach((b) => b.classList.toggle('off', !showVi));
  toast(showVi ? '🇻🇳 Tiếng Việt: on' : '🇻🇳 Tiếng Việt: off', 1400);
}

function statusOf(n) { return G.pub.revealed?.[n]?.status || 'pending'; }

function panelHTML(n, { small = false } = {}) {
  const sc = SCENE_BY_N[n];
  const r = G.pub.revealed?.[n];
  const st = r?.status || 'pending';
  if (st === 'pending') return `<div class="panel locked ${small ? 'small' : ''}"><div class="lock">Clue #${n}: ???</div></div>`;
  const a = G.pub.assign?.[n];
  let body;
  if (st === 'unresolved') body = `<div class="classified">${esc(CLASSIFIED)}</div>`;
  else if (st === 'restored') body = `<div class="restored">🕵️ Restored: ${esc(plain(sc.prompt))}</div>`;
  else body = `<div class="report">“${esc(r.sentence)}”</div><div class="react">${rich(sc.reaction)}</div>`;
  return `<div class="panel ${st} ${small ? 'small' : ''} ${(r?.sentence || '').length > 70 ? 'long' : ''}" data-n="${n}" title="Show clue #${n} again">
    <div class="p-img"><img src="${assetUrl(sc.image)}" alt=""><span class="p-num">#${n}</span>${st === 'correct' || st === 'overridden' ? '<span class="p-ok">✔</span>' : ''}</div>
    <div class="p-cap"><div class="p-who">Detective #${n} · ${esc(r?.name || a?.name || '')}</div>${body}</div>
  </div>`;
}

function boardHTML() {
  return `<h2>🗂️ Case Board: ${esc(STORY_TITLE)}</h2><div class="board-grid">${SCENES.map((s) => panelHTML(s.n, { small: true })).join('')}</div>`;
}

// ------------------------------------------------------------------ keys
let skipFn = null; // resolves the current wait early (Space)
let keyHandlers = {};
function installKeys() {
  addEventListener('keydown', (e) => {
    if (e.target.matches('input, textarea, select')) { if (e.key === 'Escape') e.target.blur(); return; }
    if (editor?.isOpen) { if (e.key === 'Escape') editor.close(); return; }
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (k === ' ') { e.preventDefault(); if (keyHandlers.space) keyHandlers.space(); else if (skipFn) skipFn(); return; }
    if (k === '?' || k === '/') return toggleOverlay('help');
    if (k === 'b') return toggleOverlay('board');
    if (k === 'v') return toggleOverlay('vault');
    if (k === 'm') return chromeAction('mute');
    if (k === 'l') return toggleVi();
    if (k === 'ArrowLeft' || k === ',' || k === '<') { e.preventDefault(); return navScene(-1); }
    if (k === 'ArrowRight' || k === '.' || k === '>') { e.preventDefault(); return navScene(1); }
    if (k === 'e') return openStoryEditor();
    if (k === 'Escape' && overlay) return toggleOverlay(overlay);
    if (k === 't') { G.settings.showReasons = !G.settings.showReasons; document.querySelector('.reasons')?.classList.toggle('open', G.settings.showReasons); return; }
    keyHandlers[k]?.();
  });
}

function wait(ms) {
  return new Promise((res) => {
    const done = () => { clearTimeout(t); if (skipFn === done) skipFn = null; res(); };
    const t = setTimeout(done, ms * SPEED);
    skipFn = done;
  });
}

// ------------------------------------------------------------------ LOBBY
function joinUrl() {
  const u = new URL('../play/', location.href);
  u.search = `?room=${code}${db.mode === 'local' ? '&local=1' : ''}`;
  return u.toString();
}

function qrSvg(text) {
  const q = qrcode(0, 'M');
  q.addData(text); q.make();
  return q.createSvgTag({ cellSize: 8, margin: 2, scalable: true });
}

let lobbyTaken = new Set();
function renderLobby(update = false) {
  keyHandlers = {};
  const players = playerList();
  const again = !!$stage.querySelector('.lobby');
  const prevTaken = lobbyTaken; lobbyTaken = new Set();
  const slots = Array.from({ length: NUM_SCENES }, (_, i) => {
    const n = i + 1; const uid = G.seats[n]; const p = uid && G.players[uid];
    if (p) lobbyTaken.add(uid);
    return `<div class="slot ${p ? 'taken' : ''} ${p && !prevTaken.has(uid) ? 'fresh' : ''}"><span class="s-n">${n}</span><span class="s-name">${p ? esc(p.name) : '—'}</span>${p ? `<button class="kick" data-kick="${uid}" title="Remove">✕</button>` : ''}</div>`;
  }).join('');
  const juniors = players.filter((p) => p.isJunior);
  const html = `${topbar('<span class="state-tag">Lobby</span>')}
  <main class="lobby ${again ? 'still' : ''}">
    <section class="join-box">
      <div class="qr">${qrSvg(joinUrl())}</div>
      <div class="join-text">Scan to join<br><span class="code">${esc(code)}</span></div>
      <div class="url">${esc(joinUrl())}</div>
      ${db.mode === 'local' ? `<div class="warn">${DEMO ? '🧪 DEMO MODE: 15 fake students' : '⚠️ Local mode: no Firebase config. Phones cannot join. See README.'}</div>` : ''}
    </section>
    <section class="slots-box">
      <h2>${esc(STORY_TITLE)}</h2>
      <div class="slots">${slots}</div>
      <div class="juniors">${juniors.length ? `Junior Detectives: ${juniors.map((j) => esc(j.name)).join(', ')}` : ''}</div>
      <div class="lobby-ctrl">
        <div class="timer-set">Writing time <button data-t="-30">−30s</button><b>${fmtTime(G.settings.writeSecs * 1000)}</b><button data-t="30">+30s</button></div>
        <label class="chk"><input type="checkbox" id="pauseEvery" ${G.settings.pauseEvery ? 'checked' : ''}> pause after every scene</label>
        <button class="big-btn" id="startBtn" ${players.length ? '' : 'disabled'}>🔎 Start the Case</button>
        <div class="muted">${players.length} detective${players.length === 1 ? '' : 's'} here</div>
        <button class="link-btn" id="newRoom">New room</button>
      </div>
    </section>
  </main>`;
  $stage.innerHTML = html;
  if (editor?.el) $stage.appendChild(editor.el); // keep the story editor open while students join
  bindChrome();
  $stage.querySelectorAll('[data-t]').forEach((b) => b.onclick = () => { G.settings.writeSecs = Math.max(30, Math.min(900, G.settings.writeSecs + Number(b.dataset.t))); saveVerdicts(); renderLobby(); });
  $stage.querySelector('#pauseEvery').onchange = (e) => { G.settings.pauseEvery = e.target.checked; saveVerdicts(); };
  $stage.querySelectorAll('[data-kick]').forEach((b) => b.onclick = async () => {
    const uid = b.dataset.kick; const p = G.players[uid];
    if (p?.number) await db.remove(`${paths.seats}/${p.number}`);
    await db.remove(`${paths.players}/${uid}`);
  });
  $stage.querySelector('#startBtn').onclick = startCase;
  $stage.querySelector('#newRoom').onclick = async () => { localStorage.removeItem(`csd-host-room-${db.mode}`); location.search = DEMO ? '?demo=1' : ''; };
  void update;
}

async function startCase() {
  if (!playerList().length) return;
  const { assign, extra } = autoAssign(G.seats, G.players);
  const jokes = extra.map((x) => pick(ASSIGN_JOKES).replace(/\{name\}/g, x.name).replace(/\{n\}/g, x.n));
  await setPub({ state: 'assigning', assign, announce: jokes, revealed: null, fix: null, hints: null, currentScene: 0, quiz: null, outcome: null, tally: null });
  renderAssigning();
}

function renderAssigning() {
  const jokes = G.pub.announce || [];
  $stage.innerHTML = `${topbar('<span class="state-tag">Assigning</span>')}
  <main class="assigning">
    <h1>🕵️ Case files are ready!</h1>
    ${jokes.length ? `<div class="jokes">${jokes.map((j) => `<div class="joke">${esc(j)}</div>`).join('')}</div>` : '<p class="big-p">Every detective has one scene. Perfect!</p>'}
    <p class="big-p">Write ONE passive sentence for your picture: <b>was / were + V3</b></p>
    <button class="big-btn" id="goWrite">✍️ Go! Start writing (${fmtTime(G.settings.writeSecs * 1000)})</button>
  </main>`;
  bindChrome();
  $stage.querySelectorAll('.joke').forEach((j, i) => { j.style.animationDelay = `${i * 0.4}s`; });
  $stage.querySelector('#goWrite').onclick = startWriting;
  keyHandlers = { space: startWriting };
}

async function startWriting() {
  await setPub({ state: 'writing', timerEndsAt: db.now() + G.settings.writeSecs * 1000, writeSecs: G.settings.writeSecs });
  renderWriting();
}

// ------------------------------------------------------------------ WRITING (Phase 1)
let writeTimer = null; let msgTimer = null;
function renderWriting() {
  const written = G.pub.state === 'written';
  $stage.innerHTML = `${topbar(`<span class="state-tag">${written ? 'Time is up!' : 'Phase 1: everybody writes'}</span>`)}
  <main class="writing">
    <div class="w-left">
      <div class="countdown" id="countdown">--:--</div>
      <div class="t-ctrl" ${written ? 'hidden' : ''}><button data-t="-30">−30s</button><button data-t="30">+30s</button><button id="endNow">End now</button></div>
      <div class="w-stats" id="wStats"></div>
      <div class="ticker" id="ticker">${esc(pick(CHO_GAGS))}</div>
      <button class="big-btn" id="openFiles" ${written ? '' : 'hidden'}>Open the case files 🗂️</button>
      <button class="link-btn" id="reassignBtn">R · Reassign a scene</button>
    </div>
    <div class="files" id="files"></div>
  </main>`;
  bindChrome();
  $stage.querySelectorAll('[data-t]').forEach((b) => b.onclick = () => setPub({ timerEndsAt: Math.max(db.now() + 5000, G.pub.timerEndsAt + Number(b.dataset.t) * 1000) }));
  $stage.querySelector('#endNow').onclick = finishWriting;
  $stage.querySelector('#openFiles').onclick = () => openCaseFiles();
  $stage.querySelector('#reassignBtn').onclick = openReassign;
  keyHandlers = { r: openReassign, space: () => { if (G.pub.state === 'written') openCaseFiles(); } };
  updateWriting();
  clearInterval(writeTimer); clearInterval(msgTimer);
  writeTimer = setInterval(() => {
    if (!['writing', 'written'].includes(G.pub.state)) return clearInterval(writeTimer);
    const left = G.pub.timerEndsAt - db.now();
    const el = document.getElementById('countdown');
    if (!el) return;
    el.textContent = G.pub.state === 'written' ? '0:00' : fmtTime(left);
    el.className = 'countdown' + (left < 20000 ? ' red' : left < 60000 ? ' orange' : '');
    if (G.pub.state === 'writing' && left <= 0) finishWriting();
  }, 250);
  msgTimer = setInterval(() => {
    const t = document.getElementById('ticker');
    if (!t) return clearInterval(msgTimer);
    const ns = Object.keys(G.pub.assign || {});
    const n = pick(ns) || 1;
    t.textContent = Math.random() < 0.25 ? pick(CHO_GAGS) : pick(WRITING_MESSAGES).replace(/\{n\}/g, n);
    t.classList.remove('in'); void t.offsetWidth; t.classList.add('in');
  }, 5000);
}

function subStatus(n) {
  const s = G.subs[n];
  if (s?.submittedAt && s.text) return 'submitted';
  if (s?.draft) return 'draft';
  return 'writing';
}

function updateWriting() {
  const files = document.getElementById('files');
  if (!files) return;
  const icon = { submitted: '✅', draft: '📝', writing: '✍️' };
  files.innerHTML = SCENES.map((s) => {
    const a = G.pub.assign?.[s.n]; const st = subStatus(s.n);
    return `<div class="file ${st}"><div class="f-tab">#${s.n}</div><div class="f-name">${esc(a?.name || '—')}</div><div class="f-st">${icon[st]}</div>${G.subs[s.n]?.usedAdvice ? '<div class="f-adv" title="Asked Chó for advice">🐟</div>' : ''}</div>`;
  }).join('');
  const done = SCENES.filter((s) => subStatus(s.n) === 'submitted').length;
  const adv = SCENES.filter((s) => G.subs[s.n]?.usedAdvice).length;
  const st = document.getElementById('wStats');
  if (st) st.innerHTML = `<div><b>${done}</b>/15 submitted</div><div>🐟 Asked Chó for advice: <b>${adv}</b></div>`;
  if (G.pub.state === 'writing' && done === NUM_SCENES) finishWriting();
}

let finishing = false;
async function finishWriting() {
  if (finishing || G.pub.state !== 'writing') return;
  finishing = true;
  await setPub({ state: 'written' });
  // Unsent drafts are auto-submitted. Run the checker now; results stay hidden until the reveal.
  runAllChecks();
  finishing = false;
  renderWriting();
  sfx.tada();
}

function sentenceOf(n) {
  const s = G.subs[n];
  return (s?.text || s?.draft || '').replace(/[\r\n]+/g, ' ').trim();
}

function runAllChecks() {
  for (const s of SCENES) {
    const text = sentenceOf(s.n);
    if (G.verdicts[s.n]?.text === text && G.verdicts[s.n]?.final) continue;
    G.verdicts[s.n] = { text, ...check(text, s, { isWord }) };
  }
  saveVerdicts();
}

function openReassign() {
  document.querySelector('.overlay')?.remove();
  overlay = 'reassign';
  const players = playerList();
  const o = document.createElement('div');
  o.className = 'overlay';
  o.innerHTML = `<div class="overlay-card reassign"><h2>🔁 Reassign a scene</h2>
    <div class="ra-row"><label>Scene <select id="raScene">${SCENES.map((s) => `<option value="${s.n}" ${s.n === (G.pub.currentScene || 1) ? 'selected' : ''}>#${s.n} · ${esc(G.pub.assign?.[s.n]?.name || '—')} ${subStatus(s.n) === 'submitted' ? '✅' : ''}</option>`).join('')}</select></label>
    <label>Give to <select id="raWho">${players.map((p) => `<option value="${p.uid}">${esc(p.name)}${p.number ? ` (#${p.number})` : ' (junior)'}</option>`).join('')}</select></label>
    <button class="mid-btn" id="raGo">Give</button></div>
    <div class="ra-row"><input id="raText" placeholder="...or the teacher types the sentence here" autocomplete="off" spellcheck="false"><button class="mid-btn" id="raType">Teacher types</button></div>
    <button class="close-x">✕</button></div>`;
  $stage.appendChild(o);
  o.querySelector('.close-x').onclick = () => { o.remove(); overlay = null; };
  o.querySelector('#raGo').onclick = async () => {
    const n = o.querySelector('#raScene').value; const uid = o.querySelector('#raWho').value;
    await db.update(paths.pub, { [`assign/${n}`]: { uid, name: G.players[uid].name } });
    G.pub.assign[n] = { uid, name: G.players[uid].name };
    o.remove(); overlay = null; updateWriting(); toast(`Scene #${n} → ${esc(G.players[uid].name)}`);
  };
  o.querySelector('#raType').onclick = async () => {
    const n = o.querySelector('#raScene').value; const text = o.querySelector('#raText').value.trim();
    if (!text) return;
    await db.set(`${paths.subs}/${n}`, { uid: db.uid, text, submittedAt: db.now(), byTeacher: true });
    if (G.pub.state === 'written') { G.subs[n] = { text, submittedAt: 1 }; runAllChecks(); }
    o.remove(); overlay = null; toast(`Scene #${n}: the teacher wrote it.`);
  };
}

// ------------------------------------------------------------------ REVEAL (Phase 2)
let flowToken = 0;
let fixWatch = null; let quizWatch = null;
const alive = (t) => t === flowToken;

async function openCaseFiles() {
  runAllChecks();
  await setPub({ state: 'revealing', currentScene: 1 });
  runReveal(1);
}

function revealShell() {
  $stage.innerHTML = `${topbar('<span class="state-tag" id="stTag">Phase 2: the case reveal</span>')}
  <main class="reveal">
    <div class="scene-stage" id="sceneStage"></div>
    <aside class="side" id="side"></aside>
  </main>
  <div class="rail" id="rail"></div>
  <div class="spotlight" id="spotlight"></div>`;
  bindChrome();
  document.getElementById('rail').onclick = (e) => { const g = e.target.closest('[data-n]'); if (g) jumpTo(Number(g.dataset.n)); };
}

function renderRail(current) {
  const rail = document.getElementById('rail');
  if (!rail) return;
  const pts = SCENES.map((s, i) => ({ n: s.n, x: 40 + i * 101, st: statusOf(s.n) }));
  let lines = '';
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1]; const b = pts[i];
    if (a.st === 'pending' || b.st === 'pending') continue;
    const broken = a.st === 'unresolved' || b.st === 'unresolved';
    lines += `<path d="M${a.x} 30 Q ${(a.x + b.x) / 2} ${broken ? 46 : 42} ${b.x} 30" class="${broken ? 'string broken' : 'string'}"/>`;
  }
  rail.innerHTML = `<svg viewBox="0 0 1500 60" class="rail-svg">${lines}${pts.map((p) => `<g class="pin ${p.st} ${p.n === current ? 'cur' : ''}" data-n="${p.n}"><title>Clue #${p.n}</title><circle cx="${p.x}" cy="30" r="17"/><text x="${p.x}" y="36">${p.n}</text></g>`).join('')}</svg>`;
}

function spotlightFor(sc) {
  const el = document.getElementById('spotlight');
  if (!el) return;
  const ids = sc.mode === 'phrase' ? sc.targetPhrases : (sc.bonusPhrases || []);
  const vb = `<span class="sp-verb">🔑 ${esc(sc.verb)}</span>`;
  el.innerHTML = `<span class="sp-title">Vocab Spotlight</span>${vb}${ids.map((id) => { const v = VOCAB_BY_ID[id]; return `<span class="sp-item"><b>${esc(v.phrase)}</b> <i>${esc(v.ipa)}</i> ${esc(v.vi)}${sc.mode === 'clue' ? ' <small>(bonus 🐟)</small>' : ''}</span>`; }).join('')}`;
}

async function actCard(act, t) {
  const st = document.getElementById('sceneStage');
  st.innerHTML = `<div class="act-card"><div class="act-title">${esc(act.title)}</div><div class="act-sub">${esc(act.sub)}</div>${vi(act.subVi, 'act-vi')}</div>`;
  sfx.drumroll(0.8);
  await wait(2600);
  return alive(t);
}

function sceneHTML(sc) {
  const a = G.pub.assign?.[sc.n];
  return `<div class="scene-card slide-in">
    <div class="sc-pic"><img src="${assetUrl(sc.image)}" alt="${esc(sc.title)}"><div class="stamp-slot" id="stampSlot"></div></div>
    <div class="sc-text">
      <div class="sc-head"><span class="sc-num">Clue #${sc.n}</span><span class="sc-title">${esc(sc.title)}</span>${sc.mode === 'phrase' ? '<span class="tag-phrase">PHRASE</span>' : '<span class="tag-clue">CLUE</span>'}</div>
      ${sc.previously ? `<div class="sc-prev">${rich(sc.previously, sc.glossary)}${vi(sc.previouslyVi)}</div>` : ''}
      <div class="sc-intro">${rich(sc.intro, sc.glossary)}${vi(sc.introVi)}</div>
      <div class="sc-det" id="scDet">🕵️ Detective #${sc.n} · <b>${esc(a?.name || '???')}</b> is on the case...</div>
      <div class="sc-report" id="scReport"><span class="rep-label">Detective's report:</span> <span class="rep-text" id="repText"></span><span class="caret">▍</span></div>
      <div class="sc-after" id="scAfter"></div>
    </div>
    <div class="reasons ${G.settings.showReasons ? 'open' : ''}" id="reasons"></div>
  </div>`;
}

function setReasons(v) {
  const el = document.getElementById('reasons');
  if (!el) return;
  el.innerHTML = `<button class="r-tog" onclick="this.parentElement.classList.toggle('open')">🔍 teacher</button><div class="r-body">${v?.ok ? '✅ checker: OK' : (v?.reasons || []).map((r) => `• ${esc(r)}`).join('<br>') || '—'}${v?.phrases?.length ? `<br>phrases: ${v.phrases.join(', ')}` : ''}</div>`;
}

async function typeSentence(text, t) {
  const el = document.getElementById('repText');
  if (!el) return;
  el.textContent = '';
  const rep = document.getElementById('scReport');
  if (rep) rep.style.fontSize = `${(text || '').length > 120 ? 19 : (text || '').length > 95 ? 21 : (text || '').length > 70 ? 23 : (text || '').length > 50 ? 25 : 28}px`;
  sfx.drumroll(1.2);
  if (!text) { await wait(600); el.innerHTML = '<i class="muted">(nothing written)</i>'; return; }
  let skip = false;
  skipFn = () => { skip = true; };
  for (let i = 0; i < text.length && alive(t); i++) {
    if (skip) { el.textContent = text; break; }
    el.textContent = text.slice(0, i + 1);
    await new Promise((r) => setTimeout(r, 38 * SPEED));
  }
  skipFn = null;
  await wait(500);
}

/** Long student sentences: smaller report font, and the text column scrolls to the newest line. */
function fitReport() {
  const rep = document.getElementById('scReport');
  const len = (document.getElementById('repText')?.textContent || '').length;
  if (rep) rep.style.fontSize = `${len > 120 ? 19 : len > 95 ? 21 : len > 70 ? 23 : len > 50 ? 25 : 28}px`;
  const box = rep?.closest('.sc-text');
  if (!box || box.scrollHeight <= box.clientHeight) return;
  // show the newest lines, but never scroll the student's sentence out of view
  const k = box.clientHeight / (box.getBoundingClientRect().height || 1);
  const repTop = (rep.getBoundingClientRect().top - box.getBoundingClientRect().top) * k + box.scrollTop;
  box.scrollTo({ top: Math.min(box.scrollHeight - box.clientHeight, repTop - 8), behavior: 'smooth' });
}
new MutationObserver(() => { const a = document.getElementById('scAfter'); if (a?.childElementCount) fitReport(); })
  .observe(document.getElementById('stage'), { childList: true, subtree: true });

const failStampHTML = (sub) => `<div class="stamp bad">${esc(FAIL_STAMP).replace(': ', ':<br>')}<small>${esc(sub)}</small></div>`;
function stamp(ok, quiet = false) {
  const slot = document.getElementById('stampSlot');
  if (!slot) return;
  slot.innerHTML = ok ? `<div class="stamp ok">${esc(pick(REVEAL_PRAISE))}</div>` : failStampHTML(FAIL_SUB);
  if (quiet) return;
  sfx.stampHit(0.26); // the thud lands with the stamp animation
  const pic = slot.closest('.sc-pic');
  if (pic) { pic.classList.remove('thud'); void pic.offsetWidth; pic.classList.add('thud'); }
}
/** A failed clue: the whole screen goes grey (only the red stamp and the buttons keep colour). */
function setGloom(on) { document.body.classList.toggle('gloom', !!on); }

/** Main reveal loop: scenes in order 1..15. */
async function runReveal(from, opts = {}) {
  const t = ++flowToken;
  fixWatch = null;
  revealShell();
  for (let n = from; n <= NUM_SCENES; n++) {
    preload([SCENE_BY_N[n + 1]?.image, SCENE_BY_N[n + 2]?.image]);
    const ok = await playScene(n, t, n === from ? opts : {});
    if (!ok || !alive(t)) return;
  }
  if (!alive(t)) return;
  setGloom(false);
  await setPub({ state: 'board', currentScene: 16 });
  renderBoardEnd();
}

// ------------------------------------------------------------------ moving between clues
const frontier = () => { for (const s of SCENES) if (!G.pub.revealed?.[s.n]) return s.n; return NUM_SCENES + 1; };
/** Go to clue n: a clue on the board is shown again (no new judging); the next new clue plays as usual. */
function jumpTo(n) {
  const st = G.pub.state;
  if (st === 'fixing') { toast('Finish the second chance first.'); return; }
  if (!['revealing', 'paused', 'board'].includes(st)) return;
  const f = frontier();
  if (n > NUM_SCENES) { if (f > NUM_SCENES) { flowToken++; setGloom(false); setPub({ state: 'board', currentScene: 16 }).then(renderBoardEnd); } else toast(`Clue #${f} first!`); return; }
  if (n < 1) return;
  if (n > f) { toast(`Clue #${f} first! 🔎`); n = f; }
  if (n === G.pub.currentScene && st !== 'board' && !G.pub.revealed?.[n]) return;
  document.querySelector('.overlay')?.remove(); overlay = null;
  runReveal(n);
}
function navScene(d) {
  if (G.pub.state === 'board') { if (d < 0) jumpTo(NUM_SCENES); return; }
  const cur = G.pub.currentScene || 1;
  if (d > 0 && !G.pub.revealed?.[cur]) { if (skipFn) skipFn(); else toast('Finish this clue first (or Space).'); return; }
  jumpTo(cur + d);
}

async function reviewScene(n, t, r) {
  const sc = SCENE_BY_N[n];
  const st = document.getElementById('sceneStage');
  renderRail(n);
  spotlightFor(sc);
  setGloom(false);
  await setPub({ state: 'revealing', currentScene: n, fix: null });
  if (!alive(t)) return false;
  st.innerHTML = sceneHTML(sc).replace('slide-in', 'slide-in review');
  document.getElementById('stTag').textContent = `Clue ${n} of 15 · ${actOf(n).title}`;
  document.getElementById('scDet').innerHTML = `🕵️ Detective #${n} · <b>${esc(r.name || G.pub.assign?.[n]?.name || '???')}</b> reported:`;
  document.getElementById('repText').textContent = r.status === 'unresolved' ? '' : r.sentence || '';
  document.querySelector('#scReport .caret')?.remove();
  setReasons(G.verdicts[n]);
  const after = document.getElementById('scAfter');
  if (r.status === 'unresolved') {
    document.getElementById('stampSlot').innerHTML = failStampHTML(CLASSIFIED);
    after.innerHTML = `<div class="bridge">${rich(sc.bridge, sc.glossary)}${vi(sc.bridgeVi)}</div>`;
    keyHandlers = { g: () => {}, x: () => overturnLast(n, t), h: () => showHint(sc) };
  } else {
    stamp(true, true);
    after.innerHTML = `<div class="cho-react"><img src="${assetUrl('assets/cho.png')}" alt=""><div class="bubble">${rich(sc.reaction, sc.glossary)}${vi(sc.reactionVi)}</div></div><div class="bridge">${rich(sc.bridge, sc.glossary)}${vi(sc.bridgeVi)}</div>`;
    keyHandlers = { g: () => doGotcha(n, t), x: () => {}, h: () => showHint(sc) };
  }
  fitReport();
  await advanceWait(t, 5000);
  return alive(t);
}

async function playScene(n, t, { gotcha = false } = {}) {
  const sc = SCENE_BY_N[n];
  if (!gotcha && G.pub.revealed?.[n]) return reviewScene(n, t, G.pub.revealed[n]);
  const act = actOf(n);
  const st = document.getElementById('sceneStage');
  renderRail(n);
  spotlightFor(sc);
  await setPub({ state: 'revealing', currentScene: n, fix: null });
  if (!gotcha && act.scenes[0] === n && !G.pub.revealed?.[n]) { if (!(await actCard(act, t))) return false; }
  setGloom(false);
  st.innerHTML = sceneHTML(sc);
  document.getElementById('stTag').textContent = `Clue ${n} of 15 · ${act.title}`;
  let v = G.verdicts[n] || { text: sentenceOf(n), ...check(sentenceOf(n), sc, { isWord }) };
  let text = v.text ?? sentenceOf(n);
  setReasons(v);
  keyHandlers = {
    g: () => doGotcha(n, t), x: () => toast('Nothing to overturn yet.'), h: () => showHint(sc), r: () => toast('R works during a second chance.'),
  };
  if (!gotcha) {
    await wait(sc.previously ? 5200 : 4200); if (!alive(t)) return false;
  }
  document.getElementById('scDet').innerHTML = `🕵️ Detective #${n} · <b>${esc(G.pub.assign?.[n]?.name || '???')}</b> reports:`;
  await typeSentence(text, t); if (!alive(t)) return false;

  let result;
  let forceFail = gotcha;
  for (;;) {
    if (v.ok && !forceFail) { result = 'correct'; break; }
    forceFail = false;
    stamp(false);
    setGloom(true);
    setTimeout(() => sfx.sad(), 650);
    document.getElementById('scAfter').innerHTML = `<div class="fail-line">${rich(sc.failLine, sc.glossary)}${vi(sc.failLineVi)}</div>
      <div class="pause-btns"><button class="beg-btn" id="beg">Beg for a second chance 🥺😭</button><button class="fate-btn" id="fate">Accept our fate 🪦</button></div>`;
    const decided = new Promise((res) => {
      document.getElementById('beg').onclick = () => res('beg');
      document.getElementById('fate').onclick = () => res('fate');
      keyHandlers = { ...keyHandlers, x: () => res('override'), g: () => {}, space: () => {} };
    });
    await setPub({ state: 'paused' });
    const decision = await decided;
    if (!alive(t)) return false;
    keyHandlers.space = null;
    if (decision === 'fate') { result = 'unresolved'; break; }
    if (decision === 'override') { setGloom(false); result = 'overridden'; break; }
    // second chance
    const newText = await secondChance(n, sc, t);
    if (!alive(t)) return false;
    text = newText;
    v = { text, ...check(text, sc, { isWord }) };
    G.verdicts[n] = { ...v, final: true }; saveVerdicts();
    setReasons(v);
    document.getElementById('stampSlot').innerHTML = '';
    document.getElementById('scAfter').innerHTML = '';
    await typeSentence(text, t); if (!alive(t)) return false;
  }

  const name = G.pub.assign?.[n]?.name || '';
  const fish = (result === 'correct' || result === 'overridden') && (v.fish || (v.phrases || []).length > 0);
  await db.update(paths.pub, { [`revealed/${n}`]: { status: result, sentence: text, name, fish: !!fish } });
  G.pub.revealed = { ...(G.pub.revealed || {}), [n]: { status: result, sentence: text, name, fish: !!fish } };
  renderRail(n);
  const after = document.getElementById('scAfter');
  if (result === 'unresolved') {
    document.getElementById('stampSlot').innerHTML = failStampHTML(CLASSIFIED);
    after.innerHTML = `<div class="bridge">${rich(sc.bridge, sc.glossary)}${vi(sc.bridgeVi)}</div>`;
    await setPub({ state: 'revealing' });
    keyHandlers = { g: () => {}, x: () => overturnLast(n, t), h: () => {} };
    await advanceWait(t, 3500);
    return alive(t);
  }
  if (result === 'overridden') after.innerHTML = ''; // drop the fail line and the Beg / Fate buttons
  stamp(true); sfx.tada();
  if (result === 'overridden') toast('X · Xin lỗi! Chó accepts the sentence.');
  if (fish) { addFish(1); after.innerHTML = '<div class="vocab-bonus">🐟 Vocab bonus!</div>'; }
  await wait(900);
  after.insertAdjacentHTML('beforeend', `<div class="cho-react"><img src="${assetUrl('assets/cho.png')}" alt=""><div class="bubble">${rich(sc.reaction, sc.glossary)}${vi(sc.reactionVi)}</div></div>`);
  await setPub({ state: 'revealing' });
  keyHandlers = { g: () => doGotcha(n, t), x: () => {}, h: () => showHint(sc) };
  await wait(3200); if (!alive(t)) return false;
  after.insertAdjacentHTML('beforeend', `<div class="bridge">${rich(sc.bridge, sc.glossary)}${vi(sc.bridgeVi)}</div>`);
  await advanceWait(t, 3000);
  return alive(t);
}

/** Auto-advance with a progress ring. Space = pause, Space again = next. */
async function advanceWait(t, ms) {
  const after = document.getElementById('scAfter');
  const ring = document.createElement('div');
  ring.className = 'adv';
  ring.innerHTML = `<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="16" class="bg"/><circle cx="20" cy="20" r="16" class="fg" style="animation-duration:${ms}ms"/></svg><span>next</span>`;
  after?.appendChild(ring);
  await new Promise((res) => {
    let paused = G.settings.pauseEvery;
    let timer = null;
    const go = () => { clearTimeout(timer); keyHandlers.space = null; res(); };
    const pause = () => { paused = true; clearTimeout(timer); ring.classList.add('paused'); ring.querySelector('span').textContent = 'paused · Space = next'; keyHandlers.space = go; };
    ring.onclick = () => (paused ? go() : pause());
    if (paused) pause(); else { timer = setTimeout(go, ms * SPEED); keyHandlers.space = pause; }
    const check = setInterval(() => { if (!alive(t)) { clearInterval(check); go(); } }, 200);
  });
}

async function doGotcha(n, t) {
  // G: the current scene (if stamped) or the last stamped scene becomes UNRESOLVED.
  const target = G.pub.revealed?.[n] ? n : n - 1;
  if (target < 1) return;
  sfx.stampHit();
  toast(`G · Gotcha! Clue #${target} is not so perfect...`);
  void t;
  await db.update(paths.pub, { [`revealed/${target}`]: null });
  delete G.pub.revealed?.[target];
  runReveal(target, { gotcha: true });
}

async function overturnLast(n, t) {
  // X after "Accept our fate": accept the sentence after all.
  await db.update(paths.pub, { [`revealed/${n}/status`]: 'overridden' });
  G.pub.revealed[n].status = 'overridden';
  setGloom(false);
  renderRail(n);
  document.getElementById('stampSlot').innerHTML = `<div class="stamp ok">CLUE FOUND!</div>`;
  toast('X · Xin lỗi! The clue is back.');
  void t;
}

let hintLevel = {};
function showHint(sc) {
  const lvl = Math.min(3, (hintLevel[sc.n] || 0) + 1);
  hintLevel[sc.n] = lvl;
  let box = document.getElementById('hintBox');
  if (!box) { box = document.createElement('div'); box.id = 'hintBox'; box.className = 'hint-box'; document.getElementById('sceneStage')?.appendChild(box); }
  box.innerHTML = `<div class="h-title">💡 Hint ${lvl}/3</div>${sc.hints.slice(0, lvl).map((h) => `<div>${esc(h)}</div>`).join('')}<button class="mini-btn" id="sendHint">📱 Send to phone</button>`;
  box.querySelector('#sendHint').onclick = async () => { await db.update(paths.pub, { [`hints/${sc.n}`]: lvl }); toast('Hint sent to the phone.'); };
}

async function secondChance(n, sc, t) {
  await setPub({ state: 'fixing', fix: { scene: String(n), mode: 'student', since: db.now() } });
  setGloom(false);
  document.getElementById('stampSlot').innerHTML = '';
  const after = document.getElementById('scAfter');
  const since = G.pub.fix.since;
  const prevSub = G.subs[n]?.submittedAt || 0;
  return new Promise((resolve) => {
    const draw = () => {
      const mode = G.pub.fix?.mode;
      after.innerHTML = `<div class="fix-box"><div class="fix-title">🥺 Second chance! Find the mistake together.</div>
        <div class="fix-tabs"><button class="${mode === 'student' ? 'on' : ''}" data-m="student">📱 ${esc(G.pub.assign?.[n]?.name || 'Student')}'s phone</button><button class="${mode === 'teacher' ? 'on' : ''}" data-m="teacher">⌨️ Teacher types</button><button data-h="1">💡 Hint (H)</button></div>
        ${mode === 'teacher' ? '<div class="fix-input"><input id="fixText" autocomplete="off" autocorrect="off" spellcheck="false" placeholder="Type the class\'s sentence..."><button class="mid-btn" id="fixGo">Check 🔍</button></div>' : '<div class="fix-wait">Waiting for the phone... <span class="dots"><i>.</i><i>.</i><i>.</i></span></div>'}</div>`;
      after.querySelectorAll('[data-m]').forEach((b) => b.onclick = async () => { await db.update(paths.pub, { 'fix/mode': b.dataset.m }); G.pub.fix.mode = b.dataset.m; draw(); });
      after.querySelector('[data-h]').onclick = () => showHint(sc);
      const inp = after.querySelector('#fixText');
      if (inp) {
        inp.value = document.getElementById('repText')?.textContent || '';
        inp.focus();
        const go = () => { const v = inp.value.trim(); if (v) done(v); };
        after.querySelector('#fixGo').onclick = go;
        inp.onkeydown = (e) => { if (e.key === 'Enter') go(); };
      }
    };
    const done = (text) => { fixWatch = null; keyHandlers.r = null; resolve(text); };
    fixWatch = () => {
      const s = G.subs[n];
      if (G.pub.fix?.mode === 'student' && s?.text && s.submittedAt && s.submittedAt > Math.max(prevSub, since - 1)) done(s.text.trim());
    };
    keyHandlers = {
      ...keyHandlers,
      r: async () => { const m = G.pub.fix.mode === 'student' ? 'teacher' : 'student'; await db.update(paths.pub, { 'fix/mode': m }); G.pub.fix.mode = m; draw(); },
      h: () => showHint(sc), space: () => {},
    };
    draw();
    void t;
  });
}

// ------------------------------------------------------------------ after scene 15
function renderBoardEnd() {
  flowToken++;
  const solved = SCENES.filter((s) => ['correct', 'overridden', 'restored'].includes(statusOf(s.n))).length;
  $stage.innerHTML = `${topbar('<span class="state-tag">All clues are on the board</span>')}
  <main class="board-end">
    <div class="board-grid big">${SCENES.map((s) => panelHTML(s.n, { small: true })).join('')}</div>
    <div class="be-ctrl">
      <div class="be-stat">Clues found: <b>${solved}</b>/15 · 🐟 ${G.fish}</div>
      <div class="be-q">Quiz questions <button data-q="-1">−</button><b>${G.settings.quizCount}</b><button data-q="1">+</button></div>
      <button class="big-btn alt" id="quizBtn">Lie Detector Test 🕵️</button>
      <button class="big-btn pulse" id="voteBtn">🎬 Unmask the truth: who is the cheater?!</button>
    </div>
  </main>`;
  bindChrome();
  $stage.querySelectorAll('[data-q]').forEach((b) => b.onclick = () => { G.settings.quizCount = Math.max(5, Math.min(10, G.settings.quizCount + Number(b.dataset.q))); saveVerdicts(); renderBoardEnd(); });
  $stage.querySelectorAll('.board-grid .panel[data-n]').forEach((el) => el.onclick = () => jumpTo(Number(el.dataset.n)));
  $stage.querySelector('#quizBtn').onclick = startQuiz;
  $stage.querySelector('#voteBtn').onclick = startVoting;
  keyHandlers = {};
}

// ------------------------------------------------------------------ QUIZ: Chó's Lie Detector Test
async function startQuiz() {
  const picks = pickQuiz(QUIZ, G.settings.quizCount);
  await db.remove(paths.answers);
  await db.update(paths.hostData, { quizPicks: picks });
  G.quizPicks = picks;
  await setPub({ state: 'quiz', quiz: { i: -1, total: picks.length, results: {} } });
  renderQuizIntro();
}

function renderQuizIntro() {
  flowToken++;
  $stage.innerHTML = `${topbar('<span class="state-tag">Chó\'s Lie Detector Test</span>')}
  <main class="quiz-intro"><img src="${assetUrl('assets/cho.png')}" alt=""><h1>🕵️ Chó's Lie Detector Test</h1>
  <p class="big-p">${G.pub.quiz?.total || 8} questions · 20 seconds each · 60% correct = one lost clue comes back!</p>
  <button class="big-btn" id="qGo">Start ▶</button></main>`;
  bindChrome();
  const go = async () => {
    if (!G.quizPicks) G.quizPicks = (await db.get(paths.hostData))?.quizPicks || pickQuiz(QUIZ, G.settings.quizCount);
    nextQuestion((G.pub.quiz?.i ?? -1) + 1);
  };
  $stage.querySelector('#qGo').onclick = go;
  keyHandlers = { space: go };
}

async function nextQuestion(i) {
  const total = G.quizPicks.length;
  if (i >= total) return quizScore();
  const qi = G.quizPicks[i];
  const q = QUIZ[qi];
  const endsAt = db.now() + 20000;
  await setPub({ quiz: { ...G.pub.quiz, i, qi, endsAt, phase: 'ask', startedAt: db.now() } });
  const t = ++flowToken;
  $stage.innerHTML = `${topbar(`<span class="state-tag">Lie Detector · ${i + 1}/${total}</span>`)}
  <main class="quiz">
    <div class="q-type">${{ prep: 'Pick the right word', pick: 'Pick the correct sentence', fix: 'Fix the mistake', form: 'Pick the right form', passive: 'Passive power' }[q.type]}</div>
    <div class="q-text">${esc(q.q)}</div>
    <div class="q-opts">${q.o.map((o, k) => `<div class="q-opt" data-k="${k}"><span class="q-l">${'ABC'[k]}</span>${esc(o)}</div>`).join('')}</div>
    <div class="q-foot"><div class="q-timer" id="qTimer">20</div><div id="qCount">0 answers</div><button class="mid-btn" id="qEnd">Show answer</button></div>
    <div class="q-result" id="qResult"></div>
  </main>`;
  bindChrome();
  let finished = false;
  const finish = async () => {
    if (finished || !alive(t)) return; finished = true;
    clearInterval(tick); quizWatch = null;
    const ans = G.answers[i] || {};
    const players = playerList();
    const correct = Object.values(ans).filter((a) => a.choice === q.a);
    const pct = players.length ? Math.round((correct.length / players.length) * 100) : 0;
    const pass = pct >= 60;
    // fast + correct = fish
    const fast = Object.entries(ans).filter(([, a]) => a.choice === q.a && a.at - G.pub.quiz.startedAt < 7000);
    for (const [uid] of fast) { const f = (G.players[uid]?.fish || 0) + 1; db.update(`${paths.players}/${uid}`, { fish: f }); }
    if (fast.length) addFish(fast.length);
    let extra = '';
    if (pass) {
      const lost = SCENES.find((s) => statusOf(s.n) === 'unresolved');
      if (lost) {
        await db.update(paths.pub, { [`revealed/${lost.n}/status`]: 'restored' });
        G.pub.revealed[lost.n].status = 'restored';
        extra = `🔓 Clue #${lost.n} is back: “${esc(lost.prompt)}”`;
      } else extra = esc(BONUS_TIPS[i % BONUS_TIPS.length]);
    }
    const results = { ...(G.pub.quiz.results || {}), [i]: { pct, pass } };
    await setPub({ quiz: { ...G.pub.quiz, phase: 'result', results } });
    $stage.querySelectorAll('.q-opt').forEach((el) => el.classList.add(Number(el.dataset.k) === q.a ? 'right' : 'dim'));
    document.getElementById('qResult').innerHTML = `<div class="acc-bar"><div class="acc-fill ${pass ? 'pass' : 'fail'}" style="width:${pct}%"></div><div class="acc-60"></div><span>${pct}% correct</span></div>
      <div class="q-react">${esc(pick(pass ? QUIZ_REACTIONS.pass : QUIZ_REACTIONS.fail))}</div>${extra ? `<div class="q-extra">${extra}</div>` : ''}
      ${fast.length ? `<div class="q-fish">🐟 x${fast.length} for fast detectives!</div>` : ''}
      <button class="big-btn" id="qNext">${i + 1 < total ? 'Next question ▶' : 'Lie Detector score ▶'}</button>`;
    (pass ? sfx.tada : sfx.sad)();
    document.getElementById('qNext').onclick = () => nextQuestion(i + 1);
    keyHandlers = { space: () => nextQuestion(i + 1) };
  };
  $stage.querySelector('#qEnd').onclick = finish;
  keyHandlers = { space: finish };
  quizWatch = () => {
    const n = Object.keys(G.answers[i] || {}).length;
    const c = document.getElementById('qCount'); if (c) c.textContent = `${n}/${playerList().length} answers`;
    if (n >= playerList().length && n > 0) finish();
  };
  quizWatch();
  const tick = setInterval(() => {
    if (!alive(t)) return clearInterval(tick);
    const left = endsAt - db.now();
    const el = document.getElementById('qTimer');
    if (el) { el.textContent = Math.max(0, Math.ceil(left / 1000)); el.classList.toggle('red', left < 6000); }
    if (left <= 0) finish();
  }, 200);
}

async function quizScore() {
  const res = G.pub.quiz?.results || {};
  const passed = Object.values(res).filter((r) => r.pass).length;
  const total = G.quizPicks.length;
  await setPub({ quiz: { ...G.pub.quiz, phase: 'done', score: `${passed}/${total}` } });
  $stage.innerHTML = `${topbar('<span class="state-tag">Lie Detector score</span>')}
  <main class="quiz-intro"><img src="${assetUrl('assets/cho.png')}" alt=""><h1>Lie Detector score: ${passed}/${total}</h1>
  <p class="big-p">${passed >= total * 0.6 ? 'Chó: "Excellent! Now you are ready."' : 'Chó: "Hmm. Be careful with your vote."'}</p>
  <button class="big-btn pulse" id="voteBtn">🎬 Unmask the truth: who is the cheater?!</button></main>`;
  bindChrome();
  $stage.querySelector('#voteBtn').onclick = startVoting;
  keyHandlers = { space: startVoting };
}

// ------------------------------------------------------------------ VOTE
async function startVoting() {
  await db.remove(paths.votes);
  G.votes = {};
  await setPub({ state: 'voting', tally: null, outcome: null });
  renderVoting();
}

function renderVoting() {
  flowToken++;
  $stage.innerHTML = `${topbar('<span class="state-tag">The vote</span>')}
  <main class="voting"><h1>Who is the cheater?!</h1>
    <div class="suspects">${SUSPECTS.map((s) => `<div class="suspect"><img src="${assetUrl(s.img)}" alt=""><div class="s-name">${esc(s.name)}</div><div class="s-line">${esc(s.line)}</div></div>`).join('')}</div>
    <div class="vote-foot"><div class="votes-in" id="votesIn"></div><button class="big-btn" id="revealBtn">🥁 Reveal</button></div>
  </main>`;
  bindChrome();
  $stage.querySelector('#revealBtn').onclick = revealVotes;
  keyHandlers = { space: revealVotes };
  updateVoting();
}
function updateVoting() {
  const el = document.getElementById('votesIn');
  if (el) el.innerHTML = `votes in: <b>${Object.keys(G.votes).length}</b>/${playerList().length}`;
}

async function revealVotes() {
  const tally = Object.fromEntries(SUSPECTS.map((s) => [s.id, 0]));
  for (const v of Object.values(G.votes)) if (tally[v] !== undefined) tally[v]++;
  const cast = Object.values(tally).reduce((a, b) => a + b, 0);
  const outcome = cast > 0 && tally[CHEATER] > cast / 2 ? 'win' : 'lose';
  await setPub({ state: 'revealed', tally, outcome });
  runEnding();
}

// ------------------------------------------------------------------ ENDINGS
async function runEnding() {
  const t = ++flowToken;
  const tally = G.pub.tally || {};
  const cast = Object.values(tally).reduce((a, b) => a + b, 0) || 1;
  $stage.innerHTML = `${topbar('<span class="state-tag">The truth</span>')}<main class="ending" id="ending">
    <h1>The votes...</h1><div class="tally">${SUSPECTS.map((s) => `<div class="t-row"><img src="${assetUrl(s.img)}" alt=""><span class="t-name">${esc(s.name)}</span><div class="t-bar"><div class="t-fill" data-w="${Math.round((tally[s.id] || 0) / cast * 100)}"></div></div><b>${tally[s.id] || 0}</b></div>`).join('')}</div></main>`;
  bindChrome();
  sfx.drumroll(2);
  await wait(400);
  $stage.querySelectorAll('.t-fill').forEach((f) => { f.style.width = f.dataset.w + '%'; });
  await wait(2600); if (!alive(t)) return;
  if (G.pub.outcome === 'win') await winSequence(t); else await loseSequence(t);
}

function stepWait(t) {
  return new Promise((res) => {
    const btn = document.getElementById('nextStep');
    const go = () => { keyHandlers.space = null; res(); };
    if (btn) btn.onclick = go;
    keyHandlers = { space: go };
    const c = setInterval(() => { if (!alive(t)) { clearInterval(c); res(); } }, 300);
  });
}

async function typeLines(el, lines, t, { gavel = false, echo = false } = {}) {
  for (const line of lines) {
    if (!alive(t)) return;
    const div = document.createElement('div');
    div.className = 'e-line';
    el.appendChild(div);
    const txt = plain(line);
    for (let i = 0; i < txt.length && alive(t); i += 2) { div.textContent = txt.slice(0, i + 2); await new Promise((r) => setTimeout(r, 22 * SPEED)); }
    div.innerHTML = rich(line);
    if (gavel) { sfx.gavel(); div.classList.add('bang'); }
    if (echo) { const e = document.createElement('div'); e.className = 'echo'; e.textContent = '🦩 ♪ ' + txt.toUpperCase() + ' ♪'; el.appendChild(e); }
    await wait(900);
  }
}

function confetti() {
  const box = document.createElement('div');
  box.className = 'confetti';
  for (let i = 0; i < 120; i++) {
    const p = document.createElement('i');
    p.style.left = Math.random() * 100 + '%';
    p.style.background = pick(['#f0a24b', '#e57fa8', '#2e9e5b', '#4a7bd9', '#ffd84d']);
    p.style.animationDelay = Math.random() * 1.5 + 's';
    p.style.animationDuration = 2.5 + Math.random() * 2 + 's';
    box.appendChild(p);
  }
  $stage.appendChild(box);
  setTimeout(() => box.remove(), 6000);
}

async function winSequence(t) {
  const main = document.getElementById('ending');
  confetti(); sfx.tada();
  main.innerHTML = `<div class="win-banner">${esc(WIN.banner)}</div>
    <div class="court"><img class="court-img" src="${assetUrl('assets/scenes/court.svg')}" alt="Court"><div class="court-text" id="courtText"></div></div>
    <button class="mid-btn next-step" id="nextStep">Next ▶ (Space)</button>`;
  const ct = document.getElementById('courtText');
  ct.innerHTML = `<div class="e-intro">${rich(WIN.court)}</div>`;
  await stepWait(t); if (!alive(t)) return;
  ct.innerHTML = `<div class="e-head">${esc(WIN.apologyIntro)}</div>`;
  await typeLines(ct, WIN.apologies, t);
  ct.insertAdjacentHTML('beforeend', `<div class="muted">${esc(WIN.echo)}</div>`);
  await stepWait(t); if (!alive(t)) return;
  ct.innerHTML = `<div class="e-head">${esc(WIN.sentenceIntro)}</div>`;
  const pun = [...WIN.punishments].sort(() => Math.random() - 0.5).slice(0, 3);
  await typeLines(ct, pun, t, { gavel: true });
  await stepWait(t); if (!alive(t)) return;
  ct.innerHTML = `<div class="e-head">${esc(WIN.peaceIntro)}</div>`;
  await typeLines(ct, WIN.peace, t);
  await stepWait(t); if (!alive(t)) return;
  ct.innerHTML = `<div class="e-head">${esc(WIN.epilogueIntro)}</div>`;
  await typeLines(ct, WIN.epilogue, t);
  ct.insertAdjacentHTML('beforeend', '<button class="mini-btn" id="chal">🗣️ Class challenge</button>');
  document.getElementById('chal').onclick = () => {
    ct.innerHTML = `<div class="e-head">${esc(WIN.challengeTitle)}</div>${WIN.challenge.map((c) => `<div class="e-line">${esc(c)}</div>`).join('')}`;
  };
  await stepWait(t); if (!alive(t)) return;
  recap();
}

async function loseSequence(t) {
  const main = document.getElementById('ending');
  sfx.sad();
  main.innerHTML = `<div class="lose-banner">${esc(LOSE.banner)}</div>
    <div class="court"><img class="court-img" src="${assetUrl('assets/scenes/lose.svg')}" alt="Nam escapes"><div class="court-text" id="courtText"></div></div>
    <button class="mid-btn next-step" id="nextStep">Next ▶ (Space)</button>`;
  const ct = document.getElementById('courtText');
  await typeLines(ct, LOSE.lines, t);
  ct.insertAdjacentHTML('beforeend', `<div class="e-last">${esc(LOSE.last)}</div>`);
  await stepWait(t); if (!alive(t)) return;
  recap();
}

function recap() {
  keyHandlers = {};
  const solved = SCENES.filter((s) => ['correct', 'overridden', 'restored'].includes(statusOf(s.n))).length;
  const score = G.pub.quiz?.score || '—';
  $stage.innerHTML = `${topbar('<span class="state-tag">Case file: closed</span>')}
  <main class="recap"><h1>${G.pub.outcome === 'win' ? '🏆 CASE SOLVED' : '🪦 CASE LOST'}</h1>
    <div class="recap-cols"><div class="recap-story"><h2>The true story</h2>${RECAP.map((l) => `<p>${rich(l)}</p>`).join('')}</div>
    <div class="recap-stats"><div>🗂️ Clues found <b>${solved}/15</b></div><div>🐟 Fish <b>${G.fish}</b></div><div>🕵️ Lie Detector <b>${score}</b></div>
    <button class="big-btn" id="replay">🔁 Replay the case</button></div></div></main>`;
  bindChrome();
  $stage.querySelector('#replay').onclick = replay;
}

async function replay() {
  flowToken++;
  clearInterval(writeTimer); clearInterval(msgTimer);
  fixWatch = null; quizWatch = null; keyHandlers = {};
  if (skipFn) skipFn();
  document.querySelector('.overlay')?.remove(); overlay = null;
  setGloom(false);
  await Promise.all([db.remove(paths.subs), db.remove(paths.votes), db.remove(paths.answers), db.set(paths.hostData, { settings: G.settings })]);
  G.verdicts = {}; G.fish = 0; G.subs = {}; G.votes = {}; G.answers = {}; hintLevel = {};
  await db.set(paths.pub, { ...freshPub(), writeSecs: G.settings.writeSecs });
  G.pub = { ...freshPub() };
  renderLobby();
}

// expose for tests / debugging
window.__host = { G, SCENE_BY_N, get code() { return code; }, get state() { return G.pub.state; }, finishWriting, startVoting, revealVotes };
void ACTS;
