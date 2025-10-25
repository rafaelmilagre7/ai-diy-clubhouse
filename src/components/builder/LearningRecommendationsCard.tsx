import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BookOpen, TrendingUp, ArrowRight, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useLearningRecommendations } from '@/hooks/useLearningRecommendations';

interface LearningRecommendationsCardProps {
  solutionId: string;
}

export const LearningRecommendationsCard: React.FC<LearningRecommendationsCardProps> = ({ 
  solutionId 
}) => {
  const navigate = useNavigate();
  const { data: recommendations, isLoading, error } = useLearningRecommendations(solutionId);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">
          Analisando sua solução e buscando as melhores aulas...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-destructive">
          Erro ao carregar recomendações. Tente novamente.
        </p>
      </div>
    );
  }

  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="text-center py-8 space-y-2">
        <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">
          Nenhuma recomendação encontrada para esta solução
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header com estatísticas */}
      <div className="flex items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <span className="text-sm font-medium text-muted-foreground">
            {recommendations.length} {recommendations.length === 1 ? 'aula recomendada' : 'aulas recomendadas'}
          </span>
        </div>
        <Badge variant="outline" className="gap-1">
          <TrendingUp className="h-3 w-3" />
          Ranqueadas por IA
        </Badge>
      </div>

      {/* Lista de recomendações */}
      <div className="space-y-3">
        {recommendations.map((rec, index) => {
          const lesson = rec.lesson;
          if (!lesson) return null;

          const courseTitle = lesson.learning_modules?.[0]?.learning_courses?.[0]?.title || 'Curso';
          const moduleTitle = lesson.learning_modules?.[0]?.title || '';
          const courseId = lesson.learning_modules?.[0]?.learning_courses?.[0]?.id;

          return (
            <motion.div
              key={rec.lesson_id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group p-4 rounded-lg border border-border/50 bg-surface-elevated/30 hover:bg-surface-elevated/50 hover:border-primary/30 transition-all duration-200"
            >
              {/* Header da aula */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 space-y-1">
                  <h4 className="font-semibold text-base leading-tight group-hover:text-primary transition-colors">
                    {lesson.title}
                  </h4>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="secondary" className="text-xs">
                      {courseTitle}
                    </Badge>
                    {moduleTitle && (
                      <span className="text-xs text-muted-foreground">
                        {moduleTitle}
                      </span>
                    )}
                  </div>
                </div>

                {/* Score de relevância */}
                <div className="flex flex-col items-end gap-1 min-w-[80px]">
                  <div className="flex items-center gap-1.5">
                    <TrendingUp className="h-3.5 w-3.5 text-primary" />
                    <span className="text-sm font-bold text-primary">
                      {rec.relevance_score}%
                    </span>
                  </div>
                  <Progress 
                    value={rec.relevance_score} 
                    className="h-1.5 w-full"
                  />
                </div>
              </div>

              {/* Justificativa */}
              <p className="text-sm text-foreground/80 leading-relaxed mb-3">
                {rec.justification}
              </p>

              {/* Tópicos-chave */}
              {rec.key_topics && rec.key_topics.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap mb-3">
                  <span className="text-xs text-muted-foreground">Tópicos:</span>
                  {rec.key_topics.map((topic, idx) => (
                    <Badge 
                      key={idx} 
                      variant="outline" 
                      className="text-xs py-0.5 px-2"
                    >
                      {topic}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Botão de ação */}
              <Button
                onClick={() => navigate(`/formacao/aula/${lesson.id}`)}
                size="sm"
                className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                variant="outline"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Assistir Aula
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
