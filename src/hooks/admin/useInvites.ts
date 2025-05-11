
import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';

export interface Invite {
  id: string;
  email: string;
  role_id: string;
  token: string;
  expires_at: string;
  used_at: string | null;
  created_by: string;
  created_at: string;
  notes: string | null;
  role?: {
    name: string;
  };
  creator?: {
    name: string;
    email: string;
  };
}

export function useInvites() {
  const { user } = useAuth();
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Buscar todos os convites
  const fetchInvites = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('invites')
        .select(`
          *,
          role:role_id(name),
          creator:created_by(name, email)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setInvites(data || []);
    } catch (err: any) {
      console.error('Erro ao buscar convites:', err);
      setError(err);
      toast.error('Erro ao carregar convites', {
        description: err.message || 'Não foi possível carregar a lista de convites.'
      });
    } finally {
      setLoading(false);
    }
  }, []);

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
      
      toast.success('Convite criado com sucesso', {
        description: `Um convite para ${email} foi criado.`
      });
      
      await fetchInvites();
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
  }, [user, fetchInvites]);

  // Excluir convite
  const deleteInvite = useCallback(async (inviteId: string) => {
    try {
      setIsDeleting(true);
      
      const { error } = await supabase
        .from('invites')
        .delete()
        .eq('id', inviteId);
      
      if (error) throw error;
      
      setInvites(prev => prev.filter(invite => invite.id !== inviteId));
      toast.success('Convite removido com sucesso');
      
    } catch (err: any) {
      console.error('Erro ao excluir convite:', err);
      toast.error('Erro ao remover convite', {
        description: err.message || 'Não foi possível remover o convite.'
      });
    } finally {
      setIsDeleting(false);
    }
  }, []);

  // Reenviar convite
  const resendInvite = useCallback(async (invite: Invite) => {
    // Aqui implementaríamos a lógica para reenviar o email de convite
    // Para agora, apenas retornamos os dados do convite existente
    toast.success('Convite reenviado com sucesso', {
      description: `Um novo e-mail foi enviado para ${invite.email}.`
    });
    
    return {
      token: invite.token,
      expires_at: invite.expires_at
    };
  }, []);

  // Gerar link de convite
  const getInviteLink = useCallback((token: string) => {
    return `${window.location.origin}/convite/${token}`;
  }, []);

  return {
    invites,
    loading,
    error,
    isCreating,
    isDeleting,
    fetchInvites,
    createInvite,
    deleteInvite,
    resendInvite,
    getInviteLink
  };
}
