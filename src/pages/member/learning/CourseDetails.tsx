
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { CourseDetailsSkeleton } from "@/components/learning/member/CourseDetailsSkeleton";
import { CourseModules } from "@/components/learning/member/CourseModules";
import { CourseHeader } from "@/components/learning/member/CourseHeader";
import { CourseProgress } from "@/components/learning/member/CourseProgress";
import { CourseInfoPanel } from "@/components/learning/member/CourseInfoPanel";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const CourseDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Buscar detalhes do curso
  const { data: course, isLoading: isLoadingCourse, error: courseError } = useQuery({
    queryKey: ["learning-course", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("learning_courses")
        .select("*")
        .eq("id", id)
        .eq("published", true)
        .single();
        
      if (error) {
        console.error("Erro ao carregar curso:", error);
        throw new Error("Não foi possível carregar os detalhes do curso");
      }
      
      return data;
    }
  });
  
  // Buscar módulos do curso
  const { data: modules, isLoading: isLoadingModules } = useQuery({
    queryKey: ["learning-modules", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("learning_modules")
        .select("*")
        .eq("course_id", id)
        .eq("published", true)
        .order("order_index", { ascending: true });
        
      if (error) {
        console.error("Erro ao carregar módulos:", error);
        return [];
      }
      
      return data;
    },
    enabled: !!course
  });
  
  // Buscar progresso do usuário para este curso
  const { data: userProgress } = useQuery({
    queryKey: ["learning-progress", id],
    queryFn: async () => {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw new Error("Erro ao obter usuário");
      
      const { data, error } = await supabase
        .from("learning_progress")
        .select("*")
        .eq("user_id", userData.user?.id || "");
        
      if (error) {
        console.error("Erro ao carregar progresso:", error);
        return [];
      }
      
      return data;
    },
    enabled: !!course
  });
  
  // Função para calcular o progresso do curso
  const calculateCourseProgress = () => {
    if (!modules || !userProgress) return 0;
    
    // Extrair IDs de todas as lições do curso
    const allLessonIds: string[] = []; // Este array precisará ser preenchido com os IDs de lições
    
    // Contar lições completadas
    let completedLessons = 0;
    if (userProgress) {
      userProgress.forEach(progress => {
        if (allLessonIds.includes(progress.lesson_id) && progress.progress_percentage === 100) {
          completedLessons++;
        }
      });
    }
    
    if (allLessonIds.length === 0) return 0;
    return Math.round((completedLessons / allLessonIds.length) * 100);
  };
  
  const isLoading = isLoadingCourse || isLoadingModules;
  
  if (courseError) {
    toast.error("Curso não encontrado ou indisponível");
    navigate("/learning");
    return null;
  }

  return (
    <div className="container py-6">
      <Button
        variant="ghost"
        className="mb-4"
        onClick={() => navigate("/learning")}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Voltar para Cursos
      </Button>
      
      {isLoading ? (
        <CourseDetailsSkeleton />
      ) : (
        <>
          <CourseHeader 
            title={course.title} 
            description={course.description} 
            coverImage={course.cover_image_url} 
          />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
            <div className="md:col-span-2">
              <CourseModules 
                modules={modules || []} 
                courseId={id!} 
                userProgress={userProgress || []}
              />
            </div>
            
            <div className="space-y-6">
              <CourseProgress 
                percentage={calculateCourseProgress()} 
              />
              
              <CourseInfoPanel 
                course={course} 
                moduleCount={modules?.length || 0} 
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CourseDetails;
