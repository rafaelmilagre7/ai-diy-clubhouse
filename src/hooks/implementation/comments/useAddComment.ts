
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useLogging } from '@/hooks/useLogging';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export const useAddComment = (solutionId: string, moduleId: string) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  const { logError, log } = useLogging();

  const addComment = async (content: string, parentId?: string) => {
    if (!content.trim()) {
      toast.error('O comentário não pode estar vazio');
      return false;
    }

    try {
      setIsSubmitting(true);
      log('Tentando adicionar comentário', { solutionId, moduleId, parentId, contentLength: content.length });
      
      // Verificar autenticação do usuário
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData.user) {
        toast.error('Você precisa estar logado para comentar');
        logError('Erro de autenticação ao adicionar comentário', authError || new Error('Usuário não autenticado'));
        return false;
      }
      
      // Verificamos se a tabela tool_comments existe
      const { data: checkTable } = await supabase
        .from('tool_comments')
        .select('id')
        .limit(1);
      
      // Use a tabela tool_comments em vez de solution_comments
      const tableName = checkTable !== null ? 'tool_comments' : 'solution_comments';
      const idField = 'tool_id';
      log(`Usando tabela ${tableName} para adicionar comentário`, { solutionId, moduleId });
      
      const commentData = {
        [idField]: solutionId,
        user_id: authData.user.id,
        content: content.trim(),
        parent_id: parentId || null
      };
      
      log('Dados do comentário', commentData);
      
      const { error, data } = await supabase
        .from(tableName)
        .insert(commentData)
        .select();
        
      if (error) {
        logError('Erro ao adicionar comentário', { error, details: error.details, hint: error.hint, code: error.code });
        throw error;
      }
      
      log('Comentário adicionado com sucesso', { commentId: data?.[0]?.id });
      toast.success(parentId ? 'Resposta enviada com sucesso!' : 'Comentário enviado com sucesso!');

      // 📢 Criar notificação para o autor do comentário pai (se for resposta)
      if (parentId && data?.[0]) {
        const { data: parentComment } = await supabase
          .from(tableName)
          .select('user_id, content')
          .eq('id', parentId)
          .single();

        if (parentComment && parentComment.user_id !== authData.user.id) {
          // Buscar informações do usuário que respondeu
          const { data: profile } = await supabase
            .from('profiles')
            .select('name')
            .eq('id', authData.user.id)
            .single();

          const contentPreview = content.trim().substring(0, 100);
          
          await supabase
            .from('notifications')
            .insert({
              user_id: parentComment.user_id,
              actor_id: authData.user.id,
              type: 'comment_replied',
              title: `${profile?.name || 'Alguém'} respondeu seu comentário`,
              message: `"${contentPreview}${content.trim().length > 100 ? '...' : ''}"`,
              action_url: `/solucoes/${solutionId}/modulos/${moduleId}#comment-${data[0].id}`,
              category: 'engagement',
              priority: 2
            });
        }
      }
      
      // Invalidar queries para atualizar a lista
      queryClient.invalidateQueries({ queryKey: ['solution-comments', solutionId, moduleId] });
      
      // Forçar uma segunda atualização após um pequeno delay para garantir que os dados estejam atualizados
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['solution-comments', solutionId, moduleId] });
      }, 500);
      
      return true;
    } catch (error: any) {
      logError('Erro ao adicionar comentário', error);
      toast.error(`Erro ao enviar comentário: ${error.message || 'Erro desconhecido'}`);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { addComment, isSubmitting };
};
