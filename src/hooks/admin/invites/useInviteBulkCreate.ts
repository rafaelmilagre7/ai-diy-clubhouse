import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';
import { type CleanedContact } from '@/utils/contactDataCleaner';
import { useRoleMapping } from './useRoleMapping';
import { devLog } from '@/utils/devLogger';

export interface BulkInviteItem {
  contact: CleanedContact;
  status: 'pending' | 'creating' | 'sending' | 'success' | 'error';
  inviteId?: string;
  error?: string;
  sentVia?: string;
}

export interface BulkInviteProgress {
  total: number;
  processed: number;
  successful: number;
  failed: number;
  items: BulkInviteItem[];
  isRunning: boolean;
}

export const useInviteBulkCreate = () => {
  const { user } = useAuth();
  const { getRoleId, getDefaultRoleId } = useRoleMapping();
  const [progress, setProgress] = useState<BulkInviteProgress>({
    total: 0,
    processed: 0,
    successful: 0,
    failed: 0,
    items: [],
    isRunning: false
  });

  const createBulkInvites = async (
    contacts: CleanedContact[],
    roleId: string,
    expiresIn: string = '7 days'
  ) => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return;
    }

    try {
      devLog.api(`Iniciando criação em lote de ${contacts.length} convites`);

      // Verificar se contatos têm papéis individuais
      const hasIndividualRoles = contacts.some(contact => 
        contact.cleaned.role && contact.cleaned.role !== 'convidado'
      );

      devLog.debug(`Contatos com papéis individuais: ${hasIndividualRoles}`);

      // Inicializar progresso
      const items: BulkInviteItem[] = contacts.map(contact => ({
        contact,
        status: 'pending'
      }));

      setProgress({
        total: contacts.length,
        processed: 0,
        successful: 0,
        failed: 0,
        items,
        isRunning: true
      });

      let batchResult;

      if (hasIndividualRoles) {
        // Processar individualmente quando têm papéis diversos
        devLog.data('Processando convites individualmente...');
        batchResult = await processIndividualInvites(contacts);
      } else {
        // Usar RPC batch quando todos têm o mesmo papel
        devLog.api('Criando convites via RPC batch...');
        
        // Determinar papel a usar
        const finalRoleId = roleId === 'default' ? getDefaultRoleId() : roleId;
        if (!finalRoleId) {
          throw new Error('Papel não encontrado. Selecione um papel válido.');
        }

        // Preparar dados para a nova estrutura da RPC
        const inviteData = contacts.map(contact => ({
          email: contact.cleaned.email,
          role_id: finalRoleId,
          whatsapp_number: contact.cleaned.phone,
          notes: contact.cleaned.notes,
          preferred_channel: contact.cleaned.channel || (contact.cleaned.phone ? 'whatsapp' : 'email')
        }));

        const { data, error: batchError } = await supabase.rpc('create_invite_batch', {
          p_invites: inviteData
        });

        if (batchError) {
          console.error('❌ [BULK-INVITE] Erro no RPC:', batchError);
          throw batchError;
        }

        batchResult = data;
      }

      devLog.success('Convites criados:', batchResult);

      // Verificar se RPC retornou sucesso
      if (!batchResult || !batchResult.success) {
        throw new Error(batchResult?.error || 'Erro na criação dos convites');
      }

      // Atualizar status dos items criados usando nova estrutura
      const createdInvites = batchResult.created || [];
      const failedInvites = batchResult.failed || [];
      
      devLog.data('Convites criados:', createdInvites);
      devLog.error('Convites falharam:', failedInvites);

      const updatedItems = items.map(item => {
        // Buscar convite criado por email
        const createdInvite = createdInvites.find((inv: any) => 
          inv.email === item.contact.cleaned.email
        );
        
        if (createdInvite) {
          return {
            ...item,
            status: 'creating' as const,
            inviteId: createdInvite.invite_id
          };
        }

        // Buscar se falhou
        const failedInvite = failedInvites.find((inv: any) => 
          inv.email === item.contact.cleaned.email
        );
        
        if (failedInvite) {
          return {
            ...item,
            status: 'error' as const,
            error: failedInvite.error || 'Erro na criação'
          };
        }

        // Se não encontrou nem em created nem em failed
        return {
          ...item,
          status: 'error' as const,
          error: 'Status desconhecido'
        };
      });

      setProgress(prev => ({
        ...prev,
        items: updatedItems,
        failed: updatedItems.filter(item => item.status === 'error').length
      }));

      // Enviar convites via Edge Function
      devLog.api('Iniciando envio em lote...');
      
      const invitesData = updatedItems
        .filter(item => item.status === 'creating' && item.inviteId)
        .map(item => ({
          inviteId: item.inviteId!,
          email: item.contact.cleaned.email,
          whatsapp_number: item.contact.cleaned.phone,
          roleId: roleId,
          channel: item.contact.cleaned.channel || 'email',
          expiresIn: item.contact.cleaned.expires_in || '7 days',
          notes: item.contact.cleaned.notes
        }));

      const { data: sendResult, error: sendError } = await supabase.functions.invoke('bulk-invite-sender', {
        body: {
          invites: invitesData,
          expiresIn
        }
      });

      if (sendError) {
        devLog.error('Erro no envio:', sendError);
        throw sendError;
      }

      devLog.success('Resultado do envio:', sendResult);

      // Atualizar status final
      const finalItems = updatedItems.map((item, index) => {
        if (item.status === 'error') return item;
        
        const sendItem = sendResult.results?.[index];
        if (sendItem?.success) {
          return {
            ...item,
            status: 'success' as const,
            sentVia: sendItem.method
          };
        } else {
          return {
            ...item,
            status: 'error' as const,
            error: sendItem?.error || 'Erro no envio'
          };
        }
      });

      const successful = finalItems.filter(item => item.status === 'success').length;
      const failed = finalItems.filter(item => item.status === 'error').length;

      setProgress({
        total: contacts.length,
        processed: contacts.length,
        successful,
        failed,
        items: finalItems,
        isRunning: false
      });

      if (successful > 0) {
        toast.success(`${successful} convites enviados com sucesso!`, {
          description: failed > 0 ? `${failed} falharam` : undefined
        });
      }

      if (failed > 0) {
        toast.error(`${failed} convites falharam`, {
          description: `${successful} foram enviados com sucesso`
        });
      }

      return {
        successful,
        failed,
        total: contacts.length
      };

    } catch (error: any) {
      console.error('❌ [BULK-INVITE] Erro crítico:', error);
      
      setProgress(prev => ({
        ...prev,
        isRunning: false,
        items: prev.items.map(item => 
          item.status === 'pending' || item.status === 'creating'
            ? { ...item, status: 'error', error: error.message }
            : item
        ),
        failed: prev.items.length
      }));

      toast.error('Erro no envio em lote', {
        description: error.message || 'Não foi possível processar os convites'
      });
    }
  };

  // Função para processar convites individualmente
  const processIndividualInvites = async (contacts: CleanedContact[]) => {
    const results = [];
    
    for (const contact of contacts) {
      try {
        const contactRole = contact.cleaned.role || 'convidado';
        const contactRoleId = getRoleId(contactRole);
        
        if (!contactRoleId) {
          results.push({
            success: false,
            error: `Papel "${contactRole}" não encontrado`,
            email: contact.cleaned.email
          });
          continue;
        }

        devLog.api(`Criando convite para ${contact.cleaned.email} com papel ${contactRole}`);
        
        const inviteData = [{
          email: contact.cleaned.email,
          role_id: contactRoleId,
          whatsapp_number: contact.cleaned.phone,
          notes: contact.cleaned.notes,
          preferred_channel: contact.cleaned.channel || (contact.cleaned.phone ? 'whatsapp' : 'email')
        }];

        const { data, error } = await supabase.rpc('create_invite_batch', {
          p_invites: inviteData
        });

        if (error) {
          results.push({
            success: false,
            error: error.message,
            email: contact.cleaned.email
          });
        } else if (data?.success && data.created?.[0]) {
          results.push({
            success: true,
            invite_id: data.created[0].invite_id,
            email: contact.cleaned.email
          });
        } else {
          results.push({
            success: false,
            error: data?.failed?.[0]?.error || 'Resposta inesperada do servidor',
            email: contact.cleaned.email
          });
        }
      } catch (error: any) {
        results.push({
          success: false,
          error: error.message,
          email: contact.cleaned.email
        });
      }
    }
    
    return { 
      success: true,
      created: results.filter(r => r.success).map(r => ({
        invite_id: r.invite_id,
        email: r.email
      })),
      failed: results.filter(r => !r.success).map(r => ({
        email: r.email,
        error: r.error
      })),
      stats: {
        total: results.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length
      }
    };
  };

  const resetProgress = () => {
    setProgress({
      total: 0,
      processed: 0,
      successful: 0,
      failed: 0,
      items: [],
      isRunning: false
    });
  };

  return {
    createBulkInvites,
    progress,
    resetProgress,
    isCreating: progress.isRunning
  };
};