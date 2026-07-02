import type { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';

export class CheckoutCompletePage extends BasePage {
  protected readonly path = '/checkout-complete.html';

  readonly header: Locator;
  readonly completeText: Locator;
  private readonly backHomeButton: Locator;

  constructor(page: Page) {
    super(page);
    this.header = page.locator('[data-test="complete-header"]');
    this.completeText = page.locator('[data-test="complete-text"]');
    this.backHomeButton = page.locator('[data-test="back-to-products"]');
  }

  async confirmationText(): Promise<string> {
    return (await this.header.innerText()).trim();
  }

  async backHome(): Promise<void> {
    await this.backHomeButton.click();
  }
}
