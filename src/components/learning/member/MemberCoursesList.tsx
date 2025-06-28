
import React from 'react';
import { LearningCourse } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Play, BookOpen, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

interface MemberCoursesListProps {
  courses: LearningCourse[];
  userProgress?: any[];
}

export const MemberCoursesList = ({ courses, userProgress = [] }: MemberCoursesListProps) => {
  
  const getCourseProgress = (courseId: string) => {
    return 0;
  };

  const isCompleted = (courseId: string) => {
    return false;
  };

  if (!courses || courses.length === 0) {
    return (
      <div className="text-center py-12">
        <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">Nenhum curso disponível</h3>
        <p className="text-muted-foreground">
          Novos cursos serão adicionados em breve.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course) => {
        const progress = getCourseProgress(course.id);
        const completed = isCompleted(course.id);
        
        return (
          <Card key={course.id} className="group hover:shadow-lg transition-all duration-200">
            <div className="aspect-video relative overflow-hidden rounded-t-lg bg-gradient-to-br from-primary/90 to-primary/60 flex items-center justify-center">
              <div className="text-center text-white">
                <BookOpen className="h-8 w-8 mx-auto mb-2" />
                <span className="font-semibold">{course.title}</span>
              </div>
              
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button 
                  variant="secondary" 
                  size="sm"
                  className="bg-white/90 text-primary hover:bg-white"
                  asChild
                >
                  <Link to={`/learning/course/${course.id}`}>
                    <Play className="h-4 w-4 mr-2" />
                    {completed ? 'Revisar' : progress > 0 ? 'Continuar' : 'Começar'}
                  </Link>
                </Button>
              </div>
            </div>
            
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Badge variant={course.published ? "default" : "secondary"}>
                  {course.published ? "Disponível" : "Em breve"}
                </Badge>
                {completed && (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Concluído
                  </Badge>
                )}
              </div>
              <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
                {course.title}
              </CardTitle>
            </CardHeader>
            
            <CardContent className="pt-0">
              {course.description && (
                <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                  {course.description}
                </p>
              )}
              
              <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>Auto-ritmo</span>
                </div>
              </div>
              
              {progress > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progresso</span>
                    <span className="font-medium">{progress}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
