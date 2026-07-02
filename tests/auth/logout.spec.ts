import { test, expect } from '../../src/fixtures/test-fixtures';

test.describe('Logout', () => {
  test('signing out from the burger menu returns to the login screen', async ({
    inventoryPage,
    loginPage,
    page,
  }) => {
    await inventoryPage.goto();
    await expect(page).toHaveURL(/inventory\.html/);

    await inventoryPage.header.logout();

    await expect(page).toHaveURL(/saucedemo\.com\/?$/);
    await expect(loginPage.errorMessage).toBeHidden();
    await expect(page.locator('[data-test="login-button"]')).toBeVisible();
  });

  test('inventory is not reachable after logout', async ({ inventoryPage, page }) => {
    await inventoryPage.goto();
    await inventoryPage.header.logout();

    await inventoryPage.goto();
    await expect(page).not.toHaveURL(/inventory\.html/);
    await expect(page.locator('[data-test="error"]')).toBeVisible();
  });
});
