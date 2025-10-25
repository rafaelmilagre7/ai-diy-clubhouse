
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface ContinueLearningProps {
  className?: string;
}

export const ContinueLearning = ({ className }: ContinueLearningProps) => {
  const [lastLesson, setLastLesson] = useState<any>(null);
  
  // Buscar o progresso do usuário para encontrar a última aula acessada
  const { data: userProgress, isLoading } = useQuery({
    queryKey: ["learning-user-last-progress"],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return null;
      
      // Buscar o último progresso registrado pelo usuário
      const { data: progressData, error: progressError } = await supabase
        .from("learning_progress")
        .select(`
          *,
          lesson:learning_lessons(
            *,
            module:learning_modules(
              *,
              course:learning_courses(*)
            )
          )
        `)
        .eq("user_id", userData.user.id)
        .order("updated_at", { ascending: false })
        .limit(1);
        
      if (progressError || !progressData || progressData.length === 0) {
        return null;
      }
      
      return progressData[0];
    }
  });
  
  // Processar os dados quando o progresso for carregado
  useEffect(() => {
    if (userProgress && userProgress.lesson) {
      setLastLesson({
        id: userProgress.lesson.id,
        title: userProgress.lesson.title,
        course_id: userProgress.lesson.module?.course_id,
        course_title: userProgress.lesson.module?.course?.title,
        cover_image: userProgress.lesson.cover_image_url || userProgress.lesson.module?.course?.cover_image_url,
        progress: userProgress.progress_percentage,
      });
    }
  }, [userProgress]);
  
  if (isLoading) {
    return (
      <div className={cn("animate-pulse", className)}>
        <Card className="overflow-hidden">
          <AspectRatio ratio={21/9}>
            <div className="bg-muted h-full w-full" />
          </AspectRatio>
        </Card>
      </div>
    );
  }
  
  if (!lastLesson) {
    return null; // Não mostrar nada se não houver aula em progresso
  }
  
  return (
    <div className={className}>
      <Link 
        to={`/learning/course/${lastLesson.course_id}/lesson/${lastLesson.id}`}
        className="block group"
      >
        <Card className="overflow-hidden shadow-md hover:shadow-xl transition-shadow border-transparent">
          <AspectRatio ratio={21/9}>
            <div className="relative h-full">
              {lastLesson.cover_image ? (
                <img
                  src={lastLesson.cover_image}
                  alt={lastLesson.title}
                  className="object-cover w-full h-full transition-transform duration-slower group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-blue-600 via-blue-500 to-blue-700" />
              )}
              
              {/* Gradiente para melhorar legibilidade do texto */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
              
              {/* Conteúdo */}
              <div className="absolute bottom-0 left-0 right-0 p-6 text-foreground">
                <div className="mb-4">
                  <div className="text-sm text-muted-foreground mb-1">Continue assistindo</div>
                  <h3 className="text-2xl font-semibold mb-2">{lastLesson.course_title}</h3>
                  <p className="text-foreground mb-4">{lastLesson.title}</p>
                  
                  {/* Barra de progresso */}
                  <div className="w-full bg-white/20 h-1 mb-4">
                    <div 
                      className="bg-primary h-full"
                      style={{ width: `${lastLesson.progress}%` }}
                    />
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <Button className="gap-2 bg-card text-foreground hover:bg-card/90">
                    <Play className="h-4 w-4 fill-current" />
                    Continuar
                  </Button>
                </div>
              </div>
              
              {/* Botão de play centralizado que aparece em hover */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-card/90 rounded-full p-6 opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:scale-105 duration-slow shadow-xl">
                  <Play className="h-8 w-8 text-primary fill-current" />
                </div>
              </div>
            </div>
          </AspectRatio>
        </Card>
      </Link>
    </div>
  );
};
