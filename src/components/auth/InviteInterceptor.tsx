
import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useSimpleAuth } from '@/contexts/auth/SimpleAuthProvider';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

/**
 * Componente para interceptar e processar convites via URL
 * Funciona automaticamente quando há um parâmetro 'invite' na URL
 */
export const InviteInterceptor = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, profile, refreshProfile } = useSimpleAuth();
  
  useEffect(() => {
    const processInvite = async () => {
      const inviteToken = searchParams.get('invite');
      
      if (!inviteToken || !user) {
        return;
      }

      console.log('🎫 [INVITE-INTERCEPTOR] Processando convite:', inviteToken);

      try {
        // Usar a função RPC do Supabase para processar o convite
        const { data, error } = await supabase.rpc('use_invite', {
          invite_token: inviteToken,
          user_id: user.id
        });

        if (error) {
          console.error('❌ [INVITE-INTERCEPTOR] Erro ao processar convite:', error);
          toast.error('Erro ao processar convite: ' + error.message);
          return;
        }

        console.log('✅ [INVITE-INTERCEPTOR] Resposta:', data);

        if (data.status === 'success') {
          // Atualizar o perfil do usuário para refletir o novo papel
          await refreshProfile();
          
          toast.success('Convite aplicado com sucesso! Bem-vindo(a)!');
          
          // Limpar o parâmetro da URL
          const newUrl = new URL(window.location.href);
          newUrl.searchParams.delete('invite');
          navigate(newUrl.pathname + newUrl.search, { replace: true });
          
        } else {
          toast.error(data.message || 'Não foi possível processar o convite');
        }

      } catch (error) {
        console.error('❌ [INVITE-INTERCEPTOR] Erro inesperado:', error);
        toast.error('Erro inesperado ao processar convite');
      }
    };

    processInvite();
  }, [searchParams, user, navigate, refreshProfile]);

  // Componente não renderiza nada visualmente
  return null;
};
