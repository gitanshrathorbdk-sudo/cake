import Dexie, { type Table } from 'dexie';

// This type represents the structure stored in IndexedDB for songs.
export type SongDB = {
  id?: number;
  title: string;
  artist: string;
  characteristics: string[];
  file: File;
}

export type PlaylistDB = {
  id?: number;
  name: string;
  songIds: number[];
  ownerName?: string;
};

export class HarmonicaDB extends Dexie {
  songs!: Table<SongDB>; 
  playlists!: Table<PlaylistDB>;

  constructor() {
    super('harmonicaDB');
    
    // Version 5: Added ownerName to playlists
    this.version(5).stores({
      songs: '++id, title, artist',
      playlists: '++id, name'
    });

    // Version 4: Re-introduce playlists table for private playlists
    this.version(4).stores({
      songs: '++id, title, artist',
      playlists: '++id, name'
    });
    
    // Version 3: Removed playlists table
    this.version(3).stores({
      songs: '++id, title, artist'
    }).upgrade(tx => {
       // Dexie automatically handles table removal, this is for explicit migration tasks if any
      return tx.table('songs').count();
    });

    // Version 2: Added playlists table (existed in this version)
    this.version(2).stores({
      songs: '++id, title, artist',
      playlists: '++id, name' 
    });

    // Version 1: Initial schema
    this.version(1).stores({
        songs: '++id, title, artist'
    });
  }
}

export const db = new HarmonicaDB();
