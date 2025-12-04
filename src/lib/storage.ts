export const STORE_KEY = "linkas_store_v1" as const;

export type Alias = {
  key: string; // internal store: no leading "@"
  targets: string[];
  createdAt: number;
  updatedAt: number;
};

export type Store = {
  aliases: Record<string, Alias>;
  meta: { version: 1 };
};

export function normalizeKey(key: string): string {
  return String(key ?? "")
    .trim()
    .replace(/^@+/, "")
    .toLowerCase();
}

export async function getStore(): Promise<Store> {
  const obj = await chrome.storage.local.get(STORE_KEY);
  const store = (obj[STORE_KEY] as Store | undefined) ?? {
    aliases: {},
    meta: { version: 1 },
  };
  store.aliases ??= {};
  store.meta ??= { version: 1 };
  return store;
}

export async function setStore(store: Store): Promise<void> {
  await chrome.storage.local.set({ [STORE_KEY]: store });
}

export async function upsertAlias(input: {
  key: string;
  targets: string[];
}): Promise<Alias> {
  const store = await getStore();
  const key = normalizeKey(input.key);
  const now = Date.now();
  const existing = store.aliases[key];

  const alias: Alias = {
    key,
    targets: (input.targets ?? []).filter(Boolean),
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };

  store.aliases[key] = alias;
  await setStore(store);
  return alias;
}

export async function deleteAlias(key: string): Promise<void> {
  const store = await getStore();
  const k = normalizeKey(key);
  delete store.aliases[k];
  await setStore(store);
}
