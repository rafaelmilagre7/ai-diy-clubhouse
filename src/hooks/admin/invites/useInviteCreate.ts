
import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';
import { SendInviteResponse } from './types';
import { useInviteEmailService } from './useInviteEmailService';

export function useInviteCreate() {
  const { user } = useAuth();
  const [isCreating, setIsCreating] = useState(false);
  const { sendInviteEmail, getInviteLink } = useInviteEmailService();

  // Criar novo convite
  const createInvite = useCallback(async (email: string, roleId: string, notes?: string, expiresIn: string = '7 days') => {
    if (!user) return null;
    
    try {
      setIsCreating(true);
      
      const { data, error } = await supabase.rpc('create_invite', {
        p_email: email,
        p_role_id: roleId,
        p_expires_in: expiresIn,
        p_notes: notes
      });
      
      if (error) throw error;
      
      if (data.status === 'error') {
        throw new Error(data.message);
      }
      
      console.log("Convite criado:", data);
      
      // Enviar email de convite
      const inviteUrl = getInviteLink(data.token);
      console.log("Link de convite gerado:", inviteUrl);
      
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('name')
        .eq('id', roleId)
        .single();

      const sendResult = await sendInviteEmail({
        email,
        inviteUrl,
        roleName: roleData?.name || 'membro',
        expiresAt: data.expires_at,
        senderName: user.user_metadata?.name,
        notes,
        inviteId: data.invite_id
      });
      
      console.log("Resultado do envio:", sendResult);
      
      if (!sendResult.success) {
        toast.warning('Convite criado, mas houve um erro ao enviar o e-mail', {
          description: sendResult.error || 'O sistema tentará reenviar o e-mail mais tarde.'
        });
      } else {
        toast.success('Convite criado com sucesso', {
          description: `Um convite para ${email} foi criado e enviado por email.`
        });
      }
      
      return data;
    } catch (err: any) {
      console.error('Erro ao criar convite:', err);
      toast.error('Erro ao criar convite', {
        description: err.message || 'Não foi possível criar o convite.'
      });
      return null;
    } finally {
      setIsCreating(false);
    }
  }, [user, sendInviteEmail, getInviteLink]);

  return {
    isCreating,
    createInvite
  };
}
