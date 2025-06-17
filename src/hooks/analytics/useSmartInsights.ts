
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface Insight {
  id: string;
  type: 'opportunity' | 'warning' | 'success' | 'trend';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  actionable: boolean;
  confidence: number;
}

export const useSmartInsights = (timeRange: string) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const generateInsights = async () => {
      try {
        setLoading(true);
        setError(null);

        const insights: Insight[] = [];

        // Analisar atividade por dia da semana
        const { data: analyticsData } = await supabase
          .from('analytics')
          .select('created_at')
          .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

        if (analyticsData && analyticsData.length > 0) {
          const dayActivity = analyticsData.reduce((acc, record) => {
            const day = new Date(record.created_at).getDay();
            acc[day] = (acc[day] || 0) + 1;
            return acc;
          }, {} as Record<number, number>);

          const maxActivity = Math.max(...Object.values(dayActivity));
          const maxDay = Object.keys(dayActivity).find(day => dayActivity[parseInt(day)] === maxActivity);
          const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
          
          if (maxDay && maxActivity > 0) {
            const avgActivity = Object.values(dayActivity).reduce((a, b) => a + b, 0) / 7;
            const increasePercent = Math.round(((maxActivity - avgActivity) / avgActivity) * 100);
            
            if (increasePercent > 20) {
              insights.push({
                id: 'day-activity-peak',
                type: 'trend',
                title: `Pico de Atividade às ${dayNames[parseInt(maxDay)]}s`,
                description: `Usuários são ${increasePercent}% mais ativos às ${dayNames[parseInt(maxDay)]}s. Considere agendar lançamentos e comunicações neste dia.`,
                impact: increasePercent > 50 ? 'high' : 'medium',
                actionable: true,
                confidence: Math.min(95, 70 + increasePercent / 2)
              });
            }
          }
        }

        // Analisar progresso de implementações
        const { data: progressData } = await supabase
          .from('progress')
          .select('is_completed, created_at');

        if (progressData && progressData.length > 0) {
          const completionRate = (progressData.filter(p => p.is_completed).length / progressData.length) * 100;
          
          if (completionRate < 60) {
            insights.push({
              id: 'low-completion-rate',
              type: 'warning',
              title: 'Taxa de Conclusão Abaixo do Esperado',
              description: `Taxa de conclusão atual é de ${completionRate.toFixed(1)}%. Considere revisar o processo de implementação ou fornecer mais suporte.`,
              impact: 'high',
              actionable: true,
              confidence: 90
            });
          } else if (completionRate > 80) {
            insights.push({
              id: 'high-completion-rate',
              type: 'success',
              title: 'Excelente Taxa de Conclusão',
              description: `Taxa de conclusão de ${completionRate.toFixed(1)}% demonstra alta efetividade das soluções oferecidas.`,
              impact: 'medium',
              actionable: false,
              confidence: 95
            });
          }
        }

        // Analisar crescimento de usuários
        const { data: usersData } = await supabase
          .from('profiles')
          .select('created_at')
          .order('created_at', { ascending: false });

        if (usersData && usersData.length > 0) {
          const now = new Date();
          const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);
          
          const currentMonthUsers = usersData.filter(u => new Date(u.created_at) >= lastMonth).length;
          const previousMonthUsers = usersData.filter(u => {
            const date = new Date(u.created_at);
            return date >= twoMonthsAgo && date < lastMonth;
          }).length;
          
          if (previousMonthUsers > 0) {
            const growthRate = ((currentMonthUsers - previousMonthUsers) / previousMonthUsers) * 100;
            
            if (growthRate > 10) {
              insights.push({
                id: 'user-growth',
                type: 'opportunity',
                title: 'Crescimento Acelerado de Usuários',
                description: `Crescimento de ${growthRate.toFixed(1)}% no último mês. Oportunidade para expandir infraestrutura e conteúdo.`,
                impact: 'high',
                actionable: true,
                confidence: 85
              });
            } else if (growthRate < -5) {
              insights.push({
                id: 'user-decline',
                type: 'warning',
                title: 'Declínio no Crescimento de Usuários',
                description: `Redução de ${Math.abs(growthRate).toFixed(1)}% no crescimento. Revisar estratégias de aquisição.`,
                impact: 'high',
                actionable: true,
                confidence: 80
              });
            }
          }
        }

        // Se não há dados suficientes, adicionar insight padrão
        if (insights.length === 0) {
          insights.push({
            id: 'getting-started',
            type: 'trend',
            title: 'Coletando Dados Iniciais',
            description: 'À medida que mais usuários interagem com a plataforma, insights mais detalhados serão gerados automaticamente.',
            impact: 'low',
            actionable: false,
            confidence: 100
          });
        }

        setInsights(insights);

      } catch (err: any) {
        console.error('Erro ao gerar insights:', err);
        setError(err.message || 'Erro ao gerar insights');
        toast({
          title: "Erro ao gerar insights",
          description: "Não foi possível gerar os insights automáticos.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    generateInsights();
  }, [timeRange, toast]);

  return { insights, loading, error };
};
