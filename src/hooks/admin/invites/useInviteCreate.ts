
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import type { CreateInviteParams, CreateInviteResult } from './types';

export function useInviteCreate() {
  const [loading, setLoading] = useState(false);

  const createInvite = async (params: CreateInviteParams): Promise<CreateInviteResult | null> => {
    setLoading(true);
    try {
      console.log('🎯 [CREATE-INVITE] Criando convite:', params);

      // Criar o convite no banco
      const { data: dbResult, error: dbError } = await supabase.rpc('create_invite', {
        p_email: params.email,
        p_role_id: params.roleId,
        p_expires_in: `${params.expiresIn || '7 days'}`,
        p_notes: params.notes
      });

      if (dbError) {
        console.error('❌ [CREATE-INVITE] Erro no banco:', dbError);
        toast.error(`Erro ao criar convite: ${dbError.message}`);
        return null;
      }

      const dbResponse = dbResult as any;
      console.log('✅ [CREATE-INVITE] Convite criado no banco:', dbResponse);

      if (dbResponse.status !== 'success') {
        toast.error(dbResponse.message);
        return null;
      }

      // Tentar enviar o email
      try {
        const { data: emailResult, error: emailError } = await supabase.functions.invoke('send-invite', {
          body: {
            email: params.email,
            token: dbResponse.token,
            roleId: params.roleId
          }
        });

        if (emailError) {
          console.warn('⚠️ [CREATE-INVITE] Erro no envio de email:', emailError);
          toast.warning('Convite criado, mas houve problema no envio do email');
          return {
            status: 'partial_success',
            message: 'Convite criado com sucesso, mas email não foi enviado',
            inviteId: dbResponse.invite_id
          };
        }

        console.log('✅ [CREATE-INVITE] Email enviado:', emailResult);
        toast.success('Convite criado e enviado com sucesso!');

        return {
          status: 'success',
          message: 'Convite criado e enviado com sucesso',
          inviteId: dbResponse.invite_id
        };

      } catch (emailError: any) {
        console.warn('⚠️ [CREATE-INVITE] Falha no envio de email:', emailError);
        toast.warning('Convite criado, mas houve problema no envio do email');
        
        return {
          status: 'partial_success',
          message: 'Convite criado com sucesso, mas email não foi enviado',
          inviteId: dbResponse.invite_id
        };
      }

    } catch (error: any) {
      console.error('❌ [CREATE-INVITE] Erro geral:', error);
      toast.error(`Erro ao criar convite: ${error.message}`);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    createInvite,
    loading
  };
}
