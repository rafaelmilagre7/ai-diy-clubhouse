
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth";
import { 
  showModernError, 
  showModernLoading, 
  showModernSuccess, 
  showModernErrorWithRetry,
  dismissModernToast 
} from '@/lib/toast-helpers';
import { toast } from 'sonner';
import { Comment } from "@/types/learningTypes";
import { useLogging } from "@/hooks/useLogging";

export const useLessonComments = (lessonId: string) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { log, logError } = useLogging();
  
  // Buscar comentários da lição
  const { 
    data: comments = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['learning-comments', lessonId],
    queryFn: async () => {
      if (!lessonId) return [];
      
      try {
        log('Buscando comentários da aula', { lessonId });
        
        // 1. Buscar comentários principais (não respostas)
        const { data: rootComments, error: rootError } = await supabase
          .from('learning_comments')
          .select('*')
          .eq('lesson_id', lessonId)
          .is('parent_id', null)
          .order('created_at', { ascending: false });
          
        if (rootError) {
          console.error('Query error (root):', rootError);
          logError('Erro ao buscar comentários principais', rootError);
          throw rootError;
        }
        
        // Debug para verificar a estrutura dos dados retornados
        console.log('Root comments data:', rootComments);
        
        // Garantir que rootComments seja um array
        const safeRootComments = Array.isArray(rootComments) ? rootComments : [];
        
        // 2. Buscar respostas aos comentários
        const { data: replies, error: repliesError } = await supabase
          .from('learning_comments')
          .select('*')
          .eq('lesson_id', lessonId)
          .not('parent_id', 'is', null)
          .order('created_at', { ascending: true });
          
        if (repliesError) {
          console.error('Query error (replies):', repliesError);
          logError('Erro ao buscar respostas', repliesError);
          throw repliesError;
        }
        
        // Garantir que replies seja um array
        const safeReplies = Array.isArray(replies) ? replies : [];
        
        // 3. Extrair todos os user_ids dos comentários e respostas
        const userIds = [
          ...new Set([
            ...safeRootComments.map(comment => comment.user_id),
            ...safeReplies.map(reply => reply.user_id)
          ])
        ];
        
        // 4. Buscar perfis dos usuários (usando view pública)
        const { data: userProfiles, error: profilesError } = await supabase
          .from('profiles_community_public')
          .select('id, name, avatar_url')
          .in('id', userIds);
          
        if (profilesError) {
          console.error('Query error (profiles):', profilesError);
          logError('Erro ao buscar perfis dos usuários', profilesError);
          // Não interrompemos o fluxo aqui, podemos continuar mesmo sem perfis
        }
        
        // Criar um mapa de perfis por user_id para facilitar o acesso
        const profilesMap: Record<string, any> = {};
        if (userProfiles && Array.isArray(userProfiles)) {
          userProfiles.forEach(profile => {
            profilesMap[profile.id] = profile;
          });
        }
        
        // Verificar se o usuário curtiu cada comentário
        let userLikes: Record<string, boolean> = {};
        
        if (user) {
          const { data: likesData } = await supabase
            .from('learning_comment_likes')
            .select('comment_id')
            .eq('user_id', user.id);
            
          if (likesData && Array.isArray(likesData)) {
            userLikes = likesData.reduce((acc, like) => {
              acc[like.comment_id] = true;
              return acc;
            }, {} as Record<string, boolean>);
          }
        }
        
        // 5. Organizar comentários com suas respostas e adicionar dados do perfil manualmente
        const organizedComments = safeRootComments.map((comment: Comment) => {
          // Encontrar respostas para este comentário
          const commentReplies = safeReplies
            .filter(reply => reply.parent_id === comment.id)
            .map(reply => ({
              ...reply,
              profiles: profilesMap[reply.user_id] || {
                id: reply.user_id,
                name: "Usuário",
                avatar_url: ""
              },
              user_has_liked: !!userLikes[reply.id]
            }));
          
          // Adicionar dados do perfil ao comentário
          return {
            ...comment,
            profiles: profilesMap[comment.user_id] || {
              id: comment.user_id,
              name: "Usuário",
              avatar_url: ""
            },
            replies: commentReplies,
            user_has_liked: !!userLikes[comment.id]
          };
        });
        
        log('Comentários organizados com sucesso', { total: organizedComments.length });
        return organizedComments;
      } catch (error) {
        console.error('Error fetching comments:', error);
        logError("Erro ao buscar comentários da aula", error);
        throw error;
      }
    },
    enabled: !!lessonId,
    retry: 1
  });
  
  // Adicionar comentário
  const addComment = async (content: string, parentId: string | null = null) => {
    try {
      console.log('[DEBUG-COMMENT] 🚀 Iniciando addComment', { lessonId, hasParentId: !!parentId });
      
      if (!user) {
        showModernError(
          "Login necessário",
          "Você precisa estar logado para comentar nesta aula"
        );
        return;
      }
      
      if (!content.trim()) {
        showModernError(
          "Conteúdo obrigatório",
          "Escreva seu comentário antes de enviar"
        );
        return;
      }
      
      let loadingId: string | number | undefined;
      
      try {
        console.log('[DEBUG-COMMENT] ✅ Dentro do try-catch interno');
        setIsSubmitting(true);
        log('Adicionando comentário à aula', { lessonId, hasParentId: !!parentId });
      
      // Verificar rate limiting
      const { data: canComment } = await supabase.rpc('check_comment_rate_limit', {
        p_user_id: user.id
      });

      if (!canComment) {
        showModernError(
          "Limite atingido",
          "Você atingiu o limite de comentários por hora. Aguarde um pouco antes de comentar novamente.",
          { duration: 6000 }
        );
        setIsSubmitting(false);
        return;
      }
      
      // Adicionar loading toast
      loadingId = showModernLoading(
        "Enviando comentário...",
        parentId ? "Publicando sua resposta" : "Publicando seu comentário"
      );
      console.log('[DEBUG-COMMENT] 📱 Toast de loading criado:', loadingId);
      
      console.log('[DEBUG-COMMENT] 💾 Tentando inserir comentário no banco...');
      const { data, error } = await supabase
        .from('learning_comments')
        .insert({
          lesson_id: lessonId,
          user_id: user.id,
          content: content.trim(),
          parent_id: parentId,
          is_hidden: false
        })
        .select();
      
      console.log('[DEBUG-COMMENT] 🔍 Resposta do banco:', { hasError: !!error, hasData: !!data });
        
      if (error) {
        console.error('[DEBUG-COMMENT] ❌ Erro do Supabase:', error);
        console.error('[DEBUG-COMMENT] 📄 Detalhes:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        logError('Erro ao adicionar comentário à aula', error);
        
        // Melhorar mensagem de erro para o usuário
        const userMessage = error.message || 
          (error.code === '42P01' ? 'Tabela não encontrada no banco de dados' :
           error.code === '42501' ? 'Sem permissão para adicionar comentário' :
           'Erro desconhecido ao salvar comentário');
        
        const enhancedError = new Error(userMessage);
        (enhancedError as any).originalError = error;
        throw enhancedError;
      }

      // Log da ação para auditoria
      await supabase.rpc('log_learning_action', {
        p_action: 'comment_added',
        p_resource_type: 'lesson',
        p_resource_id: lessonId,
        p_details: {
          content_length: content.length,
          has_parent: !!parentId,
          comment_id: data?.[0]?.id
        }
      });

      // 📢 Criar notificação para o autor do comentário pai (se for resposta)
      if (parentId && data?.[0]) {
        const { data: parentComment } = await supabase
          .from('learning_comments')
          .select('user_id, content')
          .eq('id', parentId)
          .single();

        if (parentComment && parentComment.user_id !== user.id) {
          // Buscar informações do usuário que respondeu
          const { data: profile } = await supabase
            .from('profiles')
            .select('name')
            .eq('id', user.id)
            .single();

          const contentPreview = content.trim().substring(0, 100);
          
          await supabase
            .from('notifications')
            .insert({
              user_id: parentComment.user_id,
              actor_id: user.id,
              type: 'comment_replied',
              title: `${profile?.name || 'Alguém'} respondeu seu comentário`,
              message: `"${contentPreview}${content.trim().length > 100 ? '...' : ''}"`,
              action_url: `/formacao/aulas/${lessonId}#comment-${data[0].id}`,
              category: 'engagement',
              priority: 2
            });
        }
      }
      
      dismissModernToast(loadingId);
      showModernSuccess(
        parentId ? "Resposta publicada!" : "Comentário publicado!",
        "Seu comentário está visível para todos na comunidade"
      );
      log('Comentário adicionado com sucesso', { commentId: data?.[0]?.id });
      
      // Invalidar cache para forçar atualização
      queryClient.invalidateQueries({ queryKey: ['learning-comments', lessonId] });
      
      return data;
      } catch (error: any) {
        console.log('[DEBUG-COMMENT] ❌ Erro capturado no catch interno:', error);
        console.log('[DEBUG-COMMENT] 🔧 loadingId no catch:', loadingId);
        logError("Erro ao adicionar comentário à aula", error);
        if (loadingId) dismissModernToast(loadingId);
        
        // Primeiro, tentar toast moderno com retry
        const toastShown = showModernErrorWithRetry(
          "Não foi possível enviar",
          error.message || "Verifique sua conexão e tente novamente",
          () => addComment(content, parentId)
        );

        // Se não retornou um ID válido, usar fallback de emergência
        if (!toastShown) {
          console.warn('[DEBUG-COMMENT] ⚠️ Toast moderno falhou, usando fallback');
          // Tentar sonner direto
          try {
            toast.error("Erro ao enviar comentário", {
              description: error.message || "Verifique sua conexão e tente novamente",
              duration: 5000,
              action: {
                label: "Tentar novamente",
                onClick: () => addComment(content, parentId)
              }
            });
          } catch (sonnerError) {
            // Último recurso: alert
            console.error('[DEBUG-COMMENT] 🔴 Todos os toasts falharam, usando alert');
            alert(`Erro ao enviar comentário: ${error.message || 'Erro desconhecido'}\n\nClique em OK e tente novamente.`);
          }
        }
      } finally {
        setIsSubmitting(false);
      }
    } catch (outerError: any) {
      console.error('[DEBUG-COMMENT] 🔴 ERRO EXTERNO AO TRY-CATCH:', outerError);
      showModernError(
        "Erro inesperado",
        "Ocorreu um erro ao processar seu comentário. Detalhes no console."
      );
      setIsSubmitting(false);
    }
  };
  
  // Excluir comentário
  const deleteComment = async (commentId: string) => {
    if (!user) {
      showModernError(
        "Login necessário", 
        "Você precisa estar logado para excluir comentários"
      );
      return;
    }
    
    let loadingId: string | number | undefined;
    
    try {
      log('Excluindo comentário da aula', { commentId, lessonId });
      
      loadingId = showModernLoading(
        "Excluindo comentário...",
        "Removendo o comentário"
      );
      
      const { error } = await supabase
        .from('learning_comments')
        .delete()
        .eq('id', commentId);
        
      if (error) {
        console.error('Delete error:', error);
        logError('Erro ao excluir comentário da aula', error);
        throw error;
      }
      
      dismissModernToast(loadingId);
      showModernSuccess(
        "Comentário excluído",
        "O comentário foi removido com sucesso"
      );
      queryClient.invalidateQueries({ queryKey: ['learning-comments', lessonId] });
    } catch (error: any) {
      logError("Erro ao excluir comentário da aula", error);
      if (loadingId) dismissModernToast(loadingId);
      showModernError(
        "Erro ao excluir",
        error.message || "Não foi possível excluir o comentário. Tente novamente."
      );
    }
  };
  
  // Curtir comentário
  const likeComment = async (commentId: string) => {
    if (!user) {
      showModernError(
        "Login necessário",
        "Você precisa estar logado para curtir comentários"
      );
      return;
    }
    
    try {
      log('Processando curtida em comentário de aula', { commentId, lessonId });
      
      // Verificar se o usuário já curtiu este comentário
      const { data: existingLike } = await supabase
        .from('learning_comment_likes')
        .select('*')
        .eq('comment_id', commentId)
        .eq('user_id', user.id)
        .maybeSingle();
        
      if (existingLike) {
        log('Removendo curtida existente', { likeId: existingLike.id });
        
        // Remover curtida (trigger atualizará contador automaticamente)
        const { error } = await supabase
          .from('learning_comment_likes')
          .delete()
          .eq('comment_id', commentId)
          .eq('user_id', user.id);
          
        if (error) throw error;
      } else {
        log('Adicionando nova curtida');
        
        // Adicionar curtida (trigger atualizará contador automaticamente)
        const { error } = await supabase
          .from('learning_comment_likes')
          .insert({
            comment_id: commentId,
            user_id: user.id
          });
          
        if (error) throw error;

        // 📢 Criar notificação para o autor do comentário (se não for o próprio usuário)
        const { data: commentData } = await supabase
          .from('learning_comments')
          .select('user_id, content, lesson_id')
          .eq('id', commentId)
          .single();

        if (commentData && commentData.user_id !== user.id) {
          // Buscar informações do usuário que curtiu
          const { data: profile } = await supabase
            .from('profiles')
            .select('name')
            .eq('id', user.id)
            .single();

          const contentPreview = commentData.content.substring(0, 100);
          
          await supabase
            .from('notifications')
            .insert({
              user_id: commentData.user_id,
              actor_id: user.id,
              type: 'comment_liked',
              title: `${profile?.name || 'Alguém'} curtiu seu comentário`,
              message: `"${contentPreview}${commentData.content.length > 100 ? '...' : ''}"`,
              action_url: `/formacao/aulas/${commentData.lesson_id}#comment-${commentId}`,
              category: 'engagement',
              priority: 1
            });
        }
      }
      
      queryClient.invalidateQueries({ queryKey: ['learning-comments', lessonId] });
    } catch (error: any) {
      console.error('Like error:', error);
      logError("Erro ao curtir comentário da aula", error);
      showModernError(
        "Erro ao curtir",
        error.message || "Não foi possível processar sua curtida. Tente novamente."
      );
    }
  };
  
  return {
    comments,
    isLoading,
    error,
    addComment,
    deleteComment,
    likeComment,
    isSubmitting
  };
};
