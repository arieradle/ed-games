const { test, expect } = require('@playwright/test');

test.describe('URL routing', () => {
  test('hub at / shows no game overlay', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#gameOverlay')).not.toHaveClass(/open/);
    await expect(page).toHaveURL('/');
  });

  test('navigating to /math opens math game', async ({ page }) => {
    await page.goto('/math');
    await expect(page.locator('#gameOverlay')).toHaveClass(/open/);
    await expect(page.locator('#gameFrame')).toHaveAttribute('src', /math/);
  });

  test('navigating to /english opens english game', async ({ page }) => {
    await page.goto('/english');
    await expect(page.locator('#gameOverlay')).toHaveClass(/open/);
    await expect(page.locator('#gameFrame')).toHaveAttribute('src', /english/);
  });

  test('navigating to /english/bingo opens english on bingo tab', async ({ page }) => {
    await page.goto('/english/bingo');
    await expect(page.locator('#gameOverlay')).toHaveClass(/open/);
    // iframe src should include ?tab=bingo
    await expect(page.locator('#gameFrame')).toHaveAttribute('src', /tab=bingo/);
  });

  const mathCard    = (page) => page.locator('a.game-card').filter({ hasText: 'משחק חשבון' });
  const englishCard = (page) => page.locator('a.game-card').filter({ hasText: 'English Adventure' });

  test('opening math game updates URL to /math', async ({ page }) => {
    await page.goto('/');
    await mathCard(page).click();
    await expect(page).toHaveURL('/math');
  });

  test('opening english game updates URL to /english', async ({ page }) => {
    await page.goto('/');
    await englishCard(page).click();
    await expect(page).toHaveURL('/english');
  });

  test('switching tab in english game updates URL', async ({ page }) => {
    await page.goto('/');
    await englishCard(page).click();

    const frame = page.frameLocator('#gameFrame');
    await frame.locator('#engNameInput').fill('Tester');
    await frame.getByText("Let's Go!").click();
    await frame.locator('.tbBingo').click();

    await expect(page).toHaveURL('/english/bingo');
  });

  test('in-app back button returns URL to /', async ({ page }) => {
    await page.goto('/');
    await englishCard(page).click();
    await expect(page).toHaveURL('/english');
    await page.locator('.back-btn').click();
    await expect(page).toHaveURL('/');
  });

  test('browser back button closes overlay', async ({ page }) => {
    await page.goto('/');
    await englishCard(page).click();
    await expect(page.locator('#gameOverlay')).toHaveClass(/open/);
    await page.goBack();
    await expect(page.locator('#gameOverlay')).not.toHaveClass(/open/);
  });

  test('browser forward button reopens game', async ({ page }) => {
    // Use real navigations so goForward works (pushState entries are not traversable via CDP)
    await page.goto('/');
    await page.goto('/english');
    await expect(page.locator('#gameOverlay')).toHaveClass(/open/);
    await page.goBack();
    await expect(page.locator('#gameOverlay')).not.toHaveClass(/open/);
    await page.goForward();
    await expect(page.locator('#gameOverlay')).toHaveClass(/open/);
  });

  test('switching between games updates URL', async ({ page }) => {
    await page.goto('/');
    await mathCard(page).click();
    await expect(page).toHaveURL('/math');
    await page.locator('.back-btn').click();
    await englishCard(page).click();
    await expect(page).toHaveURL('/english');
  });
});
