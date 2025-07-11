
import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';
import { APP_CONFIG } from '@/config/app';

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
  creator_name?: string;
  creator_email?: string;
  last_sent_at?: string;
  send_attempts?: number;
}

export interface SendInviteResponse {
  success: boolean;
  message: string;
  error?: string;
}

export function useInvites() {
  const { user } = useAuth();
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Buscar todos os convites
  const fetchInvites = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Consulta modificada para evitar o join direto com auth.users
      const { data: invitesData, error: invitesError } = await supabase
        .from('invites')
        .select(`
          *,
          role:role_id(name)
        `)
        .order('created_at', { ascending: false });
      
      if (invitesError) throw invitesError;
      
      // Obter IDs dos criadores para buscar seus perfis separadamente
      const creatorIds = invitesData?.map(invite => invite.created_by) || [];
      
      // Buscar dados dos criadores da tabela de perfis
      const { data: creatorsData, error: creatorsError } = await supabase
        .from('profiles')
        .select('id, name, email')
        .in('id', creatorIds);
        
      if (creatorsError) {
        console.error('Erro ao buscar perfis dos criadores:', creatorsError);
      }
      
      // Mapa de ID para dados do criador
      const creatorsMap = (creatorsData || []).reduce((acc, profile) => {
        acc[profile.id] = { name: profile.name, email: profile.email };
        return acc;
      }, {} as Record<string, { name?: string, email?: string }>);
      
      // Combinar dados de convites com dados de criadores
      const enrichedInvites = (invitesData || []).map(invite => ({
        ...invite,
        creator_name: creatorsMap[invite.created_by]?.name || 'Usuário desconhecido',
        creator_email: creatorsMap[invite.created_by]?.email
      }));
      
      setInvites(enrichedInvites);
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

  // Função para enviar email de convite
  const sendInviteEmail = async ({
    email,
    inviteUrl,
    roleName,
    expiresAt,
    senderName,
    notes,
    inviteId
  }: {
    email: string;
    inviteUrl: string;
    roleName: string;
    expiresAt: string;
    senderName?: string;
    notes?: string;
    inviteId?: string;
  }): Promise<SendInviteResponse> => {
    try {
      setIsSending(true);
      
      console.log("Enviando e-mail com os dados:", {
        email,
        inviteUrl,
        roleName,
        expiresAt,
        senderName,
        notes: notes ? "Presente" : "Ausente",
        inviteId
      });
      
      // Verificar se o URL está correto antes de enviar
      const urlPattern = new RegExp('^https?://[a-z0-9-]+(\\.[a-z0-9-]+)+([/?].*)?$', 'i');
      if (!urlPattern.test(inviteUrl)) {
        console.error("URL inválida gerada para o convite:", inviteUrl);
        return {
          success: false,
          message: 'Erro ao gerar URL do convite',
          error: 'URL inválida gerada'
        };
      }
      
      // Chamar a edge function para envio de email
      const { data, error } = await supabase.functions.invoke('send-invite-email', {
        body: {
          email,
          inviteUrl,
          roleName,
          expiresAt,
          senderName,
          notes,
          inviteId // Passar o ID do convite para atualizar estatísticas
        }
      });
      
      if (error) {
        console.error("Erro ao chamar a edge function:", error);
        throw error;
      }
      
      console.log("Resposta da edge function:", data);
      
      if (!data.success) {
        console.error("Edge function reportou erro:", data.error || data.message);
        throw new Error(data.message || data.error || 'Erro ao enviar e-mail');
      }
      
      return {
        success: true,
        message: 'Email enviado com sucesso'
      };
    } catch (err: any) {
      console.error('Erro ao enviar email de convite:', err);
      return {
        success: false,
        message: 'Erro ao enviar email de convite',
        error: err.message
      };
    } finally {
      setIsSending(false);
    }
  };

  // Reenviar convite
  const resendInvite = useCallback(async (invite: Invite) => {
    try {
      setIsSending(true);
      
      // Buscar o nome do papel
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('name')
        .eq('id', invite.role_id)
        .single();
        
      const inviteUrl = getInviteLink(invite.token);
      
      const sendResult = await sendInviteEmail({
        email: invite.email,
        inviteUrl: inviteUrl,
        roleName: roleData?.name || invite.role?.name || 'membro',
        expiresAt: invite.expires_at,
        notes: invite.notes || undefined,
        inviteId: invite.id // Passar o ID do convite para atualizar estatísticas
      });
      
      if (sendResult.success) {
        toast.success('Convite reenviado com sucesso', {
          description: `Um novo e-mail foi enviado para ${invite.email}.`
        });
        
        // Atualizar o convite na lista com as novas informações de tentativas
        await fetchInvites();
      } else {
        toast.error('Erro ao reenviar convite', {
          description: sendResult.error || 'Não foi possível reenviar o e-mail.'
        });
      }

      return {
        token: invite.token,
        expires_at: invite.expires_at
      };
    } catch (err: any) {
      console.error('Erro ao reenviar convite:', err);
      toast.error('Erro ao reenviar convite', {
        description: err.message || 'Não foi possível reenviar o convite.'
      });
      throw err;
    } finally {
      setIsSending(false);
    }
  }, [fetchInvites]);

  // Gerar link de convite - MELHORADO para maior robustez
  const getInviteLink = useCallback((token: string) => {
    // Verificar se o token existe e tem o formato esperado
    if (!token) {
      console.error("Erro: Token vazio ao gerar link de convite");
      return "";
    }
    
    console.log("Gerando link de convite para token:", token, "comprimento:", token.length);
    
    // Limpar o token de possíveis caracteres problemáticos
    const cleanToken = token.trim().replace(/\s+/g, '');
    
    if (cleanToken !== token) {
      console.warn("Token foi limpo antes de gerar o link. Original:", token, "Limpo:", cleanToken);
    }
    
    // Construir URL absoluta com domínio configurado
    const baseUrl = APP_CONFIG.getAppUrl(`/convite/${cleanToken}`);
    console.log("URL do convite gerado:", baseUrl);
    
    return baseUrl;
  }, []);

  return {
    invites,
    loading,
    error,
    isCreating,
    isDeleting,
    isSending,
    fetchInvites,
    createInvite,
    deleteInvite,
    resendInvite,
    getInviteLink
  };
}
