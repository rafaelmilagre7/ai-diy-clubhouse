import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LiquidGlassCard } from '@/components/ui/LiquidGlassCard';
import { Sparkles, BookOpen, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface FlowTrailConnectorProps {
  solutionId: string;
  userId: string;
}

interface RecommendedLesson {
  lessonId: string;
  moduleId: string;
  courseId: string;
  title: string;
  justification: string;
  priority: number;
}

export const FlowTrailConnector: React.FC<FlowTrailConnectorProps> = ({
  solutionId,
  userId
}) => {
  const navigate = useNavigate();

  // Buscar implementation trail do usuário
  const { data: trailData } = useQuery({
    queryKey: ['implementation-trail', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('implementation_trails')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();

      if (error) throw error;
      return data;
    },
    retry: 1
  });

  // Verificar se esta solução está na trilha
  const isInTrail = React.useMemo(() => {
    if (!trailData?.trail_data) return false;

    const allRecommendations = [
      ...(trailData.trail_data.priority1 || []),
      ...(trailData.trail_data.priority2 || []),
      ...(trailData.trail_data.priority3 || [])
    ];

    return allRecommendations.some((rec: any) => rec.solutionId === solutionId);
  }, [trailData, solutionId]);

  // Pegar aulas recomendadas
  const recommendedLessons: RecommendedLesson[] = React.useMemo(() => {
    if (!trailData?.trail_data?.recommended_lessons) return [];
    return trailData.trail_data.recommended_lessons.slice(0, 3); // Top 3
  }, [trailData]);

  if (!isInTrail && recommendedLessons.length === 0) {
    return null;
  }

  return (
    <LiquidGlassCard className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
      <div className="flex items-start gap-3 mb-4">
        <div className="p-2 bg-primary/20 rounded-lg">
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-high-contrast mb-1">
            Conexão com sua Trilha de Implementação
          </h3>
          {isInTrail && (
            <Badge variant="default" className="text-xs">
              Solução Prioritária
            </Badge>
          )}
        </div>
      </div>

      {isInTrail && (
        <p className="text-sm text-medium-contrast mb-4">
          Esta solução faz parte da sua trilha de implementação personalizada. 
          Complete os fluxos acima para avançar.
        </p>
      )}

      {recommendedLessons.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="h-4 w-4 text-primary" />
            <p className="text-sm font-semibold text-high-contrast">
              Aulas Recomendadas pela IA
            </p>
          </div>

          {recommendedLessons.map((lesson) => (
            <Button
              key={lesson.lessonId}
              variant="outline"
              className="w-full justify-start text-left h-auto py-3 hover:bg-primary/10"
              onClick={() => navigate(`/aulas/${lesson.courseId}/${lesson.moduleId}/${lesson.lessonId}`)}
            >
              <div className="flex-1">
                <p className="text-sm font-medium text-high-contrast mb-1">
                  {lesson.title}
                </p>
                <p className="text-xs text-medium-contrast line-clamp-2">
                  {lesson.justification}
                </p>
              </div>
              <ExternalLink className="h-4 w-4 ml-2 flex-shrink-0 text-primary" />
            </Button>
          ))}

          <Button
            variant="link"
            size="sm"
            onClick={() => navigate('/trilha-implementacao')}
            className="w-full text-primary"
          >
            Ver trilha completa →
          </Button>
        </div>
      )}
    </LiquidGlassCard>
  );
};
