
import { SolutionCategory } from "@/lib/types/categoryTypes";

export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: SolutionCategory | 'achievement';
  isUnlocked: boolean;
  earnedAt?: string;
  requiredCount?: number;
  currentCount?: number;
}

export type ProgressData = {
  solution_id: string;
  user_id: string;
  is_completed: boolean;
  completed_at?: string;
  created_at: string;
  last_activity?: string;
};

export type ChecklistData = {
  solution_id: string;
  checked_items: Record<string, boolean>;
};

export type BadgeData = {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: string;
  badges: {
    name: string;
    description: string;
  };
};
