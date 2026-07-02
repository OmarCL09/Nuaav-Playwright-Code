# Nuaav — Playwright Automation Suite (SauceDemo)

An end-to-end test suite for [SauceDemo](https://www.saucedemo.com) built with
**Playwright + TypeScript**, using the **Page Object Model**. It covers login/auth,
the product catalogue, cart, the 3-step checkout, logout, and the edge-case user
accounts (locked-out, problem, performance-glitch, and error users).

---

## 1. Prerequisites

| Requirement | Version                                                             |
| ----------- | ------------------------------------------------------------------- |
| Node.js     | **18 or newer** (developed on Node 20; `engines` enforces `>=18`)   |
| npm         | Ships with Node                                                     |

Install dependencies and browsers:

```bash
npm install
npx playwright install
or
npx playwright install --with-deps
```

> `--with-deps` also installs the OS libraries the browsers need. On Windows/macOS
> `npx playwright install` (without `--with-deps`) is sufficient.

No Docker, local server, or `.env` file is required, the app under test is public
and always available. Copy `.env.example` to `.env` only if you want to override the
base URL.

---

## 2. Running the tests

### Run everything (both browsers)

```bash
npx playwright test
```

**What happens:** the `setup` project logs in once as `standard_user` and saves the
session to `.auth/standard_user.json`. Then the `chromium` and `firefox` projects run
every spec in parallel, reusing that session. Expected tail of a green run:

```
Running 57 tests using 8 workers
  ...
  57 passed (22.0s)

To open last HTML report run:

  npx playwright show-report
```

(57 = the full suite across both browsers, plus the one-time auth setup. Exact
worker count and timings vary by machine; the point is a passing summary line.)

### Useful variants

```bash
npm run test:chromium      # one browser only (faster feedback loop)
npm run test:firefox
npm run test:headed        # watch it run in a real browser window
npm run test:ui            # Playwright's interactive UI mode
```

### Run a specific file

```bash
npx playwright test tests/checkout/checkout.spec.ts
```

### Run a specific test by name

```bash
npx playwright test -g "completes the full 3-step checkout flow"
```

### Run against a single browser + one file (common while developing)

```bash
npx playwright test tests/cart/cart.spec.ts --project=chromium
```

### Watch it run (headed, slow-motion)

To actually *see* the browser drive itself (useful for demos/debugging), run a single
spec headed with a pause between each action:

```bash
npm run test:demo -- tests/checkout/checkout.spec.ts
```

`test:demo` runs Chromium headed, single-worker, with `SLOWMO=1000` (1s between actions).
Adjust the delay by setting `SLOWMO` yourself, e.g. `SLOWMO=2000 npx playwright test <file>
--project=chromium --headed --workers=1`. `SLOWMO` defaults to 0, so normal and CI runs are
unaffected.

---

## 3. Viewing the HTML report

After any run:

```bash
npx playwright show-report
# or
npm run report
```

This opens the report from `playwright-report/`. Failed tests include the
**only-on-failure screenshot**, a **trace** (captured on first retry), and a **video**
(retained on failure) — all written under `test-results/`.

---

## 4. Project structure

```
.
├── playwright.config.ts        # baseURL, projects, timeouts, reporters, parallelism
├── llm/                        # skill.md — onboarding brief for an AI agent (see §7)
├── tests/
│   ├── auth.setup.ts           # one-time login → saves storageState (setup project)
│   ├── auth/                   # login (logged-out) + logout (burger menu)
│   ├── catalogue/              # grid, sorting, product detail, problem_user images
│   ├── cart/                   # add/remove, count badge
│   ├── checkout/               # full 3-step flow, validation, error_user resilience
│   └── performance/            # performance_glitch_user load budget (Task B)
└── src/
    ├── pages/                  # one Page Object per screen (BasePage + subclasses)
    ├── components/             # HeaderComponent (cart badge + burger/logout)
    ├── fixtures/               # test.extend — injects Page Objects; logged-out variant
    └── data/                   # users, products, checkout test data (typed, centralised)
```

---

## 5. Design decisions

**POM structure.** Every screen is a Page Object extending a thin `BasePage` (shared
`page` handle + navigation). Selectors and interactions live in the page class; specs
only express intent. The recurring top bar is factored into a `HeaderComponent`
(composition over inheritance) so the cart badge and logout aren't duplicated across
pages. Page Objects are delivered to specs through a `test.extend` fixture, so tests
never manually construct objects or thread `page` around.

**Test isolation.** `fullyParallel: true` runs individual tests across workers, each in
its own browser context — SauceDemo state is scoped to the session cookie, so carts and
checkouts never bleed between tests. Authentication is done **once** in a `setup` project
that saves `storageState`; the browser projects depend on it and start pre-authenticated,
which is both faster and more reliable than logging in per test. Specs that must be
logged-out (login errors, locked-out/problem/error/performance users) use a
`loggedOutTest` fixture that discards the shared state and authenticates as the specific
account they need.

**Config choices.** `baseURL` centralises the host; `retries: 1` only in CI (via
`process.env.CI`) absorbs shared-app flakiness without hiding local bugs; timeouts are
raised above defaults (test 45s / expect 10s / action 15s) specifically because
`performance_glitch_user` injects multi-second delays — see the inline justification in
`playwright.config.ts`.

**Validating app behaviour.** The brief describes
`error_user` as having "intermittent form errors on checkout". Before writing an assertion
I probed the live app (5 scripted checkout runs) and found the real behaviour: step one
(customer info) always succeeds, but the **Finish** button on step two is a *silent no-op* —
no confirmation, no error, the user is simply stranded on the overview page. So its test
classifies the terminal state and asserts the invariants that matter (never a false success;
never an unknown/crashed state), recognising the silent no-op as the documented defect. This
kind of "verify what the app actually does" check is exactly what I'd apply to LLM output too.

**Trade-offs given the time constraint.** I standardised on `data-test` attributes (SauceDemo
provides them) for resilient selectors. I used the built-in HTML reporter rather than adding
Allure — one clear, zero-config report is enough at this scope; Allure would be the next step
if we needed historical trends or richer categorisation.

---

## 6. Onboarding a Junior Engineer

_(Task B — how I'd bring a new team member onto this suite.)_

I'd start a junior with a guided read of the layout top-down: `playwright.config.ts` to
see how projects, auth setup, and parallelism fit together, then one full vertical slice —
`checkout.spec.ts` → the checkout Page Objects → the `data/` files it consumes — so they
see intent, mechanism, and test data as one story. The rule I'd teach first is the POM
boundary: **specs describe behaviour, Page Objects own selectors and interactions.** If a
test contains a raw CSS selector, it belongs in a page class. Their first task would be a
small, well-scoped addition (e.g. a "continue shopping" cart test) so they exercise the
fixtures and assertions on rails before touching shared code.

Documentation I'd add for them: a short `CONTRIBUTING.md` with our selector policy (prefer
`data-test`, then roles/text, never brittle nth-child chains), a naming convention for
specs, and a "how to debug a failure" note pointing at `--ui`, `--headed`, `--debug`, and
the trace viewer — the fastest way to build confidence is teaching them to *watch* a test
run and read a trace, not just read code.

On **preventing test-data pollution in a shared public environment** like SauceDemo: the
core discipline is that no test may depend on state left by another. Concretely — each test
gets a fresh browser context (already the default), we never assert on global counts that
other runs could change, and we treat the app as reset-per-session via the cookie rather
than assuming a clean database. I'd teach them to build their own preconditions inside the
test (add the items you need, don't assume an empty cart from "before"), to avoid hard-coded
IDs that could collide, and — for any suite that *did* create persistent data — to clean up
in `afterEach` and namespace test data with a unique run ID. Because SauceDemo is stateless
per session, our main safeguard is simply strict isolation and self-contained setup, and
that habit transfers directly to client environments where data pollution is a real cost.

---

## 7. LLM usage & AI onboarding

For **ongoing** AI-assisted work, [`llm/skill.md`](./llm/skill.md) is a self-contained
onboarding brief that teaches another AI agent (or a new engineer) how this project is
structured: the POM boundary, the fixture/auth model, the selector and test-data
conventions, the commands, the verified behavioural gotchas of the edge-case accounts,
and recipes for adding a new Page Object or test. Point an agent at that file first so it
can work productively without re-deriving the architecture — and keep it updated when the
code changes.
