
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GraduationCap, ArrowRight, PlayCircle, Clock, Target, Star, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const { getLessonImage, getLessonMetadata } = useLessonImages();
  
  const lessonImage = getLessonImage(lesson.lessonId);
  const lessonMetadata = getLessonMetadata(lesson.lessonId);

  const handleViewLesson = () => {
    navigate(`/learning/course/${lesson.courseId}/lesson/${lesson.lessonId}`);
  };

  const getPriorityConfig = () => {
    const configs = {
      1: { 
        color: "bg-green-500/20 text-green-400 border-green-500/30",
        label: "Alta Prioridade",
        stars: 3,
        accent: "green"
      },
      2: { 
        color: "bg-blue-500/20 text-blue-400 border-blue-500/30", 
        label: "Média Prioridade",
        stars: 2,
        accent: "blue"
      },
      3: { 
        color: "bg-purple-500/20 text-purple-400 border-purple-500/30",
        label: "Baixa Prioridade", 
        stars: 1,
        accent: "purple"
      }
    };
    return configs[lesson.priority as keyof typeof configs] || configs[3];
  };

  const priorityConfig = getPriorityConfig();

  const formatDuration = (duration?: number) => {
    if (!duration) return null;
    const minutes = Math.floor(duration / 60);
    return `${minutes} min`;
  };

  return (
    <Card className="group relative overflow-hidden backdrop-blur-sm bg-gradient-to-br from-neutral-900/95 to-neutral-800/95 border border-neutral-700/50 hover:border-viverblue/50 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-viverblue/10">
      {/* Gradient overlay animado */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <CardContent className="p-0 relative z-10">
        <div className="relative">
          {/* Seção da imagem principal - Netflix style */}
          <div className="relative h-64 overflow-hidden bg-gradient-to-br from-viverblue/20 to-green-500/20">
            {lessonImage ? (
              <>
                <img 
                  src={lessonImage} 
                  alt={lesson.title}
                  className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                  loading="lazy"
                />
                {/* Overlay gradientes para melhor legibilidade */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/40" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <PlayCircle className="h-20 w-20 mx-auto mb-3 text-viverblue group-hover:scale-110 transition-transform duration-300" />
                  <p className="text-sm text-medium-contrast font-medium">Aula Recomendada</p>
                </div>
              </div>
            )}
            
            {/* Badge de ranking no canto superior esquerdo */}
            <div className="absolute top-4 left-4">
              <Badge className="bg-viverblue/90 text-white font-bold text-sm px-3 py-1 backdrop-blur-sm">
                #{index + 1}
              </Badge>
            </div>

            {/* Badge de prioridade no canto superior direito */}
            <div className="absolute top-4 right-4">
              <Badge className={`text-xs px-3 py-1.5 border font-medium ${priorityConfig.color} backdrop-blur-sm`}>
                {priorityConfig.label}
              </Badge>
            </div>

            {/* Indicadores de estrelas no canto inferior esquerdo */}
            <div className="absolute bottom-4 left-4 flex gap-1">
              {Array.from({ length: priorityConfig.stars }, (_, i) => (
                <Star key={i} className="h-4 w-4 fill-current text-yellow-400" />
              ))}
            </div>

            {/* Duração no canto inferior direito */}
            {lessonMetadata?.duration && (
              <div className="absolute bottom-4 right-4 flex items-center gap-1 bg-black/70 backdrop-blur-sm px-2 py-1 rounded-full">
                <Clock className="h-3 w-3 text-white" />
                <span className="text-xs text-white font-medium">
                  {formatDuration(lessonMetadata.duration)}
                </span>
              </div>
            )}
          </div>

          {/* Seção do conteúdo */}
          <div className="p-6 space-y-4">
            {/* Header com título e metadados */}
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-xl font-bold text-high-contrast group-hover:text-white transition-colors duration-300 line-clamp-2 leading-tight">
                  {lesson.title}
                </h3>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Target className="h-4 w-4 text-viverblue" />
                  <span className="text-sm text-viverblue font-semibold">Personalizada</span>
                </div>
              </div>

              {/* Metadados da aula */}
              <div className="flex items-center gap-4 text-sm text-medium-contrast">
                <div className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  <span>Aprendizado</span>
                </div>
                {lessonMetadata?.difficulty && (
                  <div className="flex items-center gap-1">
                    <GraduationCap className="h-4 w-4" />
                    <span className="capitalize">{lessonMetadata.difficulty}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Justificativa */}
            <p className="text-medium-contrast text-sm leading-relaxed group-hover:text-high-contrast transition-colors duration-300 line-clamp-3">
              {lesson.justification}
            </p>

            {/* Footer com ação */}
            <div className="pt-4 border-t border-neutral-700/50">
              <Button 
                onClick={handleViewLesson}
                className="w-full bg-viverblue hover:bg-viverblue/90 text-white font-semibold py-3 shadow-lg hover:shadow-viverblue/25 hover:shadow-xl group-hover:scale-105 transition-all duration-300"
                size="lg"
              >
                <PlayCircle className="mr-2 h-5 w-5" />
                Assistir Aula
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
