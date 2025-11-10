'use server';

import {
  generatePlaylistFromMood,
  type GeneratePlaylistFromMoodInput,
} from '@/ai/flows/generate-playlist-from-mood';

export async function generatePlaylist(input: GeneratePlaylistFromMoodInput) {
  try {
    const result = await generatePlaylistFromMood(input);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error generating playlist:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { success: false, error: `Failed to generate playlist. ${errorMessage}` };
  }
}
