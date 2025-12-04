import { normalizeKey } from "../../lib/storage";

type Store = { aliases: Record<string, { targets: string[] }> };

const els = {
  openOptions: document.getElementById("openOptions") as HTMLButtonElement,
  key: document.getElementById("key") as HTMLInputElement,
  targets: document.getElementById("targets") as HTMLInputElement,
  save: document.getElementById("save") as HTMLButtonElement,
  fillCurrent: document.getElementById("fillCurrent") as HTMLButtonElement,
  search: document.getElementById("search") as HTMLInputElement,
  list: document.getElementById("list") as HTMLDivElement,
};

els.openOptions.addEventListener("click", () =>
  chrome.runtime.openOptionsPage()
);

els.fillCurrent.addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.url) els.targets.value = tab.url;
});

els.save.addEventListener("click", async () => {
  const key = normalizeKey(els.key.value);
  const targets = parseTargets(els.targets.value);
  if (!key) return;

  await chrome.runtime.sendMessage({
    type: "upsert-alias",
    alias: { key, targets },
  });
  els.key.value = "";
  await render();
});

els.search.addEventListener("input", () => void render());

function parseTargets(raw: string) {
  return String(raw || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

async function render() {
  const resp = await chrome.runtime.sendMessage({ type: "export-store" });
  const store: Store = resp?.store ?? { aliases: {} };

  const filter = String(els.search.value || "").toLowerCase();
  const entries = Object.entries(store.aliases)
    .filter(([k]) => !filter || k.includes(filter))
    .sort(([a], [b]) => a.localeCompare(b));

  els.list.innerHTML = "";
  for (const [k, alias] of entries) {
    const row = document.createElement("div");
    row.className = "item";

    const left = document.createElement("div");
    left.className = "col";

    const title = document.createElement("div");
    title.className = "itemTitle";
    title.textContent = "@" + k;

    const sub = document.createElement("div");
    sub.className = "muted small";
    sub.textContent = (alias.targets ?? []).join(", ");

    left.append(title, sub);

    const right = document.createElement("div");
    right.className = "row";

    const openBtn = document.createElement("button");
    openBtn.className = "btn small";
    openBtn.textContent = "Open";
    openBtn.onclick = async () => {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (!tab?.id) return;
      await chrome.runtime.sendMessage({
        type: "open-targets",
        tabId: tab.id,
        targets: alias.targets,
        openMode: "newActiveTab",
      });
      window.close();
    };

    const delBtn = document.createElement("button");
    delBtn.className = "btn small ghost";
    delBtn.textContent = "Delete";
    delBtn.onclick = async () => {
      await chrome.runtime.sendMessage({ type: "delete-alias", key: k });
      await render();
    };

    right.append(openBtn, delBtn);
    row.append(left, right);
    els.list.append(row);
  }
}

render();
