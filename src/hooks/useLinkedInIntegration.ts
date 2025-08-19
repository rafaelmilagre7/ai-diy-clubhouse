import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface LinkedInProfile {
  id: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
}

interface LinkedInPostData {
  title: string;
  description: string;
  url: string;
  imageUrl?: string;
}

export const useLinkedInIntegration = () => {
  const { user } = useAuth();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [linkedInProfile, setLinkedInProfile] = useState<LinkedInProfile | null>(null);

  // Conectar com LinkedIn OAuth
  const connectLinkedIn = useCallback(async () => {
    setIsConnecting(true);
    try {
      // Configuração OAuth para LinkedIn
      const clientId = 'YOUR_LINKEDIN_CLIENT_ID'; // Configurar nas env vars
      const redirectUri = `${window.location.origin}/auth/linkedin/callback`;
      const scope = 'r_liteprofile,r_emailaddress,w_member_social';
      const state = crypto.randomUUID();

      // Salvar state para validação posterior
      localStorage.setItem('linkedin_oauth_state', state);

      const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=${encodeURIComponent(scope)}`;

      // Abrir popup OAuth
      const popup = window.open(authUrl, 'linkedin-auth', 'width=600,height=600');
      
      // Aguardar callback
      return new Promise<boolean>((resolve) => {
        const checkClosed = setInterval(() => {
          if (popup?.closed) {
            clearInterval(checkClosed);
            setIsConnecting(false);
            resolve(false);
          }
        }, 1000);

        // Listener para mensagem do popup
        const messageListener = (event: MessageEvent) => {
          if (event.origin !== window.location.origin) return;
          
          if (event.data.type === 'LINKEDIN_AUTH_SUCCESS') {
            popup?.close();
            clearInterval(checkClosed);
            window.removeEventListener('message', messageListener);
            setLinkedInProfile(event.data.profile);
            setIsConnecting(false);
            toast.success('🎉 LinkedIn conectado com sucesso!');
            resolve(true);
          } else if (event.data.type === 'LINKEDIN_AUTH_ERROR') {
            popup?.close();
            clearInterval(checkClosed);
            window.removeEventListener('message', messageListener);
            setIsConnecting(false);
            toast.error('Erro ao conectar com LinkedIn');
            resolve(false);
          }
        };

        window.addEventListener('message', messageListener);
      });

    } catch (error) {
      console.error('Erro ao conectar LinkedIn:', error);
      toast.error('Erro ao conectar com LinkedIn');
      setIsConnecting(false);
      return false;
    }
  }, []);

  // Postar diretamente no LinkedIn
  const postToLinkedIn = useCallback(async (postData: LinkedInPostData) => {
    if (!linkedInProfile) {
      toast.error('LinkedIn não conectado');
      return false;
    }

    setIsPosting(true);
    try {
      // Enviar para edge function que fará o post via LinkedIn API
      const { data, error } = await supabase.functions.invoke('linkedin-post', {
        body: {
          userId: user?.id,
          postData,
          linkedInProfile
        }
      });

      if (error) throw error;

      if (data.success) {
        toast.success('🚀 Postado no LinkedIn com sucesso!');
        
        // Registrar analytics
        await logLinkedInShare(postData, 'api_direct');
        
        // Verificar conquistas
        await checkGamificationAchievements();
        
        return true;
      } else {
        throw new Error(data.error || 'Erro ao postar');
      }

    } catch (error: any) {
      console.error('Erro ao postar no LinkedIn:', error);
      toast.error('Erro ao postar no LinkedIn');
      return false;
    } finally {
      setIsPosting(false);
    }
  }, [linkedInProfile, user?.id]);

  // Analytics de compartilhamento
  const logLinkedInShare = async (postData: LinkedInPostData, shareType: string) => {
    try {
      await supabase.from('certificate_shares').insert({
        user_id: user?.id,
        share_type: shareType,
        platform: 'linkedin',
        post_data: postData,
        shared_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Erro ao registrar share:', error);
    }
  };

  // Sistema de gamificação
  const checkGamificationAchievements = async () => {
    try {
      // Buscar quantos compartilhamentos o usuário já fez
      const { data: shares, error } = await supabase
        .from('certificate_shares')
        .select('*')
        .eq('user_id', user?.id)
        .eq('platform', 'linkedin');

      if (error) throw error;

      const shareCount = shares?.length || 0;
      
      // Verificar conquistas baseadas em quantidade
      const achievements = [];
      
      if (shareCount === 1) {
        achievements.push({
          id: 'first_linkedin_share',
          title: '🎉 Primeira Partilha!',
          description: 'Compartilhou seu primeiro certificado no LinkedIn',
          icon: '🥇',
          points: 50
        });
      }
      
      if (shareCount === 5) {
        achievements.push({
          id: 'linkedin_influencer',
          title: '📈 Influencer em Crescimento!',
          description: 'Compartilhou 5 certificados no LinkedIn',
          icon: '🚀',
          points: 200
        });
      }
      
      if (shareCount === 10) {
        achievements.push({
          id: 'linkedin_master',
          title: '👑 Mestre do LinkedIn!',
          description: 'Verdadeiro influencer - 10 certificados compartilhados!',
          icon: '👑',
          points: 500
        });
      }

      // Mostrar conquistas desbloqueadas
      for (const achievement of achievements) {
        // Verificar se já não foi conquistado antes
        const { data: existing } = await supabase
          .from('user_achievements')
          .select('*')
          .eq('user_id', user?.id)
          .eq('achievement_id', achievement.id)
          .single();

        if (!existing) {
          // Salvar conquista
          await supabase.from('user_achievements').insert({
            user_id: user?.id,
            achievement_id: achievement.id,
            achievement_data: achievement,
            achieved_at: new Date().toISOString()
          });

          // Mostrar toast de conquista
          toast.success(
            `${achievement.icon} ${achievement.title}`, 
            {
              description: `${achievement.description} (+${achievement.points} pontos!)`,
              duration: 5000
            }
          );
        }
      }

    } catch (error) {
      console.error('Erro ao verificar conquistas:', error);
    }
  };

  // Desconectar LinkedIn
  const disconnectLinkedIn = useCallback(async () => {
    try {
      // Limpar dados locais
      setLinkedInProfile(null);
      localStorage.removeItem('linkedin_oauth_state');
      
      // Opcional: revogar token no backend
      await supabase.functions.invoke('linkedin-disconnect', {
        body: { userId: user?.id }
      });

      toast.success('LinkedIn desconectado');
    } catch (error) {
      console.error('Erro ao desconectar LinkedIn:', error);
      toast.error('Erro ao desconectar LinkedIn');
    }
  }, [user?.id]);

  return {
    isConnecting,
    isPosting,
    linkedInProfile,
    connectLinkedIn,
    postToLinkedIn,
    disconnectLinkedIn,
    checkGamificationAchievements
  };
};