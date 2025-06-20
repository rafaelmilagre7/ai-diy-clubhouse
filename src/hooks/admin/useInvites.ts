
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface Invite {
  id: string;
  email: string;
  role_id: string;
  token: string;
  expires_at: string;
  used_at: string | null;
  created_at: string;
  created_by: string;
  last_sent_at: string | null;
  send_attempts: number;
  notes: string | null;
  user_roles: {
    id: string;
    name: string;
    description: string;
  } | null;
}

export const useInvites = () => {
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchInvites = useCallback(async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('invites')
        .select(`
          id,
          email,
          role_id,
          token,
          expires_at,
          used_at,
          created_at,
          created_by,
          last_sent_at,
          send_attempts,
          notes,
          user_roles:role_id(id, name, description)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Mapear os dados para garantir compatibilidade
      const mappedInvites = (data as any)?.map((invite: any) => ({
        id: invite.id,
        email: invite.email,
        role_id: invite.role_id,
        token: invite.token,
        expires_at: invite.expires_at,
        used_at: invite.used_at,
        created_at: invite.created_at,
        created_by: invite.created_by || 'Sistema',
        last_sent_at: invite.last_sent_at,
        send_attempts: invite.send_attempts || 0,
        notes: invite.notes,
        user_roles: invite.user_roles
      })) || [];

      setInvites(mappedInvites);
    } catch (error) {
      console.error('Erro ao buscar convites:', error);
      toast({
        title: "Erro ao carregar convites",
        description: "Ocorreu um erro ao carregar a lista de convites.",
        variant: "destructive",
      });
      setInvites([]);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const createInvite = async (email: string, roleId: string, notes?: string) => {
    try {
      const { data, error } = await supabase.rpc('create_invite', {
        p_email: email,
        p_role_id: roleId,
        p_expires_in: '7 days',
        p_notes: notes
      });

      if (error) throw error;

      const result = data as any;
      
      if (result?.status === 'error') {
        throw new Error(result.message || 'Erro ao criar convite');
      }

      toast({
        title: "Convite criado!",
        description: `Convite para ${email} foi criado com sucesso.`,
      });

      // Recarregar a lista
      await fetchInvites();

      return result;
    } catch (error: any) {
      console.error('Erro ao criar convite:', error);
      toast({
        title: "Erro ao criar convite",
        description: error.message || "Ocorreu um erro inesperado",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteInvite = async (inviteId: string) => {
    try {
      const { error } = await supabase
        .from('invites')
        .delete()
        .eq('id', inviteId as any);

      if (error) throw error;

      toast({
        title: "Convite excluído",
        description: "O convite foi removido com sucesso.",
      });

      // Recarregar a lista
      await fetchInvites();
    } catch (error: any) {
      console.error('Erro ao excluir convite:', error);
      toast({
        title: "Erro ao excluir convite",
        description: error.message || "Ocorreu um erro inesperado",
        variant: "destructive",
      });
      throw error;
    }
  };

  const resendInvite = async (invite: Invite) => {
    try {
      // Atualizar tentativas de envio
      const { error: updateError } = await supabase.rpc('update_invite_send_attempt', {
        invite_id: invite.id
      });

      if (updateError) {
        console.warn('Erro ao atualizar tentativas:', updateError);
      }

      toast({
        title: "Convite reenviado",
        description: `O convite foi reenviado para ${invite.email}.`,
      });

      // Recarregar a lista
      await fetchInvites();
    } catch (error: any) {
      console.error('Erro ao reenviar convite:', error);
      toast({
        title: "Erro ao reenviar convite",
        description: error.message || "Ocorreu um erro inesperado",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchInvites();
  }, [fetchInvites]);

  return {
    invites,
    loading,
    fetchInvites,
    createInvite,
    deleteInvite,
    resendInvite
  };
};
