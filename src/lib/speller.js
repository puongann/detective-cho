// Browser spelling dictionary (en-US + en-GB, bundled locally; loaded on the big screen only).
import nspell from 'nspell';
import enAff from '../dict/en.aff?raw';
import enDic from '../dict/en.dic?raw';
import gbAff from '../dict/en-gb.aff?raw';
import gbDic from '../dict/en-gb.dic?raw';

let spell = null;
export function getIsWord() {
  if (!spell) {
    const us = nspell(enAff, enDic);
    const gb = nspell(gbAff, gbDic);
    spell = (w) => us.correct(w) || gb.correct(w);
  }
  return spell;
}
