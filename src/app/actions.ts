'use server';

import { z } from 'zod';

const YOUTUBE_API_ENDPOINT = 'https://yt1d.com/en/videos/info';

const youtubeActionSchema = z.object({
  url: z.string().url('Please enter a valid YouTube URL.'),
});

type ActionState = {
  error?: string;
  title?: string;
  artist?: string;
  audioUrl?: string;
};

export async function getYouTubeSong(
  prevState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  const validatedFields = youtubeActionSchema.safeParse({
    url: formData.get('url'),
  });

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.flatten().fieldErrors.url?.[0],
    };
  }

  try {
    const response = await fetch(YOUTUBE_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      body: new URLSearchParams({
        url: validatedFields.data.url,
      }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('YouTube Fetch Error:', errorText);
        return { error: `The service failed with status: ${response.status}. Please try another link.` };
    }

    const result = await response.json();
    
    if (result.status !== 'success' || !result.data) {
        return { error: result.data?.message || 'Could not process the YouTube link. It might be invalid or unsupported.' };
    }
    
    const title: string = result.data.title;
    
    // Find the best quality audio format (MP3)
    const audioFormat = result.data.formats
        .filter((f: any) => f.type === 'audio' && f.label === 'MP3' && f.url)
        .sort((a: any, b: any) => {
            // A simple quality sort, might need adjustment based on actual data
            const qualityA = parseInt(a.quality || '0');
            const qualityB = parseInt(b.quality || '0');
            return qualityB - qualityA;
        })[0];


    if (!audioFormat || !audioFormat.url) {
      return { error: 'No downloadable MP3 audio format found for this video.' };
    }
    
    // Attempt to parse artist and title
    let artist = '';
    let songTitle = title;
    
    const commonSeparators = [' - ', ' – ', ' -- '];
    for (const separator of commonSeparators) {
        if (title.includes(separator)) {
            const parts = title.split(separator);
            artist = parts[0].trim();
            songTitle = parts.slice(1).join(separator).trim();
            break;
        }
    }
    
    // Remove things like (Official Music Video) etc.
    songTitle = songTitle.replace(/\(.*(official|video|audio|lyric).*\)/i, '').trim();

    return {
      title: songTitle,
      artist: artist,
      audioUrl: audioFormat.url,
    };

  } catch (e: any) {
    console.error('Error fetching from YouTube service:', e);
    return { error: 'An unexpected error occurred. Please check your network and try again.' };
  }
}

    