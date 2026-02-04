import 'webextension-polyfill';
import { exampleThemeStorage, aliasStorage } from '@extension/storage';

exampleThemeStorage.get().then(theme => {
  console.log('theme', theme);
});

console.log('background loaded');

chrome.omnibox.onInputEntered.addListener(async text => {
  const args = text.trim().split(/\s+/);
  const aliasKey = args[0];
  const params = args.slice(1);

  const { aliases } = await aliasStorage.get();
  const alias = aliases.find(a => a.alias === aliasKey);

  if (alias) {
    let url = alias.url;

    // Replace {q} or {{q}} with all params joined by space
    const query = params.join(' ');
    url = url.replace(/\{q\}|\{\{q\}\}/g, query);

    // Replace positional args {0}, {1} etc or {arg0}, {arg1}
    params.forEach((param, index) => {
      url = url.replace(new RegExp(`\\{${index}\\}|\\{arg${index}\\}`, 'g'), param);
    });

    chrome.tabs.update({ url });
  } else {
    // Optional: Search with default engine or show notification
    // For now, let's open google if no alias matches but there is content,
    // or just do nothing/notify.
    // User request didn't specify fallback.
    // Let's assume strict alias matching for now.
    console.log(`No alias found for: ${aliasKey}`);
  }
});
