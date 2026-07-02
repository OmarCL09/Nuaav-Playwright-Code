import { loggedOutTest as test, expect } from '../../src/fixtures/test-fixtures';
import { users, loginErrors, PASSWORD } from '../../src/data/users';

test.describe('Login', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test('standard_user logs in and lands on the inventory page', async ({
    loginPage,
    inventoryPage,
    page,
  }) => {
    await loginPage.loginAs(users.standard);

    await expect(page).toHaveURL(/inventory\.html/);
    expect(await inventoryPage.isLoaded()).toBe(true);
  });

  test('a session cookie is set after a successful login', async ({ loginPage, page }) => {
    await loginPage.loginAs(users.standard);
    await expect(page).toHaveURL(/inventory\.html/);

    const cookies = await page.context().cookies();
    const session = cookies.find((cookie) => cookie.name === 'session-username');

    expect(session, 'expected a session-username cookie').toBeDefined();
    expect(session?.value).toBe(users.standard.username);
  });

  test('locked_out_user is blocked with an explanatory error', async ({ loginPage, page }) => {
    await loginPage.loginAs(users.lockedOut);

    await expect(loginPage.errorMessage).toBeVisible();
    expect(await loginPage.errorText()).toBe(loginErrors.lockedOut);
    await expect(page).not.toHaveURL(/inventory\.html/);
  });

  test('invalid credentials are rejected', async ({ loginPage }) => {
    await loginPage.login('standard_user', 'wrong_password');

    await expect(loginPage.errorMessage).toBeVisible();
    expect(await loginPage.errorText()).toBe(loginErrors.invalidCredentials);
  });

  test('missing username is rejected', async ({ loginPage }) => {
    await loginPage.login('', PASSWORD);

    expect(await loginPage.errorText()).toBe(loginErrors.missingUsername);
  });

  test('missing password is rejected', async ({ loginPage }) => {
    await loginPage.login(users.standard.username, '');

    expect(await loginPage.errorText()).toBe(loginErrors.missingPassword);
  });
});
