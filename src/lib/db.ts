import Dexie, { type Table } from 'dexie';

// This type represents the structure stored in IndexedDB for songs.
export type SongDB = {
  id?: number;
  title: string;
  artist: string;
  characteristics: string[];
  file: File;
}

// Playlist is no longer stored in Dexie
// export type Playlist = {
//   id?: number;
//   name: string;
//   songIds: number[];
// };

export class HarmonicaDB extends Dexie {
  songs!: Table<SongDB>; 
  // playlists!: Table<Playlist>; // Playlists are now in Firestore

  constructor() {
    super('harmonicaDB');
    
    // Version 3: Remove playlists table
    this.version(3).stores({
      songs: '++id, title, artist'
    }).upgrade(tx => {
       // Dexie automatically handles table removal, this is for explicit migration tasks if any
      return tx.table('songs').count();
    });

    // Version 2: Added playlists table
    this.version(2).stores({
      songs: '++id, title, artist',
      // Playlists table existed in this version
      playlists: '++id, name' 
    });

    // Version 1: Initial schema
    this.version(1).stores({
        songs: '++id, title, artist'
    });
  }
}

export const db = new HarmonicaDB();
