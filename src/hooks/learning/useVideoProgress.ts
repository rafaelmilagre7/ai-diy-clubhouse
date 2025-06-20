
import { useState, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface UseVideoProgressOptions {
  lessonId: string;
  videoId: string;
  duration?: number;
  onProgressUpdate?: (progress: number) => void;
}

/**
 * Hook para gerenciar o progresso de visualização de vídeo
 */
export const useVideoProgress = ({
  lessonId,
  videoId,
  duration = 0,
  onProgressUpdate
}: UseVideoProgressOptions) => {
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [lastSavedTime, setLastSavedTime] = useState(0);
  const queryClient = useQueryClient();
  
  // Use ref para armazenar o último progresso salvo para evitar atualizações excessivas
  const lastSavedProgressRef = useRef(0);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Carregar progresso inicial
  useEffect(() => {
    const loadProgress = async () => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) throw new Error("Usuário não autenticado");
        
        const { data, error } = await supabase
          .from("learning_progress")
          .select("video_progress, last_position_seconds")
          .eq("lesson_id", lessonId as any)
          .eq("user_id", userData.user.id as any)
          .single();
          
        if (error && error.code !== 'PGRST116') { // Não encontrado
          console.error("Erro ao carregar progresso:", error);
        }
        
        if (data) {
          const videoProgress = (data as any).video_progress || {};
          const videoCurrentProgress = videoProgress[videoId] || 0;
          const lastPosition = videoCurrentProgress > 0 ? (data as any).last_position_seconds : 0;
          
          setProgress(videoCurrentProgress);
          setLastSavedTime(lastPosition);
          lastSavedProgressRef.current = videoCurrentProgress;
          
          if (onProgressUpdate) {
            onProgressUpdate(videoCurrentProgress);
          }
        }
      } catch (error) {
        console.error("Erro ao carregar progresso do vídeo:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (lessonId && videoId) {
      loadProgress();
    }
    
    // Limpar timeout ao desmontar
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [lessonId, videoId]);
  
  // Função para atualizar o progresso
  const updateProgress = async (currentTime: number, videoDuration: number) => {
    if (!videoDuration) return;
    
    // Calcular porcentagem de progresso
    const currentProgress = Math.round((currentTime / videoDuration) * 100);
    
    // Atualizar progresso local
    setProgress(currentProgress);
    
    // Chamar callback se fornecido
    if (onProgressUpdate) {
      onProgressUpdate(currentProgress);
    }
    
    // Verificar se precisamos salvar no banco (diferença > 5% ou pontos chave)
    const shouldSave = 
      Math.abs(currentProgress - lastSavedProgressRef.current) >= 5 || 
      [25, 50, 75, 95].includes(currentProgress) ||
      currentProgress === 100;
      
    if (shouldSave) {
      // Evitar múltiplas chamadas em curto período
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      
      saveTimeoutRef.current = setTimeout(async () => {
        try {
          const { data: userData } = await supabase.auth.getUser();
          if (!userData.user) throw new Error("Usuário não autenticado");
          
          // Verificar se já existe registro de progresso
          const { data: existingProgress, error: checkError } = await supabase
            .from("learning_progress")
            .select("id, video_progress, progress_percentage, completed_at")
            .eq("lesson_id", lessonId as any)
            .eq("user_id", userData.user.id as any)
            .maybeSingle();
            
          if (checkError && checkError.code !== 'PGRST116') {
            console.error("Erro ao verificar progresso:", checkError);
            return;
          }
          
          const videoProgressObj = (existingProgress as any)?.video_progress || {};
          videoProgressObj[videoId] = currentProgress;
          
          // Calcular progresso geral da lição
          // Se o vídeo atual atingiu 95%, considerar lição como 100% concluída
          let lessonProgress = (existingProgress as any)?.progress_percentage || 0;
          if (currentProgress >= 95) {
            lessonProgress = 100;
          } else if (lessonProgress < 75) {
            // Se ainda não chegou a 75%, atualizar proporcional ao vídeo
            lessonProgress = Math.max(lessonProgress, Math.round(currentProgress * 0.75));
          }
          
          // Definir data de conclusão se progresso chegou a 100%
          const completedAt = lessonProgress >= 100 ? new Date().toISOString() : (existingProgress as any)?.completed_at || null;
          
          if (existingProgress) {
            // Atualizar registro existente
            await supabase
              .from("learning_progress")
              .update({
                video_progress: videoProgressObj,
                progress_percentage: lessonProgress,
                last_position_seconds: currentTime,
                completed_at: completedAt,
                updated_at: new Date().toISOString()
              } as any)
              .eq("id", (existingProgress as any).id as any);
          } else {
            // Criar novo registro de progresso
            await supabase
              .from("learning_progress")
              .insert({
                user_id: userData.user.id,
                lesson_id: lessonId,
                video_progress: videoProgressObj,
                progress_percentage: lessonProgress,
                last_position_seconds: currentTime,
                completed_at: completedAt,
              } as any);
          }
          
          // Atualizar último progresso salvo
          lastSavedProgressRef.current = currentProgress;
          
          // Invalidar queries relacionadas
          queryClient.invalidateQueries({ queryKey: ["learning-progress"] });
          
          // Notificar conclusão
          if (currentProgress >= 95 && lastSavedProgressRef.current < 95) {
            toast.success("Vídeo concluído!");
          }
        } catch (error) {
          console.error("Erro ao salvar progresso:", error);
        }
      }, 1000);
    }
  };
  
  return {
    progress,
    lastSavedTime,
    updateProgress,
    isLoading
  };
};
