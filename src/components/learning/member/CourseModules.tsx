
import { useState } from "react";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger 
} from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { LearningModule, LearningLesson, LearningCourse, LearningProgress } from "@/lib/supabase/types";
import { CheckCircle, Lock, Clock, Play, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useLessonsByModule } from "@/hooks/learning";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface CourseModulesProps {
  modules: LearningModule[];
  courseId: string;
  userProgress: LearningProgress[];
  course: LearningCourse;
  expandedModules?: string[];
}

export const CourseModules: React.FC<CourseModulesProps> = ({ 
  modules, 
  courseId, 
  userProgress,
  course,
  expandedModules = []
}) => {
  // Estado para rastrear módulos expandidos (para lembrar o estado mesmo ao recarregar componente)
  const [openModules, setOpenModules] = useState<string[]>(expandedModules);

  // Verificar se uma aula está completa
  const isLessonCompleted = (lessonId: string): boolean => {
    return !!userProgress?.find(p => 
      p.lesson_id === lessonId && 
      (p.progress_percentage >= 100 || !!p.completed_at)
    );
  };

  // Verificar se uma aula está em progresso
  const isLessonInProgress = (lessonId: string): boolean => {
    const progress = userProgress?.find(p => p.lesson_id === lessonId);
    return !!progress && progress.progress_percentage > 0 && progress.progress_percentage < 100;
  };
  
  // Obter porcentagem de progresso para uma aula
  const getLessonProgress = (lessonId: string): number => {
    const progress = userProgress?.find(p => p.lesson_id === lessonId);
    return progress ? progress.progress_percentage : 0;
  };
  
  // Caso não haja módulos, mostrar mensagem
  if (modules.length === 0) {
    return (
      <Card className="p-6 text-center text-muted-foreground">
        <p>Este curso ainda não possui módulos disponíveis.</p>
      </Card>
    );
  }
  
  return (
    <Card className="border rounded-lg overflow-hidden">
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-6">Conteúdo do curso</h2>
        
        <Accordion
          type="multiple" 
          value={openModules}
          onValueChange={setOpenModules}
          className="space-y-6"
        >
          {modules.map(module => (
            <AccordionItem
              key={module.id}
              value={module.id}
              className="border rounded-lg overflow-hidden"
            >
              <div className="border-b">
                <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-accent/50">
                  <div className="flex justify-between w-full items-center text-left">
                    <span className="font-semibold">{module.title}</span>
                    <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
                  </div>
                </AccordionTrigger>
              </div>
              <AccordionContent className="p-0">
                <ModuleLessons 
                  moduleId={module.id} 
                  courseId={courseId}
                  userProgress={userProgress}
                  isLessonCompleted={isLessonCompleted}
                  isLessonInProgress={isLessonInProgress}
                  getLessonProgress={getLessonProgress}
                />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </Card>
  );
};

// Componente interno para exibir lições de um módulo
const ModuleLessons = ({ 
  moduleId, 
  courseId,
  userProgress, 
  isLessonCompleted, 
  isLessonInProgress,
  getLessonProgress
}: { 
  moduleId: string;
  courseId: string;
  userProgress: LearningProgress[];
  isLessonCompleted: (id: string) => boolean;
  isLessonInProgress: (id: string) => boolean;
  getLessonProgress: (id: string) => number;
}) => {
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
                  <Link 
                    to={`/learning/course/${courseId}/lesson/${lesson.id}`}
                    className="block group"
                  >
                    <div className="relative overflow-hidden rounded-md">
                      <AspectRatio ratio={16/9}>
                        {lesson.cover_image_url ? (
                          <img 
                            src={lesson.cover_image_url} 
                            alt={lesson.title}
                            className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center">
                            <span className="font-semibold text-white">{lesson.title}</span>
                          </div>
                        )}
                        
                        {/* Overlay para exibir informação completa em hover */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
                          <div>
                            <h4 className="font-medium text-white">{lesson.title}</h4>
                            {lesson.description && (
                              <p className="text-xs text-white/80 mt-1 line-clamp-2">{lesson.description}</p>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-white/80 flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {lesson.estimated_time_minutes || 5} min
                            </span>
                            
                            {lesson.difficulty_level && (
                              <span className={cn(
                                "text-xs px-1.5 py-0.5 rounded-md",
                                lesson.difficulty_level === 'beginner' && "bg-green-100 text-green-800",
                                lesson.difficulty_level === 'intermediate' && "bg-yellow-100 text-yellow-800",
                                lesson.difficulty_level === 'advanced' && "bg-red-100 text-red-800"
                              )}>
                                {lesson.difficulty_level === 'beginner' && "Iniciante"}
                                {lesson.difficulty_level === 'intermediate' && "Intermediário"}
                                {lesson.difficulty_level === 'advanced' && "Avançado"}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {/* Indicadores de status (em progresso / completo) */}
                        {completed && (
                          <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-0.5">
                            <CheckCircle className="h-4 w-4" />
                          </div>
                        )}
                        
                        {/* Barra de progresso */}
                        {progress > 0 && !completed && (
                          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/30">
                            <div 
                              className="h-full bg-primary" 
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        )}
                        
                        {/* Ícone de Play centralizado em hover */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="bg-white/90 rounded-full p-3 text-primary shadow-xl">
                            <Play className="h-6 w-6 fill-current" />
                          </div>
                        </div>
                      </AspectRatio>
                    </div>
                    
                    <div className="mt-2">
                      <div className="font-medium line-clamp-1">{lesson.title}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {lesson.estimated_time_minutes || 5} min
                        </span>
                        
                        {inProgress && !completed && (
                          <Badge variant="secondary" className="text-xs">
                            {progress}% concluído
                          </Badge>
                        )}
                        
                        {completed && (
                          <Badge variant="secondary" className="bg-green-500 text-white text-xs">
                            Concluído
                          </Badge>
                        )}
                      </div>
                    </div>
                  </Link>
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
            <Link 
              key={lesson.id}
              to={`/learning/course/${courseId}/lesson/${lesson.id}`}
              className={cn(
                "flex items-center justify-between p-4 hover:bg-accent/20 transition-colors",
                completed && "bg-green-50/50 dark:bg-green-950/20",
                inProgress && !completed && "bg-blue-50/50 dark:bg-blue-950/20"
              )}
            >
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  {completed ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : inProgress ? (
                    <div className="h-5 w-5 rounded-full border-2 border-primary flex items-center justify-center">
                      <div 
                        className="h-3 w-3 rounded-full bg-primary" 
                        style={{ clipPath: `circle(${progress}% at center)` }}
                      />
                    </div>
                  ) : (
                    <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/50" />
                  )}
                </div>
                
                <div>
                  <div className="font-medium">{lesson.title}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {lesson.estimated_time_minutes || 5} min
                    </span>
                    
                    {lesson.difficulty_level && (
                      <span className={cn(
                        "text-xs px-1.5 py-0.5 rounded-md",
                        lesson.difficulty_level === 'beginner' && "bg-green-100 text-green-800",
                        lesson.difficulty_level === 'intermediate' && "bg-yellow-100 text-yellow-800",
                        lesson.difficulty_level === 'advanced' && "bg-red-100 text-red-800"
                      )}>
                        {lesson.difficulty_level === 'beginner' && "Iniciante"}
                        {lesson.difficulty_level === 'intermediate' && "Intermediário"}
                        {lesson.difficulty_level === 'advanced' && "Avançado"}
                      </span>
                    )}
                    
                    {inProgress && !completed && (
                      <Badge variant="secondary" className="text-xs">
                        {progress}% concluído
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              
              <Play className="h-4 w-4 text-muted-foreground" />
            </Link>
          );
        })}
      </div>
    </div>
  );
};
