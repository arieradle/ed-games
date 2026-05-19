import { test, expect } from '@playwright/test';

async function startGame(page, name = 'Tester') {
  await page.locator('#engNameInput').fill(name);
  await page.getByText("Let's Go!").click();
  await expect(page.locator('#engGame')).toBeVisible();
}

test.describe('English game', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/english');
    await page.waitForSelector('#welcomeOverlay');
  });

  test('shows welcome overlay on load', async ({ page }) => {
    await expect(page.locator('#welcomeOverlay')).toBeVisible();
    await expect(page.locator('#engGame')).not.toBeVisible();
  });

  test('does not start without a name', async ({ page }) => {
    await page.getByText("Let's Go!").click();
    await expect(page.locator('#welcomeOverlay')).toBeVisible();
  });

  test('starts game after entering name', async ({ page }) => {
    await startGame(page, 'Tester');
    await expect(page.locator('#engGame')).toBeVisible();
  });

  test('Enter key starts the game', async ({ page }) => {
    await page.locator('#engNameInput').fill('Tester');
    await page.keyboard.press('Enter');
    await expect(page.locator('#engGame')).toBeVisible();
  });

  test('displays player name in topbar', async ({ page }) => {
    await startGame(page, 'Alice');
    await expect(page.locator('#engPlayerName')).toHaveText('Alice');
  });

  test('remembers previous player as a chip', async ({ page }) => {
    await startGame(page, 'Alice');
    await page.locator('#playerBadge button').click();
    await expect(page.locator('#engKnownPlayers')).toBeVisible();
    await expect(page.locator('#engChips')).toContainText('Alice');
  });

  test('clicking remembered chip starts game', async ({ page }) => {
    await startGame(page, 'Alice');
    await page.locator('#playerBadge button').click();
    await page.locator('#engChips .chip').first().click();
    await expect(page.locator('#engGame')).toBeVisible();
    await expect(page.locator('#engPlayerName')).toHaveText('Alice');
  });

  test('all 9 game tabs are present', async ({ page }) => {
    await startGame(page);
    await expect(page.locator('.tab-btn')).toHaveCount(9);
  });

  test('Level 1 panel is active by default', async ({ page }) => {
    await startGame(page);
    await expect(page.locator('#level1')).toHaveClass(/active/);
  });

  test('clicking Level 2 tab activates level2 panel', async ({ page }) => {
    await startGame(page);
    await page.locator('.tb2').click();
    await expect(page.locator('#level2')).toHaveClass(/active/);
    await expect(page.locator('#level1')).not.toHaveClass(/active/);
  });

  test('clicking Level 3 tab activates level3 panel', async ({ page }) => {
    await startGame(page);
    await page.locator('.tb3').click();
    await expect(page.locator('#level3')).toHaveClass(/active/);
  });

  test('clicking Memory tab activates memory panel', async ({ page }) => {
    await startGame(page);
    await page.locator('.tbM').click();
    await expect(page.locator('#memory')).toHaveClass(/active/);
  });

  test('clicking Bingo tab activates bingo panel', async ({ page }) => {
    await startGame(page);
    await page.locator('.tbBingo').click();
    await expect(page.locator('#bingo')).toHaveClass(/active/);
  });

  test('clicking Speed tab activates speed panel', async ({ page }) => {
    await startGame(page);
    await page.locator('.tbSpeed').click();
    await expect(page.locator('#speed')).toHaveClass(/active/);
  });

  test('clicking Odd One Out tab activates odd panel', async ({ page }) => {
    await startGame(page);
    await page.locator('.tbOdd').click();
    await expect(page.locator('#odd')).toHaveClass(/active/);
  });

  test('clicking Ladder tab activates ladder panel', async ({ page }) => {
    await startGame(page);
    await page.locator('.tbLadder').click();
    await expect(page.locator('#ladder')).toHaveClass(/active/);
  });

  test('clicking Sentences tab activates sentences panel', async ({ page }) => {
    await startGame(page);
    await page.locator('.tbSent').click();
    await expect(page.locator('#sentences')).toHaveClass(/active/);
  });

  test('level 1 score starts at 0', async ({ page }) => {
    await startGame(page);
    await expect(page.locator('#l1-score')).toHaveText('0');
  });

  test('level 1 question counter starts at 1/10', async ({ page }) => {
    await startGame(page);
    await expect(page.locator('#l1-qnum')).toHaveText('1/10');
  });

  test('memory setup shows difficulty options', async ({ page }) => {
    await startGame(page);
    await page.locator('.tbM').click();
    await expect(page.locator('#mdiff-8')).toBeVisible();
    await expect(page.locator('#mdiff-12')).toBeVisible();
    await expect(page.locator('#mdiff-16')).toBeVisible();
  });

  test('memory game starts on clicking start button', async ({ page }) => {
    await startGame(page);
    await page.locator('.tbM').click();
    await page.locator('#memory .mem-start-btn').click();
    await expect(page.locator('#mem-game')).toBeVisible();
    await expect(page.locator('#mem-grid .mem-card')).toHaveCount(16);
  });

  test('switch player button shows welcome overlay', async ({ page }) => {
    await startGame(page);
    await page.locator('#playerBadge button').click();
    await expect(page.locator('#welcomeOverlay')).toBeVisible();
    await expect(page.locator('#engGame')).not.toBeVisible();
  });

  test('can start a new game after switching player', async ({ page }) => {
    await startGame(page, 'Alice');
    await page.locator('#playerBadge button').click();
    await startGame(page, 'Bob');
    await expect(page.locator('#engPlayerName')).toHaveText('Bob');
  });
});
