
'use client';

import type { User } from 'firebase/auth';
import type { UserStats } from '@/lib/types';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { getXPForLevel, getXPForNextLevel } from '@/lib/gamification';
import { Skeleton } from '@/components/ui/skeleton';

interface UserProfileWidgetProps {
  user: User;
  userStats: UserStats | null;
}

export function UserProfileWidget({ user, userStats }: UserProfileWidgetProps) {
  if (!userStats) {
    return (
      <div className="p-2 rounded-lg bg-muted/50">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="w-full space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-2 w-full" />
          </div>
        </div>
      </div>
    );
  }

  const { level, totalXP } = userStats;
  const xpForCurrentLevel = getXPForLevel(level);
  const xpForNextLevel = getXPForNextLevel(level);
  const xpProgress = ((totalXP - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel)) * 100;

  const getInitials = (name: string | null) => {
    if (!name) return 'A'; // Anonymous
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('');
  };

  return (
    <div className="p-3 rounded-lg bg-muted/50 border">
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarFallback className='font-heading bg-primary/20 text-primary'>
            {getInitials(user.displayName)}
          </AvatarFallback>
        </Avatar>
        <div className="w-full">
          <div className="flex justify-between items-baseline mb-1">
            <p className="font-heading text-lg text-foreground">Level {level}</p>
            <p className="text-xs text-muted-foreground">
              {totalXP} / {xpForNextLevel} XP
            </p>
          </div>
          <Progress value={xpProgress} />
        </div>
      </div>
    </div>
  );
}
