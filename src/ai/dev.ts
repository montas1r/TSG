'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/suggest-related-skills.ts';
import '@/ai/flows/suggest-quests.ts';
