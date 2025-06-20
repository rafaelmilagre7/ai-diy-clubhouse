
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useVideoProgress(lessonId?: string) {
  const [videoProgresses, setVideoProgresses] = useState<Record<string, number>>({});
  const [totalProgress, setTotalProgress] = useState<number>(0);
  const queryClient = useQueryClient();

  // Buscar progresso inicial
  useEffect(() => {
    const fetchInitialProgress = async () => {
      if (!lessonId) return;
      
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) return;
        
        const { data, error } = await supabase
          .from("learning_progress")
          .select("*")
          .eq("user_id", userData.user.id as any)
          .eq("lesson_id", lessonId as any)
          .maybeSingle();
          
        if (error) throw error;
        
        if (data && (data as any).video_progress) {
          setVideoProgresses((data as any).video_progress);
          setTotalProgress((data as any).progress_percentage || 0);
        }
      } catch (err) {
        console.error("Erro ao buscar progresso inicial:", err);
      }
    };
    
    fetchInitialProgress();
  }, [lessonId]);
  
  // Mutation para atualizar o progresso no banco de dados
  const updateProgressMutation = useMutation({
    mutationFn: async ({ 
      progress, 
      videoProgress 
    }: { 
      progress: number, 
      videoProgress: Record<string, number> 
    }) => {
      if (!lessonId) throw new Error("ID da aula não fornecido");
      
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Usuário não autenticado");
      
      const now = new Date().toISOString();
      
      // Verificar se já existe um registro de progresso
      const { data: existingProgress } = await supabase
        .from("learning_progress")
        .select("id, completed_at")
        .eq("user_id", userData.user.id as any)
        .eq("lesson_id", lessonId as any)
        .maybeSingle();
      
      if (existingProgress) {
        // Atualizar progresso existente
        const { data, error } = await supabase
          .from("learning_progress")
          .update({
            progress_percentage: progress,
            video_progress: videoProgress,
            updated_at: now,
            completed_at: progress >= 100 ? now : (existingProgress as any).completed_at
          } as any)
          .eq("id", (existingProgress as any).id as any)
          .select();
          
        if (error) throw error;
        return data;
      } else {
        // Criar novo registro de progresso
        const { data, error } = await supabase
          .from("learning_progress")
          .insert({
            user_id: userData.user.id,
            lesson_id: lessonId,
            progress_percentage: progress,
            video_progress: videoProgress,
            started_at: now,
            completed_at: progress >= 100 ? now : null
          } as any)
          .select();
          
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      // Invalidar consultas relacionadas para atualizar dados
      queryClient.invalidateQueries({
        queryKey: ["formacao-progresso-aula", lessonId],
      });
    },
    onError: (error) => {
      console.error("Erro ao atualizar progresso:", error);
      toast.error("Não foi possível salvar seu progresso");
    }
  });
  
  // Função para atualizar o progresso de um vídeo específico
  const updateVideoProgress = (videoId: string, progress: number, videos?: any[]) => {
    if (!videoId) return;
    
    setVideoProgresses(prev => {
      // Se o progresso anterior for maior, manter o maior progresso
      const currentProgress = prev[videoId] || 0;
      if (progress <= currentProgress) return prev;
      
      const newProgresses = { ...prev, [videoId]: progress };
      
      // Calcular o progresso geral da aula se temos a lista de vídeos
      if (videos && videos.length > 0) {
        let totalVideoProgress = 0;
        
        videos.forEach(video => {
          const videoProgress = newProgresses[video.id] || 0;
          totalVideoProgress += videoProgress;
        });
        
        // Média do progresso de todos os vídeos
        const averageProgress = Math.round(totalVideoProgress / videos.length);
        setTotalProgress(averageProgress);
        
        // Atualizar no banco de dados
        updateProgressMutation.mutate({
          progress: averageProgress,
          videoProgress: newProgresses
        });
      }
      
      return newProgresses;
    });
  };
  
  // Função para marcar toda a aula como concluída
  const markAsCompleted = (videos?: any[]) => {
    if (!videos || videos.length === 0) {
      // Se não temos vídeos, apenas marcar como 100%
      updateProgressMutation.mutate({
        progress: 100,
        videoProgress: {}
      });
      setTotalProgress(100);
      return;
    }
    
    // Marcar todos os vídeos como concluídos
    const fullProgress: Record<string, number> = {};
    videos.forEach(video => {
      fullProgress[video.id] = 100;
    });
    
    setVideoProgresses(fullProgress);
    setTotalProgress(100);
    
    updateProgressMutation.mutate({
      progress: 100,
      videoProgress: fullProgress
    });
    
    toast.success("Aula concluída! Parabéns!");
  };
  
  return {
    videoProgresses,
    totalProgress,
    updateVideoProgress,
    markAsCompleted,
    isUpdating: updateProgressMutation.isPending
  };
}
