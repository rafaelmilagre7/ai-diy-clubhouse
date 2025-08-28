import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';
import { type CleanedContact } from '@/utils/contactDataCleaner';
import { useRoleMapping } from './useRoleMapping';

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
      console.log(`📦 [BULK-INVITE] Iniciando criação em lote de ${contacts.length} convites`);

      // Verificar se contatos têm papéis individuais
      const hasIndividualRoles = contacts.some(contact => 
        contact.cleaned.role && contact.cleaned.role !== 'convidado'
      );

      console.log(`🔍 [BULK-INVITE] Contatos com papéis individuais: ${hasIndividualRoles}`);

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
        console.log('🔄 [BULK-INVITE] Processando convites individualmente...');
        batchResult = await processIndividualInvites(contacts);
      } else {
        // Usar RPC batch quando todos têm o mesmo papel
        console.log('📧 [BULK-INVITE] Criando convites via RPC batch...');
        
        // Determinar papel a usar
        const finalRoleId = roleId === 'default' ? getDefaultRoleId() : roleId;
        if (!finalRoleId) {
          throw new Error('Papel não encontrado. Selecione um papel válido.');
        }

        const emails = contacts.map(contact => contact.cleaned.email);
        const { data, error: batchError } = await supabase.rpc('create_invite_batch', {
          p_emails: emails,
          p_role_id: finalRoleId,
          p_expires_in: expiresIn
        });

        if (batchError) {
          console.error('❌ [BULK-INVITE] Erro no RPC:', batchError);
          throw batchError;
        }

        batchResult = data;
      }

      console.log('✅ [BULK-INVITE] Convites criados:', batchResult);

      // Atualizar status dos items criados
      const updatedItems = items.map((item, index) => {
        let batchItem;
        
        if (hasIndividualRoles) {
          // Para processamento individual, buscar resultado por email
          batchItem = batchResult.invites?.find(inv => 
            inv.email === item.contact.cleaned.email
          );
        } else {
          // Para processamento batch, usar índice
          batchItem = batchResult.invites?.[index];
        }

        if (batchItem?.success || batchItem?.invite_id) {
          return {
            ...item,
            status: 'creating' as const,
            inviteId: batchItem.invite_id
          };
        } else {
          return {
            ...item,
            status: 'error' as const,
            error: batchItem?.error || 'Erro na criação'
          };
        }
      });

      setProgress(prev => ({
        ...prev,
        items: updatedItems,
        failed: updatedItems.filter(item => item.status === 'error').length
      }));

      // Enviar convites via Edge Function
      console.log('📬 [BULK-INVITE] Iniciando envio em lote...');
      
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
        console.error('❌ [BULK-INVITE] Erro no envio:', sendError);
        throw sendError;
      }

      console.log('✅ [BULK-INVITE] Resultado do envio:', sendResult);

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

        console.log(`📧 [INDIVIDUAL-INVITE] Criando convite para ${contact.cleaned.email} com papel ${contactRole}`);
        
        const { data, error } = await supabase.rpc('create_invite_batch', {
          p_emails: [contact.cleaned.email],
          p_role_id: contactRoleId,
          p_expires_in: contact.cleaned.expires_in || '7 days'
        });

        if (error) {
          results.push({
            success: false,
            error: error.message,
            email: contact.cleaned.email
          });
        } else if (data?.invites?.[0]) {
          results.push({
            success: true,
            invite_id: data.invites[0].invite_id,
            email: contact.cleaned.email
          });
        } else {
          results.push({
            success: false,
            error: 'Resposta inesperada do servidor',
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
    
    return { invites: results };
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