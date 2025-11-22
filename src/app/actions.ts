'use server';

import { z } from 'zod';

const YOUTUBE_API_ENDPOINT = 'https://yt1s.com/api/ajaxSearch/index';

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
  
  const videoId = new URL(validatedFields.data.url).searchParams.get('v');
  if (!videoId) {
    return { error: 'Invalid YouTube URL. Could not find video ID.' };
  }

  try {
    const response = await fetch(YOUTUBE_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'x-requested-with': 'XMLHttpRequest'
      },
      body: new URLSearchParams({
        q: validatedFields.data.url,
        vt: 'mp3',
      }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('YouTube Fetch Error:', errorText);
        return { error: `The service failed with status: ${response.status}. Please try another link.` };
    }

    const result = await response.json();
    
    if (result.status !== 'ok' || !result.links?.mp3) {
        return { error: result.mess || 'Could not process the YouTube link. It might be invalid or unsupported.' };
    }
    
    const title: string = result.title;
    
    // The API gives multiple mp3 links, find the first one with a key.
    const audioFormatKey = Object.values(result.links.mp3).find((format: any) => format.k) as any;

    if (!audioFormatKey || !audioFormatKey.k) {
      return { error: 'No downloadable MP3 audio format found for this video.' };
    }
    
    const conversionResponse = await fetch('https://yt1s.com/api/ajaxConvert/convert', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'x-requested-with': 'XMLHttpRequest'
        },
        body: new URLSearchParams({
            vid: result.vid,
            k: audioFormatKey.k
        }),
    });

    if (!conversionResponse.ok) {
        return { error: `Failed to get download link. Status: ${conversionResponse.status}` };
    }

    const conversionResult = await conversionResponse.json();

    if (conversionResult.status !== 'ok' || !conversionResult.dlink) {
         return { error: conversionResult.mess || 'Could not prepare the download link.' };
    }
    
    let artist = result.a || '';
    let songTitle = title;
    
    if (!artist && title.includes(' - ')) {
        const parts = title.split(' - ');
        artist = parts[0].trim();
        songTitle = parts.slice(1).join(' - ').trim();
    }
    
    songTitle = songTitle.replace(/\(.*(official|video|audio|lyric).*\)/i, '').trim();

    return {
      title: songTitle,
      artist: artist,
      audioUrl: conversionResult.dlink,
    };

  } catch (e: any) {
    console.error('Error fetching from YouTube service:', e);
    return { error: 'An unexpected error occurred. Please check your network and try again.' };
  }
}
    
