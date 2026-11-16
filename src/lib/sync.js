// Real-time sync. Two backends with the same tiny API:
//   - Firebase Realtime Database (classroom: phones + big screen)
//   - Local (BroadcastChannel + localStorage): demo mode / testing on ONE device, no Firebase needed
// API: { uid, mode, get(path), set(path,v), update(path,obj), remove(path), on(path, cb) -> off, onConnected(cb), now() }
import { FIREBASE_CONFIG } from '../firebase-config.js';

export function hasFirebase() {
  return !!(FIREBASE_CONFIG && FIREBASE_CONFIG.apiKey && FIREBASE_CONFIG.databaseURL);
}

export async function connect({ local = false } = {}) {
  if (local || !hasFirebase()) return createLocal();
  return createFirebase();
}

// ---------------------------------------------------------------- local
function split(path) { return path.split('/').filter(Boolean); }
function getIn(obj, parts) { let o = obj; for (const p of parts) { if (o == null || typeof o !== 'object') return null; o = o[p]; } return o === undefined ? null : o; }
function setIn(obj, parts, val) {
  if (!parts.length) return val ?? {};
  let o = obj;
  for (let i = 0; i < parts.length - 1; i++) { if (o[parts[i]] == null || typeof o[parts[i]] !== 'object') o[parts[i]] = {}; o = o[parts[i]]; }
  const last = parts[parts.length - 1];
  if (val === null || val === undefined) delete o[last]; else o[last] = val;
  return obj;
}
const clone = (v) => (v == null ? null : JSON.parse(JSON.stringify(v)));

function createLocal() {
  const KEY = 'csd-local-db';
  let tree = {};
  try { tree = JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { tree = {}; }
  let uid;
  try { uid = sessionStorage.getItem('csd-local-uid'); } catch { /* ignore */ }
  if (!uid) { uid = 'u' + Math.random().toString(36).slice(2, 10); try { sessionStorage.setItem('csd-local-uid', uid); } catch { /* ignore */ } }
  const ch = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('csd-local') : null;
  const listeners = new Set();
  let saveT = null;
  const save = () => { clearTimeout(saveT); saveT = setTimeout(() => { try { localStorage.setItem(KEY, JSON.stringify(tree)); } catch { /* full */ } }, 150); };
  const notify = (changed) => {
    for (const l of listeners) {
      if (changed.startsWith(l.path) || l.path.startsWith(changed)) l.fire();
    }
  };
  const apply = (op, path, val, broadcast = true) => {
    const parts = split(path);
    if (op === 'set') tree = setIn(tree, parts, clone(val));
    else if (op === 'update') for (const [k, v] of Object.entries(val)) tree = setIn(tree, [...parts, ...split(k)], clone(v));
    save();
    if (broadcast && ch) ch.postMessage({ op, path, val });
    notify('/' + parts.join('/'));
  };
  if (ch) ch.onmessage = (e) => apply(e.data.op, e.data.path, e.data.val, false);
  return {
    mode: 'local', uid,
    now: () => Date.now(),
    async get(path) { return clone(getIn(tree, split(path))); },
    async set(path, v) { apply('set', path, v); },
    async update(path, obj) { apply('update', path, obj); },
    async remove(path) { apply('set', path, null); },
    on(path, cb) {
      const norm = '/' + split(path).join('/');
      let last;
      const l = { path: norm, fire: () => { const v = getIn(tree, split(path)); const s = JSON.stringify(v ?? null); if (s !== last) { last = s; cb(clone(v)); } } };
      listeners.add(l);
      setTimeout(l.fire, 0);
      return () => listeners.delete(l);
    },
    onConnected(cb) { cb(true); return () => {}; },
    resetAll() { tree = {}; try { localStorage.removeItem(KEY); } catch { /* ignore */ } },
  };
}

// ---------------------------------------------------------------- firebase
async function createFirebase() {
  const [{ initializeApp }, db, auth] = await Promise.all([
    import('firebase/app'), import('firebase/database'), import('firebase/auth'),
  ]);
  const app = initializeApp(FIREBASE_CONFIG);
  const a = auth.getAuth(app);
  const cred = a.currentUser ? { user: a.currentUser } : await new Promise((res, rej) => {
    const off = auth.onAuthStateChanged(a, (u) => { if (u) { off(); res({ user: u }); } });
    auth.signInAnonymously(a).catch(rej);
  });
  const d = db.getDatabase(app);
  let offset = 0;
  db.onValue(db.ref(d, '.info/serverTimeOffset'), (s) => { offset = s.val() || 0; });
  const r = (p) => db.ref(d, p);
  return {
    mode: 'firebase', uid: cred.user.uid,
    now: () => Date.now() + offset,
    async get(path) { const s = await db.get(r(path)); return s.exists() ? s.val() : null; },
    set: (path, v) => db.set(r(path), v),
    update: (path, obj) => db.update(r(path), obj),
    remove: (path) => db.remove(r(path)),
    on(path, cb) { return db.onValue(r(path), (s) => cb(s.exists() ? s.val() : null), () => cb(null)); },
    onConnected(cb) { return db.onValue(r('.info/connected'), (s) => cb(!!s.val())); },
    onDisconnectRemove(path) { db.onDisconnect(r(path)).remove(); },
  };
}
