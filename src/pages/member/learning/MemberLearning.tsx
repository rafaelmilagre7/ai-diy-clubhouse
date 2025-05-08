
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CourseCard } from "@/components/learning/member/CourseCard";
import { ContinueLearning } from "@/components/learning/member/ContinueLearning";
import { Search } from "lucide-react";
import { LearningCourse, LearningProgress } from "@/lib/supabase/types";

const MemberLearning = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  
  // Buscar cursos disponíveis
  const { data: courses, isLoading: isLoadingCourses } = useQuery({
    queryKey: ["learning-courses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("learning_courses")
        .select("*")
        .eq("published", true)
        .order("order_index", { ascending: true });
        
      if (error) {
        console.error("Erro ao buscar cursos:", error);
        return [];
      }
      
      return data;
    }
  });
  
  // Buscar progresso do usuário
  const { data: userProgress, isLoading: isLoadingProgress } = useQuery({
    queryKey: ["learning-user-progress"],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Usuário não autenticado");
      
      const { data, error } = await supabase
        .from("learning_progress")
        .select("*")
        .eq("user_id", userData.user.id);
        
      if (error) {
        console.error("Erro ao buscar progresso:", error);
        return [];
      }
      
      return data;
    }
  });
  
  // Filtrar cursos com base na pesquisa e na aba ativa
  const filteredCourses = (courses || []).filter(course => {
    // Filtro de pesquisa
    const matchesSearch = 
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (course.description || "").toLowerCase().includes(searchQuery.toLowerCase());
      
    // Se não passar no filtro de pesquisa, não mostrar
    if (!matchesSearch) return false;
    
    // Filtros de abas
    if (activeTab === "all") return true;
    
    if (activeTab === "in-progress") {
      // Verificar se há algum progresso neste curso
      if (!userProgress) return false;
      
      // Obter todos os IDs de aulas que o usuário iniciou neste curso
      // Esta parte exigiria um JOIN para saber quais aulas pertencem a este curso
      // Como isso é complexo sem a API completa, simularemos assumindo que temos essa informação
      const hasProgress = userProgress.some(progress => {
        // Aqui precisaríamos verificar se a aula pertence ao curso
        // Como simplificação, consideramos que há progresso se houver qualquer registro
        return true;
      });
      
      return hasProgress;
    }
    
    if (activeTab === "completed") {
      // Verificar se o curso foi concluído
      // Isso requer saber quantas aulas o curso tem no total
      // Como simplificação, consideramos concluído se o usuário tiver algum registro de progresso = 100%
      if (!userProgress) return false;
      
      const isCompleted = userProgress.some(progress => {
        return progress.progress_percentage === 100;
      });
      
      return isCompleted;
    }
    
    return true;
  });
  
  // Calcular progresso de um curso
  const calculateCourseProgress = (courseId: string): number => {
    if (!userProgress || userProgress.length === 0) return 0;
    
    // Isto é uma simplificação. Em uma implementação real,
    // precisaríamos buscar todas as aulas do curso e verificar o progresso de cada uma
    const courseLessonsProgress = userProgress.filter(progress => {
      // Verificaria se a aula pertence ao curso, mas como simplificação:
      return progress.progress_percentage > 0;
    });
    
    if (courseLessonsProgress.length === 0) return 0;
    
    // Calcular média de progresso
    const totalProgress = courseLessonsProgress.reduce(
      (sum, progress) => sum + progress.progress_percentage, 
      0
    );
    
    return Math.round(totalProgress / courseLessonsProgress.length);
  };
  
  const isLoading = isLoadingCourses || isLoadingProgress;

  return (
    <div className="container py-6">
      <h1 className="text-3xl font-bold mb-6">Cursos</h1>
      
      {/* Componente para continuar de onde parou */}
      <ContinueLearning />
      
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-8">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar cursos..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full sm:w-auto"
        >
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="all" className="flex-1 sm:flex-initial">Todos</TabsTrigger>
            <TabsTrigger value="in-progress" className="flex-1 sm:flex-initial">Em Progresso</TabsTrigger>
            <TabsTrigger value="completed" className="flex-1 sm:flex-initial">Concluídos</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-[280px] rounded-lg animate-pulse bg-muted"></div>
          ))}
        </div>
      ) : filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map(course => (
            <CourseCard
              key={course.id}
              id={course.id}
              title={course.title}
              description={course.description || ""}
              imageUrl={course.cover_image_url || undefined}
              progress={calculateCourseProgress(course.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Nenhum curso encontrado.</p>
        </div>
      )}
    </div>
  );
};

export default MemberLearning;
