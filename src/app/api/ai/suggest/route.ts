import { NextRequest, NextResponse } from 'next/server';
import { suggestSkillsForStem, suggestRelatedSkillBundles } from '@/lib/google-ai';

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

    return NextResponse.json({ error: 'Invalid suggestion type' }, { status: 400 });

  } catch (error) {
    console.error('AI API Error:', error);
    return NextResponse.json({ error: 'An error occurred while fetching AI suggestions.' }, { status: 500 });
  }
}
