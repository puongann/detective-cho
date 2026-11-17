import test from 'node:test';
import assert from 'node:assert/strict';
import { rich } from '../src/lib/text.js';
import { SCENES } from '../src/data/scenes.js';
import * as STORY from '../src/data/story.js';

const visible = (html) => html.replace(/<[^>]*>/g, '');

test('overlapping glossary terms make one chip ("banana peel", not "peel" inside it)', () => {
  const g = [{ en: 'peel', vi: 'vỏ' }, { en: 'banana peel', vi: 'vỏ chuối' }];
  const out = rich('Chó finds a banana peel. Fresh.', g);
  assert.equal((out.match(/<button/g) || []).length, 1);
  assert.match(out, /data-en="banana peel"/);
  assert.equal(visible(out), 'Chó finds a banana peel. Fresh.');
});

test('no chip HTML ever leaks into the visible text of any scene or ending', () => {
  const texts = [];
  for (const s of SCENES) for (const f of ['prompt', 'intro', 'reaction', 'bridge', 'failLine', 'previously']) if (s[f]) texts.push([`scene ${s.n} ${f}`, s[f], s.glossary]);
  for (const [k, v] of Object.entries(STORY.WIN)) (Array.isArray(v) ? v : [v]).forEach((t, i) => typeof t === 'string' && texts.push([`WIN.${k}[${i}]`, t, []]));
  for (const [where, t, g] of texts) {
    const out = rich(t, g);
    const vis = visible(out);
    assert.ok(!/data-(en|vi|phrase)=|class="chip/.test(vis), `${where}: chip markup leaked: ${vis}`);
    assert.equal((out.match(/<button/g) || []).length, (out.match(/<\/button>/g) || []).length, where);
  }
});
