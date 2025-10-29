import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

/**
 * Hook para sincronizar progresso entre diferentes páginas
 * Usa sessionStorage para detectar quando houve atualização de progresso
 */
export function useProgressSync() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleStorageChange = async (e: StorageEvent) => {
      // Detectar mudanças no sessionStorage relacionadas ao progresso
      if (e.key === 'learning_progress_updated' && e.newValue) {
        console.log('[PROGRESS-SYNC] 🔄 Detectada atualização de progresso via storage event');
        
        // Invalidar e refetch de todas as queries relacionadas
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["learning-user-progress"] }),
          queryClient.invalidateQueries({ queryKey: ["course-details"] }),
          queryClient.invalidateQueries({ queryKey: ["learning-lesson-progress"] }),
          queryClient.invalidateQueries({ queryKey: ["learning-completed-lessons"] })
        ]);
      }
    };

    // Listener para mudanças no storage
    window.addEventListener('storage', handleStorageChange);

    // Verificar periodicamente se há flag de atualização (para mesma aba)
    const intervalId = setInterval(() => {
      const lastUpdate = sessionStorage.getItem('learning_progress_updated');
      
      if (lastUpdate) {
        const updateTime = parseInt(lastUpdate);
        const now = Date.now();
        
        // Se a atualização foi nos últimos 5 segundos
        if (now - updateTime < 5000) {
          console.log('[PROGRESS-SYNC] 🔄 Detectada atualização recente de progresso');
          
          // Refetch silencioso
          queryClient.refetchQueries({ queryKey: ["learning-user-progress"] });
          queryClient.refetchQueries({ queryKey: ["course-details"] });
        }
      }
    }, 2000); // Verificar a cada 2 segundos

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(intervalId);
    };
  }, [queryClient]);
}
