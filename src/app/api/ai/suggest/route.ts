import { NextRequest, NextResponse } from 'next/server';
import { suggestSkillsForStem, suggestRelatedSkillBundles, generateQuests } from '@/lib/google-ai';

export async function POST(req: NextRequest) {
  try {
    const { type, payload } = await req.json();

    if (type === 'skillsForStem') {
      const { stemName, existingSkills } = payload;
      const suggestions = await suggestSkillsForStem(stemName, existingSkills);
      return NextResponse.json({ suggestions });
    }

    if (type === 'relatedSkillBundles') {
      const { currentSkills } = payload;
      const suggestions = await suggestRelatedSkillBundles(currentSkills);
      return NextResponse.json({ suggestions });
    }
    
    if (type === 'questsForSkill') {
      const { skillName, existingQuests } = payload;
      const suggestions = await generateQuests(skillName, existingQuests);
      return NextResponse.json({ suggestions });
    }

    return NextResponse.json({ error: 'Invalid suggestion type' }, { status: 400 });

  } catch (error) {
    console.error('AI API Error:', error);
    // It's better to type the error if possible, e.g., error instanceof Error
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'An error occurred while fetching AI suggestions.', details: errorMessage }, { status: 500 });
  }
}
