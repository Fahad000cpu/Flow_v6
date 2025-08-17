'use server';
/**
 * @fileOverview AI flow for generating product details from an image URL.
 *
 * This file defines a Genkit AI flow that takes an image URL of a product
 * and returns structured details about it, including a generated name, price,
 * description, and an AI hint for image search. This flow leverages a
 * multimodal AI model to analyze the image and generate relevant text content.
 *
 * - generateProductDetails - The main function that executes the AI flow.
 * - ProductDetailsInput - The Zod schema for the input (image URL).
 * - ProductDetailsOutput - The Zod schema for the structured output.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

// Define the schema for the input, which is the product's image URL.
const ProductDetailsInputSchema = z.object({
  imageUrl: z
    .string()
    .url()
    .describe(
      "A URL of a product image. This should be a publicly accessible URL."
    ),
});
export type ProductDetailsInput = z.infer<typeof ProductDetailsInputSchema>;

// Define the schema for the output, which contains the generated product details.
const ProductDetailsOutputSchema = z.object({
  name: z
    .string()
    .describe('A creative and appealing name for the product.'),
  price: z
    .number()
    .describe('A plausible price for the product in Indian Rupees (INR).'),
  description: z
    .string()
    .describe(
      'A detailed and engaging description of the product, highlighting its key features and benefits.'
    ),
  dataAiHint: z
    .string()
    .describe(
      'One or two keywords (e.g., "ceramic vase") that can be used to find similar images on stock photo websites like Unsplash.'
    ),
});
export type ProductDetailsOutput = z.infer<typeof ProductDetailsOutputSchema>;


/**
 * An asynchronous wrapper function that invokes the product detail generation flow.
 * @param input The product image URL.
 * @returns A promise that resolves with the generated product details.
 */
export async function generateProductDetails(
  input: ProductDetailsInput
): Promise<ProductDetailsOutput> {
  return generateProductDetailsFlow(input);
}

// Define the AI prompt for the generation task.
// It instructs the AI to act as a marketing expert and generate details
// in a specific JSON format based on the provided image.
const prompt = ai.definePrompt({
  name: 'productDetailsPrompt',
  input: {schema: ProductDetailsInputSchema},
  output: {schema: ProductDetailsOutputSchema},
  prompt: `You are a world-class marketing expert and copywriter.
Analyze the product in the following image and generate the requested details.
The price should be a reasonable estimate in Indian Rupees (INR).
The description should be compelling and highlight the product's best qualities.
The AI hint should be one or two simple keywords for image search.

Image: {{media url=imageUrl}}`,
});

// Define the main AI flow.
// This flow takes the input, calls the defined prompt, and returns the structured output.
const generateProductDetailsFlow = ai.defineFlow(
  {
    name: 'generateProductDetailsFlow',
    inputSchema: ProductDetailsInputSchema,
    outputSchema: ProductDetailsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
        throw new Error("AI failed to generate a response.");
    }
    return output;
  }
);
