import React from 'react';
import { BookOpen, GraduationCap, Clock, ChevronRight, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface LessonsTabProps {
  trail: {
    recommended_lessons?: Array<{
      lessonId: string;
      moduleId: string;
      courseId: string;
      title: string;
      justification: string;
      priority: number;
    }>;
    ai_message?: string;
  };
}

export const LessonsTab = ({ trail }: LessonsTabProps) => {
  const lessons = trail.recommended_lessons || [];

  if (lessons.length === 0) {
    return (
      <div className="text-center py-12 space-y-4">
        <div className="w-16 h-16 bg-gradient-to-br from-operational/20 to-operational/10 rounded-full flex items-center justify-center mx-auto">
          <BookOpen className="w-8 h-8 text-operational" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Aulas em preparação</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            As recomendações de aulas personalizadas estão sendo preparadas para complementar suas soluções prioritárias.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-operational/20 to-operational/10 rounded-full flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-operational" />
          </div>
          <h2 className="text-2xl font-bold">Aulas Recomendadas</h2>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Aulas selecionadas estrategicamente para complementar suas soluções prioritárias e acelerar sua jornada de implementação.
        </p>
      </div>

      <div className="space-y-4">
        {lessons
          .sort((a, b) => b.priority - a.priority)
          .map((lesson, index) => (
            <Card 
              key={lesson.lessonId} 
              className="aurora-glass border-operational/20 hover:border-operational/40 transition-all duration-300 hover:shadow-lg group"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-operational to-operational/80 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg group-hover:text-operational transition-colors">
                          {lesson.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            Prioridade {lesson.priority}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground leading-relaxed pl-11">
                      {lesson.justification}
                    </p>

                    <div className="flex items-center justify-between pl-11">
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Target className="w-3 h-3" />
                          Módulo: {lesson.moduleId.slice(0, 8)}...
                        </span>
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-3 h-3" />
                          Curso: {lesson.courseId.slice(0, 8)}...
                        </span>
                      </div>
                      
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-operational hover:text-operational hover:bg-operational/10"
                      >
                        Acessar Aula
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>

      {trail.ai_message && (
        <Card className="aurora-glass border-primary/20 bg-gradient-to-r from-primary/5 to-operational/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Target className="w-5 h-5" />
              Mensagem da IA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed">{trail.ai_message}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};