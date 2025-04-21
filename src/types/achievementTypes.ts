
import { SolutionCategory } from "@/lib/types/categoryTypes";

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon?: string;
  category: "achievement" | SolutionCategory;
  requiredCount?: number;
  currentCount?: number;
  isUnlocked: boolean;
  earnedAt?: string;
  level?: number;
}

export interface ProgressData {
  id: string;
  user_id: string;
  solution_id: string;
  current_module: number;
  is_completed: boolean;
  completed_at?: string;
  created_at: string;
  solutions: {
    id: string;
    category: string;
  };
}

export interface ChecklistData {
  id: string;
  user_id: string;
  checklist_id: string;
  solution_id: string;
  is_completed: boolean;
  completed_at?: string;
}

export interface BadgeData {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: string;
  badges: {
    id: string;
    name: string;
    description: string;
    icon: string;
    category: string;
  };
}
