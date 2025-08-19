import React, { useState } from 'react';
import { useOptimizedLearningCourses } from '@/hooks/learning/useOptimizedLearningCourses';
import { useLessonsWithTags } from '@/hooks/useLessonsWithTags';
import { LearningLessonWithRelations } from '@/lib/supabase/types/extended';
import { convertToLearningLessonWithRelations } from '@/lib/supabase/utils/typeConverters';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Loader2, ChevronDown, ChevronRight, BookOpen, Users, Clock } from 'lucide-react';
import { AulasList } from './AulasList';
import { NovaAulaButton } from './NovaAulaButton';
import { useAuth } from '@/contexts/auth';

interface LessonsByCourseViewProps {
  onEdit: (lesson: LearningLessonWithRelations) => void;
  onDelete: (lessonId: string) => void;
  onSuccess: () => void;
}

export const LessonsByCourseView: React.FC<LessonsByCourseViewProps> = ({
  onEdit,
  onDelete,
  onSuccess,
}) => {
  const { isAdmin } = useAuth();
  const { courses, isLoading, error } = useOptimizedLearningCourses(true); // Incluir não publicados na área administrativa
  const [searchTerm, setSearchTerm] = useState('');
  const [openCourses, setOpenCourses] = useState<Set<string>>(new Set());
  
  const { data: allLessonsWithTags } = useLessonsWithTags({ 
    searchTerm, 
    includeUnpublished: true 
  });

  const toggleCourse = (courseId: string) => {
    const newOpenCourses = new Set(openCourses);
    if (newOpenCourses.has(courseId)) {
      newOpenCourses.delete(courseId);
    } else {
      newOpenCourses.add(courseId);
    }
    setOpenCourses(newOpenCourses);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Erro ao carregar cursos: {error.message}</p>
      </div>
    );
  }

  const filteredCourses = courses.filter(course => {
    if (!searchTerm) return true;
    
    const courseMatches = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const lessonsFromThisCourse = allLessonsWithTags?.filter(lesson => 
      lesson.learning_modules?.course_id === course.id
    );
    
    const lessonMatches = lessonsFromThisCourse?.some(lesson =>
      lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lesson.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    return courseMatches || lessonMatches;
  });

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <Input
          placeholder="Buscar cursos ou aulas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setOpenCourses(new Set(courses.map(c => c.id)))}
          >
            Expandir Todos
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setOpenCourses(new Set())}
          >
            Recolher Todos
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {filteredCourses.map((course) => {
          const isOpen = openCourses.has(course.id);
          const lessonsFromThisCourse = allLessonsWithTags?.filter(lesson => 
            lesson.learning_modules?.course_id === course.id
          ) || [];

          return (
            <Card key={course.id} className="overflow-hidden">
              <Collapsible open={isOpen} onOpenChange={() => toggleCourse(course.id)}>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          {isOpen ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                          <BookOpen className="h-5 w-5 text-primary" />
                        </div>
                        
                        <div className="text-left">
                          <CardTitle className="text-lg">{course.title}</CardTitle>
                          {course.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {course.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>{course.module_count} módulos</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{lessonsFromThisCourse.length} aulas</span>
                          </div>
                        </div>
                        
                        <Badge variant={course.is_restricted ? "secondary" : "default"}>
                          {course.is_restricted ? "Restrito" : "Público"}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <CardContent className="pt-0">
                    {lessonsFromThisCourse.length > 0 ? (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <p className="text-sm text-muted-foreground">
                            {lessonsFromThisCourse.length} aula{lessonsFromThisCourse.length !== 1 ? 's' : ''} encontrada{lessonsFromThisCourse.length !== 1 ? 's' : ''}
                          </p>
                          
                          {isAdmin && (
                            <NovaAulaButton 
                              moduleId=""
                              allowModuleSelection={true}
                              buttonText="Nova Aula neste Curso"
                              onSuccess={onSuccess}
                              variant="outline"
                              size="sm"
                            />
                          )}
                        </div>

                        <AulasList
                          aulas={lessonsFromThisCourse.map(convertToLearningLessonWithRelations)}
                          loading={false}
                          onEdit={onEdit}
                          onDelete={onDelete}
                          isAdmin={isAdmin}
                        />
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground mb-4">
                          Nenhuma aula encontrada neste curso
                        </p>
                        
                        {isAdmin && (
                          <NovaAulaButton 
                            moduleId=""
                            allowModuleSelection={true}
                            buttonText="Criar Primeira Aula"
                            onSuccess={onSuccess}
                            variant="outline"
                          />
                        )}
                      </div>
                    )}
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          );
        })}

        {filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium">Nenhum curso encontrado</p>
            <p className="text-muted-foreground">
              {searchTerm ? 'Tente ajustar sua busca' : 'Não há cursos disponíveis no momento'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};