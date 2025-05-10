
import { useLessonsByModule } from "@/hooks/learning";
import { LearningProgress } from "@/lib/supabase/types";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { LessonThumbnail } from "./LessonThumbnail";
import { LessonListItem } from "./LessonListItem";

interface ModuleLessonsProps { 
  moduleId: string;
  courseId: string;
  userProgress: LearningProgress[];
  isLessonCompleted: (id: string) => boolean;
  isLessonInProgress: (id: string) => boolean;
  getLessonProgress: (id: string) => number;
}

export const ModuleLessons = ({ 
  moduleId, 
  courseId,
  userProgress, 
  isLessonCompleted, 
  isLessonInProgress,
  getLessonProgress
}: ModuleLessonsProps) => {
  const { data, isLoading } = useLessonsByModule(moduleId);
  
  // Garantir que lessons seja sempre um array válido
  const lessons = Array.isArray(data) ? data : [];
  
  console.log(`ModuleLessons - moduleId: ${moduleId}`, { 
    dataType: typeof data,
    isArray: Array.isArray(data),
    dataValue: data,
    lessonsLength: lessons.length
  });
  
  if (isLoading) {
    return (
      <div className="p-4 text-center">
        <p className="text-muted-foreground">Carregando aulas...</p>
      </div>
    );
  }
  
  if (!lessons || lessons.length === 0) {
    return (
      <div className="p-4 text-center">
        <p className="text-muted-foreground">Este módulo ainda não possui aulas disponíveis.</p>
      </div>
    );
  }
  
  return (
    <div>
      {/* Carrossel de miniaturas para as aulas (estilo Netflix) */}
      <div className="p-4 border-b">
        <Carousel
          opts={{
            align: "start",
            loop: lessons.length > 3,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-4">
            {lessons.map(lesson => {
              const completed = isLessonCompleted(lesson.id);
              const inProgress = isLessonInProgress(lesson.id);
              const progress = getLessonProgress(lesson.id);
              
              return (
                <CarouselItem 
                  key={lesson.id} 
                  className="pl-4 basis-full sm:basis-1/2 md:basis-1/3"
                >
                  <LessonThumbnail
                    lesson={lesson}
                    courseId={courseId}
                    isCompleted={completed}
                    inProgress={inProgress}
                    progress={progress}
                  />
                </CarouselItem>
              );
            })}
          </CarouselContent>
          
          <CarouselPrevious className="left-2 bg-black/30 text-white border-none hover:bg-black/60" />
          <CarouselNext className="right-2 bg-black/30 text-white border-none hover:bg-black/60" />
        </Carousel>
      </div>
      
      {/* Lista completa de aulas (formato tradicional) */}
      <div className="divide-y">
        {lessons.map(lesson => {
          const completed = isLessonCompleted(lesson.id);
          const inProgress = isLessonInProgress(lesson.id);
          const progress = getLessonProgress(lesson.id);
          
          return (
            <LessonListItem
              key={lesson.id}
              lesson={lesson}
              courseId={courseId}
              isCompleted={completed}
              inProgress={inProgress}
              progress={progress}
            />
          );
        })}
      </div>
    </div>
  );
};
