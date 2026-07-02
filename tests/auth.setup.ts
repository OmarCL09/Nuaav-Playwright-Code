import { test as setup, expect } from '@playwright/test';
import { LoginPage } from '../src/pages/login.page';
import { InventoryPage } from '../src/pages/inventory.page';
import { users } from '../src/data/users';

const STORAGE_STATE = '.auth/standard_user.json';

setup('authenticate as standard_user', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const inventoryPage = new InventoryPage(page);

  await loginPage.goto();
  await loginPage.loginAs(users.standard);

  await expect(page).toHaveURL(/inventory\.html/);
  await expect(inventoryPage.items.first()).toBeVisible();

  await page.context().storageState({ path: STORAGE_STATE });
});
