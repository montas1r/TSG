'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting related skills to a user based on their current skills.
 *
 * - suggestRelatedSkills - A function that takes a list of skills and returns suggestions for related skills.
 * - SuggestRelatedSkillsInput - The input type for the suggestRelatedSkills function, an array of skill names.
 * - SuggestRelatedSkillsOutput - The output type for the suggestRelatedSkills function, an array of suggested skill names.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestRelatedSkillsInputSchema = z.array(z.string().describe('Skill name'));
export type SuggestRelatedSkillsInput = z.infer<typeof SuggestRelatedSkillsInputSchema>;

const SuggestRelatedSkillsOutputSchema = z.array(z.string().describe('Suggested skill name'));
export type SuggestRelatedSkillsOutput = z.infer<typeof SuggestRelatedSkillsOutputSchema>;

export async function suggestRelatedSkills(input: SuggestRelatedSkillsInput): Promise<SuggestRelatedSkillsOutput> {
  return suggestRelatedSkillsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestRelatedSkillsPrompt',
  input: {schema: SuggestRelatedSkillsInputSchema},
  output: {schema: SuggestRelatedSkillsOutputSchema},
  prompt: `Given the following list of skills: {{{skills}}},
  suggest 5 related skills that the user might be interested in learning. Return them as a list of strings.
  Skills: {{#each input}}- {{{this}}}
{{/each}}`,
});

const suggestRelatedSkillsFlow = ai.defineFlow(
  {
    name: 'suggestRelatedSkillsFlow',
    inputSchema: SuggestRelatedSkillsInputSchema,
    outputSchema: SuggestRelatedSkillsOutputSchema,
  },
  async input => {
    const {output} = await prompt({skills: input});
    return output!;
  }
);
