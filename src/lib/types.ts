

export type Song = {
  title: string;
  artist: string;
  fileUrl: string;
  characteristics: string[];
};

export type Playlist = {
  name: string;
  songs: Song[];
  type: 'manual' | 'ai';
};
