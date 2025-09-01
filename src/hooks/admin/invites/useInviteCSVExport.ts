import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Invite } from './types';
import { APP_CONFIG } from '@/config/app';
import { csvExporter } from '@/utils/csvExporter';

export interface CSVExportData {
  destinatario: string;
  telefone: string;
  papel: string;
  canal: string;
  status: string;
  email: string;
  whatsapp: string;
  linkCadastro: string;
}

export function useInviteCSVExport() {
  const [isExporting, setIsExporting] = useState(false);

  const getActiveInvites = useCallback((invites: Invite[]): Invite[] => {
    return invites.filter(invite => {
      const isUsed = !!invite.used_at;
      const isExpired = new Date(invite.expires_at) <= new Date();
      return !isUsed && !isExpired;
    });
  }, []);

  const formatSendStatus = useCallback((invite: Invite, channel: 'email' | 'whatsapp'): string => {
    if (!invite.last_sent_at) {
      return 'Não enviado';
    }

    const sentDate = new Date(invite.last_sent_at);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - sentDate.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) {
      return 'Enviado agora há pouco';
    } else if (diffInMinutes < 60) {
      return `Enviado há ${diffInMinutes} minuto${diffInMinutes > 1 ? 's' : ''}`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `Enviado há ${hours} hora${hours > 1 ? 's' : ''}`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `Enviado há ${days} dia${days > 1 ? 's' : ''}`;
    }
  }, []);

  const formatPhoneNumber = useCallback((phone?: string): string => {
    if (!phone) return 'Não informado';
    
    // Remove todos os caracteres não numéricos
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Verifica se tem formato brasileiro (DDI + DDD + número)
    if (cleanPhone.length >= 13 && cleanPhone.startsWith('55')) {
      const ddi = cleanPhone.slice(0, 2); // 55
      const ddd = cleanPhone.slice(2, 4); // ex: 11
      const number = cleanPhone.slice(4);  // ex: 999999999
      
      // Formatar como +55 (11) 99999-9999
      if (number.length >= 8) {
        const firstPart = number.slice(0, -4);
        const lastPart = number.slice(-4);
        return `+${ddi} (${ddd}) ${firstPart}-${lastPart}`;
      }
    }
    
    // Se não conseguir formatar, retorna o número original ou padrão
    return cleanPhone || 'Não informado';
  }, []);

  const formatChannelPreference = useCallback((preference?: string): string => {
    switch (preference) {
      case 'email':
        return 'Email';
      case 'whatsapp':
        return 'WhatsApp';
      case 'both':
        return 'Ambos';
      default:
        return 'Email';
    }
  }, []);

  const generateCSVData = useCallback((activeInvites: Invite[]): CSVExportData[] => {
    return activeInvites.map(invite => ({
      destinatario: invite.email,
      telefone: formatPhoneNumber(invite.phone),
      papel: invite.role?.name || 'N/A',
      canal: formatChannelPreference(invite.channel_preference),
      status: 'Ativo',
      email: formatSendStatus(invite, 'email'),
      whatsapp: formatSendStatus(invite, 'whatsapp'),
      linkCadastro: APP_CONFIG.getAppUrl(`/convite/${invite.token}`)
    }));
  }, [formatSendStatus, formatChannelPreference, formatPhoneNumber]);

  const exportActiveInvitesCSV = useCallback(async (invites: Invite[]) => {
    if (isExporting) return;

    try {
      setIsExporting(true);

      // Filtrar apenas convites ativos
      const activeInvites = getActiveInvites(invites);

      if (activeInvites.length === 0) {
        toast.error('Nenhum convite ativo encontrado', {
          description: 'Não há convites ativos para exportar no momento.'
        });
        return;
      }

      // Gerar dados do CSV
      const csvData = generateCSVData(activeInvites);

      // Configurar cabeçalhos do CSV
      const headers = {
        destinatario: 'Destinatário',
        telefone: 'Telefone',
        papel: 'Papel',
        canal: 'Canal',
        status: 'Status',
        email: 'Email',
        whatsapp: 'WhatsApp',
        linkCadastro: 'Link de Cadastro'
      };

      // Gerar nome do arquivo com timestamp
      const timestamp = new Date().toISOString().slice(0, 16).replace('T', '-').replace(':', 'h');
      const filename = `convites-ativos-${timestamp}.csv`;

      // Exportar CSV
      csvExporter.exportToCSV(csvData, headers, filename);

      toast.success('CSV exportado com sucesso!', {
        description: `${activeInvites.length} convite${activeInvites.length > 1 ? 's' : ''} ativo${activeInvites.length > 1 ? 's' : ''} exportado${activeInvites.length > 1 ? 's' : ''}.`
      });

    } catch (error) {
      console.error('Erro ao exportar CSV:', error);
      toast.error('Erro ao exportar CSV', {
        description: 'Não foi possível exportar os convites. Tente novamente.'
      });
    } finally {
      setIsExporting(false);
    }
  }, [isExporting, getActiveInvites, generateCSVData]);

  const getActiveInvitesCount = useCallback((invites: Invite[]): number => {
    return getActiveInvites(invites).length;
  }, [getActiveInvites]);

  return {
    exportActiveInvitesCSV,
    getActiveInvitesCount,
    isExporting
  };
}