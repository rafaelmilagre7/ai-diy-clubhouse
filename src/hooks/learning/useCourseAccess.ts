
import { supabase } from "@/lib/supabase";

export const useCourseAccess = () => {
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
        .from("roles")
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

  return { checkCourseAccess };
};
