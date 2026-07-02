import type { Page } from '@playwright/test';

export abstract class BasePage {
  constructor(protected readonly page: Page) { }

  protected readonly path: string = '';

  async goto(): Promise<void> {
    await this.page.goto(this.path);
  }

  url(): string {
    return this.page.url();
  }
}
