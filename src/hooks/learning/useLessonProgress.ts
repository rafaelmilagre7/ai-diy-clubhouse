
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { useToast } from '@/hooks/use-toast';

interface LessonProgressOptions {
  lessonId: string;
  courseId: string;
  autoSave?: boolean;
}

export const useLessonProgress = ({ lessonId, courseId, autoSave = true }: LessonProgressOptions) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [progress, setProgress] = useState<number>(0);
  const [lastPosition, setLastPosition] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [progressId, setProgressId] = useState<string | null>(null);

  // Carregar progresso existente
  useEffect(() => {
    const fetchProgress = async () => {
      if (!user || !lessonId) return;
      
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('learning_progress')
          .select('*')
          .eq('user_id', user.id)
          .eq('lesson_id', lessonId)
          .maybeSingle();
        
        if (error) throw error;
        
        if (data) {
          setProgress(data.progress_percentage || 0);
          setLastPosition(data.last_position_seconds || 0);
          setIsCompleted(!!data.completed_at);
          setProgressId(data.id);
          console.log("Progresso carregado:", data);
        } else {
          // Criar novo registro de progresso
          if (autoSave) {
            const { data: newData, error: createError } = await supabase
              .from('learning_progress')
              .insert({
                user_id: user.id,
                lesson_id: lessonId,
                progress_percentage: 0,
                last_position_seconds: 0
              })
              .select()
              .single();
              
            if (createError) throw createError;
            
            if (newData) {
              setProgressId(newData.id);
              console.log("Novo progresso criado:", newData);
            }
          }
        }
      } catch (err) {
        console.error("Erro ao carregar progresso:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProgress();
  }, [user, lessonId, autoSave]);

  // Função para atualizar o progresso
  const updateProgress = async (newProgress: number, newPosition?: number) => {
    if (!user || !lessonId || !autoSave) {
      // Apenas atualiza o estado local se autoSave estiver desativado
      setProgress(newProgress);
      if (newPosition !== undefined) setLastPosition(newPosition);
      return;
    }
    
    // Não fazer nada se o progresso já estiver em 100% (aula completada)
    if (isCompleted && newProgress < 100) return;
    
    // Verificar se o novo progresso é significativamente maior que o atual
    if (newProgress <= progress && !isCompleted) return;
    
    try {
      setIsSaving(true);
      setProgress(newProgress);
      if (newPosition !== undefined) setLastPosition(newPosition);
      
      const isNowCompleted = newProgress >= 100;
      if (isNowCompleted) setIsCompleted(true);
      
      const updateData: any = {
        progress_percentage: newProgress,
        updated_at: new Date().toISOString()
      };
      
      if (newPosition !== undefined) {
        updateData.last_position_seconds = newPosition;
      }
      
      if (isNowCompleted && !isCompleted) {
        updateData.completed_at = new Date().toISOString();
      }
      
      const { error } = await supabase
        .from('learning_progress')
        .upsert({
          id: progressId,
          user_id: user.id,
          lesson_id: lessonId,
          ...updateData
        });
      
      if (error) throw error;
      
      // Se completou a aula, exibir toast
      if (isNowCompleted && !isCompleted) {
        toast({
          title: "Aula concluída!",
          description: "Seu progresso foi salvo.",
        });
      }
    } catch (err) {
      console.error("Erro ao salvar progresso:", err);
    } finally {
      setIsSaving(false);
    }
  };

  // Função para marcar como concluído manualmente
  const markAsCompleted = () => updateProgress(100);
  
  // Função para salvar a posição atual do vídeo
  const saveVideoPosition = (position: number) => {
    const progressPercentage = position > 0 ? Math.min(Math.floor(progress + 5), 95) : progress;
    updateProgress(progressPercentage, position);
  };

  return {
    progress,
    lastPosition,
    isCompleted,
    loading,
    isSaving,
    updateProgress,
    markAsCompleted,
    saveVideoPosition
  };
};
