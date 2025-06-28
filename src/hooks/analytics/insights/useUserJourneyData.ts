
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface JourneyStep {
  step: string;
  users: number;
  completion_rate: number;
  avg_time_minutes: number;
  drop_off_rate: number;
}

export interface UserJourneyData {
  steps: JourneyStep[];
  total_users: number;
  completion_rate: number;
  avg_journey_time: number;
  insights: string[];
}

export const useUserJourneyData = () => {
  return useQuery({
    queryKey: ['user-journey-data'],
    queryFn: async (): Promise<UserJourneyData> => {
      console.log('🗺️ [USER JOURNEY] Analisando jornada do usuário...');

      try {
        // Buscar dados básicos
        const [profilesResult, analyticsResult] = await Promise.allSettled([
          supabase.from('profiles').select('id, created_at').limit(100),
          supabase.from('analytics').select('*').limit(200)
        ]);

        const profiles = profilesResult.status === 'fulfilled' ? profilesResult.value.data || [] : [];
        const analytics = analyticsResult.status === 'fulfilled' ? analyticsResult.value.data || [] : [];

        const totalUsers = profiles.length;

        // Simular dados de jornada
        const steps: JourneyStep[] = [
          {
            step: 'Registro',
            users: totalUsers,
            completion_rate: 100,
            avg_time_minutes: 2,
            drop_off_rate: 0
          },
          {
            step: 'Onboarding',
            users: Math.floor(totalUsers * 0.85),
            completion_rate: 85,
            avg_time_minutes: 8,
            drop_off_rate: 15
          },
          {
            step: 'Primeira Solução',
            users: Math.floor(totalUsers * 0.65),
            completion_rate: 65,
            avg_time_minutes: 25,
            drop_off_rate: 20
          },
          {
            step: 'Implementação',
            users: Math.floor(totalUsers * 0.45),
            completion_rate: 45,
            avg_time_minutes: 120,
            drop_off_rate: 20
          },
          {
            step: 'Conclusão',
            users: Math.floor(totalUsers * 0.30),
            completion_rate: 30,
            avg_time_minutes: 180,
            drop_off_rate: 15
          }
        ];

        const insights: string[] = [];
        
        // Gerar insights baseados nos dados
        const highestDropOff = steps.reduce((max, step) => 
          step.drop_off_rate > max.drop_off_rate ? step : max
        );
        
        if (highestDropOff.drop_off_rate > 15) {
          insights.push(`Maior abandono na etapa "${highestDropOff.step}" (${highestDropOff.drop_off_rate}%)`);
        }

        const avgCompletionRate = steps.reduce((sum, step) => sum + step.completion_rate, 0) / steps.length;
        if (avgCompletionRate < 50) {
          insights.push('Taxa de conclusão geral baixa - revisar fluxo de onboarding');
        }

        const journeyData: UserJourneyData = {
          steps,
          total_users: totalUsers,
          completion_rate: steps[steps.length - 1]?.completion_rate || 0,
          avg_journey_time: steps.reduce((sum, step) => sum + step.avg_time_minutes, 0),
          insights
        };

        console.log(`✅ [USER JOURNEY] Análise concluída: ${steps.length} etapas analisadas`);
        return journeyData;

      } catch (error) {
        console.error('❌ [USER JOURNEY] Erro na análise:', error);
        throw error;
      }
    },
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false
  });
};
