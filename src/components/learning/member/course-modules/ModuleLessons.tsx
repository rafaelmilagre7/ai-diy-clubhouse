
import { useLessonsByModule } from "@/hooks/learning";
import { LearningProgress } from "@/lib/supabase/types";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { LessonThumbnail } from "./LessonThumbnail";
import { LessonListItem } from "./LessonListItem";
import { sortLessonsByNumber } from "./CourseModulesHelpers";

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
  
  console.log(`ModuleLessons renderizado para módulo ${moduleId}:`, {
    lessonsCount: lessons.length,
    isLoading,
    lessons: lessons.map(l => ({ id: l.id, title: l.title }))
  });
  
  if (isLoading) {
    return (
      <div className="p-4 text-center">
        <p className="text-neutral-300">Carregando aulas...</p>
      </div>
    );
  }
  
  if (!lessons || lessons.length === 0) {
    console.log(`Nenhuma aula encontrada para o módulo ${moduleId}`);
    return (
      <div className="p-4 text-center">
        <p className="text-neutral-300">Este módulo ainda não possui aulas disponíveis.</p>
      </div>
    );
  }
  
  return (
    <div>
      {/* Banner estilo Netflix - Carrossel de miniaturas destacado */}
      <div className="p-6 bg-[#1A1E2E] border-b border-white/10">
        <h3 className="text-lg font-semibold mb-4 text-neutral-100">
          Aulas do Módulo ({lessons.length})
        </h3>
        
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
                  className="pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
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
          
          <CarouselPrevious className="left-2 bg-viverblue/90 text-white border-2 border-white/20 hover:bg-viverblue hover:border-white/40 hover:scale-110 transition-all duration-300 shadow-lg backdrop-blur-sm" />
          <CarouselNext className="right-2 bg-viverblue/90 text-white border-2 border-white/20 hover:bg-viverblue hover:border-white/40 hover:scale-110 transition-all duration-300 shadow-lg backdrop-blur-sm" />
        </Carousel>
      </div>
      
      {/* Lista detalhada de aulas (formato tradicional) */}
      <div className="divide-y divide-white/10 bg-[#151823]">
        <div className="px-6 py-3 bg-[#1A1E2E] border-b border-white/10">
          <h4 className="text-sm font-medium text-neutral-300">
            Lista Detalhada das Aulas
          </h4>
        </div>
        
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
