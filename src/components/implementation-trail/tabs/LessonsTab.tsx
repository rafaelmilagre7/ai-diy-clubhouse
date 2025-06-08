
import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GraduationCap, ArrowRight, Sparkles, TrendingUp, Eye } from 'lucide-react';
import { EnhancedLessonCard } from '../cards/EnhancedLessonCard';
import { useLessonImages } from '../hooks/useLessonImages';
import { useTopLessons } from '../hooks/useTopLessons';

interface RecommendedLesson {
  lessonId: string;
  moduleId: string;
  courseId: string;
  title: string;
  justification: string;
  priority: number;
}

interface LessonsTabProps {
  lessons: RecommendedLesson[];
}

export const LessonsTab = ({ lessons }: LessonsTabProps) => {
  const { topLessons, hasMoreLessons, remainingCount, totalLessons } = useTopLessons(lessons, 5);
  const { fetchLessonImages, loading } = useLessonImages();

  // Precarregar imagens das top 5 aulas
  useEffect(() => {
    if (topLessons.length > 0) {
      const lessonIds = topLessons.map(lesson => lesson.lessonId);
      fetchLessonImages(lessonIds);
    }
  }, [topLessons, fetchLessonImages]);

  if (!lessons || lessons.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-viverblue/10 via-green-500/5 to-transparent rounded-2xl blur-xl opacity-50" />
          <Card className="glass-dark border border-neutral-700/50 relative backdrop-blur-sm max-w-md mx-auto">
            <CardContent className="p-8 text-center">
              <GraduationCap className="h-16 w-16 mx-auto text-medium-contrast mb-4" />
              <h3 className="text-lg font-semibold text-high-contrast mb-2">
                Nenhuma aula recomendada
              </h3>
              <p className="text-medium-contrast">
                Não há aulas personalizadas para sua trilha no momento.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header da seção - melhorado */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-viverblue/20 via-green-500/10 to-transparent rounded-2xl blur-xl opacity-50" />
        <Card className="glass-dark border-2 border-viverblue/40 bg-viverblue/5 relative overflow-hidden backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-transparent" />
          <CardHeader className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-viverblue/20 rounded-xl">
                  <GraduationCap className="h-8 w-8 text-viverblue animate-pulse" />
                </div>
                <div>
                  <CardTitle className="text-high-contrast text-3xl font-bold flex items-center gap-2">
                    🎓 Top 5 Aulas Recomendadas
                    <Sparkles className="h-6 w-6 text-viverblue animate-pulse" />
                  </CardTitle>
                  <p className="text-medium-contrast text-lg mt-2">
                    As {topLessons.length} aulas mais relevantes selecionadas especialmente para você
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-viverblue">{topLessons.length}</div>
                <div className="text-sm text-medium-contrast">Top Aulas</div>
                {hasMoreLessons && (
                  <div className="text-xs text-green-400 mt-1">
                    +{remainingCount} disponíveis
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: Math.min(5, topLessons.length) }, (_, i) => (
            <Card key={i} className="glass-dark border border-neutral-700/50 animate-pulse">
              <CardContent className="p-0">
                <div className="h-64 bg-neutral-800 rounded-t-xl"></div>
                <div className="p-6 space-y-4">
                  <div className="h-6 bg-neutral-700 rounded w-3/4"></div>
                  <div className="h-4 bg-neutral-700 rounded w-1/2"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-neutral-700 rounded"></div>
                    <div className="h-3 bg-neutral-700 rounded w-4/5"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Grid de aulas - Netflix style */}
      {!loading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {topLessons.map((lesson, index) => (
            <div
              key={`${lesson.lessonId}-${index}`}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <EnhancedLessonCard lesson={lesson} index={index} />
            </div>
          ))}
        </div>
      )}

      {/* Indicador de mais aulas disponíveis */}
      {hasMoreLessons && !loading && (
        <div className="animate-fade-in" style={{ animationDelay: '750ms' }}>
          <Card className="glass-dark border border-viverblue/30 bg-viverblue/5 hover:border-viverblue/50 transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <TrendingUp className="h-6 w-6 text-viverblue" />
                <h3 className="text-xl font-semibold text-high-contrast">
                  Mais Aulas Disponíveis
                </h3>
              </div>
              <p className="text-medium-contrast mb-4">
                Existem mais <span className="text-viverblue font-semibold">{remainingCount} aulas</span> recomendadas 
                além das top 5 mostradas acima.
              </p>
              <Button 
                variant="outline" 
                className="border-viverblue/50 text-viverblue hover:bg-viverblue/10"
              >
                <Eye className="mr-2 h-4 w-4" />
                Ver Todas as {totalLessons} Aulas
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
