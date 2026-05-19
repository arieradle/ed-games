import { test, expect } from '@playwright/test';

test.describe('Hub page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('shows both game cards', async ({ page }) => {
    await expect(page.getByText('משחק חשבון').first()).toBeVisible();
    await expect(page.getByText('English Adventure').first()).toBeVisible();
  });

  const mathCard    = (p) => p.locator('a.game-card').filter({ hasText: 'משחק חשבון' });
  const englishCard = (p) => p.locator('a.game-card').filter({ hasText: 'English Adventure' });

  test('clicking math card navigates to /math', async ({ page }) => {
    await mathCard(page).click();
    await expect(page).toHaveURL('/math');
  });

  test('clicking english card navigates to /english', async ({ page }) => {
    await englishCard(page).click();
    await expect(page).toHaveURL('/english');
  });

  test('math card has correct href', async ({ page }) => {
    await expect(mathCard(page)).toHaveAttribute('href', /math/);
  });

  test('english card has correct href', async ({ page }) => {
    await expect(englishCard(page)).toHaveAttribute('href', /english/);
  });
});
