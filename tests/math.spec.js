const { test, expect } = require('@playwright/test');

test.describe('Math game', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/math_game_grade3.html');
    await page.waitForSelector('#welcomeScreen');
  });

  // ── Welcome screen ──

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

  // ── Game screen ──

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

  test('answering a second question adds second history entry', async ({ page }) => {
    await page.locator('#nameInput').fill('ארי');
    await page.keyboard.press('Enter');
    for (let i = 0; i < 2; i++) {
      await page.locator('#answerInput').fill('1');
      await page.getByText('בדוק').click();
      await page.getByText('שאלה חדשה').click();
    }
    await expect(page.locator('.history-item')).toHaveCount(2);
  });

  // ── Difficulty ──

  test('easy difficulty is active by default', async ({ page }) => {
    await page.locator('#nameInput').fill('ארי');
    await page.keyboard.press('Enter');
    await expect(page.locator('.diff-btn.easy')).toHaveClass(/active/);
  });

  test('clicking medium difficulty marks it active', async ({ page }) => {
    await page.locator('#nameInput').fill('ארי');
    await page.keyboard.press('Enter');
    await page.getByText('בינוני').click();
    await expect(page.locator('.diff-btn.medium')).toHaveClass(/active/);
    await expect(page.locator('.diff-btn.easy')).not.toHaveClass(/active/);
  });

  test('clicking hard difficulty marks it active', async ({ page }) => {
    await page.locator('#nameInput').fill('ארי');
    await page.keyboard.press('Enter');
    await page.getByText('קשה').click();
    await expect(page.locator('.diff-btn.hard')).toHaveClass(/active/);
  });

  // ── Switch player ──

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
