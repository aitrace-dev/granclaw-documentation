import { test, expect } from '@playwright/test';

test('index redirects to introduction', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/getting-started\/introduction\/?$/);
  await expect(page.locator('main h1')).toContainText('Introduction');
});

test('sidebar renders all 20 pages', async ({ page }) => {
  await page.goto('/getting-started/introduction');
  // Use the fixed sidebar (left sidebar) specifically, not the TOC sidebar
  const links = page.locator('aside.fixed nav a');
  await expect(links).toHaveCount(20);
});

test('active page is highlighted in sidebar', async ({ page }) => {
  await page.goto('/getting-started/install');
  const active = page.locator('aside.fixed nav a.text-primary');
  await expect(active).toHaveCount(1);
  await expect(active).toContainText('install.md');
});

test('clicking a sidebar link navigates', async ({ page }) => {
  await page.goto('/getting-started/introduction');
  await page.click('a:has-text("chat.md")');
  await expect(page).toHaveURL(/using-granclaw\/chat\/?$/);
  await expect(page.locator('main h1')).toContainText('Chat');
});

test('cmd+k opens search and returns results', async ({ page }) => {
  await page.goto('/getting-started/introduction');
  await page.keyboard.press('Meta+k');
  const input = page.locator('#search-input');
  await expect(input).toBeVisible();
  await input.fill('install');
  // Pagefind debounces ~120ms; give it a beat.
  await page.waitForTimeout(500);
  const results = page.locator('#search-results a');
  await expect(results.first()).toBeVisible({ timeout: 5000 });
});

test('escape closes search modal', async ({ page }) => {
  await page.goto('/getting-started/introduction');
  await page.keyboard.press('Meta+k');
  await expect(page.locator('#search-input')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('#search-modal.flex')).toHaveCount(0);
});
