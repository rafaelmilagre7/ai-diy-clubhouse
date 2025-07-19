
import { useState, useEffect, useRef } from 'react';
import { User } from '@supabase/supabase-js';
import { UserProfile } from '@/lib/supabase';

interface UseProfileFallbackProps {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
}

interface UseProfileFallbackReturn {
  shouldShowLoading: boolean;
  hasTimedOut: boolean;
  canProceedWithFallback: boolean;
  fallbackProfile: Partial<UserProfile> | null;
}

/**
 * Hook para gerenciar fallback gracioso quando perfil não carrega
 * Evita bloquear usuários por problemas temporários de rede/DB
 */
export const useProfileFallback = ({
  user,
  profile,
  isLoading
}: UseProfileFallbackProps): UseProfileFallbackReturn => {
  const [hasTimedOut, setHasTimedOut] = useState(false);
  const [canProceedWithFallback, setCanProceedWithFallback] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Criar perfil temporário mínimo se necessário
  const fallbackProfile: Partial<UserProfile> | null = user && hasTimedOut ? {
    id: user.id,
    email: user.email || '',
    name: user.user_metadata?.name || user.user_metadata?.full_name || 'Usuário',
    created_at: new Date().toISOString()
  } : null;

  useEffect(() => {
    // Só iniciar timeout se temos usuário mas não temos perfil
    if (user && !profile && !isLoading && !hasTimedOut) {
      console.log('[PROFILE-FALLBACK] Iniciando timeout de 8 segundos...');
      
      timeoutRef.current = setTimeout(() => {
        console.warn('[PROFILE-FALLBACK] Timeout atingido - habilitando fallback');
        setHasTimedOut(true);
        setCanProceedWithFallback(true);
      }, 8000);
    }

    // Limpar timeout se perfil carregar
    if (profile && timeoutRef.current) {
      console.log('[PROFILE-FALLBACK] Perfil carregado - cancelando timeout');
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [user, profile, isLoading, hasTimedOut]);

  const shouldShowLoading = Boolean(
    user && !profile && !hasTimedOut && !canProceedWithFallback
  );

  return {
    shouldShowLoading,
    hasTimedOut,
    canProceedWithFallback,
    fallbackProfile
  };
};
