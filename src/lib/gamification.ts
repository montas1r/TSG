
/**
 * Calculates the user's level based on their total experience points (XP).
 * The formula is: XP needed for level N = 100 * N^2
 * @param totalXP The total experience points of the user.
 * @returns The calculated level.
 */
export function calculateLevelFromXP(totalXP: number): number {
  if (totalXP <= 0) return 1;
  // This formula is the reverse of XP = 100 * level^2
  const level = Math.floor(Math.sqrt(totalXP / 100)) + 1;
  return level;
}

/**
 * Calculates the total XP required to reach a specific level.
 * @param level The target level.
 * @returns The total XP required for that level.
 */
export function getXPForLevel(level: number): number {
  if (level <= 1) return 100;
  // The XP for level N is the threshold to enter level N+1
  return 100 * Math.pow(level - 1, 2);
}

/**
 * Calculates the XP needed to reach the next level.
 * @param level The current level.
 * @returns The total XP required for the next level.
 */
export function getXPForNextLevel(level: number): number {
    return getXPForLevel(level + 1);
}

/**
 * Placeholder function for awarding XP.
 * In a real implementation, this would involve a Firestore transaction or a Cloud Function
 * to ensure atomic updates to the user's stats.
 * @param userId The ID of the user to award XP to.
 * @param amount The amount of XP to award.
 * @param reason A description of why the XP is being awarded.
 */
export async function addXP(userId: string, amount: number, reason: string): Promise<void> {
  console.log(`Awarded ${amount} XP to user ${userId} for: ${reason}`);
  // In a real app, you would have a firestore.rules-secured function or a Cloud Function
  // to update the user's totalXP in the 'users/{userId}/stats/{userId}' document.
  // For now, this is a client-side placeholder.
}
