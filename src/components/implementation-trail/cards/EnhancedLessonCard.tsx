
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GraduationCap, Clock, Zap, ArrowRight, Star } from 'lucide-react';
import { useLessonImages } from '../hooks/useLessonImages';

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
  const { getLessonImage, getLessonMetadata } = useLessonImages();
  
  const imageUrl = getLessonImage(lesson.lessonId);
  const metadata = getLessonMetadata(lesson.lessonId);
  
  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1: return 'bg-green-500';
      case 2: return 'bg-yellow-500';
      case 3: return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 1: return 'Alta Prioridade';
      case 2: return 'Prioridade Média';
      case 3: return 'Complementar';
      default: return 'Recomendada';
    }
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyLabel = (difficulty?: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner': return 'Iniciante';
      case 'intermediate': return 'Intermediário';
      case 'advanced': return 'Avançado';
      default: return 'Não definido';
    }
  };

  return (
    <Card className="glass-dark border border-neutral-700/50 hover:border-viverblue/50 transition-all duration-300 group overflow-hidden">
      <div className="relative">
        {/* Ranking badge */}
        <div className="absolute top-3 left-3 z-10">
          <div className="flex items-center gap-1 bg-viverblue text-white text-xs px-2 py-1 rounded-full font-bold">
            <Star className="h-3 w-3 fill-current" />
            #{index + 1}
          </div>
        </div>

        {/* Priority badge */}
        <div className="absolute top-3 right-3 z-10">
          <Badge className={`${getPriorityColor(lesson.priority)} text-white text-xs`}>
            {getPriorityLabel(lesson.priority)}
          </Badge>
        </div>

        {/* Cover image */}
        <div className="h-48 bg-gradient-to-br from-neutral-800 to-neutral-900 relative overflow-hidden">
          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt={lesson.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <GraduationCap className="h-16 w-16 text-neutral-600" />
            </div>
          )}
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </div>
      </div>

      <CardHeader className="pb-3">
        <CardTitle className="text-high-contrast text-lg leading-tight line-clamp-2">
          {lesson.title}
        </CardTitle>
        
        {/* Metadata badges */}
        <div className="flex items-center gap-2 flex-wrap mt-2">
          {metadata?.estimated_time_minutes && (
            <Badge variant="outline" className="text-xs border-neutral-600">
              <Clock className="h-3 w-3 mr-1" />
              {metadata.estimated_time_minutes} min
            </Badge>
          )}
          
          {metadata?.difficulty_level && (
            <Badge className={`text-xs ${getDifficultyColor(metadata.difficulty_level)}`}>
              <Zap className="h-3 w-3 mr-1" />
              {getDifficultyLabel(metadata.difficulty_level)}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Justification */}
        <p className="text-medium-contrast text-sm leading-relaxed mb-4 line-clamp-3">
          {lesson.justification}
        </p>

        {/* Description preview if available */}
        {metadata?.description && (
          <p className="text-low-contrast text-xs leading-relaxed mb-4 line-clamp-2">
            {metadata.description}
          </p>
        )}

        {/* Action button */}
        <Button 
          className="w-full bg-viverblue hover:bg-viverblue-dark text-white group/btn"
          onClick={() => {
            // Navigate to lesson - you can implement navigation logic here
            window.open(`/learning/lessons/${lesson.lessonId}`, '_blank');
          }}
        >
          <GraduationCap className="mr-2 h-4 w-4" />
          Começar Aula
          <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
        </Button>
      </CardContent>
    </Card>
  );
};
