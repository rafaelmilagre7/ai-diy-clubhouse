
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Comment } from '@/types/commentTypes';
import { useLogging } from '@/hooks/useLogging';
import { useAuth } from '@/contexts/auth';

export const useFetchModuleComments = (solutionId: string, moduleId: string) => {
  const { log, logError } = useLogging();
  const { user } = useAuth();

  return useQuery({
    queryKey: ['solution-comments', solutionId, moduleId],
    queryFn: async () => {
      try {
        log('Buscando comentários da solução', { solutionId, moduleId });
        
        // Buscar comentários principais de forma direta (sem join automático)
        const { data: parentComments, error: parentError } = await supabase
          .from('solution_comments')
          .select('*')
          .eq('solution_id', solutionId)
          .is('parent_id', null)
          .order('created_at', { ascending: false });

        if (parentError) {
          logError('Erro ao buscar comentários principais', parentError);
          throw parentError;
        }

        // Buscar perfis dos usuários que fizeram os comentários
        const userIds = [...new Set(parentComments.map((c: any) => c.user_id))];
        const { data: userProfiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, name, avatar_url, role')
          .in('id', userIds);
          
        if (profilesError) {
          logError('Erro ao buscar perfis dos usuários', profilesError);
        }
        
        // Mapear perfis por ID para fácil acesso
        const profilesMap = (userProfiles || []).reduce((acc: Record<string, any>, profile: any) => {
          acc[profile.id] = profile;
          return acc;
        }, {});

        // Buscar respostas (replies)
        const { data: replies, error: repliesError } = await supabase
          .from('solution_comments')
          .select('*')
          .eq('solution_id', solutionId)
          .not('parent_id', 'is', null)
          .order('created_at', { ascending: true });

        if (repliesError) {
          logError('Erro ao buscar respostas', repliesError);
          throw repliesError;
        }
        
        // Adicionar IDs de usuários de respostas ao conjunto de IDs
        const replyUserIds = [...new Set(replies.map((r: any) => r.user_id))];
        
        // Buscar perfis adicionais se necessário
        if (replyUserIds.some(id => !profilesMap[id])) {
          const missingIds = replyUserIds.filter(id => !profilesMap[id]);
          
          const { data: additionalProfiles } = await supabase
            .from('profiles')
            .select('id, name, avatar_url, role')
            .in('id', missingIds);
            
          if (additionalProfiles) {
            additionalProfiles.forEach((profile: any) => {
              profilesMap[profile.id] = profile;
            });
          }
        }

        // Verificar curtidas do usuário atual
        let likesMap: Record<string, boolean> = {};
        
        if (user) {
          const { data: userLikes } = await supabase
            .from('solution_comment_likes')
            .select('comment_id')
            .eq('user_id', user.id);

          likesMap = (userLikes || []).reduce((acc: Record<string, boolean>, like) => {
            acc[like.comment_id] = true;
            return acc;
          }, {});
        }

        // Organizar comentários com respostas e perfis
        const organizedComments = parentComments.map((comment: any) => ({
          ...comment,
          profiles: profilesMap[comment.user_id] || null,
          user_has_liked: !!likesMap[comment.id],
          replies: (replies || [])
            .filter((reply: any) => reply.parent_id === comment.id)
            .map((reply: any) => ({
              ...reply,
              profiles: profilesMap[reply.user_id] || null,
              user_has_liked: !!likesMap[reply.id]
            }))
        }));

        log('Comentários carregados com sucesso', { 
          total: organizedComments.length
        });
        
        return organizedComments;
      } catch (error) {
        logError('Erro ao buscar comentários', error);
        throw error;
      }
    },
    staleTime: 30000,
    enabled: !!solutionId && !!moduleId,
    retry: 1
  });
};
