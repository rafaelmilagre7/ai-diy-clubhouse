
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
  used_at: string | null;
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

      logger.info('[INVITE-FLOW] 🚀 Iniciando validação CORRIGIDA de convite:', { 
        token: inviteToken.substring(0, 8) + '***',
        timestamp: new Date().toISOString()
      });

      // TIMEOUT AGRESSIVO: máximo 800ms (aumentado para robustez)
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout na validação do convite')), 800);
      });

      try {
        // PRIMEIRA TENTATIVA: Consulta com JOIN simplificado
        logger.info('[INVITE-FLOW] 📡 Tentativa 1: Consulta com JOIN simplificado');
        
        const fetchPromise = supabase
          .from('invites')
          .select(`
            token,
            email,
            role_id,
            created_at,
            expires_at,
            used_at
          `)
          .eq('token', inviteToken)
          .maybeSingle();

        const { data: inviteData, error: fetchError } = await Promise.race([fetchPromise, timeoutPromise]) as any;

        const duration = Date.now() - startTime;
        logger.info('[INVITE-FLOW] ⏱️ Consulta de convite finalizada:', { 
          duration: `${duration}ms`,
          hasData: !!inviteData,
          hasError: !!fetchError,
          token: inviteToken.substring(0, 8) + '***'
        });

        if (fetchError) {
          logger.error('[INVITE-FLOW] ❌ Erro na consulta de convite:', fetchError);
          setError('Erro ao validar convite');
          return;
        }

        if (!inviteData) {
          logger.warn('[INVITE-FLOW] ⚠️ Convite não encontrado:', {
            token: inviteToken.substring(0, 8) + '***'
          });
          setError('Convite não encontrado ou inválido');
          return;
        }

        logger.info('[INVITE-FLOW] ✅ Dados básicos do convite encontrados:', {
          email: inviteData.email,
          roleId: inviteData.role_id,
          used_at: inviteData.used_at,
          expires_at: inviteData.expires_at
        });

        // SEGUNDA CONSULTA: Buscar dados do role separadamente
        logger.info('[INVITE-FLOW] 📡 Tentativa 2: Buscar dados do role');
        
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('id, name')
          .eq('id', inviteData.role_id)
          .single();

        if (roleError) {
          logger.error('[INVITE-FLOW] ⚠️ Erro ao buscar role (continuando):', roleError);
          // Continuar mesmo sem dados do role
        }

        // Verificar se expirou
        const now = new Date();
        const expiresAt = new Date(inviteData.expires_at);
        
        if (now > expiresAt) {
          logger.warn('[INVITE-FLOW] ⌛ Convite expirado:', {
            expires_at: inviteData.expires_at,
            current_time: now.toISOString()
          });
          setError('Convite expirado');
          return;
        }

        // VERIFICAÇÃO CRÍTICA: Verificar se já foi usado
        if (inviteData.used_at !== null) {
          logger.warn('[INVITE-FLOW] ✅ Convite já foi usado:', {
            used_at: inviteData.used_at,
            email: inviteData.email
          });
          setError('Convite já foi utilizado');
          return;
        }

        // Montar dados finais
        const finalRole: InviteRole = roleData ? {
          id: roleData.id,
          name: roleData.name
        } : {
          id: inviteData.role_id,
          name: 'Membro' // Fallback
        };

        logger.info('[INVITE-FLOW] ✅ Convite válido CONFIRMADO:', {
          email: inviteData.email,
          roleName: finalRole.name,
          roleId: finalRole.id,
          duration: `${Date.now() - startTime}ms`
        });
        
        const inviteDetails: InviteDetails = {
          token: inviteData.token,
          email: inviteData.email,
          role: finalRole,
          created_at: inviteData.created_at,
          expires_at: inviteData.expires_at,
          used_at: inviteData.used_at
        };
        
        setInviteDetails(inviteDetails);

      } catch (err: any) {
        const duration = Date.now() - startTime;
        
        if (err.message?.includes('Timeout')) {
          logger.warn('[INVITE-FLOW] ⏰ Timeout após 800ms - continuando sem dados do convite');
          setError('Timeout na validação - preencha os dados manualmente');
        } else {
          logger.error('[INVITE-FLOW] 💥 Erro inesperado na validação:', {
            error: err.message,
            stack: err.stack,
            token: inviteToken.substring(0, 8) + '***'
          });
          setError(`Erro ao processar convite: ${err.message}`);
        }
        
        logger.info('[INVITE-FLOW] 📊 Estatísticas do erro:', {
          duration: `${duration}ms`,
          errorType: err.message?.includes('Timeout') ? 'timeout' : 'unexpected',
          token: inviteToken.substring(0, 8) + '***'
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
    error
  };
};
