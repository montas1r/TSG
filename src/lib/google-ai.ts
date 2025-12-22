
import { HfInference } from '@huggingface/inference';

// Ensure the environment variable is being read. 
// You might need to prefix it with NEXT_PUBLIC_ if you're using it in client-side components,
// but for API routes (server-side), it should be fine.
const hf = new HfInference(process.env.HUGGINGFACE_API_TOKEN);

interface SkillSuggestion {
    name: string;
    description?: string;
}

export async function suggestSkillsForStem(stemName: string, existingSkills: string[] = []): Promise<SkillSuggestion[]> {
  const prompt = `You are an AI learning assistant. Your task is to generate a list of 8-12 unique skills (Leaves) for a given category (Stem).

Input Stem: "${stemName}"
${existingSkills.length > 0 ? `The user already has these skills, so avoid suggesting them again: ${existingSkills.join(', ')}.` : ''}

Rules:
1. Generate 8-12 unique skills.
2. Skills must be specific, actionable, and relevant to the Stem.
3. Provide a short description for each skill.
4. Vary the complexity (beginner, intermediate, advanced).
5. Respond strictly in a valid JSON array of objects.

JSON format:
[
  { "name": "Skill Name", "description": "A short, actionable description." }
]

JSON array:`;

  try {
    const response = await hf.textGeneration({
      model: 'mistralai/Mistral-7B-Instruct-v0.2',
      inputs: prompt,
      parameters: {
        max_new_tokens: 1000,
        temperature: 0.8,
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
        { name: `Basics of ${stemName}`, description: "Start with the fundamentals." },
        { name: `Advanced ${stemName}`, description: "Dive into complex topics." },
        { name: `Build a ${stemName} project`, description: "Apply your knowledge in a real project." },
    ];
  }
}

export async function suggestRelatedSkillBundles(currentSkills: string[] = []): Promise<{ stem: string; leaves: string[] }[]> {
   const prompt = `
You are an AI skill-assistant. Your task is to generate a diverse list of 10-15 unique skill categories (Stems), each with a list of 4-5 beginner skills (Leaves).

Rules:
1.  Generate **10-15 unique Stems**.
2.  Cover a wide variety of domains: technical, creative, professional, personal growth, hobbies.
3.  For each Stem, provide a list of 4-5 specific, beginner-friendly skills.
4.  If the user has existing skills, suggest related but distinct new Stems. User's current skills are: ${currentSkills.join(', ')}.
5.  Respond **only** with a valid, clean JSON array of objects. Do not add any other text, markdown, or explanations.

JSON format:
[
  {
    "stem": "Stem Name",
    "leaves": ["Leaf Name 1", "Leaf Name 2", "Leaf Name 3", "Leaf Name 4"]
  }
]

JSON array:`;

  try {
    const response = await hf.textGeneration({
      model: 'mistralai/Mistral-7B-Instruct-v0.2',
      inputs: prompt,
      parameters: {
        max_new_tokens: 2000,
        temperature: 0.9,
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
  const prompt = `You are a learning assistant. Your task is to generate a list of 5-8 small, actionable tasks (Quests) for a given skill.

Input Skill: "${skillName}"
${existingQuests.length > 0 ? `The user has already completed these quests, so suggest the next logical steps: ${existingQuests.join(', ')}.` : ''}

Rules:
1. Generate 5-8 unique Quests.
2. Quests must be short, actionable, and incremental.
3. Include a variety of tasks: practice exercises, reading, small projects.
4. Randomize wording to increase variety.

Return ONLY a valid JSON array of strings.
Example: ["Read the official documentation", "Build a simple counter component", "Follow a video tutorial"]

JSON array:`;

  try {
    const response = await hf.textGeneration({
      model: 'mistralai/Mistral-7B-Instruct-v0.2',
      inputs: prompt,
      parameters: {
        max_new_tokens: 500,
        temperature: 0.8,
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
