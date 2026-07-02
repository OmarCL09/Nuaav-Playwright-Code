import type { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';
import type { ProductName } from '../data/products';

export class CheckoutOverviewPage extends BasePage {
  protected readonly path = '/checkout-step-two.html';

  readonly items: Locator;
  private readonly finishButton: Locator;
  private readonly cancelButton: Locator;
  private readonly subtotalLabel: Locator;
  private readonly taxLabel: Locator;
  private readonly totalLabel: Locator;

  constructor(page: Page) {
    super(page);
    this.items = page.locator('[data-test="inventory-item"]');
    this.finishButton = page.locator('[data-test="finish"]');
    this.cancelButton = page.locator('[data-test="cancel"]');
    this.subtotalLabel = page.locator('[data-test="subtotal-label"]');
    this.taxLabel = page.locator('[data-test="tax-label"]');
    this.totalLabel = page.locator('[data-test="total-label"]');
  }

  async itemNames(): Promise<string[]> {
    return this.page.locator('[data-test="inventory-item-name"]').allInnerTexts();
  }

  async hasItem(name: ProductName): Promise<boolean> {
    return (await this.items.filter({ has: this.page.getByText(name, { exact: true }) }).count()) > 0;
  }

  async subtotal(): Promise<number> {
    return this.parseAmount(this.subtotalLabel);
  }

  async tax(): Promise<number> {
    return this.parseAmount(this.taxLabel);
  }

  async total(): Promise<number> {
    return this.parseAmount(this.totalLabel);
  }

  async finish(): Promise<void> {
    await this.finishButton.click();
  }

  async cancel(): Promise<void> {
    await this.cancelButton.click();
  }

  private async parseAmount(label: Locator): Promise<number> {
    const text = await label.innerText();
    const match = text.match(/\$([\d.]+)/);
    return match ? Number(match[1]) : NaN;
  }
}
