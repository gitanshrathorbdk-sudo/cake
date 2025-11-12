import Dexie, { type Table } from 'dexie';

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

  constructor() {
    super('harmonicaDB');
    this.version(1).stores({
      songs: '++id, title, artist',
    });
  }
}

export const db = new HarmonicaDB();
