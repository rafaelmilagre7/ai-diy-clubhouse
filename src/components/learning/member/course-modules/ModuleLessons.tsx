
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
  
  if (isLoading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded mb-4 w-1/3 mx-auto"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="aspect-[9/16] bg-gray-700 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  if (!lessons || lessons.length === 0) {
    return (
      <div className="p-8 text-center bg-gradient-to-br from-gray-900/50 to-gray-800/30 rounded-lg border border-gray-700/50">
        <div className="text-gray-400 text-lg mb-2">📚</div>
        <p className="text-gray-300 font-medium">Este módulo ainda não possui aulas disponíveis</p>
        <p className="text-gray-500 text-sm mt-1">Em breve novos conteúdos serão adicionados</p>
      </div>
    );
  }
  
  // Log detalhado para depuração do problema de aulas desaparecendo
  console.log(`=== DEPURAÇÃO MÓDULO ${moduleId} ===`, {
    totalAulas: lessons.length,
    aulasEncontradas: lessons.map(l => ({
      id: l.id, 
      title: l.title,
      published: l.published
    })),
    progressoDisponivel: userProgress.length,
    progressoPorAula: lessons.map(lesson => {
      const completed = isLessonCompleted(lesson.id);
      const inProgress = isLessonInProgress(lesson.id);
      const progress = getLessonProgress(lesson.id);
      return {
        lessonId: lesson.id,
        lessonTitle: lesson.title,
        completed,
        inProgress,
        progress
      };
    })
  });
  
  return (
    <div className="space-y-6">
      {/* Carrossel de miniaturas estilo Netflix */}
      <div className="relative px-6 pt-4">
        <div className="mb-4">
          <h3 className="text-xl font-semibold text-white mb-2">Aulas do Módulo</h3>
          <p className="text-gray-400 text-sm">{lessons.length} aula{lessons.length !== 1 ? 's' : ''} disponível{lessons.length !== 1 ? 'is' : ''}</p>
        </div>
        
        <Carousel
          opts={{
            align: "start",
            loop: lessons.length > 3,
          }}
          className="w-full group"
        >
          <CarouselContent className="-ml-3">
            {lessons.map(lesson => {
              const completed = isLessonCompleted(lesson.id);
              const inProgress = isLessonInProgress(lesson.id);
              const progress = getLessonProgress(lesson.id);
              
              return (
                <CarouselItem 
                  key={lesson.id} 
                  className="pl-3 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5"
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
          
          <CarouselPrevious className="left-2 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/80 hover:bg-black border-0 text-white shadow-2xl backdrop-blur-sm hover:scale-110" />
          <CarouselNext className="right-2 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/80 hover:bg-black border-0 text-white shadow-2xl backdrop-blur-sm hover:scale-110" />
        </Carousel>
      </div>
      
      {/* Lista detalhada de aulas */}
      <div className="bg-gray-900/30 rounded-lg border border-gray-700/30 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-700/30 bg-gray-900/50">
          <h4 className="text-lg font-medium text-white">Lista Completa</h4>
          <p className="text-gray-400 text-sm">Visão detalhada de todas as aulas</p>
        </div>
        
        <div className="divide-y divide-gray-700/30">
          {lessons.map(lesson => {
            const completed = isLessonCompleted(lesson.id);
            const inProgress = isLessonInProgress(lesson.id);
            const progress = getLessonProgress(lesson.id);
            
            // Log individual para cada aula sendo renderizada
            console.log(`Renderizando aula ${lesson.title}:`, {
              id: lesson.id,
              completed,
              inProgress,
              progress,
              visible: true // Sempre verdadeiro - aulas nunca devem desaparecer
            });
            
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
    </div>
  );
};
