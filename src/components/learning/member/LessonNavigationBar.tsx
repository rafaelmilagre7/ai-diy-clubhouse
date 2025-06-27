
import React from 'react';
import { ChevronLeft, ChevronRight, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LearningLesson } from '@/lib/supabase';
import { safeJsonParseObject } from '@/utils/jsonUtils';

interface LessonNavigationBarProps {
  lesson: LearningLesson;
  onPrevious?: () => void;
  onNext?: () => void;
  onBackToModule?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
}

export const LessonNavigationBar = ({
  lesson,
  onPrevious,
  onNext,
  onBackToModule,
  hasPrevious = false,
  hasNext = false
}: LessonNavigationBarProps) => {
  const moduleName = lesson.module?.title || 'Módulo';
  
  // CORREÇÃO: Parse seguro do conteúdo JSON
  const content = safeJsonParseObject(lesson.content, {});
  const estimatedTime = lesson.estimated_time_minutes || content.estimatedTime || 0;

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
              {lesson.title}
            </h1>
            {estimatedTime > 0 && (
              <span className="text-xs text-muted-foreground">
                ~{estimatedTime} min
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onPrevious}
            disabled={!hasPrevious}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={onNext}
            disabled={!hasNext}
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
