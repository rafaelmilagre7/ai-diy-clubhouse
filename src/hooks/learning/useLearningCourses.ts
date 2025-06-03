
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export function useLearningCourses() {
  const { data: courses = [], isLoading, error } = useQuery({
    queryKey: ["learning-courses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("learning_courses")
        .select("*")
        .eq("published", true)
        .order("created_at", { ascending: false });
        
      if (error) {
        console.error("Erro ao carregar cursos:", error);
        throw new Error("Não foi possível carregar os cursos");
      }
      
      return data;
    }
  });

  return {
    courses,
    isLoading,
    error
  };
}
