
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { LearningCourse } from '@/lib/supabase';

export const useCourseAccess = () => {
  const [loading, setLoading] = useState(false);

  const getCoursesByRole = async (roleId: string): Promise<LearningCourse[]> => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('course_role_access')
        .select(`
          course_id,
          learning_courses (*)
        `)
        .eq('role_id', roleId);

      if (error) throw error;

      return (data || []).map((item: any) => item.learning_courses).filter(Boolean);
    } catch (error) {
      console.error('Erro ao buscar cursos por papel:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const manageCourseAccess = async (courseId: string, roleId: string, hasAccess: boolean) => {
    try {
      if (hasAccess) {
        // Adicionar acesso
        const { error } = await supabase
          .from('course_role_access')
          .insert({ course_id: courseId, role_id: roleId });
        
        if (error) throw error;
      } else {
        // Remover acesso
        const { error } = await supabase
          .from('course_role_access')
          .delete()
          .eq('course_id', courseId)
          .eq('role_id', roleId);
        
        if (error) throw error;
      }
    } catch (error) {
      console.error('Erro ao gerenciar acesso ao curso:', error);
      throw error;
    }
  };

  return {
    loading,
    getCoursesByRole,
    manageCourseAccess
  };
};
