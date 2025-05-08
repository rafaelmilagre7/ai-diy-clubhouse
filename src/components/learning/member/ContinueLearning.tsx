
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlayCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

export const ContinueLearning = () => {
  const { user } = useAuth();
  
  // Buscar o último progresso do usuário
  const { data: lastProgress, isLoading } = useQuery({
    queryKey: ["learning-last-progress"],
    queryFn: async () => {
      if (!user) return null;
      
      // Buscar o progresso mais recente
      const { data: progressData, error: progressError } = await supabase
        .from("learning_progress")
        .select("*, learning_lessons(*)")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })
        .limit(1)
        .single();
        
      if (progressError) {
        console.error("Erro ao buscar último progresso:", progressError);
        return null;
      }
      
      if (!progressData) return null;
      
      // Buscar informações do curso e módulo
      const { data: lessonData, error: lessonError } = await supabase
        .from("learning_lessons")
        .select("*, module:learning_modules(*)")
        .eq("id", progressData.lesson_id)
        .single();
        
      if (lessonError) {
        console.error("Erro ao buscar detalhes da aula:", lessonError);
        return progressData;
      }
      
      if (!lessonData.module) return progressData;
      
      // Buscar informações do curso
      const { data: courseData, error: courseError } = await supabase
        .from("learning_courses")
        .select("*")
        .eq("id", lessonData.module.course_id)
        .single();
        
      if (courseError) {
        console.error("Erro ao buscar detalhes do curso:", courseError);
        return { ...progressData, lesson: lessonData };
      }
      
      // Combinar todos os dados
      return {
        ...progressData,
        lesson: lessonData,
        course: courseData
      };
    },
    enabled: !!user
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-10 w-24" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Se não houver progresso ou curso, não mostrar nada
  if (!lastProgress || !lastProgress.course) return null;
  
  const lessonTitle = lastProgress.lesson?.title || "Aula";
  const courseTitle = lastProgress.course?.title || "Curso";
  const courseId = lastProgress.course?.id;
  const lessonId = lastProgress.lesson_id;
  const progress = lastProgress.progress_percentage || 0;

  return (
    <Card className="mb-8 bg-gradient-to-r from-blue-50 to-slate-50 dark:from-blue-950/20 dark:to-slate-900">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Continue de onde parou</CardTitle>
        <CardDescription>
          {progress < 100 ? "Continue seus estudos" : "Revise este conteúdo"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-semibold">{lessonTitle}</h3>
            <p className="text-sm text-muted-foreground">{courseTitle}</p>
          </div>
          <Button asChild>
            <Link to={`/learning/course/${courseId}/lesson/${lessonId}`}>
              <PlayCircle className="h-4 w-4 mr-2" />
              {progress < 100 ? "Continuar" : "Revisar"}
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
