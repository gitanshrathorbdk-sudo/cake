'use server';
/**
 * @fileOverview An AI flow to generate a playlist from a list of available songs.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SongInfoSchema = z.object({
    title: z.string(),
    artist: z.string(),
    characteristics: z.string().describe('A comma-separated list of tags, genres, and moods.'),
});

const GeneratePlaylistInputSchema = z.object({
  availableSongs: z.array(SongInfoSchema),
  prompt: z.string().describe('The user\'s request for the playlist, e.g., "a workout mix"'),
  count: z.number().describe('The desired number of songs in the playlist.'),
});

export type GeneratePlaylistInput = z.infer<typeof GeneratePlaylistInputSchema>;

const PlaylistSongSchema = z.object({
    title: z.string(),
    artist: z.string(),
    reason: z.string().describe('A brief explanation for why this song was chosen for the playlist.'),
});

const GeneratePlaylistOutputSchema = z.object({
  songs: z.array(PlaylistSongSchema),
});

export type GeneratePlaylistOutput = z.infer<typeof GeneratePlaylistOutputSchema>;


const prompt = ai.definePrompt({
    name: 'generatePlaylistPrompt',
    input: { schema: GeneratePlaylistInputSchema },
    output: { schema: GeneratePlaylistOutputSchema },
    prompt: `You are a helpful AI playlist curator. Based on the user's prompt, select {{count}} songs from the provided list of available songs to create a playlist.

User prompt: "{{prompt}}"

Available songs:
{{#each availableSongs}}
- "{{title}}" by {{artist}} (Characteristics: {{characteristics}})
{{/each}}

Provide a reason for each song selection.`,
});

const generatePlaylistFlow = ai.defineFlow(
    {
        name: 'generatePlaylistFlow',
        inputSchema: GeneratePlaylistInputSchema,
        outputSchema: GeneratePlaylistOutputSchema,
    },
    async (input) => {
        const { output } = await prompt(input);
        return output!;
    }
);

export async function generatePlaylist(input: GeneratePlaylistInput): Promise<GeneratePlaylistOutput> {
  return generatePlaylistFlow(input);
}
