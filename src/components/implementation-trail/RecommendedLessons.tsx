
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GraduationCap, ArrowRight, PlayCircle, Clock, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface RecommendedLesson {
  lessonId: string;
  moduleId: string;
  courseId: string;
  title: string;
  justification: string;
  priority: number;
}

interface RecommendedLessonsProps {
  lessons: RecommendedLesson[];
}

const LessonCard = ({ lesson }: { lesson: RecommendedLesson }) => {
  const navigate = useNavigate();

  const handleViewLesson = () => {
    navigate(`/learning/courses/${lesson.courseId}/modules/${lesson.moduleId}/lessons/${lesson.lessonId}`);
  };

  const getPriorityColor = () => {
    const colors = {
      1: "bg-aurora-primary/20 text-aurora-primary border-aurora-primary/30",
      2: "bg-operational/20 text-operational border-operational/30", 
      3: "bg-strategy/20 text-strategy border-strategy/30"
    };
    return colors[lesson.priority as keyof typeof colors] || colors[3];
  };

  return (
    <Card className="group relative overflow-hidden backdrop-blur-xl bg-card/80 border border-border/50 hover:border-aurora-primary/50 transition-all duration-300 hover:scale-[1.02] shadow-md hover:shadow-xl hover:shadow-aurora-primary/5">
      <div className="absolute inset-0 bg-gradient-aurora-subtle opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <CardContent className="p-0 relative z-10">
        <div className="flex h-40">
          {/* Seção da imagem/ícone */}
          <div className="w-64 relative overflow-hidden rounded-l-xl bg-gradient-aurora-subtle">
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <PlayCircle className="h-16 w-16 mx-auto mb-2 text-aurora-primary group-hover:scale-110 transition-transform duration-300" />
                <p className="text-xs text-muted-foreground font-medium">Aula Recomendada</p>
              </div>
            </div>
            
            {/* Badge de prioridade */}
            <div className="absolute top-3 left-3">
              <span className={`text-xs px-2 py-1 rounded-full border font-medium ${getPriorityColor()} backdrop-blur-sm`}>
                Prioridade {lesson.priority}
              </span>
            </div>
          </div>

          {/* Seção do conteúdo */}
          <div className="flex-1 p-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div>
                <h4 className="text-base font-bold text-foreground group-hover:text-aurora-primary transition-colors duration-200 line-clamp-2">
                  {lesson.title}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <BookOpen className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Módulo de Aprendizado</span>
                </div>
              </div>

              <p className="text-sm text-foreground leading-relaxed line-clamp-2">
                {lesson.justification}
              </p>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-border/50">
              <div className="flex items-center gap-2 text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-200">
                <GraduationCap className="h-4 w-4" />
                <span>Aprendizado</span>
              </div>
              
              <Button 
                size="sm" 
                onClick={handleViewLesson}
                variant="aurora-primary"
                className="shadow-md hover:shadow-lg hover:shadow-aurora-primary/20 group-hover:scale-105 transition-all duration-200"
              >
                Ver Aula
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const RecommendedLessons = ({ lessons }: RecommendedLessonsProps) => {
  if (!lessons || lessons.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header da seção */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-aurora-subtle rounded-2xl blur-xl opacity-50" />
        <Card className="relative overflow-hidden backdrop-blur-xl bg-card/80 border-2 border-aurora-primary/40 shadow-lg">
          <div className="absolute inset-0 bg-gradient-aurora-subtle opacity-20" />
          <CardHeader className="relative z-10">
            <div className="flex items-center gap-3">
              <GraduationCap className="h-6 w-6 text-aurora-primary animate-pulse" />
              <div>
                <CardTitle className="text-foreground text-2xl font-bold">
                  📚 Aulas Recomendadas
                </CardTitle>
                <p className="text-muted-foreground text-lg mt-1">
                  Fortaleça seu conhecimento com estas aulas selecionadas
                </p>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Grid de aulas */}
      <div className="space-y-4">
        {lessons.map((lesson, index) => (
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
