'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting actionable quests for a given skill.
 *
 * - suggestQuests - A function that takes a skill name and returns a list of suggested quests.
 * - SuggestQuestsInput - The input type for the suggestQuests function.
 * - SuggestQuestsOutput - The output type for the suggestQuests function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestQuestsInputSchema = z.object({
  skillName: z.string().describe('The name of the skill to generate quests for.'),
  stemName: z.string().optional().describe('The broader category or "stem" this skill belongs to, for context.'),
});
export type SuggestQuestsInput = z.infer<typeof SuggestQuestsInputSchema>;

const SuggestQuestsOutputSchema = z.array(z.string().describe('A single, actionable quest text.'));
export type SuggestQuestsOutput = z.infer<typeof SuggestQuestsOutputSchema>;

export async function suggestQuests(input: SuggestQuestsInput): Promise<SuggestQuestsOutput> {
  return suggestQuestsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestQuestsPrompt',
  input: {schema: SuggestQuestsInputSchema},
  output: {schema: SuggestQuestsOutputSchema},
  prompt: `You are a helpful learning coach. Your goal is to break down a complex skill into small, actionable, and beginner-friendly tasks or "quests".

Given the following skill and its category, generate a list of 3-5 concrete quests to help a user get started. Frame them as clear, completable actions.

Skill: {{{skillName}}}
{{#if stemName}}
Category: {{{stemName}}}
{{/if}}

Return ONLY a JSON array of strings.`,
});

const suggestQuestsFlow = ai.defineFlow(
  {
    name: 'suggestQuestsFlow',
    inputSchema: SuggestQuestsInputSchema,
    outputSchema: SuggestQuestsOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
