// ⚙️ Story editor (teacher settings). Lobby only. Edits are saved on this computer and sent to phones with the room.
import { SCENES, STORY_TITLE } from '../data/scenes.js';
import { VOCAB } from '../data/vocab.js';
import { FIELDS, toText, fromText, sceneDiff, validateScene, originalScene, originalTitle, isEmpty } from '../lib/story-edit.js';
import { check } from '../lib/checker.js';
import { esc } from '../lib/text.js';
import { assetUrl } from '../lib/assets.js';
import { makeLevelChecker } from '../lib/level-check.js';
import WORDS from '../../scripts/a1a2-words.txt?raw';

const BUILT_IN_PICS = [
  ...Array.from({ length: 15 }, (_, i) => `assets/scenes/scene-${String(i + 1).padStart(2, '0')}.svg`),
  'assets/scenes/court.svg', 'assets/scenes/lose.svg',
];

/**
 * @param {{ root: HTMLElement, isWord: () => Function, onSave: (ov) => Promise<void>|void, onClose: () => void, toast: (msg: string) => void }} o
 */
export function openEditor({ root, isWord, onSave, onClose, toast }) {
  // texts[n] = full editable text of every field, starting from the story as it is now (built-in + saved edits)
  const fromScenes = () => Object.fromEntries(SCENES.map((s) => [s.n, Object.fromEntries(FIELDS.map(([k]) => [k, toText(k, s[k])]))]));
  let texts = fromScenes();
  let title = STORY_TITLE;
  let cur = 1;
  let dirty = false;
  let armedResetAll = false;

  const el = document.createElement('div');
  el.className = 'overlay editor-ov';
  el.innerHTML = `<div class="overlay-card editor">
    <h2>✏️ Story editor</h2>
    <div class="ed-top">
      <label class="ed-title">Case title <input id="edTitle" maxlength="60"></label>
      <span class="ed-note">Saved on this computer. Phones get the story when they join.</span>
    </div>
    <div class="ed-body">
      <nav class="ed-list" id="edList"></nav>
      <section class="ed-form" id="edForm"></section>
      <aside class="ed-side">
        <div class="ed-pic"><img id="edPic" alt=""></div>
        <div class="ed-box">
          <div class="ed-h">🧪 Test a student sentence</div>
          <div class="ed-test"><input id="edTry" placeholder="The ring was given to Panda." autocomplete="off" spellcheck="false"><button class="mini-btn" id="edTryBtn">Test</button></div>
          <div id="edTryOut" class="ed-out"></div>
        </div>
        <div class="ed-box">
          <div class="ed-h">📏 Level check (A1-A2)</div>
          <button class="mini-btn" id="edLevel">Check this scene</button>
          <div id="edLevelOut" class="ed-out"></div>
        </div>
      </aside>
    </div>
    <div class="ed-foot">
      <button class="mid-btn" id="edSave">💾 Save</button>
      <button class="mini-btn" id="edResetOne">↩️ Reset this scene</button>
      <button class="mini-btn" id="edResetAll">🧨 Reset whole story</button>
      <span class="ed-gap"></span>
      <button class="mini-btn" id="edExport">⬇️ Export file</button>
      <label class="mini-btn ed-file">⬆️ Import file<input type="file" id="edImport" accept=".json,application/json" hidden></label>
      <span class="ed-dirty" id="edDirty"></span>
    </div>
    <button class="close-x" aria-label="Close">✕</button>
  </div>`;
  root.appendChild(el);
  const $ = (id) => el.querySelector('#' + id);

  const sceneFromTexts = (n) => {
    const s = { ...JSON.parse(JSON.stringify(originalScene(n))) };
    for (const [k] of FIELDS) s[k] = fromText(k, texts[n][k]);
    return s;
  };
  const isEdited = (n) => Object.keys(sceneDiff(n, texts[n])).length > 0;
  const markDirty = () => { dirty = true; $('edDirty').textContent = '● not saved yet'; };

  function drawList() {
    $('edList').innerHTML = SCENES.map((s) => `<button class="ed-item ${s.n === cur ? 'on' : ''}" data-n="${s.n}"><b>${s.n}</b><span>${esc(texts[s.n].title || '(no title)')}</span>${isEdited(s.n) ? '<i title="edited">✎</i>' : ''}</button>`).join('');
    $('edList').querySelectorAll('[data-n]').forEach((b) => b.onclick = () => { cur = Number(b.dataset.n); drawList(); drawForm(); });
  }

  function fieldHTML([k, label, kind, help]) {
    const v = esc(texts[cur][k]);
    let input;
    if (kind === 'area') input = `<textarea data-k="${k}" rows="3">${v}</textarea>`;
    else if (kind === 'lines') input = `<textarea data-k="${k}" rows="3">${v}</textarea>`;
    else if (kind === 'mode') input = `<select data-k="${k}"><option value="clue" ${v === 'clue' ? 'selected' : ''}>clue</option><option value="phrase" ${v === 'phrase' ? 'selected' : ''}>phrase</option></select>`;
    else if (kind === 'image') {
      input = `<div class="ed-img"><input data-k="${k}" value="${v.startsWith('data:') ? '' : v}" placeholder="${v.startsWith('data:') ? '(uploaded picture)' : 'assets/scenes/scene-01.svg or https://...'}">
        <select id="edPicPick"><option value="">Built-in pictures…</option>${BUILT_IN_PICS.map((p) => `<option value="${p}">${p.split('/').pop()}</option>`).join('')}</select>
        <label class="mini-btn ed-file">📷 Upload<input type="file" id="edUpload" accept="image/*" hidden></label></div>`;
    } else input = `<input data-k="${k}" value="${v}">`;
    const wide = kind === 'area' || kind === 'lines' || kind === 'image';
    return `<label class="ed-field ${wide ? 'wide' : ''}"><span class="ed-lbl">${esc(label)}</span>${input}${help ? `<small>${esc(help)}</small>` : ''}</label>`;
  }

  function drawForm() {
    const errs = validateScene(sceneFromTexts(cur));
    $('edForm').innerHTML = `<div class="ed-errs">${errs.map((e) => `<div>⚠️ ${esc(e)}</div>`).join('')}</div>
      <div class="ed-grid">${FIELDS.map(fieldHTML).join('')}</div>
      <details class="ed-ids"><summary>Phrase ids you can use</summary>${VOCAB.map((v) => `<code title="${esc(v.phrase)}">${esc(v.id)}</code>`).join(' ')}</details>`;
    $('edForm').querySelectorAll('[data-k]').forEach((inp) => {
      inp.addEventListener('input', () => {
        texts[cur][inp.dataset.k] = inp.value;
        markDirty();
        if (inp.dataset.k === 'title') drawList();
        if (inp.dataset.k === 'image') drawPic();
        refreshErrs();
      });
    });
    const pick = $('edPicPick');
    if (pick) pick.onchange = () => { if (!pick.value) return; setImage(pick.value); };
    const up = $('edUpload');
    if (up) up.onchange = async () => { const f = up.files[0]; if (!f) return; try { setImage(await shrinkImage(f)); toast('📷 Picture added'); } catch (e) { toast('😿 ' + e.message); } };
    drawPic();
    $('edTryOut').innerHTML = '';
    $('edLevelOut').innerHTML = '';
  }
  function refreshErrs() {
    const errs = validateScene(sceneFromTexts(cur));
    const box = $('edForm').querySelector('.ed-errs');
    if (box) box.innerHTML = errs.map((e) => `<div>⚠️ ${esc(e)}</div>`).join('');
  }
  function setImage(src) {
    texts[cur].image = src;
    markDirty();
    drawForm();
  }
  function drawPic() { $('edPic').src = assetUrl(texts[cur].image || ''); }

  function runTest() {
    const t = $('edTry').value.trim();
    if (!t) return;
    const r = check(t, sceneFromTexts(cur), { isWord: isWord() });
    $('edTryOut').innerHTML = r.ok
      ? `<div class="ok">✅ CLUE FOUND${r.fish ? ' + 🐟' : ''}</div>`
      : `<div class="bad">❌ Rejected</div>${r.reasons.map((x) => `<div>• ${esc(x)}</div>`).join('')}`;
  }
  $('edTryBtn').onclick = runTest;
  $('edTry').addEventListener('keydown', (e) => { if (e.key === 'Enter') runTest(); });

  $('edLevel').onclick = () => {
    const s = sceneFromTexts(cur);
    const { lintText, problems } = makeLevelChecker(WORDS);
    for (const f of ['title', 'prompt', 'intro', 'reaction', 'bridge', 'failLine', 'previously']) lintText(f, s[f], { glossary: s.glossary || [] });
    (s.hints || []).forEach((h, i) => lintText(`hint ${i + 1}`, h.replace(/^[^:]+:/, '').replace(/\([^)]*\)/g, ' '), { maxWords: 0, passive: false, glossary: s.glossary || [] }));
    $('edLevelOut').innerHTML = problems.length
      ? problems.map((p) => `<div>• ${esc(p)}</div>`).join('')
      : '<div class="ok">✔ All A1-A2, short sentences, no passive in the story text.</div>';
  };

  $('edTitle').value = title;
  $('edTitle').addEventListener('input', () => { title = $('edTitle').value; markDirty(); });

  function buildOverrides() {
    const ov = { scenes: {} };
    const t = title.trim();
    if (t && t !== originalTitle()) ov.title = t;
    for (const s of SCENES) { const d = sceneDiff(s.n, texts[s.n]); if (Object.keys(d).length) ov.scenes[`s${s.n}`] = d; }
    return ov;
  }

  $('edSave').onclick = async () => {
    const bad = SCENES.map((s) => [s.n, validateScene(sceneFromTexts(s.n))]).filter(([, e]) => e.length);
    if (bad.length) { cur = bad[0][0]; drawList(); drawForm(); toast(`⚠️ Scene ${cur} has a problem. Fix it first.`); return; }
    await onSave(buildOverrides());
    dirty = false; $('edDirty').textContent = '✔ saved';
    drawList();
    toast('💾 Story saved');
  };
  $('edResetOne').onclick = () => {
    const o = originalScene(cur);
    texts[cur] = Object.fromEntries(FIELDS.map(([k]) => [k, toText(k, o[k])]));
    markDirty(); drawList(); drawForm();
  };
  $('edResetAll').onclick = () => {
    if (!armedResetAll) { armedResetAll = true; $('edResetAll').textContent = '🧨 Click again to reset everything'; $('edResetAll').classList.add('armed'); return; }
    texts = Object.fromEntries(SCENES.map((s) => { const o = originalScene(s.n); return [s.n, Object.fromEntries(FIELDS.map(([k]) => [k, toText(k, o[k])]))]; }));
    title = originalTitle(); $('edTitle').value = title;
    armedResetAll = false; $('edResetAll').textContent = '🧨 Reset whole story'; $('edResetAll').classList.remove('armed');
    markDirty(); drawList(); drawForm();
  };
  $('edExport').onclick = () => {
    const blob = new Blob([JSON.stringify({ app: 'crime-scene-detective', version: 1, ...buildOverrides() }, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = 'detective-cho-story.json'; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  };
  $('edImport').onchange = async () => {
    const f = $('edImport').files[0]; if (!f) return;
    try {
      const ov = JSON.parse(await f.text());
      if (typeof ov !== 'object' || (ov.scenes && typeof ov.scenes !== 'object')) throw new Error('This is not a story file.');
      texts = Object.fromEntries(SCENES.map((s) => {
        const o = originalScene(s.n);
        const t = Object.fromEntries(FIELDS.map(([k]) => [k, toText(k, o[k])]));
        for (const [k, v] of Object.entries(ov.scenes?.[`s${s.n}`] || {})) if (k in t) t[k] = String(v);
        return [s.n, t];
      }));
      title = ov.title || originalTitle(); $('edTitle').value = title;
      markDirty(); drawList(); drawForm();
      toast('⬆️ Story loaded. Press Save to use it.');
    } catch (e) { toast('😿 ' + e.message); }
    $('edImport').value = '';
  };

  function close() {
    if (dirty && !confirm('Close without saving your changes?')) return;
    el.remove();
    onClose?.();
  }
  el.querySelector('.close-x').onclick = close;
  el.addEventListener('click', (e) => { if (e.target === el) close(); });

  drawList(); drawForm();
  return { close, get isOpen() { return el.isConnected; }, el };
}

/** Make an uploaded picture small enough to send to every phone (max 960px wide JPEG). */
function shrinkImage(file) {
  return new Promise((res, rej) => {
    if (!file.type.startsWith('image/')) return rej(new Error('Please choose a picture file.'));
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, 960 / img.width);
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * scale); c.height = Math.round(img.height * scale);
      const ctx = c.getContext('2d');
      ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height);
      ctx.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(img.src);
      const url = c.toDataURL('image/jpeg', 0.8);
      if (url.length > 400000) return rej(new Error('This picture is too big. Try a smaller one.'));
      res(url);
    };
    img.onerror = () => rej(new Error('Cannot read this picture.'));
    img.src = URL.createObjectURL(file);
  });
}

export { isEmpty };
