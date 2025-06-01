
import React from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, RefreshCw, Eye, Target, BookOpen } from "lucide-react";
import { TrailSolutionEnriched, TrailLessonEnriched } from "@/types/implementation-trail";

interface MinimalTrailContentProps {
  enrichedSolutions: TrailSolutionEnriched[];
  enrichedLessons: TrailLessonEnriched[];
  isLoading: boolean;
  onSolutionClick: (id: string) => void;
  onLessonClick: (courseId: string, lessonId: string) => void;
  onViewAll: () => void;
  onRegenerate: () => void;
}

export const MinimalTrailContent: React.FC<MinimalTrailContentProps> = ({
  enrichedSolutions,
  enrichedLessons,
  isLoading,
  onSolutionClick,
  onLessonClick,
  onViewAll,
  onRegenerate
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-between py-3">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-viverblue"></div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-3 w-3 text-viverblue" />
              <span className="text-sm font-medium text-white">Trilha de Implementação IA</span>
            </div>
            <p className="text-xs text-neutral-400">Carregando recomendações...</p>
          </div>
        </div>
      </div>
    );
  }

  const totalItems = enrichedSolutions.length + enrichedLessons.length;
  const topSolution = enrichedSolutions[0];
  const topLesson = enrichedLessons[0];

  return (
    <div className="flex items-center justify-between py-2">
      {/* Left: Header + Preview */}
      <div className="flex items-center gap-4 flex-1">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-viverblue" />
          <span className="text-sm font-medium text-white">Trilha IA</span>
          <span className="text-xs text-viverblue bg-viverblue/10 px-2 py-0.5 rounded-full">
            {totalItems} itens
          </span>
        </div>

        {/* Preview Items */}
        <div className="flex items-center gap-3 flex-1">
          {topSolution && (
            <div 
              className="flex items-center gap-2 cursor-pointer hover:bg-neutral-700/30 rounded px-2 py-1 transition-colors"
              onClick={() => onSolutionClick(topSolution.id)}
            >
              <Target className="h-3 w-3 text-viverblue" />
              <span className="text-xs text-neutral-300 truncate max-w-24">
                {topSolution.title}
              </span>
            </div>
          )}
          
          {topLesson && (
            <div 
              className="flex items-center gap-2 cursor-pointer hover:bg-neutral-700/30 rounded px-2 py-1 transition-colors"
              onClick={() => onLessonClick(topLesson.courseId, topLesson.id)}
            >
              <BookOpen className="h-3 w-3 text-viverblue" />
              <span className="text-xs text-neutral-300 truncate max-w-24">
                {topLesson.title}
              </span>
            </div>
          )}
          
          {totalItems > 2 && (
            <span className="text-xs text-neutral-500">
              +{totalItems - 2} mais
            </span>
          )}
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        <Button
          onClick={onRegenerate}
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs text-neutral-400 hover:text-white"
        >
          <RefreshCw className="h-3 w-3" />
        </Button>
        <Button
          onClick={onViewAll}
          variant="outline"
          size="sm"
          className="h-7 px-3 text-xs border-viverblue/40 text-viverblue hover:bg-viverblue/10"
        >
          <Eye className="mr-1 h-3 w-3" />
          Ver Tudo
        </Button>
      </div>
    </div>
  );
};
