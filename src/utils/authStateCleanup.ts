import { supabase } from '@/lib/supabase';

/**
 * Realiza limpeza completa do estado de autenticação
 * Remove todos os tokens e dados de sessão do localStorage
 * e executa logout global no Supabase
 */
export const performCompleteAuthCleanup = async (reason?: string): Promise<void> => {
  console.log(`🧹 [AUTH-CLEANUP] Iniciando limpeza completa${reason ? ` - Motivo: ${reason}` : ''}`);
  
  try {
    // 1. Limpar chaves específicas do Supabase
    const keysToRemove = [
      'supabase.auth.token',
      'sb-auth-token', 
      'sb-refresh-token'
    ];
    
    keysToRemove.forEach(key => {
      try {
        localStorage.removeItem(key);
        console.log(`✅ [AUTH-CLEANUP] Removido: ${key}`);
      } catch (e) {
        console.warn(`⚠️ [AUTH-CLEANUP] Erro ao remover ${key}:`, e);
      }
    });
    
    // 2. Limpar todas as chaves que começam com 'supabase.auth.' ou contêm 'sb-'
    const allKeys = Object.keys(localStorage);
    const authKeys = allKeys.filter(key => 
      key.startsWith('supabase.auth.') || key.includes('sb-')
    );
    
    console.log(`🔍 [AUTH-CLEANUP] Encontradas ${authKeys.length} chaves de auth para limpeza:`, authKeys);
    
    authKeys.forEach(key => {
      try {
        localStorage.removeItem(key);
        console.log(`✅ [AUTH-CLEANUP] Removido: ${key}`);
      } catch (e) {
        console.warn(`⚠️ [AUTH-CLEANUP] Erro ao remover ${key}:`, e);
      }
    });
    
    // 3. Tentar logout global no Supabase
    try {
      await supabase.auth.signOut({ scope: 'global' });
      console.log('✅ [AUTH-CLEANUP] Logout global realizado com sucesso');
    } catch (signOutError) {
      console.warn('⚠️ [AUTH-CLEANUP] Aviso - Não foi possível fazer logout global:', signOutError);
      // Continuar mesmo se o logout global falhar
    }
    
    // 4. Aguardar um pouco para garantir que a limpeza seja processada
    await new Promise(resolve => setTimeout(resolve, 100));
    
    console.log('🎉 [AUTH-CLEANUP] Limpeza completa de autenticação finalizada com sucesso');
    
  } catch (error) {
    console.error('❌ [AUTH-CLEANUP] Erro durante limpeza de autenticação:', error);
    throw error;
  }
};

/**
 * Verifica se há tokens de autenticação residuais no localStorage
 * Útil para debugging
 */
export const checkAuthTokensInStorage = (): { hasTokens: boolean; tokens: string[] } => {
  const allKeys = Object.keys(localStorage);
  const authKeys = allKeys.filter(key => 
    key.startsWith('supabase.auth.') || key.includes('sb-')
  );
  
  return {
    hasTokens: authKeys.length > 0,
    tokens: authKeys
  };
};

/**
 * Limpeza segura com redirecionamento forçado
 * Usa window.location.href para garantir estado completamente limpo
 */
export const performCleanupAndRedirect = async (redirectUrl: string, reason?: string): Promise<void> => {
  await performCompleteAuthCleanup(reason);
  
  console.log(`🚀 [AUTH-CLEANUP] Redirecionando para: ${redirectUrl}`);
  window.location.href = redirectUrl;
};