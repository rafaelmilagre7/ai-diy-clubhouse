
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GraduationCap, Play, Clock, BookOpen } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Link } from 'react-router-dom';

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

interface LessonData {
  id: string;
  title: string;
  description: string;
  estimated_time_minutes: number;
  difficulty_level: string;
  learning_modules: {
    id: string;
    title: string;
    learning_courses: {
      id: string;
      title: string;
    };
  };
}

export const RecommendedLessons = ({ lessons }: RecommendedLessonsProps) => {
  const [lessonsData, setLessonsData] = useState<LessonData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadLessons = async () => {
      try {
        const lessonIds = lessons.map(l => l.lessonId);
        
        const { data, error } = await supabase
          .from('learning_lessons')
          .select(`
            *,
            learning_modules(
              id,
              title,
              learning_courses(
                id,
                title
              )
            )
          `)
          .in('id', lessonIds)
          .eq('published', true);

        if (error) {
          console.error('Erro ao carregar aulas:', error);
          return;
        }

        setLessonsData(data || []);
      } catch (error) {
        console.error('Erro ao carregar aulas:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (lessons.length > 0) {
      loadLessons();
    } else {
      setIsLoading(false);
    }
  }, [lessons]);

  if (isLoading) {
    return (
      <Card className="glass-dark">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-neutral-700 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (lessonsData.length === 0) {
    return null;
  }

  return (
    <Card className="glass-dark border-2 bg-indigo-500/5 border-indigo-500/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-high-contrast text-xl">
          <div className="p-2 bg-indigo-500/20 rounded-lg">
            <GraduationCap className="h-6 w-6 text-indigo-400" />
          </div>
          📚 Aulas Recomendadas para Você
        </CardTitle>
        <p className="text-medium-contrast">
          Aulas selecionadas pela IA para complementar sua jornada de implementação
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {lessonsData.map((lesson) => {
            const recommendation = lessons.find(l => l.lessonId === lesson.id);
            
            return (
              <Card key={lesson.id} className="glass-dark hover:bg-neutral-800/50 transition-all duration-200">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <BookOpen className="h-4 w-4 text-indigo-400" />
                        <Badge variant="outline" className="text-xs">
                          {lesson.learning_modules?.learning_courses?.title}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {lesson.learning_modules?.title}
                        </Badge>
                      </div>
                      
                      <h4 className="text-high-contrast font-semibold mb-2">
                        {lesson.title}
                      </h4>
                      
                      {lesson.description && (
                        <p className="text-medium-contrast text-sm mb-3 line-clamp-2">
                          {lesson.description}
                        </p>
                      )}

                      <div className="flex items-center gap-3 mb-3">
                        {lesson.estimated_time_minutes && (
                          <div className="flex items-center gap-1 text-sm text-medium-contrast">
                            <Clock className="h-4 w-4" />
                            {lesson.estimated_time_minutes} min
                          </div>
                        )}
                        <Badge variant="outline" className="text-xs">
                          {lesson.difficulty_level}
                        </Badge>
                      </div>

                      {recommendation?.justification && (
                        <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-3">
                          <p className="text-sm text-high-contrast">
                            <span className="font-medium text-indigo-400">Por que assistir: </span>
                            {recommendation.justification}
                          </p>
                        </div>
                      )}
                    </div>

                    <Link to={`/learning/course/${lesson.learning_modules?.learning_courses?.id}/lesson/${lesson.id}`}>
                      <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                        <Play className="mr-1 h-4 w-4" />
                        Assistir
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
