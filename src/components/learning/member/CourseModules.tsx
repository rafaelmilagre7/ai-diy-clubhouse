
import { useState } from "react";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger 
} from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { LearningModule, LearningLesson, LearningCourse, LearningProgress } from "@/lib/supabase/types";
import { CheckCircle, Lock, Clock, Play } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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

  // Função para buscar lições de um módulo
  const useLessonsByModule = (moduleId: string) => {
    // Simulação de hook - em uma implementação real, este seria um hook React Query
    return {
      data: [],
      isLoading: false,
      error: null
    };
  };

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
  
  // Calcular a última aula em que o usuário estava
  const getLastAccessedLesson = (): string | null => {
    if (!userProgress || userProgress.length === 0) return null;
    
    // Ordenar por updated_at (mais recente primeiro)
    const sortedProgress = [...userProgress].sort((a, b) => {
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });
    
    return sortedProgress[0].lesson_id;
  };
  
  // Mostrar badge de dificuldade
  const DifficultyBadge = ({ level }: { level: string | null }) => {
    if (!level) return null;
    
    const getDifficultyColor = (difficulty: string) => {
      switch(difficulty) {
        case 'beginner':
          return 'bg-green-100 text-green-800 border-green-200';
        case 'intermediate':
          return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'advanced':
          return 'bg-red-100 text-red-800 border-red-200';
        default:
          return 'bg-slate-100 text-slate-800 border-slate-200';
      }
    };

    const getDifficultyLabel = (difficulty: string) => {
      switch(difficulty) {
        case 'beginner':
          return 'Iniciante';
        case 'intermediate':
          return 'Intermediário';
        case 'advanced':
          return 'Avançado';
        default:
          return 'Não definido';
      }
    };
    
    return (
      <Badge variant="outline" className={getDifficultyColor(level)}>
        {getDifficultyLabel(level)}
      </Badge>
    );
  };
  
  const lastAccessedLessonId = getLastAccessedLesson();
  
  // Caso não haja módulos, mostrar mensagem
  if (modules.length === 0) {
    return (
      <Card className="p-6 text-center text-muted-foreground">
        <p>Este curso ainda não possui módulos disponíveis.</p>
      </Card>
    );
  }
  
  return (
    <Card>
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">Módulos do curso</h2>
        
        {lastAccessedLessonId && (
          <div className="mb-6">
            <Link 
              to={`/learning/course/${courseId}/lesson/${lastAccessedLessonId}`}
              className="flex items-center p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
            >
              <Play className="h-4 w-4 mr-2" />
              <span>Continuar de onde parou</span>
            </Link>
          </div>
        )}
        
        <Accordion
          type="multiple" 
          value={openModules}
          onValueChange={setOpenModules}
          className="space-y-4"
        >
          {modules.map(module => (
            <AccordionItem
              key={module.id}
              value={module.id}
              className="border rounded-lg overflow-hidden"
            >
              <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-accent/50">
                <div className="flex justify-between w-full items-center text-left">
                  <span className="font-semibold">{module.title}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-2 pb-1 px-0">
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
  const { data: lessons, isLoading } = useLessonsByModule(moduleId);
  
  const LessonItem = ({ lesson }: { lesson: LearningLesson }) => {
    const completed = isLessonCompleted(lesson.id);
    const inProgress = isLessonInProgress(lesson.id);
    const progress = getLessonProgress(lesson.id);
    
    // Estimar tempo de leitura em minutos (1 min para cada 500 caracteres)
    const estimatedTime = lesson.estimated_time_minutes || 
      (lesson.description ? Math.max(1, Math.ceil(lesson.description.length / 500)) : 5);
    
    return (
      <Link 
        to={`/learning/course/${courseId}/lesson/${lesson.id}`}
        className={cn(
          "flex items-center justify-between p-3 border-b last:border-0 hover:bg-accent/20 transition-colors",
          completed && "bg-green-50/50 dark:bg-green-950/20",
          inProgress && !completed && "bg-blue-50/50 dark:bg-blue-950/20"
        )}
      >
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            {completed ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/50 flex items-center justify-center">
                {inProgress && (
                  <div 
                    className="h-3 w-3 rounded-full bg-blue-500" 
                    style={{ 
                      clipPath: `circle(${progress}% at center)` 
                    }}
                  />
                )}
              </div>
            )}
          </div>
          <div>
            <div className="font-medium">{lesson.title}</div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-muted-foreground flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                {estimatedTime} min
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
        </div>
      </Link>
    );
  };
  
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
    <div className="divide-y">
      {lessons.map(lesson => (
        <LessonItem key={lesson.id} lesson={lesson} />
      ))}
    </div>
  );
};
