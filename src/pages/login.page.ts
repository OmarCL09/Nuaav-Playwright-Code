import type { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';
import type { TestUser } from '../data/users';

export class LoginPage extends BasePage {
  protected readonly path = '/';

  private readonly usernameInput: Locator;
  private readonly passwordInput: Locator;
  private readonly loginButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.usernameInput = page.locator('[data-test="username"]');
    this.passwordInput = page.locator('[data-test="password"]');
    this.loginButton = page.locator('[data-test="login-button"]');
    this.errorMessage = page.locator('[data-test="error"]');
  }

  async login(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async loginAs(user: TestUser): Promise<void> {
    await this.login(user.username, user.password);
  }

  async errorText(): Promise<string> {
    return (await this.errorMessage.innerText()).trim();
  }
}
