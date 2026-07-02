import { test, expect } from '../../src/fixtures/test-fixtures';
import { products } from '../../src/data/products';
import { validCustomer, checkoutErrors } from '../../src/data/checkout';

/** End-to-end checkout: cart → information → overview → confirmation. */
test.describe('Checkout', () => {
  test.beforeEach(async ({ inventoryPage }) => {
    await inventoryPage.goto();
  });

  test('completes the full 3-step checkout flow', async ({
    inventoryPage,
    cartPage,
    checkoutInformationPage,
    checkoutOverviewPage,
    checkoutCompletePage,
    page,
  }) => {
    // Cart
    await inventoryPage.addToCart(products.backpack);
    await inventoryPage.addToCart(products.bikeLight);
    await inventoryPage.header.openCart();
    expect(await cartPage.itemCount()).toBe(2);

    // customer information
    await cartPage.checkout();
    await expect(page).toHaveURL(/checkout-step-one\.html/);
    await checkoutInformationPage.submit(validCustomer);

    // both items present and totals are internally consistent
    await expect(page).toHaveURL(/checkout-step-two\.html/);
    expect(await checkoutOverviewPage.hasItem(products.backpack)).toBe(true);
    expect(await checkoutOverviewPage.hasItem(products.bikeLight)).toBe(true);

    const subtotal = await checkoutOverviewPage.subtotal();
    const tax = await checkoutOverviewPage.tax();
    const total = await checkoutOverviewPage.total();
    expect(Number((subtotal + tax).toFixed(2))).toBe(total);

    // confirmation
    await checkoutOverviewPage.finish();
    await expect(page).toHaveURL(/checkout-complete\.html/);
    expect(await checkoutCompletePage.confirmationText()).toBe('Thank you for your order!');
  });

  test('returns to inventory with an empty cart after ordering', async ({
    inventoryPage,
    cartPage,
    checkoutInformationPage,
    checkoutOverviewPage,
    checkoutCompletePage,
  }) => {
    await inventoryPage.addToCart(products.backpack);
    await inventoryPage.header.openCart();
    await cartPage.checkout();
    await checkoutInformationPage.submit(validCustomer);
    await checkoutOverviewPage.finish();

    await checkoutCompletePage.backHome();
    expect(await inventoryPage.isLoaded()).toBe(true);
    expect(await inventoryPage.header.cartItemCount()).toBe(0);
  });

  test.describe('information form validation', () => {
    test.beforeEach(async ({ inventoryPage, cartPage }) => {
      await inventoryPage.addToCart(products.backpack);
      await inventoryPage.header.openCart();
      await cartPage.checkout();
    });

    test('requires a first name', async ({ checkoutInformationPage }) => {
      await checkoutInformationPage.enterDetails({ lastName: 'Contreras', postalCode: '28080' });
      await checkoutInformationPage.continue();

      expect(await checkoutInformationPage.errorText()).toBe(checkoutErrors.missingFirstName);
    });

    test('requires a last name', async ({ checkoutInformationPage }) => {
      await checkoutInformationPage.enterDetails({ firstName: 'Omar', postalCode: '28080' });
      await checkoutInformationPage.continue();

      expect(await checkoutInformationPage.errorText()).toBe(checkoutErrors.missingLastName);
    });

    test('requires a postal code', async ({ checkoutInformationPage }) => {
      await checkoutInformationPage.enterDetails({ firstName: 'Omar', lastName: 'Contreras' });
      await checkoutInformationPage.continue();

      expect(await checkoutInformationPage.errorText()).toBe(checkoutErrors.missingPostalCode);
    });
  });
});
