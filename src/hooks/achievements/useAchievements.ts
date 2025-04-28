import { useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { useToast } from '@/hooks/use-toast';
import { useAchievementData } from './useAchievementData';
import { Achievement, ensureValidCategory, isValidCategory, achievementCache } from '@/types/achievementTypes';
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
  removeDuplicateAchievements,
  processAchievements
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
      
      // Se o cache é válido e estamos apenas revalidando, retornamos o cache
      if (achievementCache.isValid() && !achievementData.loading) {
        console.log('Usando cache de conquistas válido');
        return achievementCache.achievements;
      }
      
      const { 
        progressData, 
        solutions, 
        badgesData, 
        comments, 
        totalLikes,
        error: dataError,
        loading: dataLoading
      } = achievementData;

      // Se os dados ainda estão carregando e já temos dados em cache, use o cache
      if (dataLoading && achievementCache.achievements.length > 0) {
        console.log('Dados ainda carregando, retornando cache temporário');
        return achievementCache.achievements;
      }
      
      // Se os dados ainda estão carregando e não temos cache, indicamos carregamento
      if (dataLoading) {
        console.log('Dados de conquistas carregando pela primeira vez');
        return null;
      }
      
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
      
      // Gerar conquistas baseadas nos dados
      const generatedAchievements = adaptAchievements([
        ...generateImplementationAchievements(progressData || [], adaptedSolutions),
        ...generateCategoryAchievements(progressData || [], adaptedSolutions),
        ...generateEngagementAchievements(progressData || [], adaptedSolutions),
        ...generateSocialAchievements(progressData || [], comments || [], totalLikes || 0)
      ]);
      console.log('Conquistas geradas:', generatedAchievements.length);

      // Conquistas básicas que são sempre verificadas
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
          try {
            if (badgeData.badges) {
              // Lidar com o caso de badges ser um objeto ou um array
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
            }
          } catch (error) {
            console.error(`Erro ao processar badge ${index + 1}:`, error);
          }
        });
      }
      
      // Adiciona os badges processados ao conjunto de conquistas
      allAchievements = [...allAchievements, ...processedBadges];
      
      // Remove duplicatas
      const uniqueAchievements = removeDuplicateAchievements(allAchievements);
      console.log("Total de conquistas carregadas após remoção de duplicatas:", uniqueAchievements.length);
      console.log("Conquistas desbloqueadas:", uniqueAchievements.filter(a => a.isUnlocked).length);
      
      // Processa as conquistas para preservar estados de desbloqueio anteriores
      const processedAchievements = processAchievements(uniqueAchievements, achievementCache.achievements);
      
      // Garantir conquistas mínimas se o usuário tiver algum progresso
      if (processedAchievements.length === 0 && progressData && progressData.length > 0) {
        console.log("Adicionando conquista 'Iniciante' como fallback");
        const fallbackAchievements = [
          {
            id: 'achievement-beginner',
            name: 'Iniciante',
            description: 'Começou sua jornada no clube ao iniciar sua primeira solução',
            category: "achievement" as const,
            isUnlocked: true,
            earnedAt: new Date().toISOString(),
          }
        ];
        achievementCache.update(fallbackAchievements);
        return fallbackAchievements;
      } else if (processedAchievements.length === 0) {
        // Se não houver conquistas e nem progresso, use conquistas de fallback
        console.log("Usando conquistas de fallback como último recurso");
        const fallbacks = createFallbackAchievements();
        achievementCache.update(fallbacks);
        return fallbacks;
      }
      
      // Atualiza o cache
      achievementCache.update(processedAchievements);
      return processedAchievements;
      
    } catch (error) {
      console.error('Erro ao carregar conquistas:', error);
      toast({
        title: "Erro ao carregar conquistas",
        description: "Não foi possível carregar suas conquistas. Tente novamente mais tarde.",
        variant: "destructive",
      });
      
      // Se o cache existe, use-o como fallback quando ocorrer um erro
      if (achievementCache.achievements.length > 0) {
        return achievementCache.achievements;
      }
      
      // Caso contrário, use conquistas de fallback
      const fallbacks = createFallbackAchievements();
      achievementCache.update(fallbacks);
      return fallbacks;
    }
  }, [user, toast, achievementData]);
  
  // Efeito para limpar o cache quando o usuário muda
  useEffect(() => {
    if (user) {
      console.log('Usuário alterado, limpando cache de conquistas');
      achievementCache.clear();
    }
  }, [user?.id]);
  
  const result = useQuery({
    queryKey: ['achievements', user?.id],
    queryFn: fetchAchievements,
    enabled: !!user,
    staleTime: 30000, // 30 segundos
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
    refetchInterval: 60000, // Refetch automático a cada 60 segundos
    retry: 3
  });
  
  return result;
}
