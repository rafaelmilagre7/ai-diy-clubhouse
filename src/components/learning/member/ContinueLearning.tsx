
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Play, BookOpen } from 'lucide-react';
import { LearningCourseWithLessons } from '@/lib/supabase/types/learning';

interface ContinueLearningProps {
  course: LearningCourseWithLessons;
  progress: number;
}

export const ContinueLearning: React.FC<ContinueLearningProps> = ({
  course,
  progress
}) => {
  return (
    <Card className="bg-gradient-to-r from-viverblue/10 to-viverblue/5 border-viverblue/20">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          {/* Imagem do curso */}
          <div className="flex-shrink-0">
            <div className="w-16 h-16 rounded-lg bg-viverblue/20 flex items-center justify-center">
              {course.cover_image_url ? (
                <img 
                  src={course.cover_image_url} 
                  alt={course.title}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <BookOpen className="w-8 h-8 text-viverblue" />
              )}
            </div>
          </div>
          
          {/* Informações do curso */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg mb-1 line-clamp-1">
              Continue aprendendo
            </h3>
            <p className="text-muted-foreground text-sm mb-3 line-clamp-1">
              {course.title}
            </p>
            
            {/* Barra de progresso */}
            <div className="flex items-center gap-2 mb-2">
              <Progress value={progress} className="flex-1 h-2" />
              <span className="text-sm font-medium text-viverblue">
                {progress}%
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {Math.round((progress / 100) * (course.lesson_count || 0))} de {course.lesson_count} aulas concluídas
            </p>
          </div>
          
          {/* Botão de ação */}
          <div className="flex-shrink-0">
            <Button asChild className="bg-viverblue hover:bg-viverblue-dark">
              <Link to={`/learning/course/${course.id}`}>
                <Play className="w-4 h-4 mr-2" />
                Continuar
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
