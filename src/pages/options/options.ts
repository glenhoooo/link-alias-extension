import { normalizeKey } from "../../lib/storage";

type Store = { aliases: Record<string, { targets: string[] }> };

const el = {
  key: document.getElementById("key") as HTMLInputElement,
  targets: document.getElementById("targets") as HTMLTextAreaElement,
  save: document.getElementById("save") as HTMLButtonElement,
  reset: document.getElementById("reset") as HTMLButtonElement,
  exportBtn: document.getElementById("export") as HTMLButtonElement,
  file: document.getElementById("file") as HTMLInputElement,
  exportOut: document.getElementById("exportOut") as HTMLPreElement,
  filter: document.getElementById("filter") as HTMLInputElement,
  list: document.getElementById("list") as HTMLDivElement,
};

el.save.onclick = async () => {
  const key = normalizeKey(el.key.value);
  const targets = String(el.targets.value || "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
  if (!key) return;
  await chrome.runtime.sendMessage({
    type: "upsert-alias",
    alias: { key, targets },
  });
  await render();
};

el.reset.onclick = () => {
  el.key.value = "";
  el.targets.value = "";
};

el.exportBtn.onclick = async () => {
  const resp = await chrome.runtime.sendMessage({ type: "export-store" });
  el.exportOut.textContent = JSON.stringify(resp.store, null, 2);
};

el.file.onchange = async () => {
  const f = el.file.files?.[0];
  if (!f) return;
  const text = await f.text();
  const store = JSON.parse(text);
  const resp = await chrome.runtime.sendMessage({
    type: "import-store",
    store,
  });
  if (!resp.ok) alert(resp.error || "Import failed");
  await render();
};

el.filter.oninput = () => void render();

async function render() {
  const resp = await chrome.runtime.sendMessage({ type: "export-store" });
  const store: Store = resp?.store ?? { aliases: {} };

  const filter = String(el.filter.value || "").toLowerCase();
  const entries = Object.entries(store.aliases)
    .filter(([k]) => !filter || k.includes(filter))
    .sort(([a], [b]) => a.localeCompare(b));

  el.list.innerHTML = "";
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

    const editBtn = document.createElement("button");
    editBtn.className = "btn small";
    editBtn.textContent = "Edit";
    editBtn.onclick = () => {
      el.key.value = k;
      el.targets.value = (alias.targets ?? []).join("\n");
      window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const delBtn = document.createElement("button");
    delBtn.className = "btn small ghost";
    delBtn.textContent = "Delete";
    delBtn.onclick = async () => {
      await chrome.runtime.sendMessage({ type: "delete-alias", key: k });
      await render();
    };

    right.append(editBtn, delBtn);
    row.append(left, right);
    el.list.append(row);
  }
}

render();
