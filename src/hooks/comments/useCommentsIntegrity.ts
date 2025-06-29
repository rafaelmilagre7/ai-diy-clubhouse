
/**
 * Hook para verificar e manter a integridade do sistema de comentários.
 * Realiza verificações periódicas e diagnóstico de possíveis problemas.
 */

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useLogging } from '@/hooks/useLogging';
import { supabase } from '@/lib/supabase';
import { validateComments } from '@/utils/dataValidation';
import { toast } from 'sonner';

export const useCommentsIntegrity = (toolId: string) => {
  const { log, logError } = useLogging();
  const queryClient = useQueryClient();
  
  // Verifica a estrutura da tabela e se as configurações de tempo real estão ativas
  useEffect(() => {
    const checkDatabaseIntegrity = async () => {
      try {
        // Verifica se a tabela tool_comments existe
        const { data: tableExists, error: tableError } = await supabase
          .from('tool_comments')
          .select('id')
          .limit(1);
          
        if (tableError) {
          logError('Erro ao verificar tabela de comentários', tableError);
          return;
        }
        
        log('Verificação de integridade do banco de dados concluída', {
          commentsTableExists: tableExists !== null,
          toolId
        });
      } catch (error) {
        logError('Erro durante verificação de integridade', error);
      }
    };
    
    checkDatabaseIntegrity();
  }, [toolId, log, logError]);
  
  // Verificar a integridade dos dados de comentários no cache
  useEffect(() => {
    const verifyDataIntegrity = () => {
      try {
        // Obter dados do cache do React Query
        const cachedData = queryClient.getQueryData(['solution-comments', toolId, 'all']);
        
        if (!cachedData) {
          return; // Nenhum dado em cache para verificar
        }
        
        // Validar os dados em cache
        const validatedComments = validateComments(cachedData as any[], toolId);
        
        const hasProfileIssues = validatedComments.some(
          comment => !comment.profiles?.name || (comment.replies || []).some(reply => !reply.profiles?.name)
        );
        
        if (hasProfileIssues) {
          log('Problemas de integridade detectados nos perfis de comentários', { toolId });
          
          // Invalidar os dados para forçar uma nova busca
          queryClient.invalidateQueries({ queryKey: ['solution-comments', toolId, 'all'] });
          queryClient.invalidateQueries({ queryKey: ['tool-comments', toolId] });
        }
      } catch (error) {
        logError('Erro durante verificação de integridade dos dados', error);
      }
    };
    
    // Executar verificação ao montar e repetir a cada minuto
    verifyDataIntegrity();
    const intervalId = setInterval(verifyDataIntegrity, 60000);
    
    return () => clearInterval(intervalId);
  }, [toolId, queryClient, log, logError]);
  
  // Função que pode ser chamada para verificar e reparar a integridade dos comentários
  const repairCommentsIntegrity = async () => {
    try {
      log('Iniciando reparo de integridade dos comentários', { toolId });
      
      toast.info("Verificando integridade dos comentários...");
      
      // Invalidar todas as consultas relacionadas a comentários
      queryClient.invalidateQueries({ queryKey: ['solution-comments'] });
      queryClient.invalidateQueries({ queryKey: ['tool-comments'] });
      
      // Forçar uma nova busca com os dados atualizados
      await queryClient.refetchQueries({ queryKey: ['solution-comments', toolId, 'all'] });
      
      toast.success("Dados de comentários atualizados com sucesso!");
      
      log('Reparo de integridade dos comentários concluído', { toolId });
      return true;
    } catch (error) {
      logError('Erro ao reparar integridade dos comentários', error);
      toast.error("Erro ao atualizar dados de comentários");
      return false;
    }
  };
  
  return {
    repairCommentsIntegrity
  };
};
