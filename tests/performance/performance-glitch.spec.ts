import { loggedOutTest as test, expect } from '../../src/fixtures/test-fixtures';
import { users } from '../../src/data/users';

const INVENTORY_LOAD_BUDGET_MS = 6000;

test.describe('performance_glitch_user load time', () => {
  test('inventory becomes usable within the documented budget', async ({
    loginPage,
    inventoryPage,
    page,
  }) => {
    await loginPage.goto();

    const started = Date.now();
    await loginPage.loginAs(users.performanceGlitch);

    await expect(page).toHaveURL(/inventory\.html/, { timeout: 20_000 });
    await expect(inventoryPage.items.first()).toBeVisible({ timeout: 20_000 });

    const elapsedMs = Date.now() - started;
    test.info().annotations.push({
      type: 'inventory load time',
      description: `${elapsedMs} ms (budget ${INVENTORY_LOAD_BUDGET_MS} ms)`,
    });

    expect(
      elapsedMs,
      `inventory took ${elapsedMs}ms, exceeding the ${INVENTORY_LOAD_BUDGET_MS}ms budget`,
    ).toBeLessThanOrEqual(INVENTORY_LOAD_BUDGET_MS);
  });
});
