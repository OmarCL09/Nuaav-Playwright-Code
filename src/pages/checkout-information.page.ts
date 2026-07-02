import type { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';
import type { CustomerInfo } from '../data/checkout';

export class CheckoutInformationPage extends BasePage {
  protected readonly path = '/checkout-step-one.html';

  private readonly firstNameInput: Locator;
  private readonly lastNameInput: Locator;
  private readonly postalCodeInput: Locator;
  private readonly continueButton: Locator;
  private readonly cancelButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.firstNameInput = page.locator('[data-test="firstName"]');
    this.lastNameInput = page.locator('[data-test="lastName"]');
    this.postalCodeInput = page.locator('[data-test="postalCode"]');
    this.continueButton = page.locator('[data-test="continue"]');
    this.cancelButton = page.locator('[data-test="cancel"]');
    this.errorMessage = page.locator('[data-test="error"]');
  }

  async enterDetails(info: Partial<CustomerInfo>): Promise<void> {
    if (info.firstName !== undefined) await this.firstNameInput.fill(info.firstName);
    if (info.lastName !== undefined) await this.lastNameInput.fill(info.lastName);
    if (info.postalCode !== undefined) await this.postalCodeInput.fill(info.postalCode);
  }

  async continue(): Promise<void> {
    await this.continueButton.click();
  }

  async submit(info: CustomerInfo): Promise<void> {
    await this.enterDetails(info);
    await this.continue();
  }

  async cancel(): Promise<void> {
    await this.cancelButton.click();
  }

  async errorText(): Promise<string> {
    return (await this.errorMessage.innerText()).trim();
  }
}
