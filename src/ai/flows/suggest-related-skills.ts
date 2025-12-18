'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting related skills to a user based on their current skills.
 *
 * - suggestRelatedSkills - A function that takes a list of skills and returns suggestions for related skill bundles.
 * - SuggestRelatedSkillsInput - The input type for the suggestRelatedSkills function, an array of skill names.
 * - SuggestRelatedSkillsOutput - The output type for the suggestRelatedSkills function, an array of suggested skill bundles.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestRelatedSkillsInputSchema = z.array(z.string().describe('Skill name'));
export type SuggestRelatedSkillsInput = z.infer<typeof SuggestRelatedSkillsInputSchema>;

const SkillBundleSchema = z.object({
  stem: z.string().describe('The name of the suggested skill category (stem).'),
  leaves: z.array(z.string()).describe('A list of related skills (leaves) within this category.'),
});

const SuggestRelatedSkillsOutputSchema = z.array(SkillBundleSchema);
export type SuggestRelatedSkillsOutput = z.infer<typeof SuggestRelatedSkillsOutputSchema>;

export async function suggestRelatedSkills(input: SuggestRelatedSkillsInput): Promise<SuggestRelatedSkillsOutput> {
  return suggestRelatedSkillsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestRelatedSkillsPrompt',
  input: {schema: SuggestRelatedSkillsInputSchema},
  output: {schema: SuggestRelatedSkillsOutputSchema},
  prompt: `Based on the user's current skills, suggest 3 new skill categories (stems) they might be interested in. For each stem, provide a list of 3-5 beginner-friendly skills (leaves).
  
If the user has no current skills, provide 3 diverse and popular skill categories to get them started.

Current user skills:
{{#if input.length}}
  {{#each input}}
  - {{{this}}}
  {{/each}}
{{else}}
  None
{{/if}}`,
});

const suggestRelatedSkillsFlow = ai.defineFlow(
  {
    name: 'suggestRelatedSkillsFlow',
    inputSchema: SuggestRelatedSkillsInputSchema,
    outputSchema: SuggestRelatedSkillsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
