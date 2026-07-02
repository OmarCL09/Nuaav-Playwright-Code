import type { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';
import { HeaderComponent } from '../components/header.component';
import type { ProductName, SortOption } from '../data/products';

export class InventoryPage extends BasePage {
  protected readonly path = '/inventory.html';

  readonly header: HeaderComponent;
  readonly items: Locator;
  private readonly sortDropdown: Locator;

  constructor(page: Page) {
    super(page);
    this.header = new HeaderComponent(page);
    this.items = page.locator('[data-test="inventory-item"]');
    this.sortDropdown = page.locator('[data-test="product-sort-container"]');
  }

  private item(name: ProductName): Locator {
    return this.items.filter({ has: this.page.getByText(name, { exact: true }) });
  }

  async isLoaded(): Promise<boolean> {
    return this.url().includes('/inventory.html');
  }

  async productCount(): Promise<number> {
    return this.items.count();
  }

  async productNames(): Promise<string[]> {
    return this.page.locator('[data-test="inventory-item-name"]').allInnerTexts();
  }

  async productPrices(): Promise<number[]> {
    const raw = await this.page.locator('[data-test="inventory-item-price"]').allInnerTexts();
    return raw.map((price) => Number(price.replace('$', '')));
  }

  async sortBy(option: SortOption): Promise<void> {
    await this.sortDropdown.selectOption(option);
  }

  async addToCart(name: ProductName): Promise<void> {
    await this.item(name).getByRole('button', { name: 'Add to cart' }).click();
  }

  async removeFromCart(name: ProductName): Promise<void> {
    await this.item(name).getByRole('button', { name: 'Remove' }).click();
  }

  async isInCart(name: ProductName): Promise<boolean> {
    return (await this.item(name).getByRole('button', { name: 'Remove' }).count()) > 0;
  }

  async openProduct(name: ProductName): Promise<void> {
    await this.item(name).getByText(name, { exact: true }).click();
  }

  async productImageSources(): Promise<string[]> {
    return this.page.locator('.inventory_item_img img').evaluateAll((imgs) =>
      imgs.map((img) => (img as HTMLImageElement).getAttribute('src') ?? ''),
    );
  }
}
