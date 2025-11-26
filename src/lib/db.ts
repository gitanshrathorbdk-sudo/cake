import Dexie, { type Table } from 'dexie';
import type { Playlist } from './types';

// This type represents the structure stored in IndexedDB.
// It should only contain data that can be persisted.
export type SongDB = {
  id?: number;
  title: string;
  artist: string;
  characteristics: string[];
  file: File;
}

export class HarmonicaDB extends Dexie {
  songs!: Table<SongDB>; 
  playlists!: Table<Playlist>;

  constructor() {
    super('harmonicaDB');
    this.version(2).stores({
      songs: '++id, title, artist',
      playlists: '++id, name'
    }).upgrade(tx => {
      // This is to satisfy the linter if no changes are made to schema.
      // If you are changing schema, you'd perform upgrade operations here.
      return tx.table('playlists').count();
    });

    // Handle initial schema creation for users who have version 1
    this.version(1).stores({
        songs: '++id, title, artist'
    });
  }
}

export const db = new HarmonicaDB();
