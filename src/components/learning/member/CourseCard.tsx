
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Clock, Users } from 'lucide-react';

interface CourseCardProps {
  id: string;
  title: string;
  description: string;
  imageUrl?: string | null;
  progress: number;
  moduleCount?: number;
  lessonCount?: number;
}

export const CourseCard: React.FC<CourseCardProps> = ({
  id,
  title,
  description,
  imageUrl,
  progress,
  moduleCount = 0,
  lessonCount = 0
}) => {
  return (
    <Link to={`/learning/course/${id}`}>
      <Card className="group hover:shadow-lg transition-all duration-200 h-full">
        <CardHeader className="p-0">
          <div className="aspect-video bg-gradient-to-br from-viverblue/10 to-viverblue/5 rounded-t-lg overflow-hidden">
            {imageUrl ? (
              <img 
                src={imageUrl} 
                alt={title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <BookOpen className="w-12 h-12 text-viverblue/30" />
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-viverblue transition-colors">
                {title}
              </h3>
              <p className="text-muted-foreground text-sm line-clamp-2 mt-1">
                {description}
              </p>
            </div>
            
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <BookOpen className="w-3 h-3" />
                <span>{moduleCount} módulos</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{lessonCount} aulas</span>
              </div>
            </div>
            
            {progress > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Progresso</span>
                  <span className="font-medium">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}
            
            {progress === 0 && (
              <Badge variant="outline" className="text-xs">
                Não iniciado
              </Badge>
            )}
            
            {progress === 100 && (
              <Badge className="text-xs bg-green-600 hover:bg-green-700">
                Concluído
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};
