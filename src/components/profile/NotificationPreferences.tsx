
import React, { useState, useEffect } from 'react';
import { useSimpleAuth } from '@/contexts/auth/SimpleAuthProvider';
import { supabase } from '@/lib/supabase';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface NotificationPrefs {
  email_enabled: boolean;
  whatsapp_enabled: boolean;
  admin_communications_inapp: boolean;
  admin_communications_email: boolean;
}

export const NotificationPreferences = () => {
  const { user } = useSimpleAuth();
  const [preferences, setPreferences] = useState<NotificationPrefs>({
    email_enabled: true,
    whatsapp_enabled: false,
    admin_communications_inapp: true,
    admin_communications_email: true,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadPreferences();
    }
  }, [user]);

  const loadPreferences = async () => {
    if (!user) return;
    
    try {
      // Usar cast para any para contornar erro de tipos
      const { data, error } = await (supabase as any)
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao carregar preferências:', error);
        return;
      }

      if (data) {
        setPreferences(data);
      }
    } catch (error) {
      console.error('Erro ao carregar preferências:', error);
    }
  };

  const updatePreferences = async (newPrefs: Partial<NotificationPrefs>) => {
    if (!user) return;
    
    setLoading(true);
    try {
      const updatedPrefs = { ...preferences, ...newPrefs };
      
      // Usar cast para any para contornar erro de tipos
      const { error } = await (supabase as any)
        .from('notification_preferences')
        .upsert({
          user_id: user.id,
          ...updatedPrefs,
          updated_at: new Date().toISOString()
        });

      if (error) {
        toast.error('Erro ao salvar preferências');
        console.error('Erro ao atualizar preferências:', error);
        return;
      }

      setPreferences(updatedPrefs);
      toast.success('Preferências atualizadas com sucesso!');
    } catch (error) {
      toast.error('Erro ao salvar preferências');
      console.error('Erro ao atualizar preferências:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Preferências de Notificação</h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="email-enabled" className="flex flex-col gap-1">
            <span>Notificações por Email</span>
            <span className="text-sm text-muted-foreground">
              Receber notificações importantes por email
            </span>
          </Label>
          <Switch
            id="email-enabled"
            checked={preferences.email_enabled}
            onCheckedChange={(checked) => 
              updatePreferences({ email_enabled: checked })
            }
            disabled={loading}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="admin-email" className="flex flex-col gap-1">
            <span>Comunicações Administrativas por Email</span>
            <span className="text-sm text-muted-foreground">
              Receber comunicados da administração por email
            </span>
          </Label>
          <Switch
            id="admin-email"
            checked={preferences.admin_communications_email}
            onCheckedChange={(checked) => 
              updatePreferences({ admin_communications_email: checked })
            }
            disabled={loading}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="admin-inapp" className="flex flex-col gap-1">
            <span>Comunicações Administrativas no App</span>
            <span className="text-sm text-muted-foreground">
              Receber comunicados da administração dentro da plataforma
            </span>
          </Label>
          <Switch
            id="admin-inapp"
            checked={preferences.admin_communications_inapp}
            onCheckedChange={(checked) => 
              updatePreferences({ admin_communications_inapp: checked })
            }
            disabled={loading}
          />
        </div>
      </div>
    </div>
  );
};

// Manter exportação default para compatibilidade
export default NotificationPreferences;
