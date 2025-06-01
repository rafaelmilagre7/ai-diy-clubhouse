
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, BookOpen, Lightbulb, Sparkles, Eye, Lock } from "lucide-react";
import { TrailSolutionEnriched, TrailLessonEnriched } from "@/types/implementation-trail";
import { useLearningAccess } from "@/hooks/learning/useLearningAccess";
import { toast } from "sonner";

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
  const { hasLearningAccess, canAccessLesson } = useLearningAccess();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-viverblue"></div>
          <span className="ml-3 text-neutral-400">Carregando trilha personalizada...</span>
        </div>
      </div>
    );
  }

  const topSolutions = enrichedSolutions.filter(s => s.priority === 1).slice(0, 2);
  const topLessons = enrichedLessons.slice(0, 2);

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1: return "bg-viverblue text-white";
      case 2: return "bg-amber-500 text-white";
      case 3: return "bg-neutral-500 text-white";
      default: return "bg-neutral-600 text-white";
    }
  };

  const handleLessonClick = (lesson: TrailLessonEnriched) => {
    if (!hasLearningAccess) {
      toast.error("Acesso negado", {
        description: "Você precisa de permissões para acessar as aulas"
      });
      return;
    }

    if (!canAccessLesson(lesson.module.course.id, lesson.id)) {
      toast.error("Aula não disponível", {
        description: "Esta aula não está disponível para seu perfil"
      });
      return;
    }

    onLessonClick(lesson.module.course.id, lesson.id);
  };

  return (
    <div className="space-y-6">
      {/* AI Header */}
      <div className="text-center p-4 bg-viverblue/10 border border-viverblue/20 rounded-lg">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Sparkles className="h-5 w-5 text-viverblue animate-pulse" />
          <span className="text-viverblue font-semibold">Trilha Personalizada com IA</span>
        </div>
        <p className="text-sm text-neutral-400">
          Soluções e aulas selecionadas especialmente para o seu perfil
        </p>
      </div>

      {/* Top Priority Solutions */}
      {topSolutions.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-viverblue" />
            <h3 className="font-semibold text-white">Soluções Prioritárias</h3>
          </div>
          
          {topSolutions.map((solution) => (
            <div
              key={solution.id}
              className="bg-neutral-800/50 border border-neutral-700/50 rounded-lg p-4 cursor-pointer hover:border-viverblue/30 transition-all group hover:bg-neutral-800/70"
              onClick={() => onSolutionClick(solution.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={getPriorityColor(solution.priority)}>
                      Alta Prioridade
                    </Badge>
                    <Badge variant="outline" className="border-neutral-600 text-neutral-300">
                      {solution.difficulty}
                    </Badge>
                  </div>
                  <h4 className="font-medium text-white group-hover:text-viverblue transition-colors">
                    {solution.title}
                  </h4>
                  <p className="text-sm text-neutral-400 mt-1 line-clamp-2">
                    {solution.description}
                  </p>
                  {solution.justification && (
                    <div className="mt-2 p-2 bg-viverblue/10 border border-viverblue/20 rounded">
                      <p className="text-xs text-viverblue">
                        💡 {solution.justification}
                      </p>
                    </div>
                  )}
                </div>
                <ArrowRight className="h-4 w-4 text-neutral-400 group-hover:text-viverblue transition-colors" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recommended Lessons */}
      {topLessons.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-viverblue" />
            <h3 className="font-semibold text-white">Aulas Recomendadas</h3>
          </div>
          
          {topLessons.map((lesson) => {
            const hasAccess = hasLearningAccess && canAccessLesson(lesson.module.course.id, lesson.id);
            
            return (
              <div
                key={lesson.id}
                className={`bg-neutral-800/50 border border-neutral-700/50 rounded-lg p-4 transition-all group ${
                  hasAccess 
                    ? 'cursor-pointer hover:border-viverblue/30 hover:bg-neutral-800/70' 
                    : 'opacity-60'
                }`}
                onClick={() => hasAccess && handleLessonClick(lesson)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {!hasAccess && <Lock className="h-3 w-3 text-neutral-500" />}
                      <h4 className={`font-medium ${hasAccess ? 'text-white group-hover:text-viverblue' : 'text-neutral-400'} transition-colors`}>
                        {lesson.title}
                      </h4>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-neutral-400 mt-1">
                      <span>{lesson.module.course.title}</span>
                      <span>•</span>
                      <span>{lesson.module.title}</span>
                      {lesson.estimated_time_minutes && (
                        <>
                          <span>•</span>
                          <span>{lesson.estimated_time_minutes} min</span>
                        </>
                      )}
                    </div>
                    {lesson.justification && (
                      <div className="mt-2 p-2 bg-viverblue/10 border border-viverblue/20 rounded">
                        <p className="text-xs text-viverblue">
                          💡 {lesson.justification}
                        </p>
                      </div>
                    )}
                  </div>
                  {hasAccess && (
                    <ArrowRight className="h-4 w-4 text-neutral-400 group-hover:text-viverblue transition-colors" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* View All Button */}
      <div className="text-center pt-4 border-t border-neutral-700/50">
        <Button
          onClick={onViewAll}
          variant="outline"
          className="border-viverblue/40 text-viverblue hover:bg-viverblue/10 transition-all"
        >
          <Eye className="h-4 w-4 mr-2" />
          Ver Trilha Completa
        </Button>
      </div>
    </div>
  );
};
