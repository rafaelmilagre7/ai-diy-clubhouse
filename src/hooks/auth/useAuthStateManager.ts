
import { useState, useEffect, useRef, useCallback } from "react";
import { Session, User } from '@supabase/supabase-js';
import { validateUserSession, fetchUserProfileSecurely, clearProfileCache } from '@/hooks/auth/utils/authSessionUtils';
import { UserProfile } from '@/lib/supabase';
import { logger } from '@/utils/logger';
import { useGlobalLoading } from '@/hooks/useGlobalLoading';
import { navigationCache } from '@/utils/navigationCache';
import { secureSessionCache } from '@/utils/secureSessionCache';
import { intelligentRateLimit } from '@/utils/intelligentRateLimit';

interface UseAuthStateManagerProps {
  setSession: (session: Session | null) => void;
  setUser: (user: User | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  setIsLoading: (loading: boolean) => void;
}

export const useAuthStateManager = ({
  setSession,
  setUser,
  setProfile,
  setIsLoading,
}: UseAuthStateManagerProps) => {
  const { setLoading: setGlobalLoading, circuitBreakerActive } = useGlobalLoading();
  const [retryCount, setRetryCount] = useState(0);
  const [lastAttemptTime, setLastAttemptTime] = useState(0);
  const maxRetries = 3;
  const retryDelay = 1000;
  
  // SEGURANÇA: Detectar IP do cliente para rate limiting
  const getClientIdentifier = useCallback(() => {
    // Em produção, isso viria do servidor. No cliente, usamos fallbacks
    return `browser_${navigator.userAgent.substring(0, 50).replace(/\s+/g, '_')}`;
  }, []);

  // OTIMIZAÇÃO: Exponential backoff para retry
  const getRetryDelay = useCallback((attempt: number) => {
    return Math.min(retryDelay * Math.pow(2, attempt), 5000);
  }, []);

  const setupAuthSession = useCallback(async () => {
    const now = Date.now();
    const clientId = getClientIdentifier();
    
    // SEGURANÇA: Rate limiting inteligente
    const rateLimitCheck = intelligentRateLimit.checkRateLimit(
      clientId, 
      'auth_setup', 
      navigator.userAgent
    );
    
    if (!rateLimitCheck.allowed) {
      logger.warn('[AUTH-STATE] Bloqueado por rate limiting', {
        reason: rateLimitCheck.reason,
        retryAfter: rateLimitCheck.retryAfter
      });
      setIsLoading(false);
      setGlobalLoading('auth', false);
      return;
    }
    
    // Rate limiting para evitar chamadas excessivas
    if (now - lastAttemptTime < 500) {
      logger.info('[AUTH-STATE] Rate limiting local - aguardando...');
      return;
    }
    
    setLastAttemptTime(now);
    logger.info('[AUTH-STATE] Iniciando setup com segurança avançada');
    
    try {
      setIsLoading(true);
      setGlobalLoading('auth', true);

      // Verificar circuit breaker
      if (circuitBreakerActive) {
        logger.warn('[AUTH-STATE] Circuit breaker ativo - setup simplificado');
        setIsLoading(false);
        setGlobalLoading('auth', false);
        return;
      }

      // SEGURANÇA: Verificar cache seguro primeiro
      const userId = sessionStorage.getItem('current_user_id');
      if (userId) {
        const cachedSession = await secureSessionCache.getSecureSession(userId);
        if (cachedSession) {
          logger.info('[AUTH-STATE] Usando sessão segura em cache');
          setSession(cachedSession);
          setUser(cachedSession.user);
          
          // Verificar cache de navegação
          const cachedNavigation = navigationCache.get(userId);
          if (cachedNavigation?.userProfile) {
            setProfile(cachedNavigation.userProfile);
            setIsLoading(false);
            setGlobalLoading('auth', false);
            return;
          }
        }
      }

      // Timeout adaptativo baseado no número de tentativas
      const adaptiveTimeout = 1000 + (retryCount * 500);
      const sessionPromise = validateUserSession();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Auth session timeout")), adaptiveTimeout)
      );

      let sessionResult;
      try {
        sessionResult = await Promise.race([sessionPromise, timeoutPromise]) as { session: Session | null; user: User | null };
      } catch (timeoutError) {
        // SEGURANÇA: Reportar tentativa de falha para rate limiting
        intelligentRateLimit.checkRateLimit(clientId, 'auth_timeout', navigator.userAgent, true);
        
        if (retryCount < maxRetries) {
          const delay = getRetryDelay(retryCount);
          logger.warn(`[AUTH-STATE] Timeout - retry ${retryCount + 1}/${maxRetries} em ${delay}ms`);
          
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
          }, delay);
          return;
        }
        
        logger.error('[AUTH-STATE] Timeout máximo atingido');
        setSession(null);
        setUser(null);
        setProfile(null);
        clearProfileCache();
        return;
      }

      const { session, user } = sessionResult;
      
      if (!session || !user) {
        logger.info('[AUTH-STATE] Nenhuma sessão válida - estado limpo');
        setSession(null);
        setUser(null);
        setProfile(null);
        clearProfileCache();
        navigationCache.clear();
        
        // Limpar cache seguro
        if (userId) {
          await secureSessionCache.clearUserSession(userId);
        }
        return;
      }

      // SEGURANÇA: Armazenar sessão de forma segura
      const cacheStored = await secureSessionCache.setSecureSession(user.id, session);
      if (cacheStored) {
        sessionStorage.setItem('current_user_id', user.id);
      }

      // Definir sessão e usuário
      setSession(session);
      setUser(user);

      // Verificar cache de navegação
      const cachedNavigation = navigationCache.get(user.id);
      if (cachedNavigation?.userProfile) {
        logger.info('[AUTH-STATE] Perfil em cache - usando dados salvos');
        setProfile(cachedNavigation.userProfile);
        
        logger.info('[AUTH-STATE] ✅ Setup completo via cache', {
          userId: user.id.substring(0, 8) + '***',
          hasProfile: true,
          cached: true
        });
        
        // Reset retry count em sucesso
        setRetryCount(0);
        
        // SEGURANÇA: Reportar sucesso para rate limiting
        intelligentRateLimit.checkRateLimit(clientId, 'auth_success', navigator.userAgent, false);
        return;
      }

      // Buscar perfil com timeout reduzido
      try {
        const profilePromise = fetchUserProfileSecurely(user.id);
        const profileTimeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Profile timeout")), 800)
        );

        let profile;
        try {
          profile = await Promise.race([profilePromise, profileTimeoutPromise]) as UserProfile | null;
        } catch (profileTimeoutError) {
          logger.warn('[AUTH-STATE] Timeout no perfil - continuando sem perfil');
          profile = null;
        }
        
        if (profile) {
          if (profile.id !== user.id) {
            logger.error('[AUTH-STATE] VIOLAÇÃO DE SEGURANÇA: ID do perfil incorreto');
            
            // SEGURANÇA: Reportar violação
            intelligentRateLimit.checkRateLimit(clientId, 'security_violation', navigator.userAgent, true);
            
            throw new Error('Violação de segurança detectada');
          }

          setProfile(profile);
          
          // Atualizar cache de navegação baseado no role do banco
          const roleName = profile.user_roles?.name;
          if (roleName === 'admin') {
            navigationCache.set(user.id, profile, 'admin');
          } else if (roleName === 'formacao') {
            navigationCache.set(user.id, profile, 'formacao');
          }
          
          logger.info('[AUTH-STATE] ✅ Setup completo', {
            userId: user.id.substring(0, 8) + '***',
            hasProfile: true,
            roleName: profile.user_roles?.name || 'sem role',
            cached: false
          });
        } else {
          logger.warn('[AUTH-STATE] Sem perfil disponível');
          setProfile(null);
        }
        
        // Reset retry count em sucesso
        setRetryCount(0);
        
        // SEGURANÇA: Reportar sucesso
        intelligentRateLimit.checkRateLimit(clientId, 'auth_success', navigator.userAgent, false);
        
      } catch (profileError) {
        logger.error('[AUTH-STATE] Erro no perfil:', profileError);
        setProfile(null);
        
        // SEGURANÇA: Reportar falha de perfil
        intelligentRateLimit.checkRateLimit(clientId, 'profile_error', navigator.userAgent, true);
        
        if (profileError instanceof Error && profileError.message.includes('segurança')) {
          logger.warn('[AUTH-STATE] Logout por violação de segurança');
          setSession(null);
          setUser(null);
          clearProfileCache();
          navigationCache.clear();
          await secureSessionCache.clearUserSession(user.id);
        }
      }

    } catch (error) {
      logger.error('[AUTH-STATE] Erro crítico:', error);
      
      // SEGURANÇA: Reportar erro crítico
      intelligentRateLimit.checkRateLimit(clientId, 'critical_error', navigator.userAgent, true);
      
      if (error instanceof Error && error.message.includes('timeout')) {
        if (retryCount < maxRetries) {
          const delay = getRetryDelay(retryCount);
          logger.warn(`[AUTH-STATE] Erro de timeout - retry ${retryCount + 1}/${maxRetries} em ${delay}ms`);
          
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
          }, delay);
          return;
        }
      }
      
      setSession(null);
      setUser(null);
      setProfile(null);
      clearProfileCache();
      navigationCache.clear();
      secureSessionCache.clearAllSessions();
      
    } finally {
      setIsLoading(false);
      setGlobalLoading('auth', false);
      logger.info('[AUTH-STATE] ✅ Setup finalizado (segurança avançada)');
    }
  }, [
    setSession, 
    setUser, 
    setProfile, 
    setIsLoading, 
    setGlobalLoading, 
    circuitBreakerActive, 
    retryCount, 
    lastAttemptTime,
    getRetryDelay,
    getClientIdentifier,
    maxRetries
  ]);

  // Reset automático de retry count após sucesso
  useEffect(() => {
    if (retryCount > 0) {
      const resetTimer = setTimeout(() => {
        setRetryCount(0);
        logger.info('[AUTH-STATE] Retry count resetado automaticamente');
      }, 30000);
      
      return () => clearTimeout(resetTimer);
    }
  }, [retryCount]);

  return { setupAuthSession };
};
