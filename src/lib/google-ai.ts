import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GOOGLE_API_KEY!);

const generationConfig = {
    temperature: 0.7,
    topK: 1,
    topP: 1,
    maxOutputTokens: 2048,
};

const safetySettings = [
    {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
];

export async function suggestSkillsForStem(stemName: string, existingSkills: string[] = []) {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro', generationConfig, safetySettings });

    const prompt = `You are a helpful learning coach. Your goal is to help a user expand their skills within a specific category.

    Given the category (stem) and a list of skills the user already has, generate a list of 5 related, beginner-to-intermediate level skills they could learn next.

    Category: "${stemName}"

    ${existingSkills.length > 0 ? `Existing Skills:\n${existingSkills.map(s => `- ${s}`).join('\n')}` : ''}

    Return ONLY a valid JSON array of strings, where each string is a new skill suggestion. Do not include markdown formatting.
    Example: ["Skill 1", "Skill 2", "Skill 3"]`;

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        // Extract JSON array from the text
        const jsonMatch = text.match(/\[(.*?)\]/s);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        return [];
    } catch (error) {
        console.error('Error suggesting skills for stem:', error);
        return [];
    }
}

export async function suggestRelatedSkillBundles(currentSkills: string[] = []) {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro', generationConfig, safetySettings });

    const prompt = `You are a creative and encouraging learning coach. Your goal is to inspire users by suggesting new skills to learn.

    Based on the user's current skills, suggest 3-5 new skill categories (stems) they might be interested in. For each stem, provide a list of 3-5 engaging, beginner-friendly skills (leaves).

    ${currentSkills.length > 0
            ? `Current user skills:\n${currentSkills.map(s => `- ${s}`).join('\n')}`
            : 'The user is new and has no skills yet. Please provide a welcoming and diverse set of 3-5 starting points. Make them interesting and cover a range of topics like technology, creativity, wellness, and practical life skills.'
        }

    Return ONLY a valid JSON array of objects (no markdown).
    Example: [
        { "stem": "Category Name", "leaves": ["Skill 1", "Skill 2"] }
    ]`;

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const jsonMatch = text.match(/\[(.*?)\]/s);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        return [];
    } catch (error) {
        console.error('Error suggesting related skills:', error);
        return [];
    }
}
