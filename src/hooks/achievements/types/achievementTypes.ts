
import { Achievement } from '@/types/achievementTypes';

export interface AchievementDataResponse {
  progressData: any[];
  solutions: any[];
  badgesData: any[];
  comments: any[];
  totalLikes: number;
  error: string | null;
}

export interface FetchAchievementsResult {
  achievements: Achievement[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}
