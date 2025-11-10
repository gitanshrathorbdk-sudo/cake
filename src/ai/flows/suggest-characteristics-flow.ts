'use server';
/**
 * @fileOverview An AI flow to suggest characteristics for a song.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestCharacteristicsInputSchema = z.object({
  title: z.string().describe('The title of the song.'),
  artist: z.string().describe('The artist of the song.'),
});

type SuggestCharacteristicsInput = z.infer<typeof SuggestCharacteristicsInputSchema>;

const SuggestCharacteristicsOutputSchema = z.array(z.string()).describe('A list of 10 descriptive characteristics for the song.');

type SuggestCharacteristicsOutput = z.infer<typeof SuggestCharacteristicsOutputSchema>;


const prompt = ai.definePrompt({
    name: 'suggestCharacteristicsPrompt',
    input: { schema: SuggestCharacteristicsInputSchema },
    output: { schema: SuggestCharacteristicsOutputSchema },
    prompt: `Based on the song title "{{title}}" by "{{artist}}", generate a list of 10 descriptive characteristics. These can include genre, mood, instrumentation, tempo, or other relevant tags. Present them as a simple array of strings.`,
});

const suggestCharacteristicsFlow = ai.defineFlow(
    {
        name: 'suggestCharacteristicsFlow',
        inputSchema: SuggestCharacteristicsInputSchema,
        outputSchema: SuggestCharacteristicsOutputSchema,
    },
    async (input) => {
        const { output } = await prompt(input);
        return output!;
    }
);

export async function suggestCharacteristics(input: SuggestCharacteristicsInput): Promise<SuggestCharacteristicsOutput> {
  return suggestCharacteristicsFlow(input);
}
