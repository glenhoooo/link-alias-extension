import { createStorage, StorageEnum } from '../base/index.js';
import type { BaseStorageType } from '../base/types.js';

export interface Alias {
  alias: string;
  url: string;
}

export interface AliasStorageState {
  aliases: Alias[];
}

export type AliasStorageAction = {
  add: (alias: string, url: string) => Promise<void>;
  remove: (alias: string) => Promise<void>;
  update: (oldAlias: string, newAlias: string, url: string) => Promise<void>;
};

export type AliasStorage = BaseStorageType<AliasStorageState> & AliasStorageAction;

const storage = createStorage<AliasStorageState>(
  'alias-storage-key',
  {
    aliases: [],
  },
  {
    storageEnum: StorageEnum.Local,
    liveUpdate: true,
  },
);

export const aliasStorage: AliasStorage = {
  ...storage,
  add: async (alias: string, url: string) => {
    await storage.set(currentState => {
      // Check for duplicates? For now just append.
      // ideally we should check if alias already exists.
      const exists = currentState.aliases.some(a => a.alias === alias);
      if (exists) {
        // For simplicity in this mvp, we might overwrite or just return
        // Let's replace if exists
        return {
          aliases: [...currentState.aliases.filter(a => a.alias !== alias), { alias, url }],
        };
      }
      return {
        aliases: [...currentState.aliases, { alias, url }],
      };
    });
  },
  remove: async (alias: string) => {
    await storage.set(currentState => ({
      aliases: currentState.aliases.filter(a => a.alias !== alias),
    }));
  },
  update: async (oldAlias: string, newAlias: string, url: string) => {
    await storage.set(currentState => {
      const filtered = currentState.aliases.filter(a => a.alias !== oldAlias);
      return {
        aliases: [...filtered, { alias: newAlias, url }],
      };
    });
  },
};
