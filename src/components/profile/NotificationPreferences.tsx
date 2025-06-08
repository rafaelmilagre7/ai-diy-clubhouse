
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Bell, Mail, MessageSquare, Settings, Shield } from 'lucide-react';

interface NotificationPreferences {
  email_enabled: boolean;
  whatsapp_enabled: boolean;
  admin_communications_email: boolean;
  admin_communications_inapp: boolean;
}

export const NotificationPreferences = () => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email_enabled: true,
    whatsapp_enabled: false,
    admin_communications_email: true,
    admin_communications_inapp: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadPreferences();
    }
  }, [user?.id]);

  const loadPreferences = async () => {
    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') { // Not found error
        throw error;
      }

      if (data) {
        setPreferences({
          email_enabled: data.email_enabled,
          whatsapp_enabled: data.whatsapp_enabled,
          admin_communications_email: data.admin_communications_email ?? true,
          admin_communications_inapp: data.admin_communications_inapp ?? true,
        });
      }
    } catch (error) {
      console.error('Erro ao carregar preferências:', error);
      toast.error('Erro ao carregar configurações de notificação');
    } finally {
      setLoading(false);
    }
  };

  const updatePreference = (key: keyof NotificationPreferences, value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const savePreferences = async () => {
    if (!user?.id) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: user.id,
          ...preferences,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast.success('Preferências de notificação salvas com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar preferências:', error);
      toast.error('Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Notificações Gerais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notificações Gerais
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Notificações por E-mail
              </Label>
              <div className="text-sm text-muted-foreground">
                Receber notificações da plataforma por e-mail
              </div>
            </div>
            <Switch
              checked={preferences.email_enabled}
              onCheckedChange={(checked) => updatePreference('email_enabled', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Notificações por WhatsApp
              </Label>
              <div className="text-sm text-muted-foreground">
                Receber notificações importantes via WhatsApp
              </div>
            </div>
            <Switch
              checked={preferences.whatsapp_enabled}
              onCheckedChange={(checked) => updatePreference('whatsapp_enabled', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Comunicados Administrativos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Comunicados Administrativos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">
                E-mails de Comunicados
              </Label>
              <div className="text-sm text-muted-foreground">
                Receber comunicados oficiais da plataforma por e-mail
              </div>
            </div>
            <Switch
              checked={preferences.admin_communications_email}
              onCheckedChange={(checked) => updatePreference('admin_communications_email', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">
                Notificações In-App
              </Label>
              <div className="text-sm text-muted-foreground">
                Receber comunicados administrativos dentro da plataforma
              </div>
            </div>
            <Switch
              checked={preferences.admin_communications_inapp}
              onCheckedChange={(checked) => updatePreference('admin_communications_inapp', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Botão de Salvar */}
      <div className="flex justify-end">
        <Button 
          onClick={savePreferences} 
          disabled={saving}
          className="flex items-center gap-2"
        >
          <Settings className="w-4 h-4" />
          {saving ? 'Salvando...' : 'Salvar Configurações'}
        </Button>
      </div>
    </div>
  );
};
