
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Save, BookOpen, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface LearningCourse {
  id: string;
  title: string;
  description: string;
  cover_image_url: string;
  slug: string;
  published: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
  created_by: string;
}

interface RoleCourseAccessProps {
  roleId: string;
  roleName: string;
}

export const RoleCourseAccess = ({ roleId, roleName }: RoleCourseAccessProps) => {
  const [courses, setCourses] = useState<LearningCourse[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadCourses();
    loadRoleCourseAccess();
  }, [roleId]);

  const loadCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('learning_courses')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) throw error;

      // Garantir que data seja um array e fazer cast seguro
      const coursesData = Array.isArray(data) ? data as LearningCourse[] : [];
      setCourses(coursesData);
    } catch (error) {
      console.error('Erro ao carregar cursos:', error);
      toast.error('Erro ao carregar cursos');
      setCourses([]);
    }
  };

  const loadRoleCourseAccess = async () => {
    try {
      const { data, error } = await supabase
        .from('course_access_control')
        .select('course_id')
        .eq('role_id', roleId);

      if (error) throw error;

      const courseIds = (data || []).map(item => item.course_id).filter(Boolean);
      setSelectedCourses(courseIds);
    } catch (error) {
      console.error('Erro ao carregar acesso do papel:', error);
      toast.error('Erro ao carregar permissões de acesso');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCourseToggle = (courseId: string, checked: boolean) => {
    setSelectedCourses(prev =>
      checked
        ? [...prev, courseId]
        : prev.filter(id => id !== courseId)
    );
  };

  const saveRoleCourseAccess = async () => {
    setIsSaving(true);
    try {
      // Remover todas as permissões existentes para este papel
      await supabase
        .from('course_access_control')
        .delete()
        .eq('role_id', roleId);

      // Adicionar novas permissões
      if (selectedCourses.length > 0) {
        const accessRecords = selectedCourses.map(courseId => ({
          role_id: roleId,
          course_id: courseId
        }));

        const { error } = await supabase
          .from('course_access_control')
          .insert(accessRecords);

        if (error) throw error;
      }

      toast.success('Permissões de acesso salvas com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar permissões:', error);
      toast.error('Erro ao salvar permissões de acesso');
    } finally {
      setIsSaving(false);
    }
  };

  const getAccessBadge = (courseId: string) => {
    const hasAccess = selectedCourses.includes(courseId);
    return hasAccess ? (
      <Badge className="bg-green-100 text-green-800 border-green-200">
        <Eye className="w-3 h-3 mr-1" />
        Com Acesso
      </Badge>
    ) : (
      <Badge variant="outline" className="border-gray-300 text-gray-600">
        <EyeOff className="w-3 h-3 mr-1" />
        Sem Acesso
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Controle de Acesso a Cursos
          </CardTitle>
          <CardDescription>
            Carregando cursos disponíveis...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          Controle de Acesso a Cursos
        </CardTitle>
        <CardDescription>
          Configure quais cursos o papel "{roleName}" pode acessar. 
          Se nenhum curso for selecionado, todos serão acessíveis.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {courses.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Nenhum curso encontrado
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {courses.map((course) => (
                <div key={course.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id={`course-${course.id}`}
                      checked={selectedCourses.includes(course.id)}
                      onCheckedChange={(checked) =>
                        handleCourseToggle(course.id, checked === true)
                      }
                    />
                    <div className="flex-1">
                      <label
                        htmlFor={`course-${course.id}`}
                        className="text-sm font-medium cursor-pointer"
                      >
                        {course.title}
                      </label>
                      {course.description && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {course.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getAccessBadge(course.id)}
                    {course.published ? (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700">
                        Publicado
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                        Rascunho
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                {selectedCourses.length === 0 
                  ? 'Acesso público (todos os usuários podem acessar)'
                  : `${selectedCourses.length} curso(s) restritos a este papel`
                }
              </div>
              <Button
                onClick={saveRoleCourseAccess}
                disabled={isSaving}
                className="min-w-[120px]"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Salvar
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default RoleCourseAccess;
