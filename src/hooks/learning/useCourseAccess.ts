
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
      console.log('🔍 Buscando cursos para role:', roleId);
      
      const { data, error } = await supabase
        .from('course_access_control')
        .select(`
          course_id,
          learning_courses (*)
        `)
        .eq('role_id', roleId);

      if (error) {
        console.error('❌ Erro ao buscar cursos por papel:', error);
        throw error;
      }

      console.log('✅ Dados retornados:', data);
      return (data || [])
        .map((item: any) => item.learning_courses)
        .filter(Boolean);
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
      console.log('🔍 Buscando roles para curso:', courseId);
      
      const { data, error } = await supabase
        .from('course_access_control')
        .select(`
          role_id,
          user_roles (*)
        `)
        .eq('course_id', courseId);

      if (error) {
        console.error('❌ Erro ao buscar papéis por curso:', error);
        throw error;
      }

      console.log('✅ Roles encontradas:', data);
      return (data || [])
        .map((item: any) => item.user_roles)
        .filter(Boolean);
    } catch (error) {
      console.error('Erro ao buscar papéis por curso:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const manageCourseAccess = async (courseId: string, roleId: string, hasAccess: boolean) => {
    try {
      console.log('🔧 Gerenciando acesso:', { courseId, roleId, hasAccess });
      
      if (hasAccess) {
        // Verificar se já existe antes de inserir
        const { data: existing } = await supabase
          .from('course_access_control')
          .select('id')
          .eq('course_id', courseId)
          .eq('role_id', roleId)
          .single();

        if (!existing) {
          const { error } = await supabase
            .from('course_access_control')
            .insert({ course_id: courseId, role_id: roleId });
          
          if (error) throw error;
          console.log('✅ Acesso concedido');
        }
      } else {
        // Remover acesso
        const { error } = await supabase
          .from('course_access_control')
          .delete()
          .eq('course_id', courseId)
          .eq('role_id', roleId);
        
        if (error) throw error;
        console.log('✅ Acesso removido');
      }
    } catch (error) {
      console.error('Erro ao gerenciar acesso ao curso:', error);
      throw error;
    }
  };

  const checkCourseAccess = async (courseId: string, userId: string): Promise<boolean> => {
    try {
      console.log('🔍 Verificando acesso ao curso:', { courseId, userId });
      
      const { data, error } = await supabase.rpc('can_access_course', {
        user_id: userId,
        course_id: courseId
      });

      if (error) {
        console.error('❌ Erro ao verificar acesso:', error);
        throw error;
      }
      
      console.log('✅ Resultado da verificação:', data);
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
