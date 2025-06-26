
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { tokenAudit } from '@/utils/tokenAuditLogger';
import { logger } from '@/utils/logger';
import AuthManager from '@/services/AuthManager';

interface InviteDetails {
  email: string;
  name?: string;
  whatsapp_number?: string;
  role: {
    id: string;
    name: string;
    description: string;
  };
  expires_at: string;
  created_at: string;
}

export const useInviteFlow = (token?: string) => {
  const [inviteDetails, setInviteDetails] = useState<InviteDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Se não há token, limpar estado e retornar
    if (!token) {
      setInviteDetails(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    // Verificar se AuthManager já tem detalhes do convite
    const authManager = AuthManager.getInstance();
    const authState = authManager.getState();
    
    if (authState.hasInviteToken && authState.inviteDetails) {
      logger.info('[INVITE-FLOW] 🔄 Usando detalhes do AuthManager');
      setInviteDetails(authState.inviteDetails);
      setIsLoading(false);
      return;
    }

    const fetchInviteDetails = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        tokenAudit.logStep('INVITE_VALIDATION_START', token, 'useInviteFlow', {
          action: 'fetchInviteDetails'
        });
        
        logger.info('[INVITE-FLOW] 🔍 Buscando detalhes do convite com timeout OTIMIZADO', {
          token: token.substring(0, 8) + '***',
          tokenLength: token.length
        });

        // TIMEOUT MAIS AGRESSIVO: 2 segundos
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout na busca do convite')), 2000)
        );

        const queryPromise = supabase
          .from('invites')
          .select(`
            email,
            name,
            whatsapp_number,
            expires_at,
            created_at,
            used_at,
            user_roles!inner(id, name, description)
          `)
          .eq('token', token)
          .maybeSingle();

        const { data, error: supabaseError } = await Promise.race([
          queryPromise,
          timeoutPromise
        ]) as any;

        tokenAudit.logStep('SUPABASE_QUERY_EXECUTED', token, 'supabase', {
          hasResult: !!data,
          error: supabaseError?.message,
          queryType: 'expanded_invite_data'
        });

        if (supabaseError) {
          logger.error('[INVITE-FLOW] ❌ Erro na query Supabase', supabaseError);
          throw new Error(`Erro na consulta: ${supabaseError.message}`);
        }

        if (!data) {
          logger.warn('[INVITE-FLOW] ⚠️ Convite não encontrado');
          throw new Error('Convite não encontrado ou token inválido');
        }

        // Verificar se já foi usado
        if (data.used_at) {
          logger.warn('[INVITE-FLOW] ⚠️ Convite já utilizado');
          throw new Error('Convite já foi utilizado');
        }

        // Verificar se expirou
        const now = new Date();
        const expiresAt = new Date(data.expires_at);
        if (now > expiresAt) {
          logger.warn('[INVITE-FLOW] ⚠️ Convite expirado');
          throw new Error('Convite expirado');
        }

        // SUCESSO: Processar dados COMPLETOS do convite
        const inviteData: InviteDetails = {
          email: data.email,
          name: data.name || undefined,
          whatsapp_number: data.whatsapp_number || undefined,
          role: Array.isArray(data.user_roles) ? data.user_roles[0] : data.user_roles,
          expires_at: data.expires_at,
          created_at: data.created_at
        };

        tokenAudit.logStep('INVITE_VALIDATED_SUCCESS', token, 'validation_success', {
          email: inviteData.email,
          hasName: !!inviteData.name,
          hasWhatsApp: !!inviteData.whatsapp_number,
          roleName: inviteData.role.name
        });

        setInviteDetails(inviteData);
        
        logger.info('[INVITE-FLOW] ✅ Convite validado OTIMIZADO', {
          token: token.substring(0, 8) + '***',
          email: inviteData.email,
          roleName: inviteData.role.name
        });

      } catch (err: any) {
        logger.error('[INVITE-FLOW] ❌ Erro ao buscar convite', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    // TIMEOUT ABSOLUTO MAIS AGRESSIVO: 3 segundos
    const absoluteTimeout = setTimeout(() => {
      if (isLoading) {
        logger.error('[INVITE-FLOW] 🚨 TIMEOUT ABSOLUTO - liberando após 3s');
        setIsLoading(false);
        if (!error && !inviteDetails) {
          setError('Timeout na verificação do convite');
        }
      }
    }, 3000);

    fetchInviteDetails();

    return () => clearTimeout(absoluteTimeout);
  }, [token, isLoading, error, inviteDetails]);

  return { inviteDetails, isLoading, error };
};
