# Experiments / Fast UI

The portfolio has a dedicated `#experiments` section, a sidebar navigation entry,
and a command-palette entry. Its documentation includes Overview, Installation,
Components, Theming, and Status. It describes Fast UI 0.1.0 as experimental and
limits compatibility claims to tested Dioxus 0.7.10 browser behavior.

## Source of truth

The independent library is the existing Codex project at:

`/Users/sreevedvp/Documents/ChatGPT/dioxus-complib`

FastMedium contains only installed consumer components in `src/ui`. There is no
nested library workspace or machine-specific Cargo dependency in FastMedium.

## Update the playground and download

From the library project:

```sh
python3 scripts/export_portfolio.py /Users/sreevedvp/Downloads/portfolio/public/experiments/fast-ui
```

The exporter compiles `examples/playground` to a release WASM app, exports its
static assets, and creates `fast-ui-0.1.0.zip` with checksums in `release.json`.
The iframe and full-view link use the explicit `playground/index.html` entry,
so the React dev server does not fall back to the portfolio's own index page.
No separate backend or external running gallery server is required. The bundle
expects hosting at the domain root under `/experiments/fast-ui/playground/`.

Source downloads are local artifacts, not links to an unpublished remote repo
or an unavailable crates.io release. The archive contains the standalone source,
examples, tests, and README; no build cache or environment files are included.

## Verify

```sh
npm run lint
npm run build
npm test
```

With a local portfolio preview running, and Playwright available to Node:

```sh
PORTFOLIO_URL=http://127.0.0.1:3016 node tests/experiments.browser.cjs
```

Set `SCREENSHOT_DIR` to choose a screenshot folder. The browser test uses an
installed Chrome browser by default; use `PLAYWRIGHT_CHANNEL=chromium` for a
Playwright-provided Chromium installation. It checks navigation, documentation,
clipboard examples, source download, live Rust interactions, theme switching,
and mobile layout. The portfolio's existing 16 tests are unchanged.

No production deployment is performed by the export or preview workflow.
