
import { HfInference } from '@huggingface/inference';

// Ensure the environment variable is being read. 
// You might need to prefix it with NEXT_PUBLIC_ if you're using it in client-side components,
// but for API routes (server-side), it should be fine.
const hf = new HfInference(process.env.HUGGINGFACE_API_TOKEN);

export async function suggestSkillsForStem(stemName: string, existingSkills: string[] = []): Promise<{ name: string; description: string }[]> {
  const prompt = `
You are an expert learning coach. For the skill category "${stemName}", suggest a list of 4-6 specific, actionable skills.
${existingSkills.length > 0 ? `The user already has these skills: ${existingSkills.join(', ')}. Suggest skills that complement or build upon these.` : ''}

Provide a very short, one-sentence description for each skill. Vary the difficulty from beginner to advanced if possible.

Return ONLY a valid JSON array of objects, like this:
[
  { "name": "Skill Name", "description": "A brief, one-sentence description." },
  { "name": "Another Skill", "description": "Another one-sentence description." }
]

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
        { name: `Basics of ${stemName}`, description: "Learn the foundational concepts." },
        { name: `Advanced ${stemName}`, description: "Explore expert-level techniques." },
        { name: `Build a ${stemName} project`, description: "Apply your skills in a real project." },
    ];
  }
}

export async function suggestRelatedSkillBundles(currentSkills: string[] = []): Promise<{ stem: string; description: string; leaves: { name: string; description: string }[] }[]> {
   const prompt = `
You are a creative and encouraging learning coach. Your goal is to inspire a user by suggesting new skill categories (Stems).

Based on the user's current skills, suggest 5 unique and diverse Stems. For each Stem, provide a short, one-sentence description and a list of 4-5 engaging, beginner-friendly skills (Leaves) with their own one-sentence descriptions.

${currentSkills.length > 0
    ? `The user's current skills are: ${currentSkills.join(', ')}.`
    : 'The user is new. Please provide a welcoming and diverse set of 5 starting Stems covering topics like technology, creativity, wellness, and practical life skills.'
}

Return ONLY a valid JSON array of objects. Do not use markdown.
Example:
[
  {
    "stem": "Stem Name",
    "description": "A short, one-sentence description of the Stem.",
    "leaves": [
      { "name": "Leaf 1", "description": "A short description for Leaf 1." },
      { "name": "Leaf 2", "description": "A short description for Leaf 2." }
    ]
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
      { stem: "Creative Arts", description: "Unleash your inner artist.", leaves: [
        { name: "Drawing Basics", description: "Learn the fundamentals of sketching." },
        { name: "Digital Painting", description: "Create art on your computer or tablet." },
        { name: "Creative Writing", description: "Write compelling stories and poems." }
      ]},
      { stem: "Wellness", description: "Improve your mental and physical health.", leaves: [
        { name: "Mindfulness Meditation", description: "Learn to focus and reduce stress." },
        { name: "Yoga for Beginners", description: "Improve flexibility and strength." },
        { name: "Healthy Cooking", description: "Prepare delicious and nutritious meals." }
      ]},
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
