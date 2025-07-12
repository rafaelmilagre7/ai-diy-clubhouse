import React, { useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TagFilters } from '@/components/learning/tags/TagFilters';
import { TagBadge } from '@/components/learning/tags/TagBadge';
import { useLessonsWithTags, useLessonCountsByTag } from '@/hooks/useLessonsWithTags';
import { useCourseDetails } from '@/hooks/learning';
import LoadingScreen from '@/components/common/LoadingScreen';

export const LessonsByTags = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Estado dos filtros
  const [selectedTags, setSelectedTags] = useState<string[]>(
    searchParams.get('tags')?.split(',').filter(Boolean) || []
  );

  // Buscar dados
  const { course } = useCourseDetails(courseId || '');
  const { data: lessons, isLoading: lessonsLoading } = useLessonsWithTags({
    courseId,
    selectedTagIds: selectedTags
  });
  const { data: tagCounts } = useLessonCountsByTag(courseId);

  // Atualizar URL quando tags mudarem
  const handleTagsChange = (newTagIds: string[]) => {
    setSelectedTags(newTagIds);
    const newSearchParams = new URLSearchParams(searchParams);
    
    if (newTagIds.length > 0) {
      newSearchParams.set('tags', newTagIds.join(','));
    } else {
      newSearchParams.delete('tags');
    }
    
    setSearchParams(newSearchParams);
  };

  if (lessonsLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="text-muted-foreground hover:text-foreground"
        >
          <Link to={courseId ? `/learning/course/${courseId}` : '/learning'}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Link>
        </Button>
        
        <div>
          <h1 className="text-2xl font-bold">
            {course ? `Aulas de ${course.title}` : 'Explorar Aulas'}
          </h1>
          <p className="text-muted-foreground">
            Filtre e encontre aulas por tags
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar com filtros */}
        <div className="lg:col-span-1">
          <TagFilters
            selectedTags={selectedTags}
            onTagsChange={handleTagsChange}
            lessonCounts={tagCounts}
          />
        </div>

        {/* Conteúdo principal */}
        <div className="lg:col-span-3 space-y-4">
          {/* Header dos resultados */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">
                {lessons?.length === 1 
                  ? '1 aula encontrada' 
                  : `${lessons?.length || 0} aulas encontradas`
                }
              </h2>
              {selectedTags.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  Filtrado por {selectedTags.length} tag{selectedTags.length > 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>

          {/* Lista de aulas */}
          {lessons && lessons.length > 0 ? (
            <div className="space-y-4">
              {lessons.map(lesson => (
                <Card key={lesson.id} className="p-4 hover:shadow-md transition-shadow">
                  <Link
                    to={`/learning/course/${lesson.learning_modules.course_id}/lesson/${lesson.id}`}
                    className="block"
                  >
                    <div className="flex items-start gap-4">
                      {/* Thumbnail */}
                      <div className="flex-shrink-0">
                        {lesson.cover_image_url ? (
                          <img
                            src={lesson.cover_image_url}
                            alt={lesson.title}
                            className="w-20 h-20 object-cover rounded-md"
                          />
                        ) : (
                          <div className="w-20 h-20 bg-muted rounded-md flex items-center justify-center">
                            <BookOpen className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>

                      {/* Conteúdo */}
                      <div className="flex-1 space-y-2">
                        <div>
                          <h3 className="font-semibold text-lg hover:text-primary transition-colors">
                            {lesson.title}
                          </h3>
                          {lesson.description && (
                            <p className="text-muted-foreground text-sm line-clamp-2">
                              {lesson.description}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>Módulo: {lesson.learning_modules.title}</span>
                          {lesson.estimated_time_minutes && (
                            <>
                              <span>•</span>
                              <span>{lesson.estimated_time_minutes} min</span>
                            </>
                          )}
                          {lesson.difficulty_level && (
                            <>
                              <span>•</span>
                              <Badge variant="outline" className="text-xs">
                                {lesson.difficulty_level === 'beginner' && 'Iniciante'}
                                {lesson.difficulty_level === 'intermediate' && 'Intermediário'}
                                {lesson.difficulty_level === 'advanced' && 'Avançado'}
                              </Badge>
                            </>
                          )}
                        </div>

                        {/* Tags da aula */}
                        {lesson.lesson_tags && lesson.lesson_tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {lesson.lesson_tags.map(({ lesson_tags: tag }) => (
                              <TagBadge
                                key={tag.id}
                                tag={tag}
                                size="sm"
                                clickable
                                onClick={(clickedTag) => {
                                  if (!selectedTags.includes(clickedTag.id)) {
                                    handleTagsChange([...selectedTags, clickedTag.id]);
                                  }
                                }}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma aula encontrada</h3>
              <p className="text-muted-foreground">
                {selectedTags.length > 0
                  ? 'Tente remover alguns filtros para ver mais resultados.'
                  : 'Não há aulas disponíveis no momento.'
                }
              </p>
              {selectedTags.length > 0 && (
                <Button
                  variant="outline"
                  onClick={() => handleTagsChange([])}
                  className="mt-4"
                >
                  Limpar filtros
                </Button>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};