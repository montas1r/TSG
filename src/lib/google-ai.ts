
import { HfInference } from '@huggingface/inference';

// Ensure the environment variable is being read. 
// You might need to prefix it with NEXT_PUBLIC_ if you're using it in client-side components,
// but for API routes (server-side), it should be fine.
const hf = new HfInference(process.env.HUGGINGFACE_API_TOKEN);

export async function suggestSkillsForStem(stemName: string, existingSkills: string[] = []): Promise<string[]> {
  const prompt = `
You are a helpful learning coach. Your goal is to help a user expand their skills within a specific category.

Given the skill category (Stem): "${stemName}"
And the skills the user already has: ${existingSkills.join(', ')}

Suggest a list of 5-6 related, specific, and actionable skills (Leaves) they could learn next. Vary the difficulty from beginner to advanced if possible.

Return ONLY a valid JSON array of strings, where each string is a new skill suggestion. Do not include any other text, just the array.
Example: ["Skill 1", "Skill 2", "Skill 3", "Skill 4", "Skill 5"]

JSON array:`;

  try {
    const response = await hf.textGeneration({
      model: 'mistralai/Mistral-7B-Instruct-v0.2',
      inputs: prompt,
      parameters: {
        max_new_tokens: 350,
        temperature: 0.7,
        return_full_text: false,
      }
    });

    const text = response.generated_text;
    const jsonMatch = text.match(/\[[\s\S]*?\]/);
    if (!jsonMatch) {
      console.error("No JSON array found in HF response:", text);
      return [];
    }
    
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('HuggingFace skill suggestion error:', error);
    // Return a fallback if the AI fails
    return [
        `Learn the basics of ${stemName}`,
        `Explore advanced ${stemName} techniques`,
        `Build a project with ${stemName}`,
    ];
  }
}

export async function suggestRelatedSkillBundles(currentSkills: string[] = []): Promise<{ stem: string; leaves: string[] }[]> {
   const prompt = `You are a creative and encouraging learning coach. Your goal is to inspire users by suggesting new skills to learn.

    Based on the user's current skills, suggest 3-5 new skill categories (stems) they might be interested in. For each stem, provide a list of 3-5 engaging, beginner-friendly skills (leaves).

    ${currentSkills.length > 0
            ? `Current user skills:\n${currentSkills.map(s => `- ${s}`).join('\n')}`
            : 'The user is new and has no skills yet. Please provide a welcoming and diverse set of 3-5 starting points. Make them interesting and cover a range of topics like technology, creativity, wellness, and practical life skills.'
        }

    Return ONLY a valid JSON array of objects (no markdown).
    Example: [
        { "stem": "Category Name", "leaves": ["Skill 1", "Skill 2"] }
    ]
    
    JSON array:`;

  try {
    const response = await hf.textGeneration({
      model: 'mistralai/Mistral-7B-Instruct-v0.2',
      inputs: prompt,
      parameters: {
        max_new_tokens: 1024,
        temperature: 0.8,
        return_full_text: false,
      }
    });

    const text = response.generated_text;
    const jsonMatch = text.match(/\[[\s\S]*?\]/);
    if (!jsonMatch) {
        console.error("No JSON array found in HF response for bundles:", text);
        return [];
    }
    
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('HuggingFace bundle suggestion error:', error);
     return [
      { stem: "Creative Arts", leaves: ["Drawing Basics", "Digital Painting", "Creative Writing"] },
      { stem: "Wellness", leaves: ["Mindfulness Meditation", "Yoga for Beginners", "Healthy Cooking"] },
    ];
  }
}

export async function generateQuests(
  skillName: string,
  existingQuests: string[]
): Promise<string[]> {
  const prompt = `Generate 5 learning quests or small, actionable tasks for the skill: "${skillName}"

${existingQuests.length > 0 ? `The user has already completed these quests: ${existingQuests.join(', ')}. Suggest the next logical steps.` : ''}

Return ONLY a valid JSON array of quest strings (each quest should be a short, actionable phrase):
Example: ["Read the official documentation", "Build a simple counter component", "Follow a video tutorial on the topic"]

JSON array:`;

  try {
    const response = await hf.textGeneration({
      model: 'mistralai/Mistral-7B-Instruct-v0.2',
      inputs: prompt,
      parameters: {
        max_new_tokens: 300,
        temperature: 0.6,
        return_full_text: false,
      }
    });

    const text = response.generated_text;
    const jsonMatch = text.match(/\[[\s\S]*?\]/);
    if (!jsonMatch) {
        console.error("No JSON array found in HF response for quests:", text);
        return [];
    }
    
    return JSON.parse(jsonMatch[0]);
  } catch (error)
