'use server';
/**
 * @fileOverview This file initializes the Genkit AI instance with necessary plugins.
 * It is configured to use Google AI for its generative capabilities. This setup
 * ensures that the AI functionalities throughout the application are powered by
 * Google's models.
 *
 * It exports a singleton `ai` object that is used to define and manage AI flows,
 * prompts, and other Genkit features.
 */

import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// Initialize the Genkit AI instance with the Google AI plugin.
// This makes Google's generative models available for use in AI flows.
export const ai = genkit({
  plugins: [googleAI()],
});
