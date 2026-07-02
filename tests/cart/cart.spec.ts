import { test, expect } from '../../src/fixtures/test-fixtures';
import { products } from '../../src/data/products';

test.describe('Cart', () => {
  test.beforeEach(async ({ inventoryPage }) => {
    await inventoryPage.goto();
  });

  test('adding an item updates the cart badge', async ({ inventoryPage }) => {
    expect(await inventoryPage.header.cartItemCount()).toBe(0);

    await inventoryPage.addToCart(products.backpack);

    expect(await inventoryPage.header.cartItemCount()).toBe(1);
    expect(await inventoryPage.isInCart(products.backpack)).toBe(true);
  });

  test('adding multiple items increments the badge accordingly', async ({ inventoryPage }) => {
    await inventoryPage.addToCart(products.backpack);
    await inventoryPage.addToCart(products.bikeLight);
    await inventoryPage.addToCart(products.boltTShirt);

    expect(await inventoryPage.header.cartItemCount()).toBe(3);
  });

  test('removing an item from the grid clears the badge', async ({ inventoryPage }) => {
    await inventoryPage.addToCart(products.backpack);
    expect(await inventoryPage.header.cartItemCount()).toBe(1);

    await inventoryPage.removeFromCart(products.backpack);
    expect(await inventoryPage.header.cartItemCount()).toBe(0);
  });

  test('items added on the grid appear in the cart page', async ({ inventoryPage, cartPage }) => {
    await inventoryPage.addToCart(products.backpack);
    await inventoryPage.addToCart(products.fleeceJacket);
    await inventoryPage.header.openCart();

    expect(await cartPage.itemCount()).toBe(2);
    expect(await cartPage.hasItem(products.backpack)).toBe(true);
    expect(await cartPage.hasItem(products.fleeceJacket)).toBe(true);
  });

  test('removing an item from the cart page updates it', async ({ inventoryPage, cartPage }) => {
    await inventoryPage.addToCart(products.backpack);
    await inventoryPage.addToCart(products.fleeceJacket);
    await inventoryPage.header.openCart();

    await cartPage.removeItem(products.backpack);

    expect(await cartPage.itemCount()).toBe(1);
    expect(await cartPage.hasItem(products.backpack)).toBe(false);
    expect(await cartPage.header.cartItemCount()).toBe(1);
  });
});
