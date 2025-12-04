import { isLikelyAliasQuery } from "../../lib/alias";

const statusEl = document.getElementById("status") as HTMLParagraphElement;
const actionsEl = document.getElementById("actions") as HTMLDivElement;
const goOptionsBtn = document.getElementById("goOptions") as HTMLButtonElement;

goOptionsBtn.onclick = () => chrome.runtime.openOptionsPage();

(async function main() {
  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (!tab?.id) return showError("No active tab id.");

    const resp = await chrome.runtime.sendMessage({
      type: "get-last-search-url",
      tabId: tab.id,
    });
    const original: string | null = resp?.value ?? null;
    if (!original)
      return showError(
        "No captured search URL. Try input @alias in Google/Bing/DDG."
      );

    const q = extractSearchQuery(original);
    if (!isLikelyAliasQuery(q)) return showError(`Not an alias query: ${q}`);

    const resolved = await chrome.runtime.sendMessage({
      type: "resolve-alias",
      raw: q,
    });
    const result = resolved?.result;
    if (!result?.found || !result?.targets?.length)
      return showError(`Alias not found: ${q}`);

    statusEl.textContent = `Opening @${result.key}…`;
    await chrome.runtime.sendMessage({
      type: "open-targets",
      tabId: tab.id,
      targets: result.targets,
      openMode: "currentTab",
    });
  } catch (e: any) {
    showError(String(e?.message || e));
  }
})();

function showError(msg: string) {
  statusEl.textContent = msg;
  actionsEl.classList.remove("hidden");
}

function extractSearchQuery(url: string): string {
  try {
    const u = new URL(url);
    return u.searchParams.get("q") || u.searchParams.get("query") || "";
  } catch {
    return "";
  }
}
