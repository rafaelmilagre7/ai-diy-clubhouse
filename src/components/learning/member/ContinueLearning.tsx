
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Play, Award, Book } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useLearningCourses } from "@/hooks/learning/useLearningCourses";
import { useUserProgress } from "@/hooks/learning/useUserProgress";

interface ContinueLearningProps {
  className?: string;
}

export const ContinueLearning: React.FC<ContinueLearningProps> = ({ className }) => {
  const { courses } = useLearningCourses();
  const { userProgress } = useUserProgress();

  // Calcular progresso para cada curso
  const coursesWithProgress = courses.map(course => {
    if (!course.all_lessons || course.all_lessons.length === 0) {
      return { ...course, progress: 0 };
    }

    const completedLessons = course.all_lessons.filter(lesson => {
      const lessonProgress = userProgress.find(p => p.lesson_id === lesson.id);
      return lessonProgress && lessonProgress.progress_percentage >= 100;
    });

    const progress = Math.round((completedLessons.length / course.all_lessons.length) * 100);
    return { ...course, progress };
  });

  // Encontrar curso em progresso ou mais recente não concluído
  const courseInProgress = coursesWithProgress.find(course => 
    course.progress > 0 && course.progress < 100
  );

  // Se não há curso em progresso, pegar o primeiro não iniciado
  const courseToShow = courseInProgress || coursesWithProgress.find(course => 
    course.progress === 0
  );

  // Se não encontrou nenhum curso adequado, não mostrar nada
  if (!courseToShow) {
    return null;
  }

  const isCompleted = courseToShow.progress >= 100;
  const isInProgress = courseToShow.progress > 0 && courseToShow.progress < 100;

  return (
    <Card className={cn("p-6", className)}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold mb-1">
            {isCompleted ? "Curso concluído" : isInProgress ? "Continue aprendendo" : "Comece a aprender"}
          </h2>
          <p className="text-muted-foreground text-sm">
            {isCompleted 
              ? "Parabéns! Você pode revisar o conteúdo a qualquer momento"
              : isInProgress 
                ? "Continue de onde parou e complete seu aprendizado"
                : "Inicie sua jornada de aprendizado com nossos cursos"
            }
          </p>
        </div>
        
        {isCompleted && (
          <Badge variant="success" className="bg-green-500/20 text-green-500 border-green-400">
            <Award className="h-3 w-3 mr-1" />
            Concluído
          </Badge>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-start">
        {/* Imagem do curso */}
        <div className="w-full md:w-32 h-20 md:h-20 rounded-lg overflow-hidden flex-shrink-0">
          {courseToShow.cover_image_url ? (
            <img 
              src={courseToShow.cover_image_url} 
              alt={courseToShow.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
              <Book className="h-6 w-6 text-white" />
            </div>
          )}
        </div>

        {/* Informações do curso */}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-lg line-clamp-1 mb-1">
            {courseToShow.title}
          </h3>
          
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {courseToShow.description || "Sem descrição disponível"}
          </p>

          {/* Progresso */}
          {courseToShow.progress > 0 && (
            <div className="mb-3">
              <div className="flex items-center justify-between text-xs mb-1">
                <span>Progresso do curso</span>
                <span className={cn(
                  "font-medium",
                  isCompleted ? "text-green-500" : "text-primary"
                )}>
                  {courseToShow.progress}%
                </span>
              </div>
              <Progress 
                value={courseToShow.progress} 
                className="h-1"
                indicatorClassName={isCompleted ? "bg-green-500" : undefined}
              />
            </div>
          )}

          {/* Estatísticas do curso */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
            {courseToShow.module_count && (
              <span className="flex items-center">
                <Book className="h-3 w-3 mr-1" />
                {courseToShow.module_count} {courseToShow.module_count === 1 ? 'módulo' : 'módulos'}
              </span>
            )}
            
            {courseToShow.lesson_count && (
              <span>
                {courseToShow.lesson_count} {courseToShow.lesson_count === 1 ? 'aula' : 'aulas'}
              </span>
            )}
          </div>

          {/* Botão de ação */}
          <Button asChild className={cn(
            isCompleted && "bg-green-500 hover:bg-green-600"
          )}>
            <Link to={`/learning/course/${courseToShow.id}`}>
              {isCompleted ? (
                <>
                  <Award className="h-4 w-4 mr-2" />
                  Revisar curso
                </>
              ) : isInProgress ? (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Continuar curso
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Iniciar curso
                </>
              )}
            </Link>
          </Button>
        </div>
      </div>
    </Card>
  );
};
