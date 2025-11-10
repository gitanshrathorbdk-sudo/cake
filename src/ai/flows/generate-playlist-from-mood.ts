'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating a playlist based on a specified mood.
 *
 * It includes:
 * - generatePlaylistFromMood: The main function to generate a playlist based on mood.
 * - GeneratePlaylistFromMoodInput: The input type for the generatePlaylistFromMood function.
 * - GeneratePlaylistFromMoodOutput: The output type for the generatePlaylistFromMood function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePlaylistFromMoodInputSchema = z.object({
  mood: z.string().describe('The desired mood for the playlist (e.g., happy, sad, energetic).'),
  numberOfSongs: z.number().int().min(5).max(20).default(10).describe('The number of songs to include in the playlist.'),
});
export type GeneratePlaylistFromMoodInput = z.infer<typeof GeneratePlaylistFromMoodInputSchema>;

const GeneratePlaylistFromMoodOutputSchema = z.object({
  playlist: z.array(
    z.object({
      title: z.string().describe('The title of the song.'),
      artist: z.string().describe('The artist of the song.'),
      genre: z.string().describe('The genre of the song.'),
      mood: z.string().describe('The mood of the song.'),
    })
  ).describe('A list of songs that match the specified mood.'),
});
export type GeneratePlaylistFromMoodOutput = z.infer<typeof GeneratePlaylistFromMoodOutputSchema>;

export async function generatePlaylistFromMood(input: GeneratePlaylistFromMoodInput): Promise<GeneratePlaylistFromMoodOutput> {
  return generatePlaylistFromMoodFlow(input);
}

const generatePlaylistPrompt = ai.definePrompt({
  name: 'generatePlaylistPrompt',
  input: {schema: GeneratePlaylistFromMoodInputSchema},
  output: {schema: GeneratePlaylistFromMoodOutputSchema},
  prompt: `You are a playlist curator. A user wants to create a playlist with a certain mood.

  Create a playlist with {{numberOfSongs}} songs that match the following mood: {{mood}}.

  Return a JSON array of songs with title, artist, genre, and mood fields.

  Make sure that the mood of each song aligns with the user provided mood.
  `,
});

const generatePlaylistFromMoodFlow = ai.defineFlow(
  {
    name: 'generatePlaylistFromMoodFlow',
    inputSchema: GeneratePlaylistFromMoodInputSchema,
    outputSchema: GeneratePlaylistFromMoodOutputSchema,
  },
  async input => {
    const {output} = await generatePlaylistPrompt(input);
    return output!;
  }
);
