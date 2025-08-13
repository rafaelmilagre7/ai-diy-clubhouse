import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";

interface BulkReactivateResponse {
  success: boolean;
  message: string;
  data?: {
    reactivated_count: number;
    failed_count: number;
    days_extension: number;
    errors: any[];
  };
  error?: string;
  error_code?: string;
}

export const useInviteBulkReactivate = () => {
  const [isBulkReactivating, setIsBulkReactivating] = useState(false);

  const bulkReactivateExpiredInvites = async (daysExtension = 7): Promise<boolean> => {
    setIsBulkReactivating(true);
    
    try {
      logger.info('[BULK_REACTIVATE] Iniciando reativação em lote...', { daysExtension });
      
      const { data, error } = await supabase.rpc('reactivate_all_expired_invites_secure', {
        p_days_extension: daysExtension
      });

      if (error) {
        logger.error('[BULK_REACTIVATE] Erro na função RPC:', error);
        toast.error('Erro na reativação', {
          description: 'Falha ao conectar com o servidor. Tente novamente.'
        });
        return false;
      }

      const response = data as BulkReactivateResponse;
      
      if (!response.success) {
        logger.error('[BULK_REACTIVATE] Operação falhou:', response);
        
        if (response.error_code === 'RATE_LIMITED') {
          toast.error('Muitas tentativas', {
            description: response.error || 'Aguarde antes de tentar novamente.'
          });
        } else if (response.error_code === 'UNAUTHORIZED') {
          toast.error('Acesso negado', {
            description: 'Apenas administradores podem reativar convites.'
          });
        } else {
          toast.error('Erro na reativação', {
            description: response.error || 'Erro desconhecido'
          });
        }
        return false;
      }

      // Sucesso na operação
      const { reactivated_count, failed_count } = response.data || {};
      
      logger.info('[BULK_REACTIVATE] Operação concluída:', response.data);
      
      if (reactivated_count && reactivated_count > 0) {
        if (failed_count && failed_count > 0) {
          toast.warning('Reativação parcial', {
            description: `${reactivated_count} convites reativados, ${failed_count} falharam.`
          });
        } else {
          toast.success('Convites reativados!', {
            description: `${reactivated_count} convites foram reativados com sucesso por ${daysExtension} dias.`
          });
        }
        return true;
      } else {
        toast.info('Nenhum convite processado', {
          description: 'Não foram encontrados convites expirados para reativar.'
        });
        return false;
      }

    } catch (error) {
      logger.error('[BULK_REACTIVATE] Erro inesperado:', error);
      toast.error('Erro inesperado', {
        description: 'Falha na comunicação com o servidor'
      });
      return false;
    } finally {
      setIsBulkReactivating(false);
    }
  };

  return {
    bulkReactivateExpiredInvites,
    isBulkReactivating
  };
};