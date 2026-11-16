// Student phone in mobile emulation: join, write with the keyboard open, submit, vote.
// Host and phone share the LOCAL backend (same browser context, no Firebase needed).
import { test, expect } from '@playwright/test';

test('phone: join, write, keyboard-safe submit, reconnect', async ({ browser }, info) => {
  const { viewport, userAgent, deviceScaleFactor, isMobile, hasTouch, baseURL } = info.project.use;
  const ctx = await browser.newContext({ viewport, userAgent, deviceScaleFactor, isMobile, hasTouch, baseURL });
  const host = await ctx.newPage();
  await host.setViewportSize({ width: 1600, height: 900 });
  await host.goto('/host/?local=1&fast=1');
  await host.waitForFunction(() => window.__host?.code && window.__host.state === 'lobby');
  const code = await host.evaluate(() => window.__host.code);

  const phone = await ctx.newPage();
  const vp = info.project.use.viewport;
  await phone.setViewportSize(vp);
  await phone.goto(`/play/?room=${code}&local=1`);
  await phone.fill('#nameIn', 'Lan');
  await phone.click('[data-n="3"]');
  await expect(phone.locator('h1')).toContainText('Detective #3');
  // no horizontal scroll
  expect(await phone.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);

  await host.click('#startBtn');
  await host.click('#goWrite');
  // only one student: they get all 15 scenes? No - one present student covers everything; check the step bar
  await expect(phone.locator('#txt')).toBeVisible();
  const box = phone.locator('#txt');
  for (const attr of ['autocorrect', 'autocomplete', 'autocapitalize']) expect(await box.getAttribute(attr)).toBe('off');
  expect(await box.getAttribute('spellcheck')).toBe('false');
  expect(await box.evaluate((e) => parseFloat(getComputedStyle(e).fontSize))).toBeGreaterThanOrEqual(16);
  const btnH = await phone.locator('#submit').evaluate((e) => e.getBoundingClientRect().height);
  expect(btnH).toBeGreaterThanOrEqual(48);

  // Simulate the on-screen keyboard: focus + shrink the visual viewport.
  await box.click();
  await phone.setViewportSize({ width: vp.width, height: Math.round(vp.height * 0.55) });
  await phone.waitForTimeout(400);
  for (const sel of ['#txt', '#submit']) {
    const r = await phone.locator(sel).boundingBox();
    expect(r.y, `${sel} top visible`).toBeGreaterThanOrEqual(0);
    expect(r.y + r.height, `${sel} bottom visible with keyboard open`).toBeLessThanOrEqual(Math.round(vp.height * 0.55) + 1);
  }
  await phone.screenshot({ path: `test-results/${info.project.name}-keyboard.png` });
  await box.fill('The hall was decorated with balloons.');
  await box.press('Enter');
  await expect(phone.locator('#status')).toContainText('Submitted');
  await phone.setViewportSize(vp);
  await host.waitForFunction(() => window.__host.G.subs?.[1]?.text === 'The hall was decorated with balloons.');

  // refresh = back to the same seat and the same draft
  await phone.locator('#txt').fill('A draft that must survive');
  await phone.waitForTimeout(500);
  await phone.reload();
  await expect(phone.locator('#txt')).toHaveValue('A draft that must survive');
  await phone.screenshot({ path: `test-results/${info.project.name}-writing.png` });
  await ctx.close();
});
