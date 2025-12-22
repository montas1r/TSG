
import { HfInference } from '@huggingface/inference';

// Ensure the environment variable is being read. 
// You might need to prefix it with NEXT_PUBLIC_ if you're using it in client-side components,
// but for API routes (server-side), it should be fine.
const hf = new HfInference(process.env.HUGGINGFACE_API_TOKEN);

export async function suggestSkillsForStem(stemName: string, existingSkills: string[] = []): Promise<string[]> {
  const prompt = `You are a learning assistant. For the skill category "${stemName}", suggest a list of 4-6 specific, actionable skills (Leaves).
${existingSkills.length > 0 ? `The user already has these skills, so suggest skills that complement them: ${existingSkills.join(', ')}.` : ''}
Vary the difficulty if possible.

Return ONLY a valid JSON array of strings, where each string is a skill name.
Example: ["Skill Name 1", "Skill Name 2", "Skill Name 3"]

JSON array:`;

  try {
    const response = await hf.textGeneration({
      model: 'mistralai/Mistral-7B-Instruct-v0.2',
      inputs: prompt,
      parameters: {
        max_new_tokens: 500,
        temperature: 0.7,
        return_full_text: false,
      }
    });

    const text = response.generated_text;
    const jsonMatch = text.match(/\[[\s\S]*?\]/);
    if (!jsonMatch) {
      console.error("No JSON array found in HF response for skills:", text);
      return [];
    }
    
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('HuggingFace skill suggestion error:', error);
    return [
        `Basics of ${stemName}`,
        `Advanced ${stemName}`,
        `Build a ${stemName} project`,
    ];
  }
}

export async function suggestRelatedSkillBundles(currentSkills: string[] = []): Promise<{ stem: string; leaves: string[] }[]> {
   const prompt = `
You are an AI skill-assistant. Your task is to generate a diverse list of skill categories (Stems) for a user, along with a few beginner skills (Leaves) for each.

Rules:
1.  Generate **at least 5 unique Stems**.
2.  Vary topics across domains: technical, creative, professional, personal growth.
3.  For each Stem, provide a list of 3-4 beginner-friendly and actionable Leaves.
4.  If the user has existing skills, suggest related but distinct new Stems. User's current skills are: ${currentSkills.join(', ')}.
5.  Respond **only** with a valid, clean JSON array of objects. Do not add any other text, markdown, or explanations.

JSON format:
[
  {
    "stem": "Stem Name",
    "leaves": ["Leaf Name 1", "Leaf Name 2", "Leaf Name 3"]
  }
]

JSON array:`;

  try {
    const response = await hf.textGeneration({
      model: 'mistralai/Mistral-7B-Instruct-v0.2',
      inputs: prompt,
      parameters: {
        max_new_tokens: 1500,
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
      { stem: "Creative Arts", leaves: ["Drawing Basics", "Digital Painting", "Creative Writing"]},
      { stem: "Wellness", leaves: ["Mindfulness Meditation", "Yoga for Beginners", "Healthy Cooking"]},
    ];
  }
}

export async function generateQuests(
  skillName: string,
  existingQuests: string[]
): Promise<string[]> {
  const prompt = `You are a learning assistant. Your task is to generate a list of small, actionable tasks (Quests) for a given skill.

Input Skill: "${skillName}"
${existingQuests.length > 0 ? `The user has already completed these quests, so suggest the next logical steps: ${existingQuests.join(', ')}.` : ''}

Generate a list of 3-5 unique Quests for this skill. The quests should be short, actionable, and incremental. Include a variety of tasks like practice exercises, reading, or small projects.

Return ONLY a valid JSON array of strings. Do not include any other text, markdown, or explanations.
Example: ["Read the official documentation", "Build a simple counter component", "Follow a video tutorial"]

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
    // Find the first occurrence of a JSON array
    const jsonMatch = text.match(/\[(.*?)\]/s);
    if (!jsonMatch) {
        console.error("No JSON array found in HF response for quests:", text);
        // Attempt to find individual quoted strings as a fallback
        const stringMatches = text.match(/"(.*?)"/g);
        if (stringMatches) {
            return stringMatches.map(s => s.replace(/"/g, ''));
        }
        return [];
    }
    
    // Clean up the matched string to make it valid JSON
    let cleanedJson = jsonMatch[0]
      .replace(/,(\s*?\])/g, '$1'); // Remove trailing commas before closing bracket

    return JSON.parse(cleanedJson);
  } catch (error) {
    console.error("Error parsing quests from HuggingFace:", error);
    return [
      `Practice ${skillName} for 15 minutes`,
      `Read an article about ${skillName}`,
      `Watch a tutorial on ${skillName}`,
    ];
  }
}
