import { test, expect } from '../../src/fixtures/test-fixtures';
import { products, sortOptions } from '../../src/data/products';

test.describe('Product catalogue', () => {
  test.beforeEach(async ({ inventoryPage }) => {
    await inventoryPage.goto();
  });

  test('displays the full product grid', async ({ inventoryPage }) => {
    expect(await inventoryPage.productCount()).toBe(6);
  });

  test('sorts products by name A → Z', async ({ inventoryPage }) => {
    await inventoryPage.sortBy(sortOptions.nameAZ);

    const names = await inventoryPage.productNames();
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
  });

  test('sorts products by name Z → A', async ({ inventoryPage }) => {
    await inventoryPage.sortBy(sortOptions.nameZA);

    const names = await inventoryPage.productNames();
    expect(names).toEqual([...names].sort((a, b) => b.localeCompare(a)));
  });

  test('sorts products by price low → high', async ({ inventoryPage }) => {
    await inventoryPage.sortBy(sortOptions.priceLowHigh);

    const prices = await inventoryPage.productPrices();
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });

  test('sorts products by price high → low', async ({ inventoryPage }) => {
    await inventoryPage.sortBy(sortOptions.priceHighLow);

    const prices = await inventoryPage.productPrices();
    expect(prices).toEqual([...prices].sort((a, b) => b - a));
  });

  test('opening a product shows its detail page', async ({
    inventoryPage,
    productDetailsPage,
    page,
  }) => {
    await inventoryPage.openProduct(products.backpack);

    await expect(page).toHaveURL(/inventory-item\.html/);
    expect(await productDetailsPage.productName()).toBe(products.backpack);
    await expect(productDetailsPage.price).toBeVisible();
    await expect(productDetailsPage.description).toBeVisible();
  });

  test('a product can be added to the cart from its detail page', async ({
    inventoryPage,
    productDetailsPage,
  }) => {
    await inventoryPage.openProduct(products.backpack);
    await productDetailsPage.addToCart();

    expect(await productDetailsPage.header.cartItemCount()).toBe(1);
  });
});
