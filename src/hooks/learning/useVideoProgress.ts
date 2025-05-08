
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';

interface VideoProgressOptions {
  lessonId: string;
  videoId: string;
  duration?: number;
  autoSave?: boolean;
}

export const useVideoProgress = ({ 
  lessonId, 
  videoId, 
  duration = 0,
  autoSave = true 
}: VideoProgressOptions) => {
  const { user } = useAuth();
  const [progress, setProgress] = useState<number>(0);
  const [position, setPosition] = useState<number>(0);
  const [saving, setSaving] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  
  // Verificar se já temos progresso salvo para este vídeo
  useEffect(() => {
    if (!user || !lessonId || !videoId) return;
    
    const loadProgress = async () => {
      try {
        const { data, error } = await supabase
          .from('learning_progress')
          .select('*')
          .eq('user_id', user.id)
          .eq('lesson_id', lessonId)
          .single();
          
        if (error) throw error;
        
        if (data && data.video_progress) {
          // Extrair progresso do vídeo específico
          const videoProgress = data.video_progress[videoId] || 0;
          setProgress(videoProgress);
          setIsCompleted(videoProgress >= 95);
          console.log(`Progresso carregado para vídeo ${videoId}: ${videoProgress}%`);
        }
      } catch (err) {
        console.error('Erro ao carregar progresso do vídeo:', err);
      }
    };
    
    loadProgress();
  }, [user, lessonId, videoId]);
  
  // Função para atualizar posição e progresso
  const updateProgress = async (
    newPosition: number, 
    videoDuration: number,
    forceUpdate = false
  ): Promise<boolean> => {
    if (!user || !lessonId || !videoId || !autoSave) {
      // Apenas atualizar localmente
      setPosition(newPosition);
      if (videoDuration > 0) {
        const newProgress = Math.round((newPosition / videoDuration) * 100);
        setProgress(newProgress);
        setIsCompleted(newProgress >= 95);
      }
      return false;
    }
    
    // Se já salvamos recentemente, não salvar novamente a menos que forceUpdate seja true
    if (saving && !forceUpdate) return false;
    
    // Calcular progresso percentual
    let newProgress = 0;
    if (videoDuration > 0) {
      newProgress = Math.round((newPosition / videoDuration) * 100);
    }
    
    // Se o progresso for menor que o atual e não estamos forçando, ignorar
    if (newProgress < progress && !forceUpdate) {
      console.log(`Ignorando progresso menor: ${newProgress}% < ${progress}%`);
      return false;
    }
    
    // Se não houve alteração significativa (< 5%), não salvar a menos que forceUpdate seja true
    if (Math.abs(newProgress - progress) < 5 && !forceUpdate) {
      console.log(`Alteração não significativa: ${progress}% → ${newProgress}%`);
      return false;
    }
    
    try {
      setSaving(true);
      setPosition(newPosition);
      setProgress(newProgress);
      setIsCompleted(newProgress >= 95);
      
      // Obter progresso existente
      const { data: existingProgress, error: getError } = await supabase
        .from('learning_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('lesson_id', lessonId)
        .maybeSingle();
      
      if (getError) throw getError;
      
      // Preparar dados para atualização
      const now = new Date().toISOString();
      let updateData: any = {
        updated_at: now
      };
      
      // Atualizar campo de progresso de vídeo
      if (existingProgress) {
        const currentVideoProgress = existingProgress.video_progress || {};
        updateData.video_progress = {
          ...currentVideoProgress,
          [videoId]: newProgress
        };
        
        // Se o progresso for alto, marcar como concluído
        if (newProgress >= 95 && !existingProgress.completed_at) {
          updateData.completed_at = now;
          
          // Também atualizar o progresso geral da aula para 100%
          updateData.progress_percentage = 100;
        } else if (!existingProgress.completed_at) {
          // Calcular progresso global da aula (média de todos os vídeos)
          const allProgresses = Object.values({
            ...currentVideoProgress,
            [videoId]: newProgress
          }) as number[];
          
          const averageProgress = allProgresses.length > 0
            ? Math.round(allProgresses.reduce((a, b) => a + b, 0) / allProgresses.length)
            : newProgress;
          
          updateData.progress_percentage = Math.min(averageProgress, 95); // Máximo 95% até completar manualmente
        }
        
        // Atualizar entrada existente
        const { error: updateError } = await supabase
          .from('learning_progress')
          .update(updateData)
          .eq('id', existingProgress.id);
          
        if (updateError) throw updateError;
      } else {
        // Criar nova entrada
        const { error: insertError } = await supabase
          .from('learning_progress')
          .insert({
            user_id: user.id,
            lesson_id: lessonId,
            progress_percentage: newProgress,
            started_at: now,
            video_progress: { [videoId]: newProgress }
          });
          
        if (insertError) throw insertError;
      }
      
      // Se completou, mostrar toast
      if (newProgress >= 95 && progress < 95) {
        toast.success('Vídeo concluído!');
      }
      
      return true;
    } catch (err) {
      console.error('Erro ao salvar progresso do vídeo:', err);
      return false;
    } finally {
      setSaving(false);
    }
  };
  
  // Função para marcar como completo
  const markAsCompleted = async (): Promise<boolean> => {
    return await updateProgress(
      duration, 
      duration,
      true
    );
  };
  
  return {
    progress,
    position,
    isCompleted,
    saving,
    updateProgress,
    markAsCompleted,
    setPosition
  };
};
