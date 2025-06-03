
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth";

export const useCourseAccess = () => {
  const { user } = useAuth();

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

  return {
    checkCourseAccess
  };
};
