
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export const useSyncProfileData = () => {
  const { user, profile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [lastSyncAt, setLastSyncAt] = useState<Date | null>(null);

  const syncProfileData = async () => {
    if (!user?.id || !profile) {
      console.log('❌ Usuário ou perfil não disponível para sincronização');
      return false;
    }

    try {
      setIsLoading(true);
      console.log('🔄 Iniciando sincronização de dados do perfil...');

      // CORRIGIDO: Buscar dados de implementation_profiles em vez de onboarding antigo
      const { data: implementationProfile, error: implementationError } = await supabase
        .from('implementation_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (implementationError && implementationError.code !== 'PGRST116') {
        throw implementationError;
      }

      // Preparar dados para atualização do perfil principal
      const updateData: any = {};
      let hasChanges = false;

      if (implementationProfile) {
        // Sincronizar dados básicos se estiverem vazios no perfil principal
        if (!profile.company_name && implementationProfile.company_name) {
          updateData.company_name = implementationProfile.company_name;
          hasChanges = true;
        }

        if (!profile.industry && implementationProfile.company_sector) {
          updateData.industry = implementationProfile.company_sector;
          hasChanges = true;
        }

        if (!profile.current_position && implementationProfile.current_position) {
          updateData.current_position = implementationProfile.current_position;
          hasChanges = true;
        }

        console.log('📊 Dados de implementação encontrados:', {
          company_name: implementationProfile.company_name,
          company_sector: implementationProfile.company_sector,
          current_position: implementationProfile.current_position
        });
      }

      // Atualizar perfil principal se houver mudanças
      if (hasChanges) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update(updateData)
          .eq('id', user.id);

        if (updateError) {
          throw updateError;
        }

        console.log('✅ Perfil atualizado com dados sincronizados:', updateData);
        toast.success('Dados do perfil sincronizados com sucesso!');
      } else {
        console.log('ℹ️ Nenhuma atualização necessária - perfil já está atualizado');
      }

      setLastSyncAt(new Date());
      return true;

    } catch (error) {
      console.error('❌ Erro na sincronização do perfil:', error);
      toast.error('Erro ao sincronizar dados do perfil');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Sincronização automática ao montar o componente
  useEffect(() => {
    if (user?.id && profile && !lastSyncAt) {
      syncProfileData();
    }
  }, [user?.id, profile, lastSyncAt]);

  return {
    syncProfileData,
    isLoading,
    lastSyncAt
  };
};
