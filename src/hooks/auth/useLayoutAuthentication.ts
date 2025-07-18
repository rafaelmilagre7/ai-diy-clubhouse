
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";

export const useLayoutAuthentication = () => {
  const { user, profile, isAdmin, isLoading, setIsLoading } = useAuth();
  const navigate = useNavigate();
  const [redirectChecked, setRedirectChecked] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const isMounted = useRef(true);
  const maxRetries = 1;
  const authTimeout = 7000; // Aumentado para 7s para sincronizar com RootRedirect

  // Setup component lifecycle
  useEffect(() => {
    isMounted.current = true;
    
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  // Timeout simplificado
  useEffect(() => {
    if (isLoading && isMounted.current) {
      const timeoutId = setTimeout(() => {
        if (isMounted.current && isLoading) {
          console.warn("⚠️ [AUTH] Timeout na autenticação");
          setIsLoading(false);
        }
      }, authTimeout);
      
      return () => clearTimeout(timeoutId);
    }
  }, [isLoading, setIsLoading]);

  // MUDANÇA PRINCIPAL: Remover redirecionamento automático para admin
  // Permitir que usuários naveguem livremente, sem forçar redirecionamento para admin
  useEffect(() => {
    if (!profile || redirectChecked || !isMounted.current || !user || isLoading) {
      return;
    }
    
    // Validar se o perfil tem dados mínimos
    if (!profile.id || !profile.role_id) {
      console.warn("⚠️ [AUTH] Perfil inválido detectado");
      return;
    }
    
    // Reset retry count quando conseguimos carregar o perfil
    setRetryCount(0);
    
    // REMOVIDO: Redirecionamento automático para admin
    // Agora apenas marca como verificado, sem forçar redirecionamento
    setRedirectChecked(true);
  }, [profile, navigate, redirectChecked, user, isLoading]);

  return {
    user,
    profile,
    isAdmin,
    isLoading: isLoading && retryCount < maxRetries,
    retryCount,
    redirectChecked
  };
};
