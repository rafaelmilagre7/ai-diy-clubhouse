
import { useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export const useSyncProfileData = () => {
  const syncPhoneFromImplementation = useCallback(async (userId: string) => {
    try {
      // Buscar dados de implementation_profiles
      const { data: implementationData, error: implementationError } = await supabase
        .from('implementation_profiles')
        .select('personal_info')
        .eq('user_id', userId)
        .single();

      if (implementationError || !implementationData) {
        console.log('Nenhum dado de implementação encontrado para sincronizar');
        return;
      }

      const personalInfo = implementationData.personal_info;
      if (!personalInfo?.phone && !personalInfo?.ddi) {
        console.log('Nenhum telefone encontrado nos dados de implementação');
        return;
      }

      // Construir número completo do WhatsApp
      let whatsappNumber = '';
      if (personalInfo.phone) {
        const ddi = personalInfo.ddi || '+55';
        const cleanPhone = personalInfo.phone.replace(/\D/g, '');
        whatsappNumber = `${ddi}${cleanPhone}`;
      }

      // Atualizar perfil com o telefone
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          whatsapp_number: whatsappNumber || null
        })
        .eq('id', userId);

      if (updateError) {
        console.error('Erro ao sincronizar telefone:', updateError);
        throw updateError;
      }

      console.log('Telefone sincronizado com sucesso:', whatsappNumber);
      return whatsappNumber;
    } catch (error) {
      console.error('Erro na sincronização de dados:', error);
      throw error;
    }
  }, []);

  const syncAllProfileData = useCallback(async (userId: string) => {
    try {
      await syncPhoneFromImplementation(userId);
      toast.success('Dados do perfil sincronizados com sucesso!');
    } catch (error) {
      console.error('Erro ao sincronizar dados do perfil:', error);
      toast.error('Erro ao sincronizar dados do perfil');
    }
  }, [syncPhoneFromImplementation]);

  return {
    syncPhoneFromImplementation,
    syncAllProfileData
  };
};
