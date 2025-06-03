
import { supabase } from "@/lib/supabase";

export function useCourseAccess() {
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

  return {
    checkCourseAccess
  };
}
