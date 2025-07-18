import { supabase } from "@/lib/supabase";

/**
 * Hook para gerenciar cache de perfil do usuário
 */
export const useProfileCache = () => {
  const invalidateCache = async (userId?: string) => {
    try {
      const { error } = await supabase.rpc('invalidate_profile_cache', {
        user_id: userId
      });
      
      if (error) {
        console.error('❌ [CACHE] Erro ao invalidar cache:', error);
      } else {
        console.log('🔄 [CACHE] Cache invalidado com sucesso');
      }
    } catch (err) {
      console.error('❌ [CACHE] Erro ao invalidar cache:', err);
    }
  };

  const clearLocalStorage = () => {
    // Limpar dados relacionados ao perfil no localStorage se existirem
    const keysToRemove = Object.keys(localStorage).filter(key => 
      key.includes('profile') || key.includes('user_role')
    );
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });
    
    console.log('🗑️ [CACHE] Local storage limpo');
  };

  return {
    invalidateCache,
    clearLocalStorage
  };
};