
import { useCallback } from 'react';
import { useAuth } from '@/contexts/auth';
import { useToast } from '@/hooks/use-toast';
import { useAchievementData } from './useAchievementData';
import { Achievement } from '@/types/achievementTypes';
import { SolutionCategory } from '@/lib/types/categoryTypes';
import { useQuery } from '@tanstack/react-query';
import {
  generateImplementationAchievements,
  generateCategoryAchievements,
  generateEngagementAchievements,
  generateSocialAchievements
} from '@/utils/achievements/achievementGenerators';
import {
  createFallbackAchievements,
  removeDuplicateAchievements
} from './utils/achievementUtils';

// Definindo o tipo Badge internamente, já que ele não é exportado pelo módulo
type Badge = {
  id: string;
  name: string;
  description: string;
  icon?: string;
  category: string;
};

export function useAchievements() {
  const { user } = useAuth();
  const { toast } = useToast();
  const achievementData = useAchievementData();
  
  const fetchAchievements = useCallback(async () => {
    if (!user) return [];
    
    try {
      const { 
        progressData, 
        solutions, 
        badgesData, 
        comments, 
        totalLikes,
        error: dataError
      } = achievementData;
      
      if (dataError) throw new Error(dataError);
      
      const generatedAchievements: Achievement[] = [
        ...generateImplementationAchievements(progressData, solutions),
        ...generateCategoryAchievements(progressData, solutions),
        ...generateEngagementAchievements(progressData, solutions),
        ...generateSocialAchievements(progressData, comments, totalLikes)
      ];

      const basicAchievements: Achievement[] = [
        {
          id: 'achievement-beginner',
          name: 'Iniciante',
          description: 'Começou sua jornada no clube ao iniciar sua primeira solução',
          category: "achievement",
          isUnlocked: progressData && progressData.length > 0,
          earnedAt: progressData && progressData.length > 0 ? new Date().toISOString() : undefined,
        },
        {
          id: 'achievement-pioneer',
          name: 'Pioneiro',
          description: 'Completou sua primeira implementação',
          category: "achievement",
          requiredCount: 1,
          currentCount: progressData?.filter(p => p.is_completed)?.length || 0,
          isUnlocked: progressData?.some(p => p.is_completed) || false,
          earnedAt: progressData?.some(p => p.is_completed) ? new Date().toISOString() : undefined,
        },
        {
          id: 'achievement-sales-expert',
          name: 'Especialista em Vendas',
          description: 'Implementou 3 soluções da trilha de Receita',
          category: "revenue",
          requiredCount: 3,
          currentCount: progressData?.filter(p => p.is_completed && p.solutions?.category === 'revenue')?.length || 0,
          isUnlocked: (progressData?.filter(p => p.is_completed && p.solutions?.category === 'revenue')?.length || 0) >= 3,
          earnedAt: (progressData?.filter(p => p.is_completed && p.solutions?.category === 'revenue')?.length || 0) >= 3 
            ? new Date().toISOString() : undefined,
        },
        {
          id: 'achievement-automation-master',
          name: 'Mestre em Automação',
          description: 'Implementou 5 soluções com sucesso',
          category: "operational",
          requiredCount: 5,
          currentCount: progressData?.filter(p => p.is_completed)?.length || 0,
          isUnlocked: (progressData?.filter(p => p.is_completed)?.length || 0) >= 5,
          earnedAt: (progressData?.filter(p => p.is_completed)?.length || 0) >= 5
            ? new Date().toISOString() : undefined,
        },
        {
          id: 'achievement-strategist',
          name: 'Estrategista',
          description: 'Completou uma solução da trilha de Estratégia',
          category: "strategy",
          requiredCount: 1,
          currentCount: progressData?.filter(p => p.is_completed && p.solutions?.category === 'strategy')?.length || 0,
          isUnlocked: progressData?.some(p => p.is_completed && p.solutions?.category === 'strategy') || false,
          earnedAt: progressData?.some(p => p.is_completed && p.solutions?.category === 'strategy')
            ? new Date().toISOString() : undefined,
        },
      ];
      
      let allAchievements = [...basicAchievements, ...generatedAchievements];
      
      if (badgesData && badgesData.length > 0) {
        badgesData.forEach(badgeData => {
          if (badgeData.badges) {
            try {
              if (Array.isArray(badgeData.badges)) {
                badgeData.badges.forEach((badge: Badge) => {
                  const validCategories: ("achievement" | SolutionCategory)[] = [
                    "achievement", "revenue", "operational", "strategy"
                  ];
                  
                  // Correção: Verificar e converter a categoria para o tipo adequado
                  const category: "achievement" | SolutionCategory = 
                    (validCategories.includes(badge.category as any)) 
                      ? (badge.category as "achievement" | SolutionCategory)
                      : "achievement";
  
                  allAchievements.push({
                    id: badge.id,
                    name: badge.name,
                    description: badge.description,
                    category: category,
                    isUnlocked: true,
                    earnedAt: badgeData.earned_at,
                  });
                });
              } else if (typeof badgeData.badges === 'object' && badgeData.badges !== null) {
                const badge = badgeData.badges as Badge;
                
                const validCategories: ("achievement" | SolutionCategory)[] = [
                  "achievement", "revenue", "operational", "strategy"
                ];
                
                // Correção: Verificar e converter a categoria para o tipo adequado
                const category: "achievement" | SolutionCategory = 
                  (validCategories.includes(badge.category as any)) 
                    ? (badge.category as "achievement" | SolutionCategory)
                    : "achievement";
  
                allAchievements.push({
                  id: badge.id,
                  name: badge.name,
                  description: badge.description,
                  category: category,
                  isUnlocked: true,
                  earnedAt: badgeData.earned_at,
                });
              }
            } catch (error) {
              console.error('Erro ao processar badges:', error);
            }
          }
        });
      }
      
      const uniqueAchievements = removeDuplicateAchievements(allAchievements);
      console.log("Conquistas carregadas:", uniqueAchievements.length);
      return uniqueAchievements;
      
    } catch (error) {
      console.error('Erro ao carregar conquistas:', error);
      toast({
        title: "Erro ao carregar conquistas",
        description: "Não foi possível carregar suas conquistas. Tente novamente mais tarde.",
        variant: "destructive",
      });
      
      return createFallbackAchievements();
    }
  }, [user, toast, achievementData]);
  
  return useQuery({
    queryKey: ['achievements', user?.id],
    queryFn: fetchAchievements,
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
