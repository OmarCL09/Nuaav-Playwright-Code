import type { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';
import { HeaderComponent } from '../components/header.component';

export class ProductDetailsPage extends BasePage {
  readonly header: HeaderComponent;
  readonly name: Locator;
  readonly price: Locator;
  readonly description: Locator;
  private readonly backButton: Locator;

  constructor(page: Page) {
    super(page);
    this.header = new HeaderComponent(page);
    this.name = page.locator('[data-test="inventory-item-name"]');
    this.price = page.locator('[data-test="inventory-item-price"]');
    this.description = page.locator('[data-test="inventory-item-desc"]');
    this.backButton = page.locator('[data-test="back-to-products"]');
  }

  async productName(): Promise<string> {
    return (await this.name.innerText()).trim();
  }

  async addToCart(): Promise<void> {
    await this.page.getByRole('button', { name: 'Add to cart' }).click();
  }

  async backToProducts(): Promise<void> {
    await this.backButton.click();
  }
}
