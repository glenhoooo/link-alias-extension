import { readFileSync } from 'node:fs';
import type { ManifestType } from '@extension/shared';

const packageJson = JSON.parse(readFileSync('./package.json', 'utf8'));

/**
 * @prop default_locale
 * if you want to support multiple languages, you can use the following reference
 * https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Internationalization
 *
 * @prop browser_specific_settings
 * Must be unique to your extension to upload to addons.mozilla.org
 * (you can delete if you only want a chrome extension)
 *
 * @prop permissions
 * Firefox doesn't support sidePanel (It will be deleted in manifest parser)
 *
 * @prop content_scripts
 * css: ['content.css'], // public folder
 */
const manifest = {
  manifest_version: 3,
  default_locale: 'en',
  name: 'Link Alias',
  version: packageJson.version,
  description: 'Local-first alias (go links) with omnibox @ trigger.',
  host_permissions: ['*://www.google.com/*', '*://www.bing.com/*', '*://duckduckgo.com/*'],
  permissions: [
    'storage',
    'tabs',
    'declarativeNetRequest',
    'declarativeNetRequestWithHostAccess',
    'declarativeNetRequestFeedback',
  ],
  options_page: 'options/index.html',
  omnibox: { keyword: '@' },
  background: {
    service_worker: 'background.js',
    type: 'module',
  },
  action: {
    default_title: 'Aliases',
    default_popup: 'popup/index.html',
    default_icon: {
      '16': 'icons/icon-16.png',
      '32': 'icons/icon-48.png',
      '48': 'icons/icon-48.png',
      '128': 'icons/icon-128.png',
    },
  },
  icons: {
    '16': 'icons/icon-16.png',
    '32': 'icons/icon-48.png',
    '48': 'icons/icon-48.png',
    '128': 'icons/icon-128.png',
  },
} satisfies ManifestType;

export default manifest;
