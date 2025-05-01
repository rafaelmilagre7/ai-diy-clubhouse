
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/lib/supabase";
import { LearningCourse } from "@/lib/supabase";
import { MemberLearningHeader } from "@/components/learning/member/MemberLearningHeader";
import { MemberCoursesList } from "@/components/learning/member/MemberCoursesList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CoursesSkeleton } from "@/components/learning/member/CoursesSkeleton";
import { EmptyCoursesState } from "@/components/learning/member/states/EmptyCoursesState";
import { ErrorState } from "@/components/learning/member/states/ErrorState";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

const MemberLearning = () => {
  console.log("Renderizando MemberLearning componente");
  const [activeTab, setActiveTab] = useState<"all" | "in-progress" | "completed">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const { isAdmin, isFormacao } = useAuth();
  
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
        .select("*, lesson:learning_lessons(id, title, module_id, module:learning_modules(id, title, course_id))")
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
  
  // Buscar detalhes de aulas não publicadas (apenas para admins/formacao)
  const { data: unpublishedLessons } = useQuery({
    queryKey: ["unpublished-lessons"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("learning_lessons")
        .select("*, module:learning_modules(title, course:learning_courses(title))")
        .eq("published", false)
        .order("updated_at", { ascending: false });
        
      if (error) {
        console.error("Erro ao carregar aulas não publicadas:", error);
        return [];
      }
      
      return data || [];
    },
    enabled: !!(isAdmin || isFormacao)
  });
  
  // Filtrar cursos com base na aba selecionada e termo de busca
  const filteredCourses = () => {
    if (!courses) return [];
    
    // Filtrar por termo de busca primeiro
    let filtered = searchTerm
      ? courses.filter(course => 
          course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (course.description && course.description.toLowerCase().includes(searchTerm.toLowerCase()))
        )
      : courses;
    
    // Depois filtrar por aba
    if (activeTab === "all") return filtered;
    
    if (!userProgress) return [];
    
    // Agrupar progresso por curso
    const courseProgress: Record<string, any[]> = {};
    userProgress.forEach(progress => {
      if (progress.lesson?.module?.course_id) {
        const courseId = progress.lesson.module.course_id;
        if (!courseProgress[courseId]) {
          courseProgress[courseId] = [];
        }
        courseProgress[courseId].push(progress);
      }
    });
    
    if (activeTab === "in-progress") {
      return filtered.filter(course => {
        const hasProgress = courseProgress[course.id]?.some(p => p.progress_percentage > 0);
        const isCompleted = courseProgress[course.id]?.every(p => p.progress_percentage === 100);
        return hasProgress && !isCompleted;
      });
    }
    
    if (activeTab === "completed") {
      return filtered.filter(course => {
        const progressItems = courseProgress[course.id];
        return progressItems && progressItems.length > 0 && 
               progressItems.every(p => p.progress_percentage === 100);
      });
    }
    
    return filtered;
  };

  const displayedCourses = filteredCourses();

  return (
    <div className="container py-6">
      <MemberLearningHeader />
      
      {(isAdmin || isFormacao) && unpublishedLessons && unpublishedLessons.length > 0 && (
        <Alert className="mt-4 border-yellow-200 bg-yellow-50">
          <AlertDescription>
            <div className="font-semibold">Atenção administrador:</div> 
            <p>Existem {unpublishedLessons.length} aulas não publicadas que não estão visíveis para os membros.</p>
            <p className="text-sm text-muted-foreground mt-1">Acesse o painel de Formação para revisar e publicar.</p>
          </AlertDescription>
        </Alert>
      )}
      
      <div className="mt-8 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <Tabs 
            defaultValue="all" 
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as "all" | "in-progress" | "completed")}
          >
            <TabsList>
              <TabsTrigger value="all">Todos os Cursos</TabsTrigger>
              <TabsTrigger value="in-progress">Em Andamento</TabsTrigger>
              <TabsTrigger value="completed">Concluídos</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="w-full sm:w-auto sm:min-w-[280px]">
            <Input
              placeholder="Buscar cursos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </div>
        
        <TabsContent value={activeTab} className="mt-6">
          {isLoading ? (
            <CoursesSkeleton />
          ) : error ? (
            <ErrorState message="Não foi possível carregar os cursos" />
          ) : displayedCourses.length === 0 ? (
            searchTerm ? (
              <EmptyCoursesState 
                activeTab={activeTab} 
                message="Nenhum curso encontrado para sua busca" 
              />
            ) : (
              <EmptyCoursesState activeTab={activeTab} />
            )
          ) : (
            <MemberCoursesList 
              courses={displayedCourses} 
              userProgress={userProgress || []} 
            />
          )}
        </TabsContent>
      </div>
    </div>
  );
};

export default MemberLearning;
