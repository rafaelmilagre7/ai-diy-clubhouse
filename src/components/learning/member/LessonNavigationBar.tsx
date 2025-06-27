
import React from 'react';
import { ChevronLeft, ChevronRight, Home, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LearningLesson } from '@/lib/supabase';
import { safeJsonParseObject } from '@/utils/jsonUtils';

interface LessonNavigationBarProps {
  lesson?: LearningLesson;
  isCompleted?: boolean;
  onComplete?: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  onBackToModule?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
  prevLesson?: any;
  nextLesson?: any;
  isUpdating?: boolean;
  currentLessonIndex?: number;
  totalLessons?: number;
}

export const LessonNavigationBar = ({
  lesson,
  isCompleted = false,
  onComplete,
  onPrevious,
  onNext,
  onBackToModule,
  hasPrevious = false,
  hasNext = false,
  prevLesson,
  nextLesson,
  isUpdating = false,
  currentLessonIndex,
  totalLessons
}: LessonNavigationBarProps) => {
  const moduleName = lesson?.module?.title || 'Módulo';
  
  // CORREÇÃO: Parse seguro do conteúdo JSON
  const content = lesson ? safeJsonParseObject(lesson.content, {}) : {};
  const estimatedTime = lesson?.estimated_time_minutes || content.estimatedTime || 0;

  return (
    <div className="sticky top-0 z-40 bg-background border-b border-border px-4 py-3">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBackToModule}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <Home className="h-4 w-4" />
            {moduleName}
          </Button>
          <div className="h-4 w-px bg-border" />
          <div className="flex flex-col">
            <h1 className="font-semibold text-sm truncate max-w-[300px]">
              {lesson?.title || 'Aula'}
            </h1>
            {estimatedTime > 0 && (
              <span className="text-xs text-muted-foreground">
                ~{estimatedTime} min
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isCompleted && onComplete && (
            <Button
              variant="outline"
              size="sm"
              onClick={onComplete}
              disabled={isUpdating}
              className="flex items-center gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              Marcar como Concluída
            </Button>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={onPrevious}
            disabled={!hasPrevious && !prevLesson}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </Button>
          
          <Button
            variant="default"
            size="sm"
            onClick={onNext}
            disabled={!hasNext && !nextLesson}
            className="flex items-center gap-2"
          >
            Próxima
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
