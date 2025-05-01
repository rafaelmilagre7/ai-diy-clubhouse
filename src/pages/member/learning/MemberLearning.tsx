
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { LearningCourse } from "@/lib/supabase";
import { MemberLearningHeader } from "@/components/learning/member/MemberLearningHeader";
import { MemberCoursesList } from "@/components/learning/member/MemberCoursesList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CoursesSkeleton } from "@/components/learning/member/CoursesSkeleton";
import { EmptyCoursesState } from "@/components/learning/member/states/EmptyCoursesState";
import { ErrorState } from "@/components/learning/member/states/ErrorState";
import { toast } from "sonner";

const MemberLearning = () => {
  console.log("Renderizando MemberLearning componente");
  const [activeTab, setActiveTab] = useState<"all" | "in-progress" | "completed">("all");
  
  useEffect(() => {
    console.log("MemberLearning montado");
    return () => {
      console.log("MemberLearning desmontado");
    };
  }, []);
  
  // Buscar todos os cursos publicados
  const { data: courses, isLoading, error } = useQuery({
    queryKey: ["learning-courses"],
    queryFn: async () => {
      console.log("Iniciando busca de cursos");
      const { data, error } = await supabase
        .from("learning_courses")
        .select("*")
        .eq("published", true)
        .order("order_index", { ascending: true });
        
      if (error) {
        console.error("Erro ao carregar cursos:", error);
        toast.error("Não foi possível carregar os cursos");
        throw new Error("Não foi possível carregar os cursos");
      }
      
      console.log("Cursos carregados:", data?.length || 0);
      return data as LearningCourse[];
    }
  });
  
  // Buscar progresso do usuário para os cursos
  const { data: userProgress } = useQuery({
    queryKey: ["learning-progress"],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        console.log("Nenhum usuário autenticado encontrado");
        return [];
      }
      
      console.log("Iniciando busca de progresso para o usuário:", user.user.id);
      const { data: progressData, error } = await supabase
        .from("learning_progress")
        .select("*")
        .eq("user_id", user.user.id);
      
      if (error) {
        console.error("Erro ao carregar progresso:", error);
        return [];
      }
      
      console.log("Progresso carregado:", progressData?.length || 0);
      return progressData;
    },
    enabled: !!courses
  });
  
  // Filtrar cursos com base na aba selecionada
  const filteredCourses = () => {
    if (!courses) return [];
    if (activeTab === "all") return courses;
    
    if (!userProgress) return [];
    
    // Obter IDs de lições por curso
    const courseLessons: Record<string, string[]> = {};
    
    // Filtrar com base no progresso
    if (activeTab === "in-progress") {
      return courses.filter(course => {
        const hasProgress = userProgress.some(p => courseLessons[course.id]?.includes(p.lesson_id));
        const isCompleted = false; // Aqui iremos implementar a lógica de conclusão
        return hasProgress && !isCompleted;
      });
    }
    
    if (activeTab === "completed") {
      return courses.filter(course => {
        // Implementar lógica para verificar conclusão
        return false;
      });
    }
    
    return courses;
  };

  return (
    <div className="container py-6">
      <MemberLearningHeader />
      
      <Tabs 
        defaultValue="all" 
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as "all" | "in-progress" | "completed")}
        className="mt-8"
      >
        <TabsList className="mb-6">
          <TabsTrigger value="all">Todos os Cursos</TabsTrigger>
          <TabsTrigger value="in-progress">Em Andamento</TabsTrigger>
          <TabsTrigger value="completed">Concluídos</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="mt-0">
          {isLoading ? (
            <CoursesSkeleton />
          ) : error ? (
            <ErrorState message="Não foi possível carregar os cursos" />
          ) : filteredCourses().length === 0 ? (
            <EmptyCoursesState activeTab={activeTab} />
          ) : (
            <MemberCoursesList courses={filteredCourses()} userProgress={userProgress || []} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MemberLearning;
