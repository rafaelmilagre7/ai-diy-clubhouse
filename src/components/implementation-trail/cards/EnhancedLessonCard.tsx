import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Play, 
  Clock, 
  Star, 
  TrendingUp,
  ExternalLink,
  GraduationCap,
  BookOpen,
  Zap,
  Target
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface RecommendedLesson {
  id: string; // Agora é UUID real da aula
  lessonId?: string; // Para compatibilidade com dados antigos
  moduleId?: string;
  courseId?: string;
  title: string;
  description: string;
  justification?: string;
  reasoning?: string;
  priority?: number;
  ai_score?: number;
  category?: string;
  difficulty?: string;
  duration?: string;
  course_title?: string;
  module_title?: string;
  cover_image_url?: string;
  topics?: string[];
}

interface EnhancedLessonCardProps {
  lesson: RecommendedLesson;
  index: number;
}

export const EnhancedLessonCard = ({ lesson, index }: EnhancedLessonCardProps) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const getPriorityConfig = (priority: number = 1) => {
    // Se temos ai_score, usar isso para determinar prioridade
    const score = lesson.ai_score || 70;
    let calculatedPriority = priority;
    
    if (score >= 85) calculatedPriority = 1;
    else if (score >= 70) calculatedPriority = 2;
    else calculatedPriority = 3;

    switch (calculatedPriority) {
      case 1:
        return {
          label: 'Alta Prioridade',
          color: 'bg-gradient-to-r from-viverblue to-viverblue-light text-white shadow-lg shadow-viverblue/25',
          borderColor: 'border-viverblue/40',
          bgGradient: 'from-viverblue/15 via-viverblue/10 to-viverblue/5',
          glowColor: 'shadow-viverblue/20',
          progressColor: 'bg-gradient-to-r from-viverblue to-viverblue-light'
        };
      case 2:
        return {
          label: 'Média Prioridade',
          color: 'bg-gradient-to-r from-operational to-operational-light text-white shadow-lg shadow-operational/25',
          borderColor: 'border-operational/40',
          bgGradient: 'from-operational/15 via-operational/10 to-operational/5',
          glowColor: 'shadow-operational/20',
          progressColor: 'bg-gradient-to-r from-operational to-operational-light'
        };
      case 3:
        return {
          label: 'Baixa Prioridade',
          color: 'bg-gradient-to-r from-revenue to-revenue-light text-white shadow-lg shadow-revenue/25',
          borderColor: 'border-revenue/40',
          bgGradient: 'from-revenue/15 via-revenue/10 to-revenue/5',
          glowColor: 'shadow-revenue/20',
          progressColor: 'bg-gradient-to-r from-revenue to-revenue-light'
        };
      default:
        return {
          label: 'Prioridade',
          color: 'bg-gradient-to-r from-muted to-muted-light text-muted-foreground shadow-lg shadow-muted/25',
          borderColor: 'border-muted/40',
          bgGradient: 'from-muted/15 via-muted/10 to-muted/5',
          glowColor: 'shadow-muted/20',
          progressColor: 'bg-gradient-to-r from-muted to-muted-light'
        };
    }
  };

  const priorityConfig = getPriorityConfig(lesson.priority);

  // Usar a capa real da aula ou fallback
  const lessonCoverUrl = lesson.cover_image_url || `https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=400&h=600&fit=crop&crop=center`;

  const handleLessonClick = () => {
    // Usar o ID da aula real
    const lessonId = lesson.id || lesson.lessonId;
    if (lessonId) {
      navigate(`/lesson/${lessonId}`);
    }
  };

  return (
    <Card 
      className={`aurora-glass ${priorityConfig.borderColor} group cursor-pointer h-full bg-gradient-to-br ${priorityConfig.bgGradient} overflow-hidden relative transition-all duration-500 hover:scale-[1.02] hover:${priorityConfig.glowColor} hover:shadow-2xl`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleLessonClick}
    >
      {/* Aurora effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-viverblue/5 via-transparent to-operational/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Vertical lesson cover image */}
      <div className="relative aspect-[2/3] overflow-hidden">
        <img 
          src={lessonCoverUrl}
          alt={`Capa da aula ${lesson.title}`}
          className={`w-full h-full object-cover transition-all duration-700 ${
            isHovered ? 'scale-110 brightness-110' : 'scale-100'
          } ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setImageLoaded(true)}
          onError={(e) => {
            setImageLoaded(true);
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?q=80&w=400&h=600&fit=crop&crop=center';
          }}
        />
        
        {/* Loading placeholder */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-br from-muted/50 to-muted/20 flex items-center justify-center">
            <div className="flex items-center gap-2">
              <BookOpen className="h-8 w-8 text-viverblue animate-pulse" />
              <div className="w-2 h-2 bg-viverblue rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-operational rounded-full animate-bounce animation-delay-200" />
              <div className="w-2 h-2 bg-revenue rounded-full animate-bounce animation-delay-400" />
            </div>
          </div>
        )}
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
        
        {/* Floating elements */}
        <div className="absolute inset-0">
          {/* Priority Badge - Enhanced */}
          <div className="absolute top-4 left-4">
            <Badge className={`${priorityConfig.color} text-xs font-semibold backdrop-blur-sm border-0 px-3 py-1 animate-pulse`}>
              {priorityConfig.label}
            </Badge>
          </div>

          {/* Rank indicator - Enhanced */}
          <div className="absolute top-4 right-4">
            <div className="bg-background/95 backdrop-blur-md rounded-full w-10 h-10 flex items-center justify-center border border-border/50 shadow-lg">
              <span className="text-sm font-bold text-viverblue">#{index + 1}</span>
            </div>
          </div>

          {/* Play button overlay */}
          <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
            isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}>
            <div className="p-4 bg-viverblue/90 backdrop-blur-sm rounded-full border-2 border-white/20 shadow-2xl">
              <Play className="h-8 w-8 text-white fill-current" />
            </div>
          </div>

          {/* Aurora particles */}
          <div className="absolute top-1/3 left-1/4 w-1 h-1 bg-viverblue rounded-full animate-pulse opacity-60" />
          <div className="absolute bottom-1/3 right-1/3 w-1.5 h-1.5 bg-operational rounded-full animate-pulse animation-delay-1000 opacity-40" />
          <div className="absolute top-2/3 right-1/4 w-1 h-1 bg-revenue rounded-full animate-pulse animation-delay-2000 opacity-50" />
        </div>
      </div>

      <CardHeader className="pb-3 relative z-10">
        <CardTitle className="text-lg font-bold line-clamp-2 group-hover:text-viverblue transition-colors duration-300">
          {lesson.title}
        </CardTitle>
        
        {/* Enhanced metadata */}
        <div className="flex items-center gap-3 text-sm text-muted-foreground mt-2">
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>{lesson.duration || '45-60 min'}</span>
          </div>
          {lesson.course_title && (
            <div className="flex items-center gap-1">
              <Target className="w-3.5 h-3.5" />
              <span className="truncate max-w-[120px]">{lesson.course_title}</span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-4 relative z-10">
        {/* AI Justification - Enhanced */}
        <div className="bg-gradient-to-r from-muted/40 via-muted/30 to-muted/40 rounded-xl p-4 border border-border/50 backdrop-blur-sm">
          <div className="flex items-start gap-3">
            <div className="p-1.5 bg-viverblue/20 rounded-full">
              <Star className="w-4 h-4 text-viverblue" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-foreground text-sm mb-1">Por que é recomendada</h4>
              <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                {lesson.reasoning || lesson.justification || lesson.description}
              </p>
            </div>
          </div>
        </div>

        {/* Enhanced Priority Score */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-muted-foreground">Compatibilidade IA</span>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-viverblue" />
            <span className="text-sm font-bold text-foreground">
              {lesson.ai_score ? `${lesson.ai_score}%` : 
               lesson.priority === 1 ? '95%' : lesson.priority === 2 ? '80%' : '65%'}
            </span>
            </div>
          </div>
          <div className="h-3 bg-muted/30 rounded-full overflow-hidden backdrop-blur-sm">
            <div 
              className={`h-full rounded-full transition-all duration-1000 ease-out ${priorityConfig.progressColor}`}
              style={{ 
                width: lesson.ai_score ? `${lesson.ai_score}%` :
                       lesson.priority === 1 ? '95%' : lesson.priority === 2 ? '80%' : '65%',
                animationDelay: `${index * 200}ms`
              }}
            />
          </div>
        </div>

        {/* Enhanced Action Button */}
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full group-hover:bg-viverblue group-hover:text-white group-hover:border-viverblue transition-all duration-300 hover:scale-[1.02] font-semibold"
          onClick={(e) => {
            e.stopPropagation();
            handleLessonClick();
          }}
        >
          <Play className="w-4 h-4 mr-2" />
          Assistir Aula
          <ExternalLink className="w-4 h-4 ml-2 opacity-75" />
        </Button>
      </CardContent>

      {/* Bottom glow effect */}
      <div className={`absolute bottom-0 left-0 right-0 h-1 ${priorityConfig.progressColor} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
    </Card>
  );
};