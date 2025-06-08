
import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Bell, Mail, MessageSquare, Megaphone, Users, Calendar } from 'lucide-react';

interface NotificationPreference {
  id: string;
  user_id: string;
  email_enabled: boolean;
  whatsapp_enabled: boolean;
  admin_communications_email: boolean;
  admin_communications_inapp: boolean;
  created_at: string;
  updated_at: string;
}

export const NotificationPreferences = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: preferences, isLoading } = useQuery({
    queryKey: ['notification-preferences', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code === 'PGRST116') {
        // Se não existe, criar com valores padrão
        const { data: newPrefs, error: createError } = await supabase
          .from('notification_preferences')
          .insert({
            user_id: user.id,
            email_enabled: true,
            whatsapp_enabled: false,
            admin_communications_email: true,
            admin_communications_inapp: true,
          })
          .select()
          .single();

        if (createError) throw createError;
        return newPrefs as NotificationPreference;
      }

      if (error) throw error;
      return data as NotificationPreference;
    },
    enabled: !!user,
  });

  const updatePreferences = useMutation({
    mutationFn: async (updates: Partial<NotificationPreference>) => {
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('notification_preferences')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences'] });
      toast.success('Preferências atualizadas com sucesso!');
    },
    onError: (error: any) => {
      toast.error('Erro ao atualizar preferências: ' + error.message);
    },
  });

  const handleToggle = (key: keyof NotificationPreference, value: boolean) => {
    updatePreferences.mutate({ [key]: value });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-32 bg-muted rounded-lg animate-pulse" />
        <div className="h-32 bg-muted rounded-lg animate-pulse" />
        <div className="h-32 bg-muted rounded-lg animate-pulse" />
      </div>
    );
  }

  if (!preferences) {
    return (
      <div className="text-center p-8">
        <p className="text-muted-foreground">Erro ao carregar preferências</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Comunicações Administrativas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="h-5 w-5" />
            Comunicações Administrativas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-medium">Notificações no App</Label>
              <p className="text-xs text-muted-foreground">
                Receba comunicados importantes diretamente na plataforma
              </p>
            </div>
            <Switch
              checked={preferences.admin_communications_inapp}
              onCheckedChange={(checked) => handleToggle('admin_communications_inapp', checked)}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-medium">E-mail</Label>
              <p className="text-xs text-muted-foreground">
                Receba comunicados administrativos por e-mail
              </p>
            </div>
            <Switch
              checked={preferences.admin_communications_email}
              onCheckedChange={(checked) => handleToggle('admin_communications_email', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Configurações Gerais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Configurações Gerais
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-medium">Notificações por E-mail</Label>
              <p className="text-xs text-muted-foreground">
                Receba notificações gerais da plataforma por e-mail
              </p>
            </div>
            <Switch
              checked={preferences.email_enabled}
              onCheckedChange={(checked) => handleToggle('email_enabled', checked)}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-medium">WhatsApp</Label>
              <p className="text-xs text-muted-foreground">
                Receba notificações importantes via WhatsApp (em breve)
              </p>
            </div>
            <Switch
              checked={preferences.whatsapp_enabled}
              onCheckedChange={(checked) => handleToggle('whatsapp_enabled', checked)}
              disabled
            />
          </div>
        </CardContent>
      </Card>

      {/* Tipos de Notificação */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Tipos de Notificação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <Megaphone className="h-4 w-4 text-muted-foreground" />
              <span>Comunicados administrativos</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>Mensagens diretas</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>Atividades da comunidade</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>Eventos e webinars</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
