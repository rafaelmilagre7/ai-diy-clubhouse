
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { logger } from '@/utils/logger';

interface InviteRole {
  id: string;
  name: string;
}

interface InviteDetails {
  token: string;
  email: string;
  role: InviteRole;
  created_at: string;
  expires_at: string;
  used_at: string | null; // CORREÇÃO: usar used_at em vez de is_used
}

interface UseInviteFlowResult {
  inviteDetails: InviteDetails | null;
  isLoading: boolean;
  error: string | null;
}

export const useInviteFlow = (inviteToken?: string): UseInviteFlowResult => {
  const [inviteDetails, setInviteDetails] = useState<InviteDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!inviteToken || inviteToken.trim() === '') {
      logger.info('[INVITE-FLOW] 🔍 Sem token de convite - modo onboarding normal');
      setInviteDetails(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    const fetchInviteDetails = async () => {
      const startTime = Date.now();
      setIsLoading(true);
      setError(null);

      logger.info('[INVITE-FLOW] 🚀 Iniciando validação de convite:', { 
        token: inviteToken.substring(0, 8) + '***',
        timestamp: new Date().toISOString()
      });

      // TIMEOUT AGRESSIVO: máximo 500ms
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout na validação do convite')), 500);
      });

      try {
        const fetchPromise = supabase
          .from('invites')
          .select(`
            token,
            email,
            role:user_roles(id, name),
            created_at,
            expires_at,
            used_at
          `)
          .eq('token', inviteToken)
          .maybeSingle();

        const { data, error: fetchError } = await Promise.race([fetchPromise, timeoutPromise]) as any;

        const duration = Date.now() - startTime;
        logger.info('[INVITE-FLOW] ⏱️ Consulta finalizada:', { 
          duration: `${duration}ms`,
          hasData: !!data,
          hasError: !!fetchError
        });

        if (fetchError) {
          logger.error('[INVITE-FLOW] ❌ Erro na consulta:', fetchError);
          setError('Erro ao validar convite');
          return;
        }

        if (!data) {
          logger.warn('[INVITE-FLOW] ⚠️ Convite not found');
          setError('Convite não encontrado ou inválido');
          return;
        }

        // Verificar se expirou
        const now = new Date();
        const expiresAt = new Date(data.expires_at);
        
        if (now > expiresAt) {
          logger.warn('[INVITE-FLOW] ⌛ Convite expirado:', {
            expires_at: data.expires_at,
            current_time: now.toISOString()
          });
          setError('Convite expirado');
          return;
        }

        // CORREÇÃO CRÍTICA: Verificar se já foi usado (used_at não null)
        if (data.used_at !== null) {
          logger.warn('[INVITE-FLOW] ✅ Convite já foi usado:', {
            used_at: data.used_at,
            email: data.email
          });
          setError('Convite já foi utilizado');
          return;
        }

        logger.info('[INVITE-FLOW] ✅ Convite válido encontrado:', {
          email: data.email,
          role: Array.isArray(data.role) ? data.role[0]?.name : data.role?.name,
          duration: `${duration}ms`
        });
        
        const inviteData: InviteDetails = {
          token: data.token,
          email: data.email,
          role: Array.isArray(data.role) ? data.role[0] : data.role,
          created_at: data.created_at,
          expires_at: data.expires_at,
          used_at: data.used_at
        };
        
        setInviteDetails(inviteData);

      } catch (err: any) {
        const duration = Date.now() - startTime;
        
        if (err.message?.includes('Timeout')) {
          logger.warn('[INVITE-FLOW] ⏰ Timeout após 500ms - continuando sem dados do convite');
          setError('Timeout na validação - preencha os dados manualmente');
        } else {
          logger.error('[INVITE-FLOW] 💥 Erro inesperado:', err);
          setError('Erro ao processar convite');
        }
        
        logger.info('[INVITE-FLOW] 📊 Estatísticas do erro:', {
          duration: `${duration}ms`,
          errorType: err.message?.includes('Timeout') ? 'timeout' : 'unexpected'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchInviteDetails();
  }, [inviteToken]);

  return {
    inviteDetails,
    isLoading,
    loading: isLoading, // Manter compatibilidade
    error
  };
};
