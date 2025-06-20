
import { useState } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export const useSyncProfileData = () => {
  const { user } = useAuth();
  const [syncing, setSyncing] = useState(false);

  const syncProfileData = async () => {
    if (!user?.id) {
      toast.error('Usuário não autenticado');
      return false;
    }

    try {
      setSyncing(true);

      // Buscar dados do implementation_profiles
      const { data: implProfile, error: implError } = await supabase
        .from('implementation_profiles')
        .select('*')
        .eq('user_id', user.id as any)
        .single();

      if (implError && implError.code !== 'PGRST116') {
        console.error('Erro ao buscar implementation_profiles:', implError);
        throw implError;
      }

      // Preparar dados para sincronização
      const updateData: any = {};
      
      if (implProfile) {
        // Sincronizar company_name
        if ((implProfile as any).company_name && (implProfile as any).company_name.trim()) {
          updateData.company_name = (implProfile as any).company_name;
        }

        // Sincronizar company_sector -> industry
        if ((implProfile as any).company_sector && (implProfile as any).company_sector.trim()) {
          updateData.industry = (implProfile as any).company_sector;
        }
      }

      // Só atualizar se há dados para sincronizar
      if (Object.keys(updateData).length > 0) {
        updateData.company_name = updateData.company_name || (implProfile as any)?.company_name || '';
        updateData.industry = updateData.industry || (implProfile as any)?.company_sector || '';

        const { error: updateError } = await supabase
          .from('profiles')
          .update(updateData)
          .eq('id', user.id as any);

        if (updateError) {
          console.error('Erro ao atualizar profiles:', updateError);
          throw updateError;
        }

        toast.success('Dados do perfil sincronizados com sucesso!');
        return true;
      } else {
        toast.info('Nenhum dado novo para sincronizar');
        return false;
      }
    } catch (error: any) {
      console.error('Erro na sincronização:', error);
      toast.error(`Erro ao sincronizar dados: ${error.message}`);
      return false;
    } finally {
      setSyncing(false);
    }
  };

  return {
    syncProfileData,
    syncing
  };
};
