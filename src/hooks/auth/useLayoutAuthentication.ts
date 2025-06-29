
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
  const maxRetries = 2;
  const authTimeout = 8000;

  // Setup component lifecycle
  useEffect(() => {
    isMounted.current = true;
    
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  // Setup loading timeout com proteção melhorada
  useEffect(() => {
    if (isLoading && isMounted.current) {
      const timeoutId = setTimeout(() => {
        if (isMounted.current && isLoading) {
          if (retryCount < maxRetries) {
            console.warn(`⚠️ [AUTH] Timeout na autenticação - retry ${retryCount + 1}/${maxRetries}`);
            setRetryCount(prev => prev + 1);
            toast.warning(`Verificando autenticação... (${retryCount + 1}/${maxRetries})`);
          } else {
            console.error("❌ [AUTH] Timeout final na autenticação");
            setIsLoading(false);
            toast.error("Problema na verificação de autenticação");
          }
        }
      }, authTimeout);
      
      return () => clearTimeout(timeoutId);
    }
  }, [isLoading, retryCount, setIsLoading]);

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
