
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Play, BookOpen, Clock } from 'lucide-react';

interface CourseCardProps {
  courseId: string;
  title: string;
  description: string;
  imageUrl?: string | null;
  progress?: number;
  moduleCount?: number;
  lessonCount?: number;
}

export const CourseCard: React.FC<CourseCardProps> = ({
  courseId,
  title,
  description,
  imageUrl,
  progress = 0,
  moduleCount = 0,
  lessonCount = 0
}) => {
  const navigate = useNavigate();

  const handleCourseClick = () => {
    navigate(`/learning/courses/${courseId}`);
  };

  return (
    <Card className="h-full cursor-pointer hover:shadow-md transition-shadow group" onClick={handleCourseClick}>
      <CardHeader className="p-0">
        <div className="aspect-video relative overflow-hidden rounded-t-lg bg-gradient-to-br from-viverblue/20 to-purple-500/20">
          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <BookOpen className="h-12 w-12 text-viverblue/40" />
            </div>
          )}
          
          {progress > 0 && (
            <div className="absolute top-2 right-2">
              <Badge variant="secondary" className="bg-white/90 text-viverblue">
                {progress}%
              </Badge>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-viverblue transition-colors">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
            {description}
          </p>
        </div>

        {/* Estatísticas do curso */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <BookOpen className="h-4 w-4" />
            <span>{moduleCount} módulos</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{lessonCount} aulas</span>
          </div>
        </div>

        {/* Progresso */}
        {progress > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progresso</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {/* Botão de ação */}
        <Button 
          className="w-full group-hover:bg-viverblue group-hover:text-white transition-colors"
          variant={progress > 0 ? "default" : "outline"}
          onClick={(e) => {
            e.stopPropagation();
            handleCourseClick();
          }}
        >
          <Play className="h-4 w-4 mr-2" />
          {progress > 0 ? 'Continuar' : 'Começar'}
        </Button>
      </CardContent>
    </Card>
  );
};
