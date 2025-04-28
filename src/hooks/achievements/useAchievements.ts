
import { useCallback } from 'react';
import { useAuth } from '@/contexts/auth';
import { useToast } from '@/hooks/use-toast';
import { useAchievementData } from './useAchievementData';
import { Achievement, ensureValidCategory, isValidCategory } from '@/types/achievementTypes';
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

// Adaptador para garantir que as conquistas geradas tenham categorias válidas
const adaptAchievements = (achievements: any[]): Achievement[] => {
  return achievements.map(achievement => ({
    ...achievement,
    category: ensureValidCategory(achievement.category)
  }));
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
        error: dataError,
        loading: dataLoading
      } = achievementData;

      // Se os dados ainda estão carregando, retorne null para indicar carregamento
      if (dataLoading) {
        return null;
      }
      
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
      
      const generatedAchievements = adaptAchievements([
        ...generateImplementationAchievements(progressData || [], adaptedSolutions),
        ...generateCategoryAchievements(progressData || [], adaptedSolutions),
        ...generateEngagementAchievements(progressData || [], adaptedSolutions),
        ...generateSocialAchievements(progressData || [], comments || [], totalLikes || 0)
      ]);
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
      
      let allAchievements: Achievement[] = [...basicAchievements, ...generatedAchievements];
      console.log('Total de conquistas antes de processar badges:', allAchievements.length);
      
      // Processa os badges e os converte em conquistas
      const processedBadges: Achievement[] = [];
      
      if (badgesData && badgesData.length > 0) {
        console.log('Processando', badgesData.length, 'badges');
        
        badgesData.forEach((badgeData, index) => {
          console.log(`Processando badge ${index + 1}:`, badgeData);
          
          if (badgeData.badges) {
            try {
              const badge = Array.isArray(badgeData.badges) 
                ? badgeData.badges[0] 
                : badgeData.badges;
              
              if (badge) {
                const category = ensureValidCategory(badge.category);
                
                processedBadges.push({
                  id: badge.id,
                  name: badge.name,
                  description: badge.description,
                  category: category,
                  isUnlocked: true,
                  earnedAt: badgeData.earned_at,
                });
                
                console.log(`Badge ${index + 1} processado com sucesso:`, badge.name);
              }
            } catch (error) {
              console.error(`Erro ao processar badge ${index + 1}:`, error);
            }
          }
        });
      }
      
      // Adiciona os badges processados ao conjunto de conquistas
      allAchievements = [...allAchievements, ...processedBadges];
      
      const uniqueAchievements = removeDuplicateAchievements(allAchievements);
      console.log("Total de conquistas carregadas após remoção de duplicatas:", uniqueAchievements.length);
      console.log("Conquistas desbloqueadas:", uniqueAchievements.filter(a => a.isUnlocked).length);
      
      // Garantir que temos pelo menos uma conquista básica se o usuário tiver algum progresso
      if (uniqueAchievements.length === 0 && progressData && progressData.length > 0) {
        console.log("Adicionando conquista 'Iniciante' como fallback");
        return [
          {
            id: 'achievement-beginner',
            name: 'Iniciante',
            description: 'Começou sua jornada no clube ao iniciar sua primeira solução',
            category: "achievement" as const,
            isUnlocked: true,
            earnedAt: new Date().toISOString(),
          }
        ];
      } else if (uniqueAchievements.length === 0) {
        // Se não houver conquistas e nem progresso, use conquistas de fallback
        console.log("Usando conquistas de fallback como último recurso");
        return createFallbackAchievements();
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
    staleTime: 5000, // Reduzimos o staleTime para atualizar com mais frequência
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
    retry: 2,
  });
}
