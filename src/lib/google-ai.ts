
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
  const prompt = `You are an AI skill-discovery assistant. Your task is to generate a list of 8-12 unique skills (Leaves) for a given skill category (Stem).

Input Stem: "${stemName}"
${existingSkills.length > 0 ? `The user already has these skills, so you MUST avoid suggesting them again: ${existingSkills.join(', ')}.` : ''}

Rules:
1. Generate 8-12 unique skills. Do not repeat skills from the "avoid" list.
2. Skills must be specific, actionable, and relevant to the Stem.
3. Provide a short, one-sentence description for each skill.
4. Vary the complexity of the skills (e.g., suggest a mix of beginner, intermediate, and advanced topics).
5. Respond strictly in a valid JSON array of objects. Do not add any other text, markdown, or explanations before or after the JSON.

JSON format example:
[
  { "name": "Skill Name 1", "description": "A short, actionable description." },
  { "name": "Skill Name 2", "description": "Another short, actionable description." }
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
      console.error("No JSON array found in HF response for skills:", text);
      return [];
    }
    
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('HuggingFace skill suggestion error:', error);
    // Fallback with more variety
    return [
        { name: `Fundamentals of ${stemName}`, description: "Start with the core concepts and foundational knowledge." },
        { name: `Intermediate Techniques in ${stemName}`, description: "Explore more complex methods and practices." },
        { name: `Advanced ${stemName} Applications`, description: "Apply your skills to advanced, real-world scenarios." },
        { name: `Tooling and Workflow for ${stemName}`, description: "Master the software and tools of the trade." },
        { name: `Build a Portfolio Project with ${stemName}`, description: "Create a complete project to showcase your abilities." },
    ];
  }
}

export async function suggestRelatedSkillBundles(currentSkills: string[] = []): Promise<{ stem: string; leaves: string[] }[]> {
   const prompt = `You are an AI skill-discovery assistant. Your task is to generate a diverse list of 10 unique skill categories (Stems), each bundled with 4-5 beginner-level skills (Leaves).

Rules:
1. Generate exactly 10 unique "Stem" bundles.
2. For each Stem, provide a unique name and 4-5 relevant beginner "Leaf" skills.
3. Cover a wide variety of domains: technical, creative, professional, personal growth, wellness, digital skills, hobbies, arts.
4. Randomize the order of the list to ensure variety on each request.
5. If the user has existing skills, suggest related but distinct new Stems. User's current skills are: ${currentSkills.join(', ')}. Do NOT suggest stems that are too similar to these.
6. Respond strictly in a valid JSON array of objects. Do not add any other text, markdown, or explanations before or after the JSON.

JSON format example:
[
  { "stem": "Web Development", "leaves": ["HTML & CSS", "JavaScript Basics", "Intro to React", "Building a Backend API"] },
  { "stem": "Digital Illustration", "leaves": ["Drawing Fundamentals", "Color Theory", "Using Procreate/Photoshop", "Character Design"] }
]

JSON array:`;

  try {
    const response = await hf.textGeneration({
      model: 'mistralai/Mistral-7B-Instruct-v0.2',
      inputs: prompt,
      parameters: {
        max_new_tokens: 2500,
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
     // Fallback with more variety
     const fallbacks = [
        { stem: "Creative Writing", leaves: ["Story Structure", "Character Development", "Dialogue Writing", "World-Building"]},
        { stem: "Personal Finance", leaves: ["Budgeting and Saving", "Introduction to Investing", "Understanding Credit", "Retirement Planning Basics"]},
        { stem: "Data Analysis", leaves: ["Introduction to SQL", "Data Cleaning with Python", "Basic Statistics", "Data Visualization with Tableau"]},
        { stem: "Graphic Design", leaves: ["Color Theory", "Typography Basics", "Layout and Composition", "Introduction to Figma"]},
        { stem: "Mindfulness and Wellness", leaves: ["Mindful Meditation", "Yoga for Beginners", "Healthy Cooking Fundamentals", "Stress Management Techniques"]},
     ];
     // Return a random subset of fallbacks
     return fallbacks.sort(() => 0.5 - Math.random()).slice(0, 3);
  }
}

export async function generateQuests(
  skillName: string,
  existingQuests: string[]
): Promise<string[]> {
  const prompt = `You are an AI learning assistant. Your task is to generate a list of 5-8 small, actionable tasks (Quests) for a given skill.

Input Skill: "${skillName}"
${existingQuests.length > 0 ? `The user has already completed these quests, so you MUST suggest the next logical steps and NOT repeat these: ${existingQuests.join(', ')}.` : ''}

Rules:
1. Generate 5-8 unique Quests.
2. Quests must be short, actionable, and incremental.
3. Include a variety of task types: practice exercises, reading articles, watching videos, building small projects, etc.
4. Randomize wording to increase variety (e.g., "Complete a tutorial" vs. "Follow a guide on...").
5. Return ONLY a valid JSON array of strings. Do not add any other text, markdown, or explanations.

JSON array example:
["Read the official documentation for useState", "Build a simple counter component", "Follow a video tutorial on useEffect"]

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
    const jsonMatch = text.match(/\[(.*?)\]/s);
    if (!jsonMatch) {
        console.error("No JSON array found in HF response for quests:", text);
        const stringMatches = text.match(/"(.*?)"/g);
        if (stringMatches) {
            return stringMatches.map(s => s.replace(/"/g, ''));
        }
        return [];
    }
    
    let cleanedJson = jsonMatch[0].replace(/,(\s*?\])/g, '$1');

    return JSON.parse(cleanedJson);
  } catch (error) {
    console.error("Error parsing quests from HuggingFace:", error);
    return [
      `Practice ${skillName} for 15 minutes`,
      `Read an article about ${skillName}`,
      `Watch a tutorial on ${skillName}`,
      `Find a community forum about ${skillName}`,
      `Explain ${skillName} to a friend`,
    ];
  }
}
