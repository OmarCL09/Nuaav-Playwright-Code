import { loggedOutTest as test, expect } from '../../src/fixtures/test-fixtures';
import { users } from '../../src/data/users';
import { products } from '../../src/data/products';
import { validCustomer } from '../../src/data/checkout';

type CheckoutOutcome = 'completed' | 'handled-error' | 'silent-noop' | 'unknown';

test.describe('error_user checkout resilience', () => {
  test('checkout ends in a recognised state and never a false success', async ({
    loginPage,
    inventoryPage,
    cartPage,
    checkoutInformationPage,
    checkoutOverviewPage,
    checkoutCompletePage,
    page,
  }, testInfo) => {
    await loginPage.goto();
    await loginPage.loginAs(users.error);
    await expect(page).toHaveURL(/inventory\.html/);

    await inventoryPage.addToCart(products.backpack);
    await inventoryPage.header.openCart();
    await cartPage.checkout();
    await checkoutInformationPage.submit(validCustomer);
    await expect(page).toHaveURL(/checkout-step-two\.html/);

    await checkoutOverviewPage.finish();

    const outcome = await classifyOutcome({
      confirmation: () => checkoutCompletePage.header.isVisible(),
      error: () => checkoutInformationPage.errorMessage.isVisible(),
      stillOnOverview: () => page.url().includes('/checkout-step-two.html'),
    });

    testInfo.annotations.push({ type: 'error_user outcome', description: outcome });

    expect(
      outcome,
      'error_user checkout landed in an unrecognised state (not success, error, or the known silent no-op)',
    ).not.toBe('unknown');

    switch (outcome) {
      case 'completed':
        expect(await checkoutCompletePage.confirmationText()).toBe('Thank you for your order!');
        break;
      case 'handled-error': {
        const message = await checkoutInformationPage.errorText();
        expect(message.length).toBeGreaterThan(0);
        break;
      }
      case 'silent-noop':
        await expect(checkoutCompletePage.header).toBeHidden();
        expect(page.url()).toContain('/checkout-step-two.html');
        break;
    }
  });
});

async function classifyOutcome(probes: {
  confirmation: () => Promise<boolean>;
  error: () => Promise<boolean>;
  stillOnOverview: () => boolean;
}): Promise<CheckoutOutcome> {
  const deadline = Date.now() + 8000;
  while (Date.now() < deadline) {
    if (await probes.confirmation()) return 'completed';
    if (await probes.error()) return 'handled-error';
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  return probes.stillOnOverview() ? 'silent-noop' : 'unknown';
}
