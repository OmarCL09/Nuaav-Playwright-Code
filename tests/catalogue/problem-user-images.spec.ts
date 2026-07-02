import { loggedOutTest as test, expect } from '../../src/fixtures/test-fixtures';
import { users } from '../../src/data/users';

test.describe('problem_user product images', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.loginAs(users.problem);
  });

  test('all product images collapse to a single (broken) source', async ({ inventoryPage }) => {
    const sources = await inventoryPage.productImageSources();

    expect(sources).toHaveLength(6);

    const uniqueSources = new Set(sources);
    expect(
      uniqueSources.size,
      'problem_user is expected to render one shared broken image for all products',
    ).toBe(1);
  });
});
