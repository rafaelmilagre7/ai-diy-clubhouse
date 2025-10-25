import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Brain, ArrowRight } from 'lucide-react';
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div 
            key={i} 
            className="h-96 rounded-lg bg-muted animate-pulse relative overflow-hidden"
          >
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          </div>
        ))}
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
      <div className="liquid-glass-card border border-aurora/20 backdrop-blur-xl p-12 text-center rounded-lg">
        <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground/40" />
        <p className="text-lg font-medium text-foreground mb-2">
          Nenhuma recomendação disponível
        </p>
        <p className="text-sm text-muted-foreground">
          A IA não encontrou aulas compatíveis com esta solução
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header com estatísticas */}
      <div className="flex items-center justify-between pb-6">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          <span className="text-sm font-medium text-muted-foreground">
            {recommendations.length} {recommendations.length === 1 ? 'aula recomendada' : 'aulas recomendadas'}
          </span>
        </div>
        <Badge variant="outline" className="gap-1">
          <Brain className="h-3 w-3" />
          Ranqueadas por IA
        </Badge>
      </div>

      {/* Grid de cards de recomendações */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendations.map((rec, index) => {
          const lesson = rec.lesson;
          if (!lesson) return null;

          const courseTitle = lesson.learning_modules?.[0]?.learning_courses?.[0]?.title || 'Curso';
          const moduleTitle = lesson.learning_modules?.[0]?.title || '';

          return (
            <motion.div
              key={rec.lesson_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group relative overflow-hidden rounded-lg border border-border/50 bg-surface-elevated/30 hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10"
            >
              {/* Thumbnail com overlay */}
              <div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5">
                {lesson.cover_image_url ? (
                  <img 
                    src={lesson.cover_image_url} 
                    alt={lesson.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen className="h-16 w-16 text-primary/30" />
                  </div>
                )}
                
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
                
                {/* Badge de relevância - overlay superior direito */}
                <div className="absolute top-3 right-3 flex flex-col items-end gap-1">
                  <Badge className="bg-primary/90 backdrop-blur-sm border-0 shadow-lg">
                    <Brain className="h-3 w-3 mr-1" />
                    {rec.relevance_score}%
                  </Badge>
                </div>

                {/* Badge do curso - overlay superior esquerdo */}
                <Badge 
                  variant="secondary" 
                  className="absolute top-3 left-3 bg-background/80 backdrop-blur-sm shadow-lg"
                >
                  {courseTitle}
                </Badge>
              </div>

              {/* Conteúdo do card */}
              <div className="p-5 space-y-4">
                {/* Título e módulo */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-base leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                    {lesson.title}
                  </h4>
                  {moduleTitle && (
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      📂 {moduleTitle}
                    </p>
                  )}
                </div>

                {/* Justificativa */}
                <p className="text-sm text-foreground/70 leading-relaxed line-clamp-3">
                  {rec.justification}
                </p>

                {/* Tópicos-chave */}
                {rec.key_topics && rec.key_topics.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {rec.key_topics.slice(0, 3).map((topic, idx) => (
                      <Badge 
                        key={idx} 
                        variant="outline" 
                        className="text-xs py-0.5 px-2"
                      >
                        {topic}
                      </Badge>
                    ))}
                    {rec.key_topics.length > 3 && (
                      <Badge variant="outline" className="text-xs py-0.5 px-2">
                        +{rec.key_topics.length - 3}
                      </Badge>
                    )}
                  </div>
                )}

                {/* Botão de ação */}
                <Button
                  onClick={() => navigate(`/formacao/aula/${lesson.id}`)}
                  className="w-full group/btn"
                  size="sm"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Assistir Aula
                  <ArrowRight className="h-4 w-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
