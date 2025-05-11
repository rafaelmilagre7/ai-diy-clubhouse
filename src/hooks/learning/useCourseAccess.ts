
import { useCallback, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";

export function useCourseAccess() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  // Verificar se o usuário pode acessar um curso específico
  const checkCourseAccess = useCallback(async (courseId: string) => {
    if (!user?.id) return false;
    
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.rpc('can_access_course', {
        user_id: user.id,
        course_id: courseId
      });
      
      if (error) {
        console.error("Erro ao verificar acesso ao curso:", error);
        return false;
      }
      
      return data || false;
      
    } catch (err) {
      console.error("Erro ao verificar permissões de acesso:", err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);
  
  // Obter todos os cursos que um papel específico pode acessar
  const getCoursesByRole = useCallback(async (roleId: string) => {
    if (!roleId) return [];
    
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('course_access_control')
        .select('*, learning_courses(*)')
        .eq('role_id', roleId);
      
      if (error) {
        throw error;
      }
      
      return data?.map(item => item.learning_courses) || [];
      
    } catch (err) {
      console.error("Erro ao buscar cursos por papel:", err);
      toast.error("Erro ao buscar cursos associados ao papel");
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Obter todos os papéis que podem acessar um curso específico
  const getRolesByCourse = useCallback(async (courseId: string) => {
    if (!courseId) return [];
    
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('course_access_control')
        .select('*, user_roles(*)')
        .eq('course_id', courseId);
      
      if (error) {
        throw error;
      }
      
      return data?.map(item => item.user_roles) || [];
      
    } catch (err) {
      console.error("Erro ao buscar papéis por curso:", err);
      toast.error("Erro ao buscar papéis associados ao curso");
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Gerenciar a associação entre um curso e um papel
  const manageCourseAccess = useCallback(async (
    courseId: string, 
    roleId: string, 
    shouldHaveAccess: boolean
  ) => {
    if (!courseId || !roleId) {
      toast.error("IDs de curso e papel são obrigatórios");
      return false;
    }
    
    try {
      setIsLoading(true);
      
      if (shouldHaveAccess) {
        // Adicionar acesso
        const { error } = await supabase
          .from('course_access_control')
          .insert({ course_id: courseId, role_id: roleId })
          .single();
        
        if (error) {
          // Ignorar erro de chave duplicada
          if (!error.message.includes('duplicate key')) {
            throw error;
          }
        }
        
        toast.success("Acesso concedido com sucesso");
      } else {
        // Remover acesso
        const { error } = await supabase
          .from('course_access_control')
          .delete()
          .match({ course_id: courseId, role_id: roleId });
        
        if (error) {
          throw error;
        }
        
        toast.success("Acesso removido com sucesso");
      }
      
      return true;
      
    } catch (err) {
      console.error("Erro ao gerenciar acesso ao curso:", err);
      toast.error("Não foi possível atualizar o acesso ao curso");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  return {
    isLoading,
    checkCourseAccess,
    getCoursesByRole,
    getRolesByCourse,
    manageCourseAccess
  };
}
