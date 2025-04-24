
import { useCallback, useEffect, useState } from 'react';
import { Achievement } from '@/types/achievementTypes';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
import { SolutionCategory } from '@/lib/types/categoryTypes';

// Define TypeScript interfaces for the data returned from Supabase
interface ProgressItem {
  solution_id: string;
  is_completed: boolean;
  current_module: number;
  solutions?: {
    id: string;
    category: string;
  };
}

interface BadgeItem {
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

export function useAchievements() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const fetchAchievements = useCallback(async () => {
    if (!user) return [];
    
    try {
      // Primeiro, tentamos buscar as conquistas reais do usuário
      const { data: progressData, error: progressError } = await supabase
        .from('progress')
        .select(`
          solution_id,
          is_completed,
          current_module,
          solutions (
            id, category
          )
        `)
        .eq('user_id', user.id);
        
      if (progressError) throw progressError;
      
      // Buscar badges já conquistados
      const { data: badgesData, error: badgesError } = await supabase
        .from('user_badges')
        .select(`
          badge_id,
          earned_at,
          badges (
            id, name, description, icon, category
          )
        `)
        .eq('user_id', user.id);
        
      if (badgesError) throw badgesError;

      // Cast the data to the appropriate types
      const typedProgressData = progressData as ProgressItem[];
      const typedBadgesData = badgesData as BadgeItem[];
      
      // Construir conquistas com métricas do progresso atual
      const allAchievements: Achievement[] = [
        // Conquista de iniciante (desbloqueia ao iniciar qualquer solução)
        {
          id: 'achievement-beginner',
          name: 'Iniciante',
          description: 'Começou sua jornada no clube ao iniciar sua primeira solução',
          category: "achievement",
          isUnlocked: typedProgressData && typedProgressData.length > 0,
          earnedAt: typedProgressData && typedProgressData.length > 0 ? new Date().toISOString() : undefined,
        },
        // Conquista de Pioneiro (completa primeira solução)
        {
          id: 'achievement-pioneer',
          name: 'Pioneiro',
          description: 'Completou sua primeira implementação',
          category: "achievement",
          requiredCount: 1,
          currentCount: typedProgressData?.filter(p => p.is_completed)?.length || 0,
          isUnlocked: typedProgressData?.some(p => p.is_completed) || false,
          earnedAt: typedProgressData?.some(p => p.is_completed) ? new Date().toISOString() : undefined,
        },
        // Especialista em Vendas (3+ soluções de receita)
        {
          id: 'achievement-sales-expert',
          name: 'Especialista em Vendas',
          description: 'Implementou 3 soluções da trilha de Receita',
          category: "revenue",
          requiredCount: 3,
          currentCount: typedProgressData?.filter(p => p.is_completed && p.solutions?.category === 'revenue')?.length || 0,
          isUnlocked: (typedProgressData?.filter(p => p.is_completed && p.solutions?.category === 'revenue')?.length || 0) >= 3,
          earnedAt: (typedProgressData?.filter(p => p.is_completed && p.solutions?.category === 'revenue')?.length || 0) >= 3 
            ? new Date().toISOString() : undefined,
        },
        // Mestre em Automação (5+ soluções completas)
        {
          id: 'achievement-automation-master',
          name: 'Mestre em Automação',
          description: 'Implementou 5 soluções com sucesso',
          category: "operational",
          requiredCount: 5,
          currentCount: typedProgressData?.filter(p => p.is_completed)?.length || 0,
          isUnlocked: (typedProgressData?.filter(p => p.is_completed)?.length || 0) >= 5,
          earnedAt: (typedProgressData?.filter(p => p.is_completed)?.length || 0) >= 5
            ? new Date().toISOString() : undefined,
        },
        // Estrategista (completa solução de estratégia)
        {
          id: 'achievement-strategist',
          name: 'Estrategista',
          description: 'Completou uma solução da trilha de Estratégia',
          category: "strategy",
          requiredCount: 1,
          currentCount: typedProgressData?.filter(p => p.is_completed && p.solutions?.category === 'strategy')?.length || 0,
          isUnlocked: typedProgressData?.some(p => p.is_completed && p.solutions?.category === 'strategy') || false,
          earnedAt: typedProgressData?.some(p => p.is_completed && p.solutions?.category === 'strategy')
            ? new Date().toISOString() : undefined,
        },
      ];
      
      // Incluir também badges específicos da tabela de badges (se houver)
      if (typedBadgesData && typedBadgesData.length > 0) {
        typedBadgesData.forEach(badgeData => {
          if (badgeData.badges) {
            allAchievements.push({
              id: badgeData.badges.id,
              name: badgeData.badges.name,
              description: badgeData.badges.description,
              icon: badgeData.badges.icon,
              category: badgeData.badges.category as SolutionCategory | "achievement",
              isUnlocked: true,
              earnedAt: badgeData.earned_at,
            });
          }
        });
      }
      
      return allAchievements;
      
    } catch (error) {
      console.error('Erro ao carregar conquistas:', error);
      toast({
        title: "Erro ao carregar conquistas",
        description: "Não foi possível carregar suas conquistas. Tente novamente mais tarde.",
        variant: "destructive",
      });
      
      // Fallback para alguns dados de exemplo em caso de erro
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
      ] as Achievement[];
    }
  }, [user, toast]);
  
  const { 
    data: achievements = [],
    isLoading: loading,
    error,
    refetch
  } = useQuery({
    queryKey: ['achievements', user?.id],
    queryFn: fetchAchievements,
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
  
  return { 
    achievements, 
    loading,
    error: error ? String(error) : null,
    refetch
  };
}
