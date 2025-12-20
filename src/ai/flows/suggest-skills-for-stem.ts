'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting new skills (leaves) for an existing category (stem).
 *
 * - suggestSkillsForStem - A function that takes a stem name and existing skills and returns new skill suggestions.
 * - SuggestSkillsForStemInput - The input type for the function.
 * - SuggestSkillsForStemOutput - The output type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestSkillsForStemInputSchema = z.object({
  stemName: z.string().describe('The name of the skill category (stem) to generate new skills for.'),
  existingSkills: z.array(z.string()).optional().describe('A list of skills the user already has in this stem.'),
});
export type SuggestSkillsForStemInput = z.infer<typeof SuggestSkillsForStemInputSchema>;

const SuggestSkillsForStemOutputSchema = z.array(z.string().describe('A single, actionable skill name to suggest.'));
export type SuggestSkillsForStemOutput = z.infer<typeof SuggestSkillsForStemOutputSchema>;

export async function suggestSkillsForStem(input: SuggestSkillsForStemInput): Promise<SuggestSkillsForStemOutput> {
  return suggestSkillsForStemFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestSkillsForStemPrompt',
  input: {schema: SuggestSkillsForStemInputSchema},
  output: {schema: SuggestSkillsForStemOutputSchema},
  prompt: `You are a helpful learning coach. Your goal is to help a user expand their skills within a specific category.

Given the category (stem) and a list of skills the user already has, generate a list of 5 related, beginner-to-intermediate level skills they could learn next.

Category: {{{stemName}}}

{{#if existingSkills.length}}
Existing Skills:
  {{#each existingSkills}}
  - {{{this}}}
  {{/each}}
{{/if}}

Return ONLY a JSON array of strings, where each string is a new skill suggestion.`,
});

const suggestSkillsForStemFlow = ai.defineFlow(
  {
    name: 'suggestSkillsForStemFlow',
    inputSchema: SuggestSkillsForStemInputSchema,
    outputSchema: SuggestSkillsForStemOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
