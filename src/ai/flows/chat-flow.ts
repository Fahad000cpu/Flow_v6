// src/ai/flows/chat-flow.ts
'use server';
/**
 * @fileOverview A simple conversational AI flow.
 *
 * - generateChatResponse - A function that takes a user's message and returns a text response.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';


export async function generateChatResponse(message: string): Promise<string> {
    const { text } = await ai.generate({
        model: 'googleai/gemini-1.5-flash-latest',
        prompt: message,
        history: [
            {
                role: 'user',
                content: [{ text: "You are a helpful and friendly AI assistant." }],
            },
            {
                role: 'model',
                content: [{ text: 'Great! How can I help you today?' }],
            },
        ],
    });
    return text;
}
