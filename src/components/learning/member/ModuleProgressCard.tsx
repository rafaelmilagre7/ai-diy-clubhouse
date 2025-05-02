
import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { LearningModule, LearningLesson } from "@/lib/supabase";
import { CheckCircle, Circle, PlayCircle, LockIcon } from "lucide-react";

interface ModuleProgressCardProps {
  module: LearningModule;
  lessons: LearningLesson[];
  courseId: string;
  completedLessons: string[];
  isLocked?: boolean;
}

export const ModuleProgressCard: React.FC<ModuleProgressCardProps> = ({ 
  module, 
  lessons, 
  courseId, 
  completedLessons,
  isLocked = false
}) => {
  // Calcular progresso
  const totalLessons = lessons.length;
  const completedCount = lessons.filter(lesson => 
    completedLessons.includes(lesson.id)
  ).length;
  
  const progressPercentage = totalLessons > 0 
    ? Math.round((completedCount / totalLessons) * 100) 
    : 0;
  
  // Encontrar a próxima aula não concluída
  const nextLesson = lessons.find(lesson => !completedLessons.includes(lesson.id));
  
  return (
    <Card className={`overflow-hidden ${isLocked ? 'opacity-70' : ''}`}>
      <CardContent className="p-0">
        {/* Cabeçalho do módulo */}
        <div className="p-4 border-b bg-muted/30">
          <div className="flex items-center justify-between">
            <h3 className="font-medium flex items-center">
              {module.title}
              {isLocked && <LockIcon className="h-4 w-4 ml-2 text-muted-foreground" />}
            </h3>
            <div className="text-sm text-muted-foreground">
              {completedCount}/{totalLessons} aulas
            </div>
          </div>
          <Progress value={progressPercentage} className="h-1.5 mt-2" />
        </div>
        
        {/* Lista de aulas */}
        <div className="divide-y">
          {lessons.slice(0, 3).map(lesson => {
            const isCompleted = completedLessons.includes(lesson.id);
            
            return (
              <div key={lesson.id} className="p-3 flex items-center justify-between">
                <div className="flex items-center">
                  {isCompleted ? (
                    <CheckCircle className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground mr-2 flex-shrink-0" />
                  )}
                  <span className="text-sm truncate">{lesson.title}</span>
                </div>
                {!isLocked && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="ml-2 flex-shrink-0" 
                    asChild
                  >
                    <Link to={`/learning/course/${courseId}/lesson/${lesson.id}`}>
                      {isCompleted ? "Rever" : "Iniciar"}
                    </Link>
                  </Button>
                )}
              </div>
            );
          })}
        </div>
        
        {/* Mais aulas */}
        {lessons.length > 3 && (
          <div className="p-3 border-t">
            <Button variant="ghost" size="sm" className="w-full" asChild>
              <Link to={`/learning/course/${courseId}`}>
                Ver todas as {lessons.length} aulas
              </Link>
            </Button>
          </div>
        )}
        
        {/* Botão de continuar */}
        {!isLocked && nextLesson && (
          <div className="p-4 bg-primary/5 border-t">
            <Button className="w-full" asChild>
              <Link to={`/learning/course/${courseId}/lesson/${nextLesson.id}`}>
                <PlayCircle className="h-4 w-4 mr-2" />
                {completedCount > 0 ? "Continuar módulo" : "Iniciar módulo"}
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
