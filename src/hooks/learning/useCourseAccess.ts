
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth";

export const useCourseAccess = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const checkCourseAccess = async (courseId: string, userId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc('can_access_course', {
        user_id: userId,
        course_id: courseId
      });

      if (error) {
        console.error("Erro ao verificar acesso ao curso:", error);
        return false;
      }

      return data === true;
    } catch (error) {
      console.error("Erro ao verificar acesso ao curso:", error);
      return false;
    }
  };

  // Buscar roles que têm acesso a um curso específico - TIPAGEM CORRIGIDA
  const getRolesByCourse = async (courseId: string) => {
    const { data, error } = await supabase
      .from('course_access_control')
      .select(`
        role_id,
        roles:role_id (
          id,
          name,
          description
        )
      `)
      .eq('course_id', courseId);

    if (error) {
      console.error("Erro ao buscar roles do curso:", error);
      throw error;
    }

    // Corrigir tipagem: data é um array de objetos, cada um com uma propriedade roles
    return data?.map(item => item.roles).filter(Boolean) || [];
  };

  // Buscar cursos que um role tem acesso - TIPAGEM CORRIGIDA
  const getCoursesByRole = async (roleId: string) => {
    const { data, error } = await supabase
      .from('course_access_control')
      .select(`
        course_id,
        learning_courses:course_id (
          id,
          title,
          description,
          published
        )
      `)
      .eq('role_id', roleId);

    if (error) {
      console.error("Erro ao buscar cursos do role:", error);
      throw error;
    }

    // Corrigir tipagem: data é um array de objetos, cada um com uma propriedade learning_courses
    return data?.map(item => item.learning_courses).filter(Boolean) || [];
  };

  // Gerenciar acesso de um role a um curso
  const manageCourseAccess = async (courseId: string, roleId: string, hasAccess: boolean) => {
    if (hasAccess) {
      // Adicionar acesso
      const { error } = await supabase
        .from('course_access_control')
        .upsert({
          course_id: courseId,
          role_id: roleId
        });

      if (error) {
        console.error("Erro ao adicionar acesso:", error);
        throw error;
      }
    } else {
      // Remover acesso
      const { error } = await supabase
        .from('course_access_control')
        .delete()
        .eq('course_id', courseId)
        .eq('role_id', roleId);

      if (error) {
        console.error("Erro ao remover acesso:", error);
        throw error;
      }
    }

    // Invalidar cache relacionado
    queryClient.invalidateQueries({ queryKey: ['course-access'] });
    queryClient.invalidateQueries({ queryKey: ['role-courses'] });
  };

  // Mutation para gerenciar acesso
  const accessMutation = useMutation({
    mutationFn: ({ courseId, roleId, hasAccess }: { 
      courseId: string; 
      roleId: string; 
      hasAccess: boolean; 
    }) => manageCourseAccess(courseId, roleId, hasAccess),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-access'] });
      queryClient.invalidateQueries({ queryKey: ['role-courses'] });
    }
  });

  return {
    checkCourseAccess,
    getRolesByCourse,
    getCoursesByRole,
    manageCourseAccess,
    loading: accessMutation.isPending
  };
};
