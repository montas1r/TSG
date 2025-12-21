
'use server';

import {
  doc,
  runTransaction,
  increment,
  type Firestore,
  getDoc,
} from 'firebase/firestore';
import { calculateLevelFromXP } from '../gamification';
import type { UserStats } from '../types';
import { safeSetDoc } from '../firestore-safe';

const XP_PER_QUEST = 10;

/**
 * Gets or creates the UserStats document for a given user.
 * @param firestore The Firestore instance.
 * @param userId The ID of the user.
 * @returns The user's stats document.
 */
export async function getOrCreateUserStats(
  firestore: Firestore,
  userId: string
): Promise<UserStats> {
  const statsRef = doc(firestore, 'users', userId, 'stats', userId);
  const statsSnap = await getDoc(statsRef);

  if (statsSnap.exists()) {
    return statsSnap.data() as UserStats;
  } else {
    const defaultStats: UserStats = {
      userId: userId,
      totalXP: 0,
      level: 1,
      currentStreak: 0,
      longestStreak: 0,
      lastActivityDate: new Date().toISOString(),
    };
    // Use safeSetDoc to ensure data is clean and to prevent loops
    await safeSetDoc(statsRef, defaultStats);
    return defaultStats;
  }
}

/**
 * Awards XP to a user for completing a quest and handles leveling up.
 * This function is designed to be called from a client component but runs on the server.
 * @param firestore The Firestore instance (passed from the client).
 * @param userId The ID of the user to award XP to.
 */
export async function awardXPForQuestCompletion(
  firestore: Firestore,
  userId: string
): Promise<void> {
  if (!userId) {
    console.error('User ID is required to award XP.');
    return;
  }

  const statsRef = doc(firestore, 'users', userId, 'stats', userId);

  try {
    await runTransaction(firestore, async (transaction) => {
      const statsDoc = await transaction.get(statsRef);
      
      let currentStats: UserStats;

      if (!statsDoc.exists()) {
        // If stats don't exist, create them. This is a fallback.
        currentStats = {
            userId: userId,
            totalXP: 0,
            level: 1,
            currentStreak: 0,
            longestStreak: 0,
            lastActivityDate: new Date().toISOString(),
        };
      } else {
        currentStats = statsDoc.data() as UserStats;
      }
      
      // We are incrementing the value, so it must be a number.
      const currentXP = (currentStats.totalXP as number) || 0;

      // Calculate new XP and level
      const newTotalXP = currentXP + XP_PER_QUEST;
      const newLevel = calculateLevelFromXP(newTotalXP);

      const statsUpdate: Partial<UserStats> = {
        totalXP: increment(XP_PER_QUEST),
        lastActivityDate: new Date().toISOString(),
      };

      if (newLevel > currentStats.level) {
        statsUpdate.level = newLevel;
        // You could also handle streak logic here in a real app
      }

      // Perform the atomic update/set
      if (statsDoc.exists()) {
          transaction.update(statsRef, statsUpdate);
      } else {
          // If for some reason the doc was deleted between get and here
          const newStatsData = { ...currentStats, ...statsUpdate, totalXP: newTotalXP };
          // We don't use safeSetDoc inside a transaction, but the transaction itself is safe.
          transaction.set(statsRef, newStatsData);
      }
    });

    console.log(`Successfully awarded ${XP_PER_QUEST} XP to user ${userId}.`);
  } catch (error) {
    console.error('Failed to award XP in transaction:', error);
    // In a real app, you might want to emit this error to a logging service
  }
}
