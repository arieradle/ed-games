const { test, expect } = require('@playwright/test');

test.describe('Hub page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('shows both game cards', async ({ page }) => {
    await expect(page.getByText('משחק חשבון')).toBeVisible();
    await expect(page.getByText('English Adventure').first()).toBeVisible();
  });

  // helpers — click card body, not the pointer-events:none play button
  const mathCard    = (p) => p.locator('a.game-card').filter({ hasText: 'משחק חשבון' });
  const englishCard = (p) => p.locator('a.game-card').filter({ hasText: 'English Adventure' });

  test('opens math game overlay when math card is clicked', async ({ page }) => {
    await mathCard(page).click();
    await expect(page.locator('#gameOverlay')).toHaveClass(/open/);
    await expect(page.locator('#gameFrame')).toHaveAttribute('src', /math/);
  });

  test('opens english game overlay when english card is clicked', async ({ page }) => {
    await englishCard(page).click();
    await expect(page.locator('#gameOverlay')).toHaveClass(/open/);
    await expect(page.locator('#gameFrame')).toHaveAttribute('src', /english/);
  });

  test('overlay bar shows correct game title for math', async ({ page }) => {
    await mathCard(page).click();
    await expect(page.locator('#overlayTitle')).toContainText('משחק חשבון');
  });

  test('overlay bar shows correct game title for english', async ({ page }) => {
    await englishCard(page).click();
    await expect(page.locator('#overlayTitle')).toContainText('English Adventure');
  });

  test('in-app back button closes overlay', async ({ page }) => {
    await englishCard(page).click();
    await expect(page.locator('#gameOverlay')).toHaveClass(/open/);
    await page.locator('.back-btn').click();
    await expect(page.locator('#gameOverlay')).not.toHaveClass(/open/);
  });

  test('Escape key closes overlay', async ({ page }) => {
    await englishCard(page).click();
    await expect(page.locator('#gameOverlay')).toHaveClass(/open/);
    await page.keyboard.press('Escape');
    await expect(page.locator('#gameOverlay')).not.toHaveClass(/open/);
  });

  test('iframe is cleared when overlay closes', async ({ page }) => {
    await englishCard(page).click();
    await page.locator('.back-btn').click();
    await expect(page.locator('#gameFrame')).toHaveAttribute('src', '');
  });
});
