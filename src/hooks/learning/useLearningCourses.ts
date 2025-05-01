
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { LearningCourse } from "@/lib/supabase/types";

export const useLearningCourses = () => {
  const {
    data: courses = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ["learning-courses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("learning_courses")
        .select("*")
        .order("order_index", { ascending: true });

      if (error) {
        throw error;
      }

      return data as LearningCourse[];
    }
  });

  return {
    courses,
    isLoading,
    error
  };
};
