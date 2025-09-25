'use server';

/**
 * @fileOverview Generates event content suggestions (descriptions, titles) based on event name and topic.
 *
 * - generateEventContent - A function that generates event content suggestions.
 * - GenerateEventContentInput - The input type for the generateEventContent function.
 * - GenerateEventContentOutput - The return type for the generateEventContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateEventContentInputSchema = z.object({
  eventName: z.string().describe('The name of the event.'),
  eventTopic: z.string().describe('The topic of the event.'),
});
export type GenerateEventContentInput = z.infer<
  typeof GenerateEventContentInputSchema
>;

const GenerateEventContentOutputSchema = z.object({
  suggestedTitle: z.string().describe('A suggested title for the event.'),
  suggestedDescription: z
    .string()
    .describe('A suggested description for the event.'),
});
export type GenerateEventContentOutput = z.infer<
  typeof GenerateEventContentOutputSchema
>;

export async function generateEventContent(
  input: GenerateEventContentInput
): Promise<GenerateEventContentOutput> {
  return generateEventContentFlow(input);
}

const generateEventContentPrompt = ai.definePrompt({
  name: 'generateEventContentPrompt',
  input: {schema: GenerateEventContentInputSchema},
  output: {schema: GenerateEventContentOutputSchema},
  prompt: `You are an expert marketing copywriter specializing in events.

  Based on the event name and topic, generate a title and a description for the event.

  Event Name: {{{eventName}}}
  Event Topic: {{{eventTopic}}}
  `,
});

const generateEventContentFlow = ai.defineFlow(
  {
    name: 'generateEventContentFlow',
    inputSchema: GenerateEventContentInputSchema,
    outputSchema: GenerateEventContentOutputSchema,
  },
  async input => {
    const {output} = await generateEventContentPrompt(input);
    return output!;
  }
);
