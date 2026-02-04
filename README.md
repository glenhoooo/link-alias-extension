# Link Alias Extension

A simple, local-first Chrome extension to manage and use URL aliases. Boost your productivity by navigating to your favorite links with short keywords directly from the address bar.

## Features

- **🚀 Omnibox Support**: Type `@` and a space in the address bar, then your alias to jump.
- **⚡️ Smart Templates**: Support for dynamic arguments.
    - `{q}`: All arguments joined by space.
    - `{0}`, `{1}`: Positional arguments.
- **📌 Quick Add**: Uses the Popup to quickly add the current page as an alias.
- **📝 Management**: Clean Options page to view, add, and delete aliases.
- **🔒 Local First**: All data is stored locally in your browser (`chrome.storage.local`).
- **🌍 i18n**: Supports English and Simplified Chinese.

## Usage

### Address Bar (Omnibox)

1.  Type `@` and press `Space` or `Tab`.
2.  Enter your alias and arguments.
    - Example: `g hello world` (if alias `g` -> `https://google.com/search?q={q}`)
3.  Press `Enter`.

### Popup

1.  Click the extension icon in the toolbar.
2.  **Add Current**: The current URL and suggested alias are pre-filled. Click "Add" to save.
3.  **View List**: See your existing aliases.
4.  **Options**: Click "Open Options" for full management.

### Templates Examples

- **Google Search**:
    - Alias: `g`
    - URL: `https://google.com/search?q={q}`
    - Usage: `@ g react hooks` -> `https://google.com/search?q=react%20hooks`

- **GitHub Repository**:
    - Alias: `gh`
    - URL: `https://github.com/{0}/{1}`
    - Usage: `@ gh facebook react` -> `https://github.com/facebook/react`

## Development

This project is built with [React](https://reactjs.org/), [Vite](https://vitejs.dev/), [TypeScript](https://www.typescriptlang.org/), and [Tailwind CSS](https://tailwindcss.com/).

### Installation

1.  Clone the repository.
2.  Install dependencies:
    ```bash
    pnpm install
    ```

### Running in Development Mode

1.  Start the dev server:
    ```bash
    pnpm dev
    ```
2.  Open Chrome and navigate to `chrome://extensions`.
3.  Enable "Developer mode".
4.  Click "Load unpacked" and select the `dist` folder.

### Building for Production

1.  Build the extension:
    ```bash
    pnpm build
    ```
2.  The output will be in the `dist` folder.

## License

MIT
