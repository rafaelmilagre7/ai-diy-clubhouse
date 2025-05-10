
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
import { sortLessonsByNumber } from "@/components/learning/member/course-modules/CourseModulesHelpers";

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
  
  // Buscar todas as aulas do curso para estatísticas
  const { data: allLessons, isLoading: isLoadingLessons } = useQuery({
    queryKey: ["learning-course-lessons", id],
    queryFn: async () => {
      if (!modules?.length) return [];
      
      const moduleIds = modules.map(m => m.id);
      const { data, error } = await supabase
        .from("learning_lessons")
        .select("*, learning_lesson_videos(*)")
        .in("module_id", moduleIds)
        .eq("published", true);
        
      if (error) {
        console.error("Erro ao carregar aulas:", error);
        return [];
      }
      
      // Ordenar aulas por número no título
      return sortLessonsByNumber(data || []);
    },
    enabled: !!modules?.length
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
  
  // Calcular estatísticas do curso
  const calculateCourseStats = () => {
    if (!allLessons) return {};
    
    let totalVideos = 0;
    let totalDuration = 0;
    
    allLessons.forEach(lesson => {
      if (lesson.learning_lesson_videos && Array.isArray(lesson.learning_lesson_videos)) {
        totalVideos += lesson.learning_lesson_videos.length;
        
        lesson.learning_lesson_videos.forEach(video => {
          if (video.duration_seconds) {
            totalDuration += video.duration_seconds;
          }
        });
      }
    });
    
    return {
      moduleCount: modules?.length || 0,
      lessonCount: allLessons.length,
      videoCount: totalVideos,
      durationMinutes: Math.ceil(totalDuration / 60)
    };
  };
  
  // Obter ID da primeira aula (para o botão de iniciar curso)
  const getFirstLessonId = () => {
    if (!allLessons || allLessons.length === 0) return null;
    return allLessons[0].id; // Agora allLessons já está ordenado pelo sortLessonsByNumber
  };
  
  // Função para calcular o progresso do curso
  const calculateCourseProgress = () => {
    if (!allLessons || !userProgress || allLessons.length === 0) return 0;
    
    // Extrair IDs de todas as lições do curso
    const allLessonIds = allLessons.map(lesson => lesson.id);
    
    // Contar lições completadas
    let completedLessons = 0;
    if (userProgress) {
      userProgress.forEach(progress => {
        if (allLessonIds.includes(progress.lesson_id) && progress.progress_percentage === 100) {
          completedLessons++;
        }
      });
    }
    
    return Math.round((completedLessons / allLessonIds.length) * 100);
  };
  
  const isLoading = isLoadingCourse || isLoadingModules || isLoadingLessons;
  
  if (courseError) {
    toast.error("Curso não encontrado ou indisponível");
    navigate("/learning");
    return null;
  }

  return (
    <div className="container pt-6 pb-12">
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
            stats={calculateCourseStats()}
            firstLessonId={getFirstLessonId()}
            courseId={id}
          />
          
          <div className="mt-8">
            <CourseProgress 
              percentage={calculateCourseProgress()} 
              className="mb-8"
            />
            
            <CourseModules 
              modules={modules || []} 
              courseId={id!} 
              userProgress={userProgress || []}
              course={course}
              expandedModules={[modules?.[0]?.id].filter(Boolean)}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default CourseDetails;
