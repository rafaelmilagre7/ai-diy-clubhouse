
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLogging } from '@/hooks/useLogging';
import { useDataValidation } from '../useDataValidation';

interface JourneyStep {
  step: string;
  users: number;
  conversionRate: number;
  avgTimeMinutes?: number; // Agora opcional
  dropoffRate: number;
}

export const useUserJourneyData = (timeRange: string) => {
  const { log, logWarning } = useLogging();
  const { validateAnalyticsData, validateNumericValue } = useDataValidation();

  return useQuery({
    queryKey: ['user-journey-data', timeRange],
    queryFn: async (): Promise<JourneyStep[]> => {
      try {
        log('Buscando dados de jornada do usuário', { timeRange });

        // Calcular período baseado no timeRange
        const now = new Date();
        let startDate: Date;

        switch (timeRange) {
          case '7d':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case '30d':
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
          case '90d':
            startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
            break;
          default:
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        }

        // 1. Buscar usuários registrados no período
        const { data: registeredUsers } = await supabase
          .from('profiles')
          .select('id, created_at')
          .gte('created_at', startDate.toISOString())
          .lte('created_at', now.toISOString());

        // 2. Buscar atividade dos usuários (analytics)
        const { data: userActivity } = await supabase
          .from('analytics')
          .select('user_id, created_at, event_type')
          .gte('created_at', startDate.toISOString())
          .lte('created_at', now.toISOString());

        // 3. Buscar progresso de implementações
        const { data: implementations } = await supabase
          .from('progress')
          .select('user_id, created_at, is_completed, updated_at')
          .gte('created_at', startDate.toISOString())
          .lte('created_at', now.toISOString());

        const totalValidation = validateNumericValue(registeredUsers?.length);
        if (!totalValidation.isValid || totalValidation.value === 0) {
          return [];
        }

        const totalRegistered = totalValidation.value;

        // Processar dados da jornada
        const userIds = new Set(registeredUsers?.map(u => u.id) || []);
        const activeUserIds = new Set(userActivity?.map(a => a.user_id) || []);
        const implementingUserIds = new Set(implementations?.map(p => p.user_id) || []);
        const completedUserIds = new Set(
          implementations?.filter(p => p.is_completed).map(p => p.user_id) || []
        );

        const firstAccessUsers = Array.from(userIds).filter(id => activeUserIds.has(id));
        const implementationUsers = Array.from(userIds).filter(id => implementingUserIds.has(id));
        const completionUsers = Array.from(userIds).filter(id => completedUserIds.has(id));

        // Calcular tempos médios baseados em dados reais, se disponíveis
        const calculateAvgTime = (dataSet: any[], dateField: string) => {
          if (!dataSet || dataSet.length === 0) return undefined;
          
          const times = dataSet
            .filter(item => item[dateField])
            .map(item => new Date(item[dateField]).getTime())
            .filter(time => !isNaN(time));
            
          if (times.length === 0) return undefined;
          
          const avgTimestamp = times.reduce((sum, time) => sum + time, 0) / times.length;
          return Math.round((Date.now() - avgTimestamp) / (1000 * 60)); // minutos desde a ação
        };

        const journeySteps: JourneyStep[] = [
          {
            step: 'Registro',
            users: totalRegistered,
            conversionRate: 100,
            avgTimeMinutes: calculateAvgTime(registeredUsers || [], 'created_at'),
            dropoffRate: 0
          },
          {
            step: 'Primeiro Acesso',
            users: firstAccessUsers.length,
            conversionRate: (firstAccessUsers.length / totalRegistered) * 100,
            avgTimeMinutes: calculateAvgTime(userActivity || [], 'created_at'),
            dropoffRate: ((totalRegistered - firstAccessUsers.length) / totalRegistered) * 100
          },
          {
            step: 'Primeira Implementação',
            users: implementationUsers.length,
            conversionRate: (implementationUsers.length / totalRegistered) * 100,
            avgTimeMinutes: calculateAvgTime(implementations || [], 'created_at'),
            dropoffRate: firstAccessUsers.length > 0 
              ? ((firstAccessUsers.length - implementationUsers.length) / firstAccessUsers.length) * 100 
              : 0
          },
          {
            step: 'Conclusão',
            users: completionUsers.length,
            conversionRate: (completionUsers.length / totalRegistered) * 100,
            avgTimeMinutes: calculateAvgTime(
              implementations?.filter(p => p.is_completed) || [], 
              'updated_at'
            ),
            dropoffRate: implementationUsers.length > 0
              ? ((implementationUsers.length - completionUsers.length) / implementationUsers.length) * 100
              : 0
          }
        ];

        // Validar dados
        const validation = validateAnalyticsData(journeySteps, 'Jornada do Usuário');
        if (!validation.isValid) {
          logWarning('Dados de jornada inválidos', { errors: validation.errors });
        }

        log('Dados de jornada processados', { 
          totalSteps: journeySteps.length,
          totalUsers: totalRegistered
        });

        return journeySteps;

      } catch (error: any) {
        logWarning('Erro ao buscar dados de jornada do usuário', { 
          error: error.message,
          timeRange
        });
        throw new Error(`Falha ao carregar dados de jornada: ${error.message}`);
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false
  });
};
