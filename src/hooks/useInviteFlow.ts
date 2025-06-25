
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { tokenAudit } from '@/utils/tokenAuditLogger';
import { logger } from '@/utils/logger';

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
    if (!token) {
      setInviteDetails(null);
      setError(null);
      return;
    }

    const fetchInviteDetails = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // AUDITORIA: Token recebido para validação
        tokenAudit.logStep('INVITE_VALIDATION_START', token, 'useInviteFlow', {
          action: 'fetchInviteDetails'
        });
        
        logger.info('[INVITE-FLOW] 🔍 Buscando detalhes COMPLETOS do convite:', {
          token: token.substring(0, 8) + '***',
          tokenLength: token.length
        });

        // QUERY EXPANDIDA - buscar dados completos do convite
        const { data, error: supabaseError } = await supabase
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

        // AUDITORIA: Resultado da query
        tokenAudit.logStep('SUPABASE_QUERY_EXECUTED', token, 'supabase', {
          hasResult: !!data,
          error: supabaseError?.message,
          queryType: 'expanded_invite_data'
        });

        if (supabaseError) {
          logger.error('[INVITE-FLOW] ❌ Erro na query Supabase:', supabaseError, {
            token: token.substring(0, 8) + '***',
            tokenLength: token.length,
            errorCode: supabaseError.code,
            errorMessage: supabaseError.message
          });
          throw new Error(`Erro na consulta: ${supabaseError.message}`);
        }

        if (!data) {
          logger.warn('[INVITE-FLOW] ⚠️ Convite não encontrado:', {
            token: token.substring(0, 8) + '***',
            tokenLength: token.length
          });
          throw new Error('Convite não encontrado ou token inválido');
        }

        // Verificar se já foi usado
        if (data.used_at) {
          logger.warn('[INVITE-FLOW] ⚠️ Convite já utilizado:', {
            token: token.substring(0, 8) + '***',
            usedAt: data.used_at
          });
          throw new Error('Convite já foi utilizado');
        }

        // Verificar se expirou
        const now = new Date();
        const expiresAt = new Date(data.expires_at);
        if (now > expiresAt) {
          logger.warn('[INVITE-FLOW] ⚠️ Convite expirado:', {
            token: token.substring(0, 8) + '***',
            expiresAt: data.expires_at,
            now: now.toISOString()
          });
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

        // AUDITORIA: Convite validado com sucesso
        tokenAudit.logStep('INVITE_VALIDATED_SUCCESS', token, 'validation_success', {
          email: inviteData.email,
          hasName: !!inviteData.name,
          hasWhatsApp: !!inviteData.whatsapp_number,
          roleName: inviteData.role.name
        });

        setInviteDetails(inviteData);
        
        logger.info('[INVITE-FLOW] ✅ Convite validado com dados COMPLETOS:', {
          token: token.substring(0, 8) + '***',
          email: inviteData.email,
          hasName: !!inviteData.name,
          hasWhatsApp: !!inviteData.whatsapp_number,
          roleName: inviteData.role.name
        });

      } catch (err: any) {
        logger.error('[INVITE-FLOW] ❌ Erro ao buscar convite:', err, {
          token: token.substring(0, 8) + '***',
          tokenLength: token.length
        });
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInviteDetails();
  }, [token]);

  return { inviteDetails, isLoading, error };
};
