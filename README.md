# link-alias

Local-first link aliases (“go links”) for Chrome. Create `@aliases` that jump to one or multiple URLs, with optional argument templating. No server required.

> Examples
>
> - `@ work` → opens your team dashboard
> - `@ docs` → opens multiple documentation tabs
> - `@ g hello world` → opens `https://www.google.com/search?q=hello%20world`
> - `@ jira ABC-123` → opens `https://jira.example.com/browse/ABC-123`

---

## Features

- **Local-first storage**: aliases live in your browser (no external backend).
- **Two ways to launch**
  - **Omnibox keyword**: type `@` then **space**, then your alias (e.g. `@ work`).
  - **Search-bar shortcut (Google/Bing/DuckDuckGo)**: type `@alias ...` in the address bar and press Enter (works when your default search engine is one of these).
- **One alias → multiple URLs** (opens multiple tabs).
- **Arguments & templating**
  - Use `{q}` for all arguments joined by spaces.
  - Use `{arg0}`, `{arg1}` (or `{0}`, `{1}`) to address individual arguments.
- **Popup quick add**: add an alias and optionally fill the current tab’s URL.
- **Options page**: manage aliases and import/export JSON.

## Usage

### 1) Use in the address bar via Omnibox

1. Type `@`

2. Press `Space`

3. Type your alias and arguments

4. Press `Enter`

Examples:

- `@ work`
- `@ g hello world`
- `@ jira ABC-123`

### 2) Use by typing @alias as a search query

If your default search engine is **Google / Bing / DuckDuckGo**, you can type:

- `@work`
- `@g hello world`

…and press Enter.

## Alias Templates

Templates are plain URLs with tokens:

- `{q}` or `{{q}}`: all arguments joined with spaces
- `{arg0}`, `{arg1}` … or `{0}`, `{1}` …: positional args

## Install

### From Chrome Web Store

Coming soon.

```

```

## Development

### Commands

- Build once:

```bash
npm run build
```

- Watch mode (rebuild on changes):

```bash
npm run dev
```

Then refresh the extension on chrome://extensions.
