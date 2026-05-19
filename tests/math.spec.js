import { test, expect } from '@playwright/test';

test.describe('Math game', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/math');
    await page.waitForSelector('#welcomeScreen');
  });

  test('shows welcome screen on load, not game screen', async ({ page }) => {
    await expect(page.locator('#welcomeScreen')).toBeVisible();
    await expect(page.locator('#gameScreen')).not.toBeVisible();
  });

  test('does not start without a name', async ({ page }) => {
    await page.getByText('בואו נתחיל!').click();
    await expect(page.locator('#welcomeScreen')).toBeVisible();
  });

  test('starts game after entering name and clicking start', async ({ page }) => {
    await page.locator('#nameInput').fill('ארי');
    await page.getByText('בואו נתחיל!').click();
    await expect(page.locator('#gameScreen')).toBeVisible();
  });

  test('starts game when Enter is pressed', async ({ page }) => {
    await page.locator('#nameInput').fill('ארי');
    await page.keyboard.press('Enter');
    await expect(page.locator('#gameScreen')).toBeVisible();
  });

  test('displays player name in greeting', async ({ page }) => {
    await page.locator('#nameInput').fill('ארי');
    await page.keyboard.press('Enter');
    await expect(page.locator('#playerName')).toHaveText('ארי');
  });

  test('remembers previous player as a chip', async ({ page }) => {
    await page.locator('#nameInput').fill('ארי');
    await page.keyboard.press('Enter');
    await page.getByText('החלף שחקן').click();
    await expect(page.locator('#playerChips')).toContainText('ארי');
  });

  test('shows a math question with = ?', async ({ page }) => {
    await page.locator('#nameInput').fill('ארי');
    await page.keyboard.press('Enter');
    await expect(page.locator('#question')).toContainText('?');
  });

  test('score starts at 0', async ({ page }) => {
    await page.locator('#nameInput').fill('ארי');
    await page.keyboard.press('Enter');
    await expect(page.locator('#score')).toHaveText('0');
  });

  test('wrong answer shows correct-answer hint', async ({ page }) => {
    await page.locator('#nameInput').fill('ארי');
    await page.keyboard.press('Enter');
    await page.locator('#answerInput').fill('9999');
    await page.getByText('בדוק').click();
    await expect(page.locator('#correctAnswer')).toContainText('התשובה הנכונה');
  });

  test('wrong answer shows ❌ feedback', async ({ page }) => {
    await page.locator('#nameInput').fill('ארי');
    await page.keyboard.press('Enter');
    await page.locator('#answerInput').fill('9999');
    await page.getByText('בדוק').click();
    await expect(page.locator('#feedback')).toContainText('❌');
  });

  test('answering adds an entry to history', async ({ page }) => {
    await page.locator('#nameInput').fill('ארי');
    await page.keyboard.press('Enter');
    await page.locator('#answerInput').fill('1');
    await page.getByText('בדוק').click();
    await expect(page.locator('.history-item')).toHaveCount(1);
  });

  test('easy difficulty is active by default', async ({ page }) => {
    await page.locator('#nameInput').fill('ארי');
    await page.keyboard.press('Enter');
    await expect(page.locator('.diff-btn.easy')).toHaveClass(/active|bg-green/);
  });

  test('clicking medium difficulty marks it active', async ({ page }) => {
    await page.locator('#nameInput').fill('ארי');
    await page.keyboard.press('Enter');
    await page.getByText('בינוני').click();
    await expect(page.locator('.diff-btn.medium')).toHaveClass(/active|bg-yellow/);
    await expect(page.locator('.diff-btn.easy')).not.toHaveClass(/bg-green-100/);
  });

  test('clicking hard difficulty marks it active', async ({ page }) => {
    await page.locator('#nameInput').fill('ארי');
    await page.keyboard.press('Enter');
    await page.getByText('קשה').click();
    await expect(page.locator('.diff-btn.hard')).toHaveClass(/bg-red/);
  });

  test('switch player returns to welcome screen', async ({ page }) => {
    await page.locator('#nameInput').fill('ארי');
    await page.keyboard.press('Enter');
    await page.getByText('החלף שחקן').click();
    await expect(page.locator('#welcomeScreen')).toBeVisible();
    await expect(page.locator('#gameScreen')).not.toBeVisible();
  });

  test('can start a new game after switching player', async ({ page }) => {
    await page.locator('#nameInput').fill('ארי');
    await page.keyboard.press('Enter');
    await page.getByText('החלף שחקן').click();
    await page.locator('#nameInput').fill('שרה');
    await page.keyboard.press('Enter');
    await expect(page.locator('#playerName')).toHaveText('שרה');
  });
});
