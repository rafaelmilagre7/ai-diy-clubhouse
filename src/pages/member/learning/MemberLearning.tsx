
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CourseCarousel } from "@/components/learning/member/CourseCarousel";
import { ContinueLearning } from "@/components/learning/member/ContinueLearning";
import { Search, X } from "lucide-react";

const MemberLearning = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  
  // Buscar cursos disponíveis
  const { data: courses = [], isLoading: isLoadingCourses } = useQuery({
    queryKey: ["learning-courses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("learning_courses")
        .select(`
          *,
          modules:learning_modules(count),
          lessons:learning_modules(
            lessons:learning_lessons(count)
          )
        `)
        .eq("published", true)
        .order("order_index", { ascending: true });
        
      if (error) {
        console.error("Erro ao buscar cursos:", error);
        return [];
      }
      
      // Processar contagens de módulos e aulas
      return data.map(course => ({
        ...course,
        module_count: course.modules ? course.modules.length : 0,
        lesson_count: course.modules ? course.modules.reduce((count, module) => {
          return count + (module.lessons ? module.lessons.length : 0);
        }, 0) : 0
      }));
    }
  });
  
  // Buscar progresso do usuário
  const { data: userProgress = [], isLoading: isLoadingProgress } = useQuery({
    queryKey: ["learning-user-progress"],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Usuário não autenticado");
      
      const { data, error } = await supabase
        .from("learning_progress")
        .select(`
          *,
          lesson:learning_lessons(*),
          lesson:learning_lessons(
            module:learning_modules(
              course_id
            )
          )
        `)
        .eq("user_id", userData.user.id);
        
      if (error) {
        console.error("Erro ao buscar progresso:", error);
        return [];
      }
      
      return data;
    }
  });
  
  // Filtrar cursos com base na pesquisa
  const getFilteredCourses = () => {
    if (!courses) return [];
    
    return courses.filter(course => {
      // Filtro de pesquisa
      if (searchQuery) {
        const matchesSearch = 
          course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (course.description || "").toLowerCase().includes(searchQuery.toLowerCase());
          
        if (!matchesSearch) return false;
      }
      
      // Filtros de abas
      if (activeTab === "all") return true;
      
      if (activeTab === "in-progress") {
        // Verificar se há algum progresso neste curso
        if (!userProgress) return false;
        
        const hasProgress = userProgress.some(progress => {
          return progress.lesson?.module?.course_id === course.id 
            && progress.progress_percentage > 0 
            && progress.progress_percentage < 100;
        });
        
        return hasProgress;
      }
      
      if (activeTab === "completed") {
        // Verificar se o curso foi concluído
        if (!userProgress) return false;
        
        const isCompleted = userProgress.some(progress => {
          return progress.lesson?.module?.course_id === course.id 
            && progress.progress_percentage === 100;
        });
        
        return isCompleted;
      }
      
      return true;
    });
  };
  
  // Obter cursos em destaque (por exemplo, os mais recentes)
  const getFeaturedCourses = () => {
    return getFilteredCourses().slice(0, 4);
  };
  
  // Obter cursos que o usuário começou mas não terminou
  const getContinueWatchingCourses = () => {
    if (!userProgress || !courses) return [];
    
    // Encontrar IDs únicos de cursos em progresso
    const inProgressCourseIds = [...new Set(
      userProgress
        .filter(p => p.progress_percentage > 0 && p.progress_percentage < 100)
        .map(p => p.lesson?.module?.course_id)
        .filter(Boolean)
    )];
    
    // Retornar os cursos correspondentes
    return courses.filter(course => inProgressCourseIds.includes(course.id));
  };
  
  // Obter cursos concluídos
  const getCompletedCourses = () => {
    if (!userProgress || !courses) return [];
    
    // Encontrar IDs únicos de cursos concluídos
    const completedCourseIds = [...new Set(
      userProgress
        .filter(p => p.progress_percentage === 100)
        .map(p => p.lesson?.module?.course_id)
        .filter(Boolean)
    )];
    
    // Retornar os cursos correspondentes
    return courses.filter(course => completedCourseIds.includes(course.id));
  };
  
  const isLoading = isLoadingCourses || isLoadingProgress;

  return (
    <div className="container py-6">
      {/* Cabeçalho da página */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Cursos</h1>
        <p className="text-muted-foreground mt-2">
          Explore nossos cursos e continue aprendendo para se desenvolver
        </p>
      </div>
      
      {/* Componente para continuar de onde parou */}
      <ContinueLearning className="mb-6" />
      
      {/* Barra de pesquisa e filtros */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-8 sticky top-0 z-10 bg-background py-4">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar cursos..."
            className="pl-10 pr-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-5 w-5" 
              onClick={() => setSearchQuery("")}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
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
        <div className="space-y-12 py-4">
          {[1, 2].map(section => (
            <div key={section} className="space-y-4">
              <div className="h-8 w-48 bg-muted animate-pulse rounded-md" />
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(i => (
                  <div 
                    key={i} 
                    className="aspect-video rounded-md animate-pulse bg-muted"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : searchQuery ? (
        // Resultados da pesquisa
        <div className="py-4">
          <CourseCarousel 
            title={`Resultados para: "${searchQuery}"`}
            courses={getFilteredCourses()}
            userProgress={userProgress}
          />
        </div>
      ) : (
        // Carrosséis por categoria
        <div className="space-y-16 py-4">
          {/* Cursos em destaque */}
          <CourseCarousel 
            title="Em destaque" 
            courses={getFeaturedCourses()} 
            userProgress={userProgress}
          />
          
          {/* Continuar assistindo */}
          <CourseCarousel 
            title="Continue assistindo" 
            courses={getContinueWatchingCourses()} 
            userProgress={userProgress}
            showEmptyMessage={false}
          />
          
          {/* Todos os cursos */}
          <CourseCarousel 
            title="Todos os cursos" 
            courses={getFilteredCourses()} 
            userProgress={userProgress}
          />
          
          {/* Cursos concluídos */}
          <CourseCarousel 
            title="Cursos concluídos" 
            courses={getCompletedCourses()} 
            userProgress={userProgress}
            showEmptyMessage={false}
          />
        </div>
      )}
    </div>
  );
};

export default MemberLearning;
