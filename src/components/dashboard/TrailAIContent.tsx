
import React from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, BookOpen, Target, ArrowRight } from "lucide-react";
import { TrailSolutionEnriched, TrailLessonEnriched } from "@/types/implementation-trail";

interface TrailAIContentProps {
  enrichedSolutions: TrailSolutionEnriched[];
  enrichedLessons: TrailLessonEnriched[];
  isLoading: boolean;
  onSolutionClick: (id: string) => void;
  onLessonClick: (courseId: string, lessonId: string) => void;
  onViewAll: () => void;
}

export const TrailAIContent: React.FC<TrailAIContentProps> = ({
  enrichedSolutions,
  enrichedLessons,
  isLoading,
  onSolutionClick,
  onLessonClick,
  onViewAll
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-viverblue"></div>
        <span className="ml-3 text-neutral-400">Carregando recomendações...</span>
      </div>
    );
  }

  const totalRecommendations = enrichedSolutions.length + enrichedLessons.length;

  return (
    <div className="space-y-6">
      {/* AI Header */}
      <div className="text-center p-4 bg-viverblue/10 border border-viverblue/20 rounded-lg">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Sparkles className="h-5 w-5 text-viverblue" />
          <h3 className="font-semibold text-viverblue">Recomendações Personalizadas</h3>
        </div>
        <p className="text-sm text-neutral-400">
          {totalRecommendations} itens selecionados pela IA baseados no seu perfil
        </p>
      </div>

      {/* Soluções Prioritárias */}
      {enrichedSolutions.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-viverblue" />
            <h4 className="font-medium text-white">Soluções Prioritárias ({enrichedSolutions.length})</h4>
          </div>
          
          {enrichedSolutions.slice(0, 2).map((solution) => (
            <div key={solution.id} className="bg-neutral-800/50 border border-neutral-700/50 rounded-lg p-4 hover:bg-neutral-800/70 transition-colors cursor-pointer" onClick={() => onSolutionClick(solution.id)}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs px-2 py-1 rounded bg-viverblue/20 text-viverblue font-medium">
                      {solution.category}
                    </span>
                    <span className="text-xs px-2 py-1 rounded bg-neutral-700 text-neutral-300">
                      {solution.difficulty}
                    </span>
                  </div>
                  <h5 className="font-medium text-white mb-2">{solution.title}</h5>
                  <p className="text-sm text-neutral-400 line-clamp-2 mb-3">{solution.description}</p>
                  {solution.justification && (
                    <div className="bg-viverblue/10 border border-viverblue/20 rounded p-2">
                      <p className="text-xs text-viverblue">{solution.justification}</p>
                    </div>
                  )}
                </div>
                <ArrowRight className="h-4 w-4 text-neutral-400 ml-4 flex-shrink-0" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Aulas Recomendadas */}
      {enrichedLessons.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-viverblue" />
            <h4 className="font-medium text-white">Aulas Recomendadas ({enrichedLessons.length})</h4>
          </div>
          
          {enrichedLessons.slice(0, 2).map((lesson) => (
            <div key={lesson.id} className="bg-neutral-800/50 border border-neutral-700/50 rounded-lg p-4 hover:bg-neutral-800/70 transition-colors cursor-pointer" onClick={() => onLessonClick(lesson.courseId, lesson.id)}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h5 className="font-medium text-white mb-2">{lesson.title}</h5>
                  <div className="flex items-center gap-2 text-sm text-neutral-400 mb-3">
                    <span>{lesson.module?.course?.title}</span>
                    <span>•</span>
                    <span>{lesson.module?.title}</span>
                    {lesson.estimated_time_minutes && (
                      <>
                        <span>•</span>
                        <span>{lesson.estimated_time_minutes} min</span>
                      </>
                    )}
                  </div>
                  {lesson.justification && (
                    <div className="bg-viverblue/10 border border-viverblue/20 rounded p-2">
                      <p className="text-xs text-viverblue">{lesson.justification}</p>
                    </div>
                  )}
                </div>
                <ArrowRight className="h-4 w-4 text-neutral-400 ml-4 flex-shrink-0" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Ver Tudo */}
      {totalRecommendations > 4 && (
        <div className="text-center pt-6 border-t border-neutral-700/50">
          <Button 
            onClick={onViewAll}
            variant="outline" 
            className="border-viverblue/40 text-viverblue hover:bg-viverblue/10"
          >
            Ver Trilha Completa ({totalRecommendations} itens)
          </Button>
        </div>
      )}
    </div>
  );
};
