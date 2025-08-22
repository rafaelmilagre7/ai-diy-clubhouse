
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
  const { data, isLoading, error, isRefetching, failureCount } = useLessonsByModule(moduleId);
  const { hasAccess } = useCourseIndividualAccess(courseId);
  
  // Debug detalhado do carregamento
  console.log(`[FORMACAO_DEBUG] ModuleLessons renderizado - moduleId: ${moduleId}`, {
    isLoading,
    isRefetching,
    hasError: !!error,
    failureCount,
    dataLength: data?.length || 0,
    hasFilteredLessons: !!filteredLessons,
    searchQuery,
    hasAccess,
    timestamp: new Date().toISOString()
  });
  
  // Use aulas filtradas se disponíveis, senão use as aulas do módulo
  let lessons: LearningLesson[] = [];
  
  if (filteredLessons && searchQuery) {
    // Filtrar apenas as aulas que pertencem a este módulo
    lessons = filteredLessons.filter(lesson => lesson.module_id === moduleId);
    console.log(`[FORMACAO_DEBUG] Usando aulas filtradas - moduleId: ${moduleId}, encontradas: ${lessons.length}`);
  } else {
    // Garantir que lessons seja sempre um array válido
    lessons = Array.isArray(data) ? data : [];
    console.log(`[FORMACAO_DEBUG] Usando dados do hook - moduleId: ${moduleId}, total: ${lessons.length}`);
  }
  
  // Exibir loading detalhado
  if (isLoading || isRefetching) {
    const loadingMessage = isRefetching ? 'Recarregando aulas...' : 'Carregando aulas...';
    const retryInfo = failureCount > 0 ? ` (tentativa ${failureCount + 1})` : '';
    
    console.log(`[FORMACAO_DEBUG] Loading state - moduleId: ${moduleId}, message: ${loadingMessage}${retryInfo}`);
    
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="text-sm text-muted-foreground">{loadingMessage}{retryInfo}</span>
          {failureCount > 0 && (
            <span className="text-xs text-yellow-600">
              Reconectando com o servidor...
            </span>
          )}
        </div>
      </div>
    );
  }
  
  // Tratar erros com opção de retry
  if (error && !filteredLessons) {
    console.error(`[FORMACAO_DEBUG] Erro ao carregar aulas - moduleId: ${moduleId}:`, error);
    
    return (
      <div className="p-6 text-center space-y-4">
        <div className="text-destructive">
          <p className="font-medium">Erro ao carregar aulas</p>
          <p className="text-sm text-muted-foreground mt-1">
            Falha na conexão com o servidor
          </p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90 transition-colors"
        >
          Tentar novamente
        </button>
      </div>
    );
  }
  
  // Verificar se não há aulas com informações detalhadas
  if (!lessons || lessons.length === 0) {
    if (filteredLessons && searchQuery) {
      console.log(`[FORMACAO_DEBUG] Nenhuma aula encontrada para busca "${searchQuery}" no módulo ${moduleId}`);
      return (
        <div className="p-6 text-center text-muted-foreground space-y-2">
          <p>Nenhuma aula encontrada neste módulo para sua busca.</p>
          <p className="text-xs">
            Busca: "{searchQuery}" | Módulo: {moduleId}
          </p>
        </div>
      );
    } else {
      console.log(`[FORMACAO_DEBUG] Nenhuma aula encontrada para o módulo ${moduleId}`);
      return (
        <div className="p-6 text-center text-muted-foreground space-y-2">
          <p>Este módulo ainda não possui aulas disponíveis.</p>
          <p className="text-xs">
            ModuleId: {moduleId} | Timestamp: {new Date().toLocaleTimeString()}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 px-3 py-1 text-xs bg-muted hover:bg-muted/80 rounded-md transition-colors"
          >
            Recarregar página
          </button>
        </div>
      );
    }
  }
  
  console.log(`[FORMACAO_DEBUG] Renderizando ${lessons.length} aulas para módulo ${moduleId}`);
  
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
