
import { useState } from "react";
import { supabase } from "@/lib/supabase";

export function useCourseAccess() {
  const [loading, setLoading] = useState(false);

  const checkCourseAccess = async (courseId: string, userId: string): Promise<boolean> => {
    try {
      // Por enquanto, vamos assumir que todos os cursos publicados são acessíveis
      // No futuro, isso pode ser expandido para verificar permissões específicas
      const { data, error } = await supabase
        .from("learning_courses")
        .select("id")
        .eq("id", courseId)
        .eq("published", true)
        .single();
        
      if (error) {
        console.error("Erro ao verificar acesso ao curso:", error);
        return false;
      }
      
      return !!data;
    } catch (error) {
      console.error("Erro ao verificar acesso ao curso:", error);
      return false;
    }
  };

  const getRolesByCourse = async (courseId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("course_access_control")
        .select("role_id, roles(*)")
        .eq("course_id", courseId);
        
      if (error) throw error;
      return data?.map(item => item.roles).filter(Boolean) || [];
    } catch (error) {
      console.error("Erro ao buscar roles do curso:", error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getCoursesByRole = async (roleId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("course_access_control")
        .select("course_id, learning_courses(*)")
        .eq("role_id", roleId);
        
      if (error) throw error;
      return data?.map(item => item.learning_courses).filter(Boolean) || [];
    } catch (error) {
      console.error("Erro ao buscar cursos do role:", error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const manageCourseAccess = async (courseId: string, roleId: string, hasAccess: boolean) => {
    try {
      setLoading(true);
      
      if (hasAccess) {
        // Adicionar acesso
        const { error } = await supabase
          .from("course_access_control")
          .upsert({ course_id: courseId, role_id: roleId });
          
        if (error) throw error;
      } else {
        // Remover acesso
        const { error } = await supabase
          .from("course_access_control")
          .delete()
          .eq("course_id", courseId)
          .eq("role_id", roleId);
          
        if (error) throw error;
      }
    } catch (error) {
      console.error("Erro ao gerenciar acesso ao curso:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    checkCourseAccess,
    getRolesByCourse,
    getCoursesByRole,
    manageCourseAccess,
    loading
  };
}
