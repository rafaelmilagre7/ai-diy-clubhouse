
import { useCallback, useEffect, useState } from 'react';
import { Achievement } from '@/types/achievementTypes';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';

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
      
      // Construir conquistas com métricas do progresso atual
      const allAchievements: Achievement[] = [
        // Conquista de iniciante (desbloqueia ao iniciar qualquer solução)
        {
          id: 'achievement-beginner',
          name: 'Iniciante',
          description: 'Começou sua jornada no clube ao iniciar sua primeira solução',
          category: 'achievement',
          isUnlocked: progressData && progressData.length > 0,
          earnedAt: progressData && progressData.length > 0 ? new Date().toISOString() : undefined,
        },
        // Conquista de Pioneiro (completa primeira solução)
        {
          id: 'achievement-pioneer',
          name: 'Pioneiro',
          description: 'Completou sua primeira implementação',
          category: 'achievement',
          requiredCount: 1,
          currentCount: progressData?.filter(p => p.is_completed)?.length || 0,
          isUnlocked: progressData?.some(p => p.is_completed) || false,
          earnedAt: progressData?.some(p => p.is_completed) ? new Date().toISOString() : undefined,
        },
        // Especialista em Vendas (3+ soluções de receita)
        {
          id: 'achievement-sales-expert',
          name: 'Especialista em Vendas',
          description: 'Implementou 3 soluções da trilha de Receita',
          category: 'revenue',
          requiredCount: 3,
          currentCount: progressData?.filter(p => p.is_completed && p.solutions?.category === 'revenue')?.length || 0,
          isUnlocked: (progressData?.filter(p => p.is_completed && p.solutions?.category === 'revenue')?.length || 0) >= 3,
          earnedAt: (progressData?.filter(p => p.is_completed && p.solutions?.category === 'revenue')?.length || 0) >= 3 
            ? new Date().toISOString() : undefined,
        },
        // Mestre em Automação (5+ soluções completas)
        {
          id: 'achievement-automation-master',
          name: 'Mestre em Automação',
          description: 'Implementou 5 soluções com sucesso',
          category: 'operational',
          requiredCount: 5,
          currentCount: progressData?.filter(p => p.is_completed)?.length || 0,
          isUnlocked: (progressData?.filter(p => p.is_completed)?.length || 0) >= 5,
          earnedAt: (progressData?.filter(p => p.is_completed)?.length || 0) >= 5
            ? new Date().toISOString() : undefined,
        },
        // Estrategista (completa solução de estratégia)
        {
          id: 'achievement-strategist',
          name: 'Estrategista',
          description: 'Completou uma solução da trilha de Estratégia',
          category: 'strategy',
          requiredCount: 1,
          currentCount: progressData?.filter(p => p.is_completed && p.solutions?.category === 'strategy')?.length || 0,
          isUnlocked: progressData?.some(p => p.is_completed && p.solutions?.category === 'strategy') || false,
          earnedAt: progressData?.some(p => p.is_completed && p.solutions?.category === 'strategy')
            ? new Date().toISOString() : undefined,
        },
      ];
      
      // Incluir também badges específicos da tabela de badges (se houver)
      if (badgesData && badgesData.length > 0) {
        badgesData.forEach(badgeData => {
          if (badgeData.badges) {
            allAchievements.push({
              id: badgeData.badges.id,
              name: badgeData.badges.name,
              description: badgeData.badges.description,
              icon: badgeData.badges.icon,
              category: badgeData.badges.category as any,
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
          category: 'achievement',
          isUnlocked: true,
          earnedAt: new Date().toISOString(),
        },
        {
          id: 'achievement-pioneiro',
          name: 'Pioneiro',
          description: 'Completou sua primeira implementação',
          category: 'achievement', 
          requiredCount: 1,
          currentCount: 0,
          isUnlocked: false,
        }
      ];
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
