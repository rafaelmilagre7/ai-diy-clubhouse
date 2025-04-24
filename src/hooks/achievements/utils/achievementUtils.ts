
import { Achievement } from '@/types/achievementTypes';
import { supabase } from '@/lib/supabase';

export const fetchProgressData = async (userId: string) => {
  const { data, error } = await supabase
    .from('progress')
    .select(`
      solution_id,
      is_completed,
      current_module,
      solutions (
        id, category
      )
    `)
    .eq('user_id', userId);
    
  if (error) throw error;
  return data;
};

export const fetchBadgesData = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_badges')
    .select(`
      badge_id,
      earned_at,
      badges (
        id, name, description, icon, category
      )
    `)
    .eq('user_id', userId);
    
  if (error) throw error;
  return data;
};

export const createFallbackAchievements = (): Achievement[] => {
  return [
    {
      id: 'achievement-beginner',
      name: 'Iniciante',
      description: 'Começou sua jornada no clube',
      category: "achievement",
      isUnlocked: true,
      earnedAt: new Date().toISOString(),
    },
    {
      id: 'achievement-pioneiro',
      name: 'Pioneiro',
      description: 'Completou sua primeira implementação',
      category: "achievement", 
      requiredCount: 1,
      currentCount: 0,
      isUnlocked: false,
    }
  ];
};

export const removeDuplicateAchievements = (achievements: Achievement[]): Achievement[] => {
  return Array.from(new Map(achievements.map(item => [item.id, item])).values());
};
