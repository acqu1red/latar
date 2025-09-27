import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/FlatMap AI/);
});

test('get started link', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Начать сейчас' }).click();
  await expect(page.locator('h1')).toHaveText('Загрузите свой план');
});
