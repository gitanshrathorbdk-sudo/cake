export type Song = {
  title: string;
  artist: string;
  genre: string;
  mood: string;
};

export type Playlist = {
  name: string;
  songs: Song[];
};
