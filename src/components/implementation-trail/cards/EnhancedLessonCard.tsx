import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Play, 
  Clock, 
  Star, 
  TrendingUp,
  ExternalLink,
  GraduationCap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface RecommendedLesson {
  lessonId: string;
  moduleId: string;
  courseId: string;
  title: string;
  justification: string;
  priority: number;
}

interface EnhancedLessonCardProps {
  lesson: RecommendedLesson;
  index: number;
}

export const EnhancedLessonCard = ({ lesson, index }: EnhancedLessonCardProps) => {
  const navigate = useNavigate();

  const getPriorityConfig = (priority: number) => {
    switch (priority) {
      case 1:
        return {
          label: 'Alta Prioridade',
          color: 'bg-viverblue text-white',
          borderColor: 'border-viverblue/50',
          bgGradient: 'from-viverblue/10 to-viverblue/5'
        };
      case 2:
        return {
          label: 'Média Prioridade',
          color: 'bg-operational text-white',
          borderColor: 'border-operational/50',
          bgGradient: 'from-operational/10 to-operational/5'
        };
      case 3:
        return {
          label: 'Baixa Prioridade',
          color: 'bg-revenue text-white',
          borderColor: 'border-revenue/50',
          bgGradient: 'from-revenue/10 to-revenue/5'
        };
      default:
        return {
          label: 'Prioridade',
          color: 'bg-muted text-muted-foreground',
          borderColor: 'border-muted/50',
          bgGradient: 'from-muted/10 to-muted/5'
        };
    }
  };

  const priorityConfig = getPriorityConfig(lesson.priority);

  const handleLessonClick = () => {
    // Navegar para a aula específica
    navigate(`/lesson/${lesson.lessonId}`);
  };

  return (
    <Card className={`aurora-glass ${priorityConfig.borderColor} aurora-hover-scale group cursor-pointer h-full bg-gradient-to-br ${priorityConfig.bgGradient} overflow-hidden`}>
      {/* Thumbnail/Preview Area */}
      <div className="relative aspect-video bg-gradient-to-br from-muted/50 to-muted/20 flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
        <div className="relative z-10 flex items-center gap-2">
          <GraduationCap className="h-8 w-8 text-viverblue" />
          <Play className="h-6 w-6 text-foreground/80 group-hover:text-viverblue transition-colors" />
        </div>
        
        {/* Priority Badge */}
        <div className="absolute top-3 left-3">
          <Badge className={`${priorityConfig.color} text-xs font-medium`}>
            {priorityConfig.label}
          </Badge>
        </div>

        {/* Rank indicator */}
        <div className="absolute top-3 right-3">
          <div className="bg-background/90 backdrop-blur-sm rounded-full w-8 h-8 flex items-center justify-center">
            <span className="text-sm font-bold text-viverblue">#{index + 1}</span>
          </div>
        </div>
      </div>

      <CardHeader className="pb-3">
        <CardTitle className="text-lg line-clamp-2 group-hover:text-viverblue transition-colors">
          {lesson.title}
        </CardTitle>
        
        {/* Course/Module info */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>Módulo ID: {lesson.moduleId.slice(0, 8)}...</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-4">
        {/* AI Justification */}
        <div className="bg-muted/30 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <Star className="w-4 h-4 text-viverblue mt-0.5 flex-shrink-0" />
            <p className="text-sm text-foreground line-clamp-3">{lesson.justification}</p>
          </div>
        </div>

        {/* Priority Score Visual */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Relevância</span>
            <span className="text-foreground font-medium">
              {lesson.priority === 1 ? '95%' : lesson.priority === 2 ? '80%' : '65%'}
            </span>
          </div>
          <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-1000 ${
                lesson.priority === 1 ? 'bg-viverblue' : 
                lesson.priority === 2 ? 'bg-operational' : 'bg-revenue'
              }`}
              style={{ 
                width: lesson.priority === 1 ? '95%' : lesson.priority === 2 ? '80%' : '65%',
                animationDelay: `${index * 200}ms`
              }}
            />
          </div>
        </div>

        {/* Action Button */}
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full group-hover:bg-viverblue group-hover:text-white group-hover:border-viverblue transition-all"
          onClick={(e) => {
            e.stopPropagation();
            handleLessonClick();
          }}
        >
          <Play className="w-4 h-4 mr-2" />
          Assistir Aula
          <ExternalLink className="w-4 h-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
};