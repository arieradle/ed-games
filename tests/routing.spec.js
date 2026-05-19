import { test, expect } from '@playwright/test';

const mathCard    = (page) => page.locator('a.game-card').filter({ hasText: 'משחק חשבון' });
const englishCard = (page) => page.locator('a.game-card').filter({ hasText: 'English Adventure' });

test.describe('URL routing', () => {
  test('hub at / shows game cards', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('a.game-card')).toHaveCount(2);
    await expect(page).toHaveURL('/');
  });

  test('navigating to /math shows math welcome screen', async ({ page }) => {
    await page.goto('/math');
    await expect(page.locator('#welcomeScreen')).toBeVisible();
  });

  test('navigating to /english shows english welcome overlay', async ({ page }) => {
    await page.goto('/english');
    await expect(page.locator('#welcomeOverlay')).toBeVisible();
  });

  test('navigating to /english/bingo opens english with bingo tab active', async ({ page }) => {
    await page.goto('/english');
    await page.locator('#engNameInput').fill('Tester');
    await page.getByText("Let's Go!").click();
    await page.goto('/english/bingo');
    await expect(page.locator('#bingo')).toHaveClass(/active/);
  });

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
    await page.goto('/english');
    await page.locator('#engNameInput').fill('Tester');
    await page.getByText("Let's Go!").click();
    await page.locator('.tbBingo').click();
    await expect(page).toHaveURL('/english/bingo');
  });

  test('back button on math page returns to hub', async ({ page }) => {
    await page.goto('/math');
    await page.locator('button', { hasText: 'חזור' }).click();
    await expect(page).toHaveURL('/');
  });

  test('back button on english page returns to hub', async ({ page }) => {
    await page.goto('/english');
    await page.locator('button', { hasText: 'חזור' }).click();
    await expect(page).toHaveURL('/');
  });

  test('browser back button from math returns to hub', async ({ page }) => {
    await page.goto('/');
    await mathCard(page).click();
    await expect(page).toHaveURL('/math');
    await page.goBack();
    await expect(page).toHaveURL('/');
  });

  test('browser forward button after back reopens game', async ({ page }) => {
    await page.goto('/');
    await page.goto('/math');
    await page.goBack();
    await expect(page).toHaveURL('/');
    await page.goForward();
    await expect(page).toHaveURL('/math');
  });

  test('switching between games updates URL', async ({ page }) => {
    await page.goto('/');
    await mathCard(page).click();
    await expect(page).toHaveURL('/math');
    await page.locator('button', { hasText: 'חזור' }).click();
    await englishCard(page).click();
    await expect(page).toHaveURL('/english');
  });
});
