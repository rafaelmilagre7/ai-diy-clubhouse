/**
 * ❌ HOOK DESABILITADO - NÃO USAR
 * 
 * Este hook foi desabilitado porque causava conflito com o sistema binário de progresso.
 * 
 * PROBLEMA: Atualizava learning_progress.progress_percentage com valores progressivos (5%, 10%, 15%...)
 * enquanto o sistema binário usava apenas 1% (iniciada) ou 100% (concluída).
 * 
 * RESULTADO: Conflito de dados - uma aula marcada como 100% era sobrescrita para 5%
 * 
 * ✅ USAR APENAS: useLessonProgress (sistema binário)
 * 
 * Data de desativação: 29/10/2025
 * Motivo: Fase 2 da correção de progresso
 */

import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useVideoProgress(lessonId?: string) {
  console.warn('⚠️ useVideoProgress está DESABILITADO - Use useLessonProgress');
  
  const [videoProgresses, setVideoProgresses] = useState<Record<string, number>>({});
  const [totalProgress, setTotalProgress] = useState<number>(0);
  const queryClient = useQueryClient();

  // Hook desabilitado - não faz nada
  useEffect(() => {
    console.warn('⚠️ useVideoProgress: Hook desabilitado, nenhuma ação será executada');
  }, [lessonId]);
  
  // Mutation desabilitada
  const updateProgressMutation = useMutation({
    mutationFn: async () => {
      console.warn('⚠️ useVideoProgress: Mutation desabilitada');
      return null;
    },
    onSuccess: () => {},
    onError: () => {}
  });
  
  // Funções desabilitadas
  const updateVideoProgress = (videoId: string, progress: number, videos?: any[]) => {
    console.warn('⚠️ useVideoProgress.updateVideoProgress está DESABILITADO');
  };
  
  const markAsCompleted = (videos?: any[]) => {
    console.warn('⚠️ useVideoProgress.markAsCompleted está DESABILITADO - Use useLessonProgress.completeLesson()');
  };
  
  return {
    videoProgresses,
    totalProgress,
    updateVideoProgress,
    markAsCompleted,
    isUpdating: false
  };
}
