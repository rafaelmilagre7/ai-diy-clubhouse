
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { saveNotificationPreferences, updateWhatsAppNumber } from '@/lib/supabase/rpc';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';

interface NotificationPreferences {
  id?: string;
  email_enabled: boolean;
  whatsapp_enabled: boolean;
  whatsapp_number?: string | null;
}

export function useNotificationPreferences() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email_enabled: true,
    whatsapp_enabled: false,
    whatsapp_number: null
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Carregar preferências existentes
  const fetchPreferences = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Buscar preferências de notificação
      const { data: prefData, error: prefError } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (prefError && prefError.code !== 'PGRST116') {
        console.error('Erro ao buscar preferências:', prefError);
      }
      
      // Buscar o número de WhatsApp do perfil
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('whatsapp_number')
        .eq('id', user.id)
        .single();
      
      if (profileError) {
        console.error('Erro ao buscar perfil:', profileError);
      }
      
      // Atualizar o estado com os dados obtidos
      setPreferences({
        id: prefData?.id,
        email_enabled: prefData?.email_enabled ?? true,
        whatsapp_enabled: prefData?.whatsapp_enabled ?? false,
        whatsapp_number: profileData?.whatsapp_number || null
      });
    } catch (error) {
      console.error('Erro ao buscar preferências:', error);
    } finally {
      setLoading(false);
    }
  };

  // Salvar preferências
  const savePreferences = async (newPreferences: {
    email_enabled?: boolean;
    whatsapp_enabled?: boolean;
    whatsapp_number?: string | null;
  }) => {
    if (!user) return;
    
    try {
      setSaving(true);
      
      const updatedPrefs = {
        ...preferences,
        ...newPreferences
      };
      
      // Se o número de WhatsApp mudou, atualizá-lo no perfil
      if (typeof newPreferences.whatsapp_number !== 'undefined' && 
          newPreferences.whatsapp_number !== preferences.whatsapp_number) {
        
        const { success, message } = await updateWhatsAppNumber(
          user.id, 
          newPreferences.whatsapp_number || ''
        );
        
        if (!success) {
          toast.error('Erro ao atualizar número de WhatsApp', {
            description: message
          });
          return;
        }
      }
      
      // Salvar as preferências de notificação
      if (typeof newPreferences.email_enabled !== 'undefined' ||
          typeof newPreferences.whatsapp_enabled !== 'undefined') {
        
        const { success, message } = await saveNotificationPreferences(user.id, {
          email_enabled: updatedPrefs.email_enabled,
          whatsapp_enabled: updatedPrefs.whatsapp_enabled
        });
        
        if (!success) {
          toast.error('Erro ao salvar preferências de notificação', {
            description: message
          });
          return;
        }
      }
      
      // Atualizar estado local
      setPreferences(updatedPrefs);
      
      toast.success('Preferências salvas com sucesso');
    } catch (error: any) {
      console.error('Erro ao salvar preferências:', error);
      toast.error('Erro ao salvar preferências', {
        description: error.message
      });
    } finally {
      setSaving(false);
    }
  };

  // Carregar dados iniciais
  useEffect(() => {
    fetchPreferences();
  }, [user]);

  return {
    preferences,
    loading,
    saving,
    savePreferences,
    reload: fetchPreferences
  };
}
