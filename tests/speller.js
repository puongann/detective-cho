import fs from 'node:fs';
import nspell from 'nspell';
const d = (f) => fs.readFileSync(new URL('../src/dict/' + f, import.meta.url), 'utf8');
const us = nspell(d('en.aff'), d('en.dic'));
const gb = nspell(d('en-gb.aff'), d('en-gb.dic'));
export const isWord = (w) => us.correct(w) || gb.correct(w);
