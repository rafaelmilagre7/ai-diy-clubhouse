
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { LearningCourse } from '@/lib/supabase';

export interface Role {
  id: string;
  name: string;
  description?: string;
  is_system: boolean;
  created_at: string;
  updated_at: string;
}

export const useCourseAccess = () => {
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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

  const getRolesByCourse = async (courseId: string): Promise<Role[]> => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('course_role_access')
        .select(`
          role_id,
          user_roles (*)
        `)
        .eq('course_id', courseId);

      if (error) throw error;

      return (data || []).map((item: any) => item.user_roles).filter(Boolean);
    } catch (error) {
      console.error('Erro ao buscar papéis por curso:', error);
      return [];
    } finally {
      setIsLoading(false);
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

  const checkCourseAccess = async (courseId: string, userId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc('can_access_course', {
        user_id: userId,
        course_id: courseId
      });

      if (error) throw error;
      return data === true;
    } catch (error) {
      console.error('Erro ao verificar acesso ao curso:', error);
      return false;
    }
  };

  return {
    loading,
    isLoading,
    getCoursesByRole,
    getRolesByCourse,
    manageCourseAccess,
    checkCourseAccess
  };
};
