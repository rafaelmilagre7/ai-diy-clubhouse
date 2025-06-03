
import { useState, useCallback } from 'react';
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

  // Função memoizada para buscar cursos por role
  const getCoursesByRole = useCallback(async (roleId: string): Promise<LearningCourse[]> => {
    try {
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

      console.log('✅ Dados retornados para role:', roleId, data?.length || 0);
      return (data || [])
        .map((item: any) => item.learning_courses)
        .filter(Boolean);
    } catch (error) {
      console.error('Erro ao buscar cursos por papel:', error);
      return [];
    }
  }, []);

  // Função memoizada para buscar roles por curso
  const getRolesByCourse = useCallback(async (courseId: string): Promise<Role[]> => {
    try {
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

      console.log('✅ Roles encontradas para curso:', courseId, data?.length || 0);
      return (data || [])
        .map((item: any) => item.user_roles)
        .filter(Boolean);
    } catch (error) {
      console.error('Erro ao buscar papéis por curso:', error);
      return [];
    }
  }, []);

  // Função memoizada para gerenciar acesso aos cursos
  const manageCourseAccess = useCallback(async (courseId: string, roleId: string, hasAccess: boolean) => {
    try {
      console.log('🔧 Gerenciando acesso:', { courseId, roleId, hasAccess });
      
      if (hasAccess) {
        // Verificar se já existe antes de inserir (evita duplicatas)
        const { data: existing } = await supabase
          .from('course_access_control')
          .select('id')
          .eq('course_id', courseId)
          .eq('role_id', roleId)
          .maybeSingle();

        if (!existing) {
          const { error } = await supabase
            .from('course_access_control')
            .insert({ course_id: courseId, role_id: roleId });
          
          if (error) throw error;
          console.log('✅ Acesso concedido para:', courseId, roleId);
        } else {
          console.log('ℹ️ Acesso já existia para:', courseId, roleId);
        }
      } else {
        // Remover acesso
        const { error } = await supabase
          .from('course_access_control')
          .delete()
          .eq('course_id', courseId)
          .eq('role_id', roleId);
        
        if (error) throw error;
        console.log('✅ Acesso removido para:', courseId, roleId);
      }
    } catch (error) {
      console.error('Erro ao gerenciar acesso ao curso:', error);
      throw error;
    }
  }, []);

  // Função memoizada para verificar acesso a curso
  const checkCourseAccess = useCallback(async (courseId: string, userId: string): Promise<boolean> => {
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
  }, []);

  return {
    loading,
    getCoursesByRole,
    getRolesByCourse,
    manageCourseAccess,
    checkCourseAccess
  };
};
