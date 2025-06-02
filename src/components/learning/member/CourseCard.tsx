
import React from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Clock, Users, Lock, CheckCircle } from "lucide-react";
import { LearningCourse, LearningProgress } from "@/lib/supabase";
import { useCourseAccess } from "@/hooks/learning/useCourseAccess";
import { useAuth } from "@/contexts/auth";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

interface CourseCardProps {
  course: LearningCourse;
  userProgress?: LearningProgress[];
  className?: string;
}

export const CourseCard: React.FC<CourseCardProps> = ({ 
  course, 
  userProgress = [], 
  className 
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { checkCourseAccess } = useCourseAccess();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);

  // Verificar acesso ao curso
  useEffect(() => {
    const verifyAccess = async () => {
      if (!user?.id) {
        setHasAccess(false);
        setIsCheckingAccess(false);
        return;
      }

      try {
        const access = await checkCourseAccess(course.id, user.id);
        setHasAccess(access);
      } catch (error) {
        console.error("Erro ao verificar acesso ao curso:", error);
        setHasAccess(false);
      } finally {
        setIsCheckingAccess(false);
      }
    };

    verifyAccess();
  }, [course.id, user?.id, checkCourseAccess]);

  // Calcular progresso do curso
  const courseProgress = userProgress?.find(p => p.lesson_id === course.id);
  const progressPercentage = courseProgress?.progress_percentage || 0;

  const handleCourseClick = () => {
    if (hasAccess) {
      navigate(`/learning/courses/${course.id}`);
    }
  };

  if (isCheckingAccess) {
    return (
      <Card className={`overflow-hidden animate-pulse ${className}`}>
        <div className="h-48 bg-gray-200 dark:bg-gray-700" />
        <CardHeader className="p-4 pb-2">
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`overflow-hidden transition-all duration-200 ${
      hasAccess 
        ? 'hover:shadow-lg cursor-pointer border-border hover:border-viverblue/30' 
        : 'opacity-75 border-gray-200 dark:border-gray-700'
    } ${className}`}>
      {/* Imagem do curso */}
      <div className="relative h-48 overflow-hidden">
        {course.cover_image_url ? (
          <img
            src={course.cover_image_url}
            alt={course.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-viverblue/20 to-viverblue/5 flex items-center justify-center">
            <BookOpen className="h-16 w-16 text-viverblue/40" />
          </div>
        )}
        
        {/* Overlay de acesso negado */}
        {!hasAccess && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <div className="text-center text-white">
              <Lock className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm font-medium">Acesso Restrito</p>
            </div>
          </div>
        )}

        {/* Badge de progresso */}
        {hasAccess && progressPercentage > 0 && (
          <div className="absolute top-3 right-3">
            <Badge variant="secondary" className="bg-viverblue text-white">
              {progressPercentage === 100 ? (
                <CheckCircle className="h-3 w-3 mr-1" />
              ) : (
                <Clock className="h-3 w-3 mr-1" />
              )}
              {progressPercentage}%
            </Badge>
          </div>
        )}
      </div>

      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-lg line-clamp-2 leading-tight">
          {course.title}
        </CardTitle>
      </CardHeader>

      <CardContent className="p-4 pt-0 flex-1">
        {course.description && (
          <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
            {course.description}
          </p>
        )}

        {/* Indicadores do curso */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <BookOpen className="h-3 w-3" />
            <span>Curso</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            <span>Online</span>
          </div>
        </div>

        {/* Barra de progresso (apenas se tiver acesso) */}
        {hasAccess && progressPercentage > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Progresso</span>
              <span className="font-medium">{progressPercentage}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0">
        {hasAccess ? (
          <Button 
            onClick={handleCourseClick}
            className="w-full"
            variant={progressPercentage > 0 ? "outline" : "default"}
          >
            {progressPercentage === 100 ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Revisitar Curso
              </>
            ) : progressPercentage > 0 ? (
              <>
                <BookOpen className="h-4 w-4 mr-2" />
                Continuar Curso
              </>
            ) : (
              <>
                <BookOpen className="h-4 w-4 mr-2" />
                Iniciar Curso
              </>
            )}
          </Button>
        ) : (
          <Button 
            disabled 
            className="w-full"
            variant="outline"
          >
            <Lock className="h-4 w-4 mr-2" />
            Acesso Restrito
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
