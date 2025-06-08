
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GraduationCap, ArrowRight, PlayCircle, Clock, BookOpen, Target, Star } from 'lucide-react';
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

interface LessonsTabProps {
  lessons: RecommendedLesson[];
}

const LessonCard = ({ lesson }: { lesson: RecommendedLesson }) => {
  const navigate = useNavigate();
  const { getLessonImage } = useLessonImages();
  const lessonImage = getLessonImage(lesson.lessonId);

  const handleViewLesson = () => {
    navigate(`/learning/course/${lesson.courseId}/lesson/${lesson.lessonId}`);
  };

  const getPriorityColor = () => {
    const colors = {
      1: "bg-green-500/20 text-green-400 border-green-500/30",
      2: "bg-blue-500/20 text-blue-400 border-blue-500/30", 
      3: "bg-purple-500/20 text-purple-400 border-purple-500/30"
    };
    return colors[lesson.priority as keyof typeof colors] || colors[3];
  };

  const getPriorityStars = () => {
    return Array.from({ length: lesson.priority }, (_, i) => (
      <Star key={i} className="h-3 w-3 fill-current text-yellow-400" />
    ));
  };

  return (
    <Card className="netflix-card-hover glass-dark border border-neutral-700/50 hover:border-viverblue/50 group relative overflow-hidden backdrop-blur-sm bg-gradient-to-br from-neutral-900/90 to-neutral-800/90 transition-all duration-300 hover:scale-[1.02]">
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <CardContent className="p-0 relative z-10">
        <div className="flex h-48">
          {/* Seção da imagem */}
          <div className="w-80 relative overflow-hidden rounded-l-xl bg-gradient-to-br from-viverblue/20 to-green-500/20">
            {lessonImage ? (
              <>
                <img 
                  src={lessonImage} 
                  alt={lesson.title}
                  className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-black/60"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <PlayCircle className="h-16 w-16 mx-auto mb-2 text-viverblue group-hover:scale-110 transition-transform duration-300" />
                  <p className="text-xs text-medium-contrast">Aula Recomendada</p>
                </div>
              </div>
            )}
            
            {/* Badge de prioridade */}
            <div className="absolute top-4 left-4">
              <span className={`text-xs px-3 py-1.5 rounded-full border font-medium ${getPriorityColor()} backdrop-blur-sm`}>
                Prioridade {lesson.priority}
              </span>
            </div>

            {/* Indicador de estrelas */}
            <div className="absolute bottom-4 left-4 flex gap-1">
              {getPriorityStars()}
            </div>
          </div>

          {/* Seção do conteúdo */}
          <div className="flex-1 p-6 flex flex-col justify-between">
            <div className="space-y-4">
              {/* Header */}
              <div>
                <h3 className="text-lg font-bold text-high-contrast group-hover:text-white transition-colors duration-200 line-clamp-2">
                  {lesson.title}
                </h3>
                <div className="flex items-center gap-2 mt-2">
                  <BookOpen className="h-4 w-4 text-medium-contrast" />
                  <span className="text-sm text-medium-contrast">Aula Recomendada</span>
                  <div className="flex items-center gap-1 ml-2">
                    <Target className="h-3 w-3 text-viverblue" />
                    <span className="text-xs text-viverblue font-medium">Personalizada</span>
                  </div>
                </div>
              </div>

              {/* Justificativa */}
              <p className="text-sm text-high-contrast group-hover:text-white transition-colors duration-200 leading-relaxed line-clamp-3">
                {lesson.justification}
              </p>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-neutral-700/50">
              <div className="flex items-center gap-2 text-sm text-medium-contrast group-hover:text-high-contrast transition-colors duration-200">
                <GraduationCap className="h-4 w-4" />
                <span>Aprendizado</span>
              </div>
              
              <Button 
                size="sm" 
                onClick={handleViewLesson}
                className="bg-viverblue hover:bg-viverblue/90 text-white shadow-lg hover:shadow-viverblue/25 hover:shadow-xl group-hover:scale-105 transition-all duration-200"
              >
                Assistir Aula
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const LessonsTab = ({ lessons }: LessonsTabProps) => {
  if (!lessons || lessons.length === 0) {
    return (
      <div className="text-center py-12">
        <GraduationCap className="h-16 w-16 mx-auto text-medium-contrast mb-4" />
        <h3 className="text-lg font-semibold text-high-contrast mb-2">
          Nenhuma aula recomendada
        </h3>
        <p className="text-medium-contrast">
          Não há aulas personalizadas para sua trilha no momento.
        </p>
      </div>
    );
  }

  // Ordenar por prioridade
  const sortedLessons = [...lessons].sort((a, b) => a.priority - b.priority);

  return (
    <div className="space-y-6">
      {/* Header da seção */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-viverblue/20 via-green-500/10 to-transparent rounded-2xl blur-xl opacity-50" />
        <Card className="glass-dark border-2 border-viverblue/40 bg-viverblue/5 relative overflow-hidden backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent" />
          <CardHeader className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <GraduationCap className="h-6 w-6 text-viverblue animate-pulse" />
                <div>
                  <CardTitle className="text-high-contrast text-2xl font-bold">
                    📚 Aulas Recomendadas
                  </CardTitle>
                  <p className="text-medium-contrast text-lg mt-1">
                    {lessons.length} aulas selecionadas especialmente para você
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-viverblue">{lessons.length}</div>
                <div className="text-xs text-medium-contrast">Aulas</div>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Grid de aulas */}
      <div className="space-y-6">
        {sortedLessons.map((lesson, index) => (
          <div
            key={`${lesson.lessonId}-${index}`}
            className="animate-fade-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <LessonCard lesson={lesson} />
          </div>
        ))}
      </div>
    </div>
  );
};
