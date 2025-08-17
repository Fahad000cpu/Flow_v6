// src/ai/flows/tts-flow.ts
'use server';
/**
 * @fileOverview A Text-to-Speech (TTS) AI flow.
 *
 * - textToSpeech - A function that converts a string of text into audio data.
 */

import { ai } from '@/ai/genkit';
import wav from 'wav';
import { googleAI } from '@genkit-ai/googleai';

// Defines the expected return type for the textToSpeech function.
export type TtsOutput = {
  media: string; // The generated audio as a data URI.
};

// Helper function to convert raw PCM audio data from the API into a WAV format.
// This is necessary because browsers need a proper audio format like WAV to play the audio.
async function toWav(pcmData: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels: 1,      // Mono audio
      sampleRate: 24000, // Sample rate for the audio
      bitDepth: 16,       // 16-bit audio depth
    });

    const bufs: any[] = [];
    writer.on('error', reject);
    writer.on('data', (d) => bufs.push(d));
    writer.on('end', () => {
      // When the conversion is done, resolve with the Base64 encoded WAV data.
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}

/**
 * Converts a given text string into speech audio.
 * @param input The text string to convert.
 * @returns An object containing the audio data as a Base64 encoded WAV data URI.
 */
export async function textToSpeech(input: string): Promise<TtsOutput> {
    // Call the Genkit AI to generate audio from the input text.
    const { media } = await ai.generate({
        model: googleAI.model('gemini-2.5-flash-preview-tts'),
        config: {
            responseModalities: ['AUDIO'], // We expect audio data in the response.
            speechConfig: {
                voiceConfig: {
                    // Using a pre-built voice from Google's TTS service.
                    prebuiltVoiceConfig: { voiceName: 'Algenib' },
                },
            },
        },
        prompt: input,
    });

    if (!media?.url) {
        throw new Error('No audio was generated.');
    }

    // The audio data from the API is in raw PCM format and Base64 encoded.
    // We need to decode it first.
    const audioBuffer = Buffer.from(
        media.url.substring(media.url.indexOf(',') + 1),
        'base64'
    );
    
    // Convert the raw PCM data to a proper WAV format.
    const wavBase64 = await toWav(audioBuffer);

    // Return the audio in a data URI format that can be used directly in an <audio> tag.
    return {
      media: 'data:audio/wav;base64,' + wavBase64,
    };
}
