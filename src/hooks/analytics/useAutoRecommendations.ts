
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

interface Recommendation {
  id: string;
  title: string;
  description: string;
  type: 'opportunity' | 'warning' | 'success';
  priority: 'high' | 'medium' | 'low';
  updated_at: string;
}

export const useAutoRecommendations = (timeRange: string) => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['auto-recommendations', timeRange],
    queryFn: async () => {
      // Mock data para demonstração
      const mockRecommendations: Recommendation[] = [
        {
          id: '1',
          title: 'Oportunidade de Engajamento',
          description: 'Taxa de engajamento baixa detectada. Considere enviar notificações personalizadas.',
          type: 'opportunity',
          priority: 'high',
          updated_at: new Date().toISOString(),
        },
        {
          id: '2',
          title: 'Otimização de Cursos',
          description: 'Alguns cursos têm baixa taxa de conclusão. Revise o conteúdo.',
          type: 'warning',
          priority: 'medium',
          updated_at: new Date().toISOString(),
        },
        {
          id: '3',
          title: 'Crescimento Positivo',
          description: 'Aumento significativo de usuários ativos este mês.',
          type: 'success',
          priority: 'low',
          updated_at: new Date().toISOString(),
        },
      ];
      
      return mockRecommendations;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  useEffect(() => {
    if (data) {
      setRecommendations(data);
    }
  }, [data]);

  const handleImplementRecommendation = (id: string) => {
    console.log(`Implementando recomendação: ${id}`);
    // Aqui implementaria a lógica real
  };

  const handleDismissRecommendation = (id: string) => {
    setRecommendations(prev => prev.filter(rec => rec.id !== id));
    console.log(`Ignorando recomendação: ${id}`);
  };

  return {
    recommendations,
    loading: isLoading,
    error: error?.message || null,
    handleImplementRecommendation,
    handleDismissRecommendation,
  };
};
