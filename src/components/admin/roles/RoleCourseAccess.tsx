
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { LearningCourse } from '@/lib/supabase/types';

interface RoleCourseAccessProps {
  roleId: string;
  roleName: string;
}

export const RoleCourseAccess = ({ roleId, roleName }: RoleCourseAccessProps) => {
  const [courses, setCourses] = useState<LearningCourse[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchCourses();
    fetchRoleAccess();
  }, [roleId]);

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('learning_courses')
        .select('*')
        .eq('published', true)
        .order('title');

      if (error) throw error;
      
      // Usar 'unknown' primeiro para evitar erro de conversão direta
      setCourses((data as unknown) as LearningCourse[]);
    } catch (error) {
      console.error('Erro ao buscar cursos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os cursos.",
        variant: "destructive",
      });
    }
  };

  const fetchRoleAccess = async () => {
    try {
      const { data, error } = await supabase
        .from('course_access_control')
        .select('course_id')
        .eq('role_id', roleId as any);

      if (error) throw error;
      
      const courseIds = Array.isArray(data) 
        ? data.map((item: any) => item?.course_id).filter(Boolean)
        : [];
      
      setSelectedCourses(courseIds);
    } catch (error) {
      console.error('Erro ao buscar acessos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCourseToggle = (courseId: string, checked: boolean) => {
    setSelectedCourses(prev => 
      checked 
        ? [...prev, courseId]
        : prev.filter(id => id !== courseId)
    );
  };

  const saveChanges = async () => {
    setSaving(true);
    try {
      // Remover acessos existentes
      const { error: deleteError } = await supabase
        .from('course_access_control')
        .delete()
        .eq('role_id', roleId as any);

      if (deleteError) throw deleteError;

      // Adicionar novos acessos
      if (selectedCourses.length > 0) {
        const accessRecords = selectedCourses.map(courseId => ({
          role_id: roleId,
          course_id: courseId
        }));

        const { error: insertError } = await supabase
          .from('course_access_control')
          .insert(accessRecords as any);

        if (insertError) throw insertError;
      }

      toast({
        title: "Sucesso",
        description: "Permissões de acesso atualizadas com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar as permissões.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Acesso a Cursos - {roleName}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Carregando...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Acesso a Cursos - {roleName}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {courses.map((course) => (
            <div key={course.id} className="flex items-center space-x-3">
              <Checkbox
                id={`course-${course.id}`}
                checked={selectedCourses.includes(course.id)}
                onCheckedChange={(checked) => 
                  handleCourseToggle(course.id, checked as boolean)
                }
              />
              <label 
                htmlFor={`course-${course.id}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {course.title}
              </label>
            </div>
          ))}
        </div>

        {courses.length === 0 && (
          <div className="text-center py-4 text-muted-foreground">
            Nenhum curso publicado encontrado.
          </div>
        )}

        <div className="flex justify-end pt-4">
          <Button onClick={saveChanges} disabled={saving}>
            {saving ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
