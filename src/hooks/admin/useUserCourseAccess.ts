import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { LearningCourse } from '@/lib/supabase';

export interface UserCourseAccessOverride {
  id: string;
  user_id: string;
  course_id: string;
  access_type: 'granted' | 'denied';
  expires_at?: string;
  notes?: string;
  granted_by: string;
  created_at: string;
  updated_at: string;
}

export interface CourseAccessStatus {
  course: LearningCourse;
  hasRoleAccess: boolean;
  hasOverride: boolean;
  overrideType?: 'granted' | 'denied';
  overrideExpiresAt?: string;
  finalAccess: boolean;
}

export const useUserCourseAccess = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Buscar status de acesso de um usuário a todos os cursos
  const getUserCourseAccess = useCallback(async (userId: string): Promise<CourseAccessStatus[]> => {
    try {
      setLoading(true);
      
      // Buscar todos os cursos
      const { data: courses, error: coursesError } = await supabase
        .from('learning_courses')
        .select('*')
        .order('title');

      if (coursesError) throw coursesError;

      // Buscar overrides do usuário
      const { data: overrides, error: overridesError } = await supabase
        .from('user_course_access')
        .select('*')
        .eq('user_id', userId);

      if (overridesError) throw overridesError;

      // Verificar acesso base do usuário
      const { data: hasLearningAccess, error: accessError } = await supabase.rpc(
        'can_access_learning_content',
        { target_user_id: userId }
      );

      if (accessError) throw accessError;

      // Buscar role do usuário e acessos por role
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select(`
          role_id,
          user_roles (
            id,
            name
          )
        `)
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;

      // Buscar cursos acessíveis por role
      const { data: roleAccess, error: roleAccessError } = await supabase
        .from('course_access_control')
        .select('course_id')
        .eq('role_id', profile.role_id);

      if (roleAccessError) throw roleAccessError;

      const roleAccessibleCourseIds = new Set(roleAccess?.map(r => r.course_id) || []);
      const overridesMap = new Map(overrides?.map(o => [o.course_id, o]) || []);

      // Montar status para cada curso
      const courseStatuses: CourseAccessStatus[] = courses?.map(course => {
        const hasRoleAccess = hasLearningAccess && roleAccessibleCourseIds.has(course.id);
        const override = overridesMap.get(course.id);
        
        let finalAccess = hasRoleAccess;
        
        if (override) {
          if (override.access_type === 'denied') {
            finalAccess = false;
          } else if (override.access_type === 'granted') {
            if (!override.expires_at || new Date(override.expires_at) > new Date()) {
              finalAccess = true;
            }
          }
        }

        return {
          course,
          hasRoleAccess,
          hasOverride: !!override,
          overrideType: override?.access_type,
          overrideExpiresAt: override?.expires_at,
          finalAccess
        };
      }) || [];

      return courseStatuses;
    } catch (error) {
      console.error('Erro ao buscar acesso do usuário aos cursos:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar o acesso aos cursos.',
        variant: 'destructive',
      });
      return [];
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Conceder acesso a um curso
  const grantCourseAccess = useCallback(async (
    userId: string,
    courseId: string,
    expiresAt?: Date,
    notes?: string
  ): Promise<boolean> => {
    try {
      setLoading(true);

      const { error } = await supabase
        .from('user_course_access')
        .upsert({
          user_id: userId,
          course_id: courseId,
          access_type: 'granted',
          expires_at: expiresAt?.toISOString(),
          notes,
          granted_by: (await supabase.auth.getUser()).data.user?.id
        });

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Acesso ao curso concedido com sucesso.',
      });

      return true;
    } catch (error) {
      console.error('Erro ao conceder acesso ao curso:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível conceder acesso ao curso.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Negar acesso a um curso
  const denyCourseAccess = useCallback(async (
    userId: string,
    courseId: string,
    notes?: string
  ): Promise<boolean> => {
    try {
      setLoading(true);

      const { error } = await supabase
        .from('user_course_access')
        .upsert({
          user_id: userId,
          course_id: courseId,
          access_type: 'denied',
          notes,
          granted_by: (await supabase.auth.getUser()).data.user?.id
        });

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Acesso ao curso negado com sucesso.',
      });

      return true;
    } catch (error) {
      console.error('Erro ao negar acesso ao curso:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível negar acesso ao curso.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Remover override (volta para acesso baseado em role)
  const removeOverride = useCallback(async (
    userId: string,
    courseId: string
  ): Promise<boolean> => {
    try {
      setLoading(true);

      const { error } = await supabase
        .from('user_course_access')
        .delete()
        .eq('user_id', userId)
        .eq('course_id', courseId);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Override removido. Acesso baseado no papel do usuário.',
      });

      return true;
    } catch (error) {
      console.error('Erro ao remover override:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível remover o override.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return {
    loading,
    getUserCourseAccess,
    grantCourseAccess,
    denyCourseAccess,
    removeOverride
  };
};