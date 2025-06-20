
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface UseLessonProgressProps {
  lessonId?: string;
}

export const useLessonProgress = ({ lessonId }: UseLessonProgressProps) => {
  const { user } = useAuth();
  const [isCompleted, setIsCompleted] = useState(false);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);

  // Carregar progresso inicial
  useEffect(() => {
    const loadProgress = async () => {
      if (!lessonId || !user) return;

      try {
        const { data, error } = await supabase
          .from("learning_progress")
          .select("*")
          .eq("lesson_id", lessonId as any)
          .eq("user_id", user.id as any)
          .single();

        if (!error && data) {
          setProgressPercentage((data as any).progress_percentage || 0);
          setIsCompleted((data as any).completed_at !== null);
        }
      } catch (error) {
        console.error("Erro ao carregar progresso:", error);
      }
    };

    loadProgress();
  }, [lessonId, user]);

  // Atualizar progresso
  const updateProgress = async (newProgress: number) => {
    if (!lessonId || !user || isUpdating) return;

    try {
      setIsUpdating(true);
      
      const { data, error } = await supabase
        .from("learning_progress")
        .upsert({
          lesson_id: lessonId,
          user_id: user.id,
          progress_percentage: newProgress,
          last_position_seconds: 0,
          updated_at: new Date().toISOString()
        } as any, {
          onConflict: "lesson_id,user_id"
        });

      if (error) throw error;

      setProgressPercentage(newProgress);
      
      if (newProgress >= 100) {
        setIsCompleted(true);
      }
    } catch (error) {
      console.error("Erro ao atualizar progresso:", error);
      toast.error("Erro ao salvar progresso");
    } finally {
      setIsUpdating(false);
    }
  };

  // Marcar como concluída
  const completeLesson = async () => {
    if (!lessonId || !user || isUpdating) return;

    try {
      setIsUpdating(true);
      
      const { error } = await supabase
        .from("learning_progress")
        .upsert({
          lesson_id: lessonId,
          user_id: user.id,
          progress_percentage: 100,
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        } as any, {
          onConflict: "lesson_id,user_id"
        });

      if (error) throw error;

      setIsCompleted(true);
      setProgressPercentage(100);
      toast.success("Aula concluída com sucesso!");
      
    } catch (error) {
      console.error("Erro ao completar aula:", error);
      toast.error("Erro ao completar aula");
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    isCompleted,
    progressPercentage,
    isUpdating,
    updateProgress,
    completeLesson
  };
};
