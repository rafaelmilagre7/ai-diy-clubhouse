
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export const useCourseAccess = () => {
  const [loading, setLoading] = useState(false);

  const checkCourseAccess = async (courseId: string, userId: string): Promise<boolean> => {
    try {
      // Primeiro, verificar se o usuário tem perfil
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .single();

      if (!profile) {
        console.log("Perfil não encontrado para o usuário");
        return false;
      }

      // Verificar se há controle de acesso para este curso
      const { data: accessControl } = await supabase
        .from("course_access_control")
        .select("role_id")
        .eq("course_id", courseId);

      // Se não há controle de acesso definido, permitir acesso
      if (!accessControl || accessControl.length === 0) {
        console.log("Nenhum controle de acesso definido, permitindo acesso");
        return true;
      }

      // Verificar se o role do usuário está na lista de roles permitidos
      const allowedRoleIds = accessControl.map(ac => ac.role_id);
      
      // Buscar o role_id do usuário
      const { data: userRole } = await supabase
        .from("user_roles")
        .select("id")
        .eq("name", profile.role)
        .single();

      if (!userRole) {
        console.log("Role do usuário não encontrado");
        return false;
      }

      const hasAccess = allowedRoleIds.includes(userRole.id);
      console.log(`Verificação de acesso: ${hasAccess ? "PERMITIDO" : "NEGADO"}`);
      
      return hasAccess;
    } catch (error) {
      console.error("Erro ao verificar acesso ao curso:", error);
      return true; // Em caso de erro, permitir acesso
    }
  };

  const getRolesByCourse = async (courseId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("course_access_control")
        .select(`
          role_id,
          user_roles!inner(id, name, description)
        `)
        .eq("course_id", courseId);

      if (error) throw error;

      return data?.map(item => item.user_roles).filter(Boolean) || [];
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
        .select(`
          course_id,
          learning_courses!inner(id, title, description)
        `)
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
          .insert({ course_id: courseId, role_id: roleId })
          .select();
        
        if (error && error.code !== '23505') { // Ignora erro de duplicata
          throw error;
        }
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
};
