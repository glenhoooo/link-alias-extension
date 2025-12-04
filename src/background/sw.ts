import { getStore, upsertAlias, deleteAlias, Store } from "../lib/storage";
import { parseAliasInput, resolveTargets } from "../lib/alias";

const LAST_SEARCH_BY_TAB = "linkas_last_search_by_tab_v1" as const;
const DNR_RULE_ID = 1001;

type Msg =
  | { type: "get-last-search-url"; tabId: number }
  | { type: "resolve-alias"; raw: string }
  | {
      type: "open-targets";
      tabId: number;
      targets: string[];
      openMode: "currentTab" | "newActiveTab" | "newInactiveTab";
    }
  | { type: "upsert-alias"; alias: { key: string; targets: string[] } }
  | { type: "delete-alias"; key: string }
  | { type: "export-store" }
  | { type: "import-store"; store: Store };

chrome.runtime.onInstalled.addListener(async () => {
  await ensureDefaultData();
  await installDnrRules();
});

chrome.runtime.onStartup.addListener(async () => {
  await installDnrRules();
});

async function ensureDefaultData() {
  const store = await getStore();
  if (Object.keys(store.aliases).length === 0) {
    await upsertAlias({ key: "work", targets: ["https://example.com"] });
    await upsertAlias({
      key: "g",
      targets: ["https://www.google.com/search?q={q}"],
    });
  }
}

async function installDnrRules() {
  const rule: chrome.declarativeNetRequest.Rule = {
    id: DNR_RULE_ID,
    priority: 1,
    action: {
      type: "redirect",
      redirect: { extensionPath: "/pages/resolve/index.html" },
    },
    condition: {
      resourceTypes: ["main_frame"],
      regexFilter:
        "^(https?://(www\\.)?google\\.com/search\\?.*([&?])q=|https?://(www\\.)?bing\\.com/search\\?.*([&?])q=|https?://duckduckgo\\.com/\\?.*([&?])q=|https?://duckduckgo\\.com/\\?.*([&?])query=).*$",
    },
  };

  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [DNR_RULE_ID],
    addRules: [rule],
  });
}

// 记录原始请求 URL（DNR 拦截时可用）
chrome.declarativeNetRequest.onRuleMatchedDebug.addListener(async (info) => {
  try {
    const tabId = info.tabId;
    const url = info.request.url;
    if (!Number.isInteger(tabId) || !url) return;

    const obj = await chrome.storage.session.get(LAST_SEARCH_BY_TAB);
    const map =
      (obj[LAST_SEARCH_BY_TAB] as
        | Record<string, { url: string; at: number }>
        | undefined) ?? {};
    map[String(tabId)] = { url, at: Date.now() };
    await chrome.storage.session.set({ [LAST_SEARCH_BY_TAB]: map });
  } catch {
    // ignore
  }
});

// Omnibox
chrome.omnibox.onInputChanged.addListener(async (text, suggest) => {
  const store = await getStore();
  const q = String(text || "").toLowerCase();

  const hits = Object.keys(store.aliases)
    .filter((k) => k.includes(q))
    .slice(0, 8)
    .map((k) => ({
      content: k, // 输入框中回填内容
      description: `@${k} → ${truncate(
        store.aliases[k]?.targets?.[0] ?? "",
        60
      )}`,
    }));

  suggest(hits);
});

chrome.omnibox.onInputEntered.addListener(async (text, disposition) => {
  const tab = await getActiveTab();
  if (!tab?.id) return;
  const raw = "@" + String(text || "");
  const openMode =
    disposition === "newForegroundTab"
      ? "newActiveTab"
      : disposition === "newBackgroundTab"
      ? "newInactiveTab"
      : "currentTab";
  const resolved = await resolveAliasRaw(raw);
  if (!resolved.found || resolved.targets.length === 0) return;
  await openTargets(tab.id, resolved.targets, openMode);
});

// Message API
chrome.runtime.onMessage.addListener((msg: Msg, _sender, sendResponse) => {
  (async () => {
    switch (msg.type) {
      case "get-last-search-url": {
        const obj = await chrome.storage.session.get(LAST_SEARCH_BY_TAB);
        const map =
          (obj[LAST_SEARCH_BY_TAB] as
            | Record<string, { url: string; at: number }>
            | undefined) ?? {};
        sendResponse({ ok: true, value: map[String(msg.tabId)]?.url ?? null });
        return;
      }
      case "resolve-alias": {
        const result = await resolveAliasRaw(msg.raw);
        sendResponse({ ok: true, result });
        return;
      }
      case "open-targets": {
        await openTargets(msg.tabId, msg.targets, msg.openMode);
        sendResponse({ ok: true });
        return;
      }
      case "upsert-alias": {
        const alias = await upsertAlias(msg.alias);
        sendResponse({ ok: true, alias });
        return;
      }
      case "delete-alias": {
        await deleteAlias(msg.key);
        sendResponse({ ok: true });
        return;
      }
      case "export-store": {
        const store = await getStore();
        sendResponse({ ok: true, store });
        return;
      }
      case "import-store": {
        const store = msg.store;
        store.aliases ??= {};
        store.meta ??= { version: 1 };
        await chrome.storage.local.set({ linkas_store_v1: store });
        sendResponse({ ok: true });
        return;
      }
      default:
        sendResponse({ ok: false, error: "Unknown message" });
    }
  })();

  return true;
});

async function resolveAliasRaw(
  raw: string
): Promise<{ found: boolean; key: string; args: string[]; targets: string[] }> {
  const store = await getStore();
  const { key, args } = parseAliasInput(raw);
  const alias = store.aliases[key];
  if (!alias) return { found: false, key, args, targets: [] };
  return { found: true, key, args, targets: resolveTargets(alias, args) };
}

async function openTargets(
  tabId: number,
  targets: string[],
  openMode: "currentTab" | "newActiveTab" | "newInactiveTab"
) {
  const list = (targets ?? []).filter(Boolean);
  if (!list.length) return;

  const [first, ...rest] = list;

  if (openMode === "currentTab") {
    await chrome.tabs.update(tabId, { url: first });
  } else {
    await chrome.tabs.create({
      url: first,
      active: openMode === "newActiveTab",
    });
  }
  for (const url of rest) {
    await chrome.tabs.create({ url, active: false });
  }
}

async function getActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab ?? null;
}

function truncate(s: string, n: number) {
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}
