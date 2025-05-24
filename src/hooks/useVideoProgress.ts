
import { useState, useEffect } from "react";
import { useLessonProgressNonLinear } from "@/hooks/learning/useLessonProgressNonLinear";

export function useVideoProgress(lessonId?: string) {
  const [videoProgresses, setVideoProgresses] = useState<Record<string, number>>({});
  
  // Usar o novo hook não-linear
  const {
    progress: totalProgress,
    userProgress,
    updateProgress,
    completeLesson,
    isUpdating
  } = useLessonProgressNonLinear({ 
    lessonId,
    autoInitialize: true 
  });

  // Inicializar progressos dos vídeos a partir dos dados existentes
  useEffect(() => {
    if (userProgress?.video_progress) {
      setVideoProgresses(userProgress.video_progress);
    }
  }, [userProgress]);

  // Função para atualizar o progresso de um vídeo específico
  const updateVideoProgress = (videoId: string, progress: number, videos?: any[]) => {
    if (!videoId) return;
    
    setVideoProgresses(prev => {
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
        
        // Atualizar no sistema não-linear
        updateProgress(averageProgress, newProgresses);
      }
      
      return newProgresses;
    });
  };
  
  // Função para marcar toda a aula como concluída
  const markAsCompleted = async (videos?: any[]) => {
    try {
      if (!videos || videos.length === 0) {
        await completeLesson();
        return;
      }
      
      // Marcar todos os vídeos como concluídos
      const fullProgress: Record<string, number> = {};
      videos.forEach(video => {
        fullProgress[video.id] = 100;
      });
      
      setVideoProgresses(fullProgress);
      await completeLesson();
    } catch (error) {
      console.error("Erro ao marcar como concluído:", error);
    }
  };
  
  return {
    videoProgresses,
    totalProgress,
    updateVideoProgress,
    markAsCompleted,
    isUpdating
  };
}
