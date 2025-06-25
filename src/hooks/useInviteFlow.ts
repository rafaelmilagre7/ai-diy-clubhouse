
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

      logger.info('[INVITE-FLOW] 🚀 Iniciando validação SIMPLIFICADA de convite:', { 
        token: inviteToken.substring(0, 8) + '***',
        timestamp: new Date().toISOString()
      });

      // TIMEOUT REDUZIDO: máximo 500ms
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout na validação do convite')), 500);
      });

      try {
        // PRIMEIRA CONSULTA: Buscar dados básicos do convite
        logger.info('[INVITE-FLOW] 📡 Consultando dados básicos do convite...');
        
        const fetchPromise = supabase
          .from('invites')
          .select('token, email, role_id, created_at, expires_at, used_at')
          .eq('token', inviteToken)
          .maybeSingle();

        const { data: inviteData, error: fetchError } = await Promise.race([fetchPromise, timeoutPromise]) as any;

        const duration = Date.now() - startTime;
        
        if (fetchError) {
          logger.error('[INVITE-FLOW] ❌ Erro na consulta básica:', {
            error: fetchError.message,
            code: fetchError.code,
            details: fetchError.details,
            duration: `${duration}ms`
          });
          setError(`Erro na consulta: ${fetchError.message}`);
          return;
        }

        if (!inviteData) {
          logger.warn('[INVITE-FLOW] ⚠️ Convite não encontrado na base de dados:', {
            token: inviteToken.substring(0, 8) + '***',
            duration: `${duration}ms`
          });
          setError('Convite não encontrado ou inválido');
          return;
        }

        logger.info('[INVITE-FLOW] ✅ Dados básicos encontrados:', {
          email: inviteData.email,
          roleId: inviteData.role_id,
          used_at: inviteData.used_at,
          expires_at: inviteData.expires_at,
          duration: `${duration}ms`
        });

        // VERIFICAÇÕES DE VALIDADE
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

        if (inviteData.used_at !== null) {
          logger.warn('[INVITE-FLOW] ✅ Convite já utilizado:', {
            used_at: inviteData.used_at,
            email: inviteData.email
          });
          setError('Convite já foi utilizado');
          return;
        }

        // SEGUNDA CONSULTA: Buscar dados do role (com fallback)
        let roleData = null;
        try {
          logger.info('[INVITE-FLOW] 📡 Buscando dados do role...');
          const { data: role, error: roleError } = await supabase
            .from('user_roles')
            .select('id, name')
            .eq('id', inviteData.role_id)
            .single();

          if (roleError) {
            logger.warn('[INVITE-FLOW] ⚠️ Erro ao buscar role (usando fallback):', roleError);
          } else {
            roleData = role;
          }
        } catch (roleErr) {
          logger.warn('[INVITE-FLOW] ⚠️ Falha na consulta do role (usando fallback):', roleErr);
        }

        // Montar dados finais com fallback
        const finalRole: InviteRole = roleData ? {
          id: roleData.id,
          name: roleData.name
        } : {
          id: inviteData.role_id,
          name: 'Membro' // Fallback
        };

        const finalDuration = Date.now() - startTime;
        logger.info('[INVITE-FLOW] ✅ Convite VÁLIDO confirmado:', {
          email: inviteData.email,
          roleName: finalRole.name,
          roleId: finalRole.id,
          totalDuration: `${finalDuration}ms`
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
          logger.warn('[INVITE-FLOW] ⏰ Timeout após 500ms - liberando formulário');
          setError('Validação demorou demais - preencha os dados manualmente');
        } else {
          logger.error('[INVITE-FLOW] 💥 Erro inesperado na validação:', {
            error: err.message,
            stack: err.stack,
            token: inviteToken.substring(0, 8) + '***',
            duration: `${duration}ms`
          });
          setError(`Erro ao processar convite: ${err.message}`);
        }
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
