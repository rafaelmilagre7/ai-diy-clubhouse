
import { Lesson } from "@/types/learningTypes";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

interface LessonListProps {
  lessons: Lesson[];
  selectedLessonId: string | null;
  onSelect: (lessonId: string) => void;
}

export function LessonList({ lessons, selectedLessonId, onSelect }: LessonListProps) {
  // Se não houver aulas
  if (!lessons.length) {
    return (
      <div className="text-center py-4">
        <p className="text-muted-foreground text-sm">
          Este módulo ainda não tem aulas.
        </p>
      </div>
    );
  }

  // Ordenar aulas pelo order_index
  const sortedLessons = [...lessons].sort((a, b) => a.order_index - b.order_index);
  
  return (
    <div className="space-y-1">
      {sortedLessons.map((lesson) => (
        <div
          key={lesson.id}
          className={cn(
            "flex items-center justify-between p-2 rounded-md hover:bg-muted cursor-pointer group",
            selectedLessonId === lesson.id && "bg-muted"
          )}
          onClick={() => onSelect(lesson.id)}
        >
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 cursor-grab drag-handle opacity-50 hover:opacity-100"
              tabIndex={-1}
            >
              <GripVertical className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center space-x-2 flex-1 min-w-0">
              <FileText className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{lesson.title}</span>
            </div>
            
            {!lesson.published && (
              <Badge variant="outline" className="text-xs">
                Rascunho
              </Badge>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
