'use server';

import ytdl from 'ytdl-core';

// This is a server action, which means it only runs on the server.
// It can be called from client components.
export async function getYouTubeSong(url: string) {
  try {
    if (!ytdl.validateURL(url)) {
      throw new Error('Invalid YouTube URL');
    }

    const info = await ytdl.getInfo(url);
    const format = ytdl.chooseFormat(info.formats, {
      quality: 'highestaudio',
      filter: 'audioonly',
    });

    if (!format) {
      throw new Error('No suitable audio format found');
    }

    // This part is tricky because we can't send a stream directly to the client
    // without a more complex setup. For simplicity, we'll download the audio
    // into a buffer on the server and send it as a base64 string.
    // WARNING: This is memory-intensive and not suitable for large files or high traffic.
    const audioBuffer = await new Promise<Buffer>((resolve, reject) => {
      const stream = ytdl.downloadFromInfo(info, { format: format });
      const chunks: Buffer[] = [];
      stream.on('data', (chunk) => chunks.push(chunk));
      stream.on('end', () => resolve(Buffer.concat(chunks)));
      stream.on('error', (err) => reject(err));
    });

    const audioBase64 = audioBuffer.toString('base64');
    const audioMimeType = format.mimeType?.split(';')[0] || 'audio/mp4';

    return {
      title: info.videoDetails.title,
      audioBase64: `data:${audioMimeType};base64,${audioBase64}`,
      error: null,
    };
  } catch (error: any) {
    console.error('Error fetching YouTube song:', error);
    return {
      title: null,
      audioBase64: null,
      error: error.message || 'Failed to process YouTube link.',
    };
  }
}
