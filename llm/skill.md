# Skill: Working on the Nuaav SauceDemo Playwright Suite

A knowledge file for an AI agent (or a new engineer) that needs to work on this
repository productively without re-deriving its structure. Read this first, then open
the files it points at. Everything here reflects the actual code if you change the
code, update this file too.

---

## 1. What this project is

An end-to-end test suite for the public practice app **SauceDemo**
(`https://www.saucedemo.com`), written in **TypeScript** with **Playwright Test**,
using the **Page Object Model (POM)**. It covers login/auth, catalogue, cart, the
3-step checkout, logout, and SauceDemo's special edge-case accounts.

- Language/runtime: TypeScript, Node ≥ 18 (developed on Node 20).
- Test runner: `@playwright/test`.
- Browsers: Chromium + Firefox.
- No app server to start — the app under test is public and always live.

---

## 2. Directory map (source of truth)

```
playwright.config.ts     # projects, baseURL, timeouts, reporters, parallelism, SLOWMO
tests/
  auth.setup.ts          # 'setup' project: logs in once, saves storageState
  auth/                  # login (logged-out) + logout (burger menu)
  catalogue/             # grid, sorting, product detail, problem_user images
  cart/                  # add/remove, count badge
  checkout/              # full 3-step flow, form validation, error_user resilience
  performance/           # performance_glitch_user load-time budget
src/
  pages/                 # one Page Object per screen, all extend BasePage
  components/            # HeaderComponent (cart badge + burger/logout), shared across pages
  fixtures/              # test.extend — injects Page Objects; also a logged-out variant
  data/                  # users, products, checkout data (typed, centralised)
```

Generated (gitignored, safe to delete, never edit by hand): `playwright-report/`,
`test-results/`, `.auth/`, `node_modules/`.

---

## 3. The mental model you must hold

### Page Object Model boundary (the golden rule)
**Specs describe behaviour. Page Objects own selectors and interactions.**
If you find yourself writing a raw CSS/`data-test` selector inside a `*.spec.ts`, it
belongs in a Page Object instead. Specs should read like intent:
`await cartPage.checkout()`, not `await page.click('[data-test="checkout"]')`.

- Every page class extends `src/pages/base.page.ts` (`BasePage`), which holds the
  shared `page` handle plus `goto()`/`url()` helpers and a `path` property.
- The recurring top bar is a **component**, not a base-class member:
  `src/components/header.component.ts` (`HeaderComponent`) exposes `cartItemCount()`,
  `openCart()`, and `logout()`. Pages that show it (inventory, cart, product details)
  compose it as `this.header`.

### Fixtures — how Page Objects reach the tests
`src/fixtures/test-fixtures.ts` exports two things you import instead of the raw
Playwright `test`:

- `test` — the default, **authenticated** fixture. Page Objects are injected as named
  fixtures (`loginPage`, `inventoryPage`, `cartPage`, `checkoutInformationPage`,
  `checkoutOverviewPage`, `checkoutCompletePage`, `productDetailsPage`). Just declare
  the ones you need in the test signature; never `new` a Page Object in a spec.
- `loggedOutTest` — same Page Objects but starts with **no session** (empty
  storageState). Use it for any flow that must begin logged-out: login errors, and the
  edge users (`locked_out`, `problem`, `performance_glitch`, `error`).

Also re-exports `expect`. So specs start with:
```ts
import { test, expect } from '../../src/fixtures/test-fixtures';
// or
import { loggedOutTest as test, expect } from '../../src/fixtures/test-fixtures';
```

### Authentication / test isolation (important, subtle)
- The `setup` project (`tests/auth.setup.ts`) logs in **once** as `standard_user`
  through the real UI and writes the session to `.auth/standard_user.json`.
- The `chromium` and `firefox` projects declare `dependencies: ['setup']` and load that
  file via `storageState`, so every worker starts already authenticated — login is paid
  once, not per test.
- `fullyParallel: true` is safe because SauceDemo cart state is **client-side per
  browser context**; each test gets a fresh context, so carts/checkouts never bleed.
  This is the crux of the isolation story — do not assume server-side shared state.

---

## 4. Conventions

- **Selectors:** prefer SauceDemo's `data-test` attributes (`[data-test="username"]`,
  `[data-test="checkout"]`, `[data-test="inventory-item"]`, …). Fall back to
  role/text (`getByRole('button', { name: 'Add to cart' })`). Avoid brittle
  positional selectors (`nth-child`).
- **Locating a product by name:** filter the item container by an exact-text child:
  `items.filter({ has: page.getByText(name, { exact: true }) })`. See `inventory.page.ts`.
- **Test data lives in `src/data/`**, not inline:
  - `users.ts` — accounts (`users.standard`, `users.lockedOut`, `users.problem`,
    `users.performanceGlitch`, `users.error`) + `loginErrors`.
  - `products.ts` — product names + `sortOptions`.
  - `checkout.ts` — `validCustomer` + `checkoutErrors`.
- **TypeScript is strict** (`noUnusedLocals`, `noUnusedParameters`, etc.). Keep it clean.
- **Style:** Prettier (`.prettierrc.json`) + ESLint (`.eslintrc.cjs`, includes
  `eslint-plugin-playwright`). Run `npm run lint` and `npm run typecheck` before finishing.

---

## 5. Commands

```bash
npm install                         # deps
npx playwright install --with-deps  # browsers (drop --with-deps on Win/macOS)

npm test                            # full suite, both browsers
npm run test:chromium               # one browser (fast feedback)
npm run test:demo -- tests/checkout/checkout.spec.ts   # headed, slow-mo, watchable
npm run test:ui                     # interactive UI mode (post-run inspector)
npm run report                      # open the HTML report

npm run lint                        # eslint
npm run typecheck                   # tsc --noEmit
```

Run one file: `npx playwright test tests/cart/cart.spec.ts`.
Run one test by title: `npx playwright test -g "full 3-step"`.
Watch slowly: `SLOWMO=2000 npx playwright test <file> --project=chromium --headed --workers=1`
(`SLOWMO` is read in `playwright.config.ts`; defaults to 0).

---

## 6. Behavioural gotchas (verified against the live app — do not "fix" as bugs)

- **`error_user`** — checkout step one succeeds, but the **Finish** button on step two
  is a *silent no-op*: no confirmation, no error, stranded on the overview page. The
  brief calls this "intermittent"; observed behaviour was deterministic across repeated
  runs. `tests/checkout/error-user-checkout.spec.ts` classifies the terminal state and
  asserts the invariants that matter (never a false success; never an unknown state),
  treating the silent no-op as the documented failure mode.
- **`problem_user`** — serves the *same broken image* for every product. The test in
  `tests/catalogue/problem-user-images.spec.ts` pins this known defect (all image `src`
  values collapse to one). If the app is ever fixed, that test should be updated.
- **`performance_glitch_user`** — artificial multi-second delays on login/page load.
  `tests/performance/performance-glitch.spec.ts` measures inventory load time and asserts
  it against a documented budget (`INVENTORY_LOAD_BUDGET_MS = 6000`). This is why the
  global timeouts in the config are raised above Playwright defaults.
- **`locked_out_user`** — login is blocked with a specific error string (see
  `loginErrors.lockedOut`).

---

## 7. Recipes

### Add a new Page Object
1. Create `src/pages/<name>.page.ts` extending `BasePage`. Declare `Locator`s in the
   constructor; set `path` if the page has its own URL. Add behaviour methods (verbs).
2. Register it as a fixture in `src/fixtures/test-fixtures.ts` (add to the `Pages`
   interface and the `test.extend` block).
3. Use it in specs via the fixture name.

### Add a new test
1. Put the spec under the matching `tests/<module>/` folder, named `*.spec.ts`.
2. Import `test`/`expect` (authenticated) or `loggedOutTest as test` (logged-out).
3. Drive the app through Page Objects only; assert with `expect`. Build your own
   preconditions inside the test (e.g. add the items you need) — never depend on state
   left by another test.

### Add a test for a specific edge user
Use `loggedOutTest`, then `await loginPage.goto()` and `await loginPage.loginAs(users.<x>)`.

---

## 8. Before you finish any change
- `npm run typecheck` — clean.
- `npm run lint` — clean.
- `npx playwright test` (or at least the affected file on `--project=chromium`) — green.
- If you changed structure/conventions/behaviour, update **this file** and the README.
