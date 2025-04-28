
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
import { Solution as SupabaseSolution } from '@/lib/supabase';
import { Solution } from '@/types/solution';

type Badge = {
  id: string;
  name: string;
  description: string;
  icon?: string;
  category: string;
};

const adaptSolutions = (solutions: Solution[]): SupabaseSolution[] => {
  return solutions.map(solution => ({
    ...solution,
    author_id: solution.author_id || '' // Adicionando a propriedade necessária
  })) as SupabaseSolution[];
};

export function useAchievements() {
  const { user } = useAuth();
  const { toast } = useToast();
  const achievementData = useAchievementData();
  
  const fetchAchievements = useCallback(async () => {
    if (!user) return [];
    
    try {
      console.log('Buscando conquistas para o usuário:', user.id);
      
      const { 
        progressData, 
        solutions, 
        badgesData, 
        comments, 
        totalLikes,
        error: dataError
      } = achievementData;
      
      // Adicionando logs detalhados para diagnóstico
      console.log('Dados carregados:');
      console.log('- progressData:', progressData?.length || 0, 'itens');
      console.log('- solutions:', solutions?.length || 0, 'itens');
      console.log('- badgesData:', badgesData?.length || 0, 'itens');
      console.log('- comments:', comments?.length || 0, 'itens');
      console.log('- totalLikes:', totalLikes);
      
      if (dataError) {
        console.error('Erro nos dados:', dataError);
        throw new Error(dataError);
      }
      
      if (!solutions || solutions.length === 0) {
        console.warn('Atenção: Nenhuma solução encontrada para processar conquistas');
      }
      
      if (!progressData || progressData.length === 0) {
        console.warn('Atenção: Nenhum dado de progresso encontrado para processar conquistas');
      }
      
      const adaptedSolutions = adaptSolutions(solutions || []);
      console.log('Soluções adaptadas:', adaptedSolutions?.length);
      
      const generatedAchievements: Achievement[] = [
        ...generateImplementationAchievements(progressData || [], adaptedSolutions),
        ...generateCategoryAchievements(progressData || [], adaptedSolutions),
        ...generateEngagementAchievements(progressData || [], adaptedSolutions),
        ...generateSocialAchievements(progressData || [], comments || [], totalLikes || 0)
      ];
      console.log('Conquistas geradas:', generatedAchievements.length);

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
      console.log('Conquistas básicas:', basicAchievements.length);
      console.log('Conquista básica desbloqueada:', basicAchievements.filter(a => a.isUnlocked).length);
      
      let allAchievements = [...basicAchievements, ...generatedAchievements];
      console.log('Total de conquistas antes de processar badges:', allAchievements.length);
      
      if (badgesData && badgesData.length > 0) {
        console.log('Processando', badgesData.length, 'badges');
        badgesData.forEach((badgeData, index) => {
          console.log(`Processando badge ${index + 1}:`, badgeData);
          if (badgeData.badges) {
            try {
              if (Array.isArray(badgeData.badges)) {
                console.log(`Badge ${index + 1} é um array com ${badgeData.badges.length} itens`);
                badgeData.badges.forEach((badge: Badge) => {
                  const validCategories: ("achievement" | SolutionCategory)[] = [
                    "achievement", "revenue", "operational", "strategy"
                  ];
                  
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
                console.log(`Badge ${index + 1} é um objeto único`);
                const badge = badgeData.badges as Badge;
                
                const validCategories: ("achievement" | SolutionCategory)[] = [
                  "achievement", "revenue", "operational", "strategy"
                ];
                
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
              } else {
                console.warn(`Badge ${index + 1} não é um array nem um objeto:`, badgeData.badges);
              }
            } catch (error) {
              console.error('Erro ao processar badge:', error, badgeData);
            }
          } else {
            console.warn(`Badge ${index + 1} não possui propriedade badges:`, badgeData);
          }
        });
      } else {
        console.log('Nenhum badge encontrado para processar');
      }
      
      const uniqueAchievements = removeDuplicateAchievements(allAchievements);
      console.log("Total de conquistas carregadas após remoção de duplicatas:", uniqueAchievements.length);
      console.log("Conquistas desbloqueadas:", uniqueAchievements.filter(a => a.isUnlocked).length);
      
      if (uniqueAchievements.length === 0) {
        console.warn("ALERTA: Nenhuma conquista foi carregada! Verificando dados de entrada novamente:");
        console.log("Progresso:", progressData);
        console.log("Soluções:", solutions);
        console.log("Badges:", badgesData);
        
        // Se não tiver nenhuma conquista, tentamos garantir pelo menos as básicas
        if (progressData && progressData.length > 0) {
          console.log("Há progresso registrado, adicionando pelo menos a conquista 'Iniciante'");
          return [
            {
              id: 'achievement-beginner',
              name: 'Iniciante',
              description: 'Começou sua jornada no clube ao iniciar sua primeira solução',
              category: "achievement",
              isUnlocked: true,
              earnedAt: new Date().toISOString(),
            }
          ];
        } else {
          // Se realmente não houver nada, retornamos as conquistas de fallback
          console.log("Usando conquistas de fallback como último recurso");
          return createFallbackAchievements();
        }
      }
      
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
    staleTime: 1000 * 60,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
}
