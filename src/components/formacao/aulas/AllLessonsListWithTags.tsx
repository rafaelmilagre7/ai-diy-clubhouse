import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, Filter, Tag, Eye, Edit, Trash2, Play } from 'lucide-react';
import { LearningLessonWithRelations } from '@/lib/supabase/types/extended';
import { useLessonsWithTags } from '@/hooks/useLessonsWithTags';
import { LessonTagsFilter } from '@/components/learning/tags/LessonTagsFilter';
import { TagBadge } from '@/components/learning/tags/TagBadge';
import { NovaAulaButton } from './NovaAulaButton';
import { useAuth } from '@/contexts/auth';
import { useFeatureAccess } from '@/hooks/auth/useFeatureAccess';
import { usePremiumUpgradeModal } from '@/hooks/usePremiumUpgradeModal';
import { useNavigate } from 'react-router-dom';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface AllLessonsListWithTagsProps {
  onEdit?: (lesson: LearningLessonWithRelations) => void;
  onDelete?: (lessonId: string) => void;
  onSuccess?: () => void;
}

export const AllLessonsListWithTags: React.FC<AllLessonsListWithTagsProps> = ({
  onEdit,
  onDelete,
  onSuccess
}) => {
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { isAdmin } = useAuth();
  const { hasFeatureAccess } = useFeatureAccess();
  const { showUpgradeModal } = usePremiumUpgradeModal();
  const navigate = useNavigate();

  // Buscar aulas com filtros aplicados
  const { data: lessons, isLoading, refetch } = useLessonsWithTags({
    selectedTagIds: selectedTagIds.length > 0 ? selectedTagIds : undefined,
    searchTerm: searchTerm.trim() || undefined
  });

  // Calcular estatísticas
  const stats = useMemo(() => {
    if (!lessons) return { total: 0, published: 0, draft: 0 };
    
    return {
      total: lessons.length,
      published: lessons.filter(l => l.published).length,
      draft: lessons.filter(l => !l.published).length,
    };
  }, [lessons]);

  const handleTagsChange = (tagIds: string[]) => {
    setSelectedTagIds(tagIds);
  };

  const handleSearchChange = (search: string) => {
    setSearchTerm(search);
  };

  const clearFilters = () => {
    setSelectedTagIds([]);
    setSearchTerm('');
  };

  const handleRefresh = () => {
    refetch();
    onSuccess?.();
  };

  const handleView = (lesson: any) => {
    if (!hasFeatureAccess('learning')) {
      showUpgradeModal('learning', lesson.title);
      return;
    }
    // Buscar course_id através do módulo
    const courseId = lesson.learning_modules?.course_id || lesson.module_id;
    navigate(`/learning/course/${courseId}/lesson/${lesson.id}`);
  };

  const handleEditLesson = (lesson: LearningLessonWithRelations) => {
    if (onEdit) {
      onEdit(lesson);
    } else {
      navigate(`/formacao/aulas/${lesson.id}`);
    }
  };

  const handleDeleteLesson = (lessonId: string) => {
    if (onDelete) {
      onDelete(lessonId);
    }
  };

  const hasFilters = selectedTagIds.length > 0 || searchTerm.trim();

  return (
    <div className="space-y-6">
      {/* Cabeçalho com Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Total de Aulas</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{stats.published}</div>
            <p className="text-xs text-muted-foreground">Publicadas</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-600">{stats.draft}</div>
            <p className="text-xs text-muted-foreground">Rascunhos</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6 flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">Ações</div>
              <p className="text-xs text-muted-foreground">Gerenciar</p>
            </div>
            {isAdmin && (
              <NovaAulaButton 
                moduleId=""
                onSuccess={handleRefresh}
                allowModuleSelection={true}
              />
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar com Filtros */}
        <div className="lg:col-span-1 space-y-4">
          <LessonTagsFilter
            selectedTagIds={selectedTagIds}
            onTagsChange={handleTagsChange}
          />
          
          {/* Busca por Texto */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Search className="h-5 w-5" />
                Buscar Aulas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                type="text"
                placeholder="Digite o nome da aula..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full"
              />
            </CardContent>
          </Card>

          {/* Resumo dos Filtros */}
          {hasFilters && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Filtros Ativos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {selectedTagIds.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Tags: {selectedTagIds.length}</p>
                  </div>
                )}
                {searchTerm && (
                  <div>
                    <p className="text-sm font-medium">Busca:</p>
                    <p className="text-xs text-muted-foreground">"{searchTerm}"</p>
                  </div>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="w-full"
                >
                  Limpar Filtros
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Lista de Aulas */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              {hasFilters 
                ? `${stats.total} aula(s) encontrada(s)`
                : 'Todas as Aulas'
              }
            </h2>
            <Button onClick={handleRefresh} variant="outline" size="sm">
              Atualizar
            </Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : lessons && lessons.length > 0 ? (
            <div className="grid gap-4">
              {lessons.map((lesson) => (
                <Card key={lesson.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      {/* Imagem/Cover */}
                      <div className="w-20 h-14 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg flex-shrink-0 flex items-center justify-center">
                        <Play className="h-6 w-6 text-primary" />
                      </div>

                      {/* Conteúdo */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg text-foreground hover:text-primary transition-colors">
                              {lesson.title}
                            </h3>
                            
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                              <span>
                                Módulo: {lesson.learning_modules?.title || 'Não definido'}
                              </span>
                              <span>•</span>
                              <span>
                                {lesson.estimated_time_minutes || 0} min
                              </span>
                              <Badge variant={lesson.published ? "default" : "secondary"} className="text-xs">
                                {lesson.published ? "Publicada" : "Rascunho"}
                              </Badge>
                            </div>

                            {lesson.description && (
                              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                                {lesson.description}
                              </p>
                            )}

                            {/* Tags da Aula */}
                            {lesson.lesson_tags && lesson.lesson_tags.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-3">
                                {lesson.lesson_tags.slice(0, 4).map(({ lesson_tags: tag }) => (
                                  <TagBadge key={tag.id} tag={tag} size="sm" />
                                ))}
                                {lesson.lesson_tags.length > 4 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{lesson.lesson_tags.length - 4}
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Ações */}
                          <div className="flex items-center gap-2 ml-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleView(lesson)}
                              title="Visualizar aula"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            
                            {isAdmin && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditLesson(lesson)}
                                  title="Editar aula"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      title="Excluir aula"
                                      className="text-destructive hover:text-destructive"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Tem certeza que deseja excluir a aula "{lesson.title}"? 
                                        Esta ação não pode ser desfeita.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleDeleteLesson(lesson.id)}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      >
                                        Excluir
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Tag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">
                  {hasFilters ? 'Nenhuma aula encontrada' : 'Nenhuma aula cadastrada'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {hasFilters 
                    ? 'Tente ajustar os filtros ou buscar por outros termos.'
                    : 'Comece criando sua primeira aula.'
                  }
                </p>
                {!hasFilters && isAdmin && (
                  <NovaAulaButton 
                    moduleId=""
                    onSuccess={handleRefresh}
                    allowModuleSelection={true}
                  />
                )}
                {hasFilters && (
                  <Button onClick={clearFilters} variant="outline">
                    Limpar Filtros
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};