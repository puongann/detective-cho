// Full demo run on the big screen: 15 fake students, reveal with mistakes, second chances,
// G / X keys, Lie Detector Test, vote, WIN or LOSE ending, recap.
import { test, expect } from '@playwright/test';

const state = (page) => page.evaluate(() => window.__host.state);

async function playDemo(page, outcome) {
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(`/host/?demo=1&fast=1&outcome=${outcome}&mistakes=0.45`);
  await page.waitForFunction(() => Object.keys(window.__host.G.players).length >= 14);
  await page.click('#startBtn');
  await expect(page.locator('.joke').first()).toBeVisible(); // seat 13 was free -> auto-assigned
  await page.click('#goWrite');
  await page.waitForFunction(() => window.__host.state === 'written', null, { timeout: 60000 });
  await page.click('#openFiles');

  const done = { studentFix: 0, teacherFix: 0, override: 0, fate: 0, gotcha: 0 };
  const deadline = Date.now() + 240000;
  while (Date.now() < deadline) {
    const st = await state(page);
    if (st === 'board') break;
    if (!done.gotcha && st === 'revealing' && await page.evaluate(() => window.__host.G.pub.revealed?.[window.__host.G.pub.currentScene]?.status === 'correct')) {
      await page.keyboard.press('g'); done.gotcha++;
      await page.waitForFunction(() => window.__host.state === 'paused', null, { timeout: 20000 });
      continue;
    }
    if (st === 'paused' && await page.locator('#beg').isVisible()) {
      if (!done.studentFix) { await page.click('#beg'); done.studentFix++; }
      else if (!done.teacherFix) {
        await page.click('#beg');
        await page.click('[data-m=teacher]');
        const model = await page.evaluate(() => window.__host.SCENE_BY_N[window.__host.G.pub.currentScene].modelAnswers[0]);
        await page.fill('#fixText', model);
        await page.click('#fixGo');
        done.teacherFix++;
      } else if (!done.override) { await page.keyboard.press('x'); done.override++; }
      else { await page.click('#fate'); done.fate++; }
      await page.waitForTimeout(300);
    }
    await page.waitForTimeout(150);
    if (Math.random() < 0.05) console.log('…', st, await page.evaluate(() => window.__host.G.pub.currentScene), done);
  }
  expect(await state(page)).toBe('board');
  const statuses = await page.evaluate(() => Object.values(window.__host.G.pub.revealed).map((r) => r.status));
  expect(statuses.length).toBe(15);
  console.log(`[${outcome}] reveal`, done, statuses.join(','));

  // Lie Detector Test
  await page.click('#quizBtn');
  await page.click('#qGo');
  for (let i = 0; i < 12; i++) {
    const next = page.locator('#qNext');
    await next.waitFor({ timeout: 40000 });
    const label = await next.textContent();
    await next.click();
    if (/score/.test(label)) break;
  }
  await expect(page.locator('h1')).toContainText('Lie Detector score');
  const quiz = await page.evaluate(() => window.__host.G.pub.quiz);
  console.log(`[${outcome}] quiz score`, quiz.score, 'restored:', await page.evaluate(() => Object.values(window.__host.G.pub.revealed).filter((r) => r.status === 'restored').length));

  // Vote
  await page.click('#voteBtn');
  await page.waitForFunction(() => Object.keys(window.__host.G.votes).length >= 14, null, { timeout: 30000 });
  await page.click('#revealBtn');
  await page.waitForFunction(() => window.__host.state === 'revealed');
  expect(await page.evaluate(() => window.__host.G.pub.outcome)).toBe(outcome);
  for (let i = 0; i < 40 && !(await page.locator('#replay').isVisible()); i++) {
    await page.keyboard.press('Space');
    await page.waitForTimeout(700);
  }
  await expect(page.locator('#replay')).toBeVisible();
  await expect(page.locator('.recap h1')).toContainText(outcome === 'win' ? 'CASE SOLVED' : 'CASE LOST');
  await page.screenshot({ path: `test-results/${outcome}-recap.png` });
  await page.click('#replay');
  await page.waitForFunction(() => window.__host.state === 'lobby');
  expect(errors).toEqual([]);
}

test('demo: WIN run', async ({ page }) => { await playDemo(page, 'win'); });
test('demo: LOSE run', async ({ page }) => { await playDemo(page, 'lose'); });
