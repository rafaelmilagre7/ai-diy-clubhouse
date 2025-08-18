
import { useLessonsByModule } from "@/hooks/learning";
import { LearningProgress, LearningLesson } from "@/lib/supabase/types";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { LessonThumbnail } from "./LessonThumbnail";
import { LessonListItem } from "./LessonListItem";
import { sortLessonsByNumber } from "./CourseModulesHelpers";
import { useCourseIndividualAccess } from "@/hooks/learning/useCourseIndividualAccess";

interface ModuleLessonsProps { 
  moduleId: string;
  courseId: string;
  userProgress: LearningProgress[];
  isLessonCompleted: (id: string) => boolean;
  isLessonInProgress: (id: string) => boolean;
  getLessonProgress: (id: string) => number;
  filteredLessons?: LearningLesson[];
  searchQuery?: string;
}

export const ModuleLessons = ({ 
  moduleId, 
  courseId,
  userProgress, 
  isLessonCompleted, 
  isLessonInProgress,
  getLessonProgress,
  filteredLessons,
  searchQuery = ""
}: ModuleLessonsProps) => {
  const { data, isLoading } = useLessonsByModule(moduleId);
  const { hasAccess } = useCourseIndividualAccess(courseId);
  
  // Use aulas filtradas se disponíveis, senão use as aulas do módulo
  let lessons: LearningLesson[] = [];
  
  if (filteredLessons && searchQuery) {
    // Filtrar apenas as aulas que pertencem a este módulo
    lessons = filteredLessons.filter(lesson => lesson.module_id === moduleId);
  } else {
    // Garantir que lessons seja sempre um array válido
    lessons = Array.isArray(data) ? data : [];
  }
  
  console.log(`ModuleLessons renderizado para módulo ${moduleId}:`, {
    lessonsCount: lessons.length,
    isLoading,
    hasFilter: !!filteredLessons,
    searchQuery,
    hasAccess,
    data: data,
    lessons: lessons.map(l => ({ id: l.id, title: l.title }))
  });
  
  if (isLoading && !filteredLessons) {
    return (
      <div className="p-4 text-center">
        <p className="text-neutral-300">Carregando aulas...</p>
      </div>
    );
  }
  
  if (!lessons || lessons.length === 0) {
    if (filteredLessons && searchQuery) {
      console.log(`Nenhuma aula encontrada para a busca "${searchQuery}" no módulo ${moduleId}`);
      return (
        <div className="p-4 text-center">
          <p className="text-neutral-300">Nenhuma aula encontrada neste módulo para sua busca.</p>
        </div>
      );
    } else {
      console.log(`Nenhuma aula encontrada para o módulo ${moduleId}`);
      return (
        <div className="p-4 text-center">
          <p className="text-neutral-300">Este módulo ainda não possui aulas disponíveis.</p>
        </div>
      );
    }
  }
  
  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="px-6 py-4">
        <h3 className="text-2xl font-bold text-foreground mb-2">
          Aulas do Módulo
        </h3>
        <p className="text-muted-foreground">
          {lessons.length} {lessons.length === 1 ? 'aula disponível' : 'aulas disponíveis'}
        </p>
      </div>
      
      {/* Netflix-style Carousel */}
      <div className="px-6">
        <Carousel
          opts={{
            align: "start",
            loop: false,
            skipSnaps: false,
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
                  className="pl-4 basis-[280px] sm:basis-[320px] md:basis-[280px] lg:basis-[300px]"
                >
                  <LessonThumbnail
                    lesson={lesson}
                    courseId={courseId}
                    isCompleted={completed}
                    inProgress={inProgress}
                    progress={progress}
                    hasAccess={hasAccess}
                  />
                </CarouselItem>
              );
            })}
          </CarouselContent>
          
          {lessons.length > 3 && (
            <>
              <CarouselPrevious className="left-2 bg-background/90 text-foreground border-border/50 hover:bg-background hover:scale-110 transition-all duration-300 shadow-xl backdrop-blur-sm" />
              <CarouselNext className="right-2 bg-background/90 text-foreground border-border/50 hover:bg-background hover:scale-110 transition-all duration-300 shadow-xl backdrop-blur-sm" />
            </>
          )}
        </Carousel>
      </div>
      
      {/* Optional: List View Toggle */}
      <div className="px-6">
        <details className="group">
          <summary className="flex items-center justify-between cursor-pointer p-4 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors">
            <span className="font-medium text-foreground">Ver lista detalhada</span>
            <span className="text-muted-foreground group-open:rotate-180 transition-transform">▼</span>
          </summary>
          
          <div className="mt-4 space-y-2">
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
                  hasAccess={hasAccess}
                />
              );
            })}
          </div>
        </details>
      </div>
    </div>
  );
};
