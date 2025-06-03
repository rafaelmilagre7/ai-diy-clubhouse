
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth";

// Tipos específicos para as funções de acesso
interface Role {
  id: string;
  name: string;
  description: string;
}

interface LearningCourse {
  id: string;
  title: string;
  description: string;
  published: boolean;
}

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
  const getRolesByCourse = async (courseId: string): Promise<Role[]> => {
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

    // Corrigir processamento: data é um array de objetos, cada um com uma propriedade roles
    if (!data) return [];
    
    const roles: Role[] = [];
    for (const item of data) {
      // item.roles pode ser um objeto ou null
      if (item.roles && typeof item.roles === 'object') {
        roles.push({
          id: item.roles.id,
          name: item.roles.name,
          description: item.roles.description || ''
        });
      }
    }
    
    return roles;
  };

  // Buscar cursos que um role tem acesso - TIPAGEM CORRIGIDA
  const getCoursesByRole = async (roleId: string): Promise<LearningCourse[]> => {
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

    // Corrigir processamento: data é um array de objetos, cada um com uma propriedade learning_courses
    if (!data) return [];
    
    const courses: LearningCourse[] = [];
    for (const item of data) {
      // item.learning_courses pode ser um objeto ou null
      if (item.learning_courses && typeof item.learning_courses === 'object') {
        courses.push({
          id: item.learning_courses.id,
          title: item.learning_courses.title,
          description: item.learning_courses.description || '',
          published: item.learning_courses.published || false
        });
      }
    }
    
    return courses;
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
