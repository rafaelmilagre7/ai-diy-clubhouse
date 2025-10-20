
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';
import { Bell, Mail, MessageCircle } from 'lucide-react';

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

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data || {
        user_id: user.id,
        email_enabled: true,
        whatsapp_enabled: false,
        admin_communications_email: true,
        admin_communications_inapp: true,
      };
    },
    enabled: !!user,
  });

  const updatePreferences = useMutation({
    mutationFn: async (updates: Record<string, boolean>) => {
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: user.id,
          ...preferences,
          ...updates,
        })
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

  const handleToggle = (key: string, value: boolean) => {
    updatePreferences.mutate({ [key]: value });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Preferências de Notificação</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Preferências de Notificação
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-lg">
        {/* Notificações Gerais */}
        <div className="space-y-4">
          <h4 className="font-medium text-sm text-muted-foreground">GERAL</h4>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <div>
                <Label htmlFor="email_enabled" className="font-medium">
                  Notificações por E-mail
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receber notificações importantes por e-mail
                </p>
              </div>
            </div>
            <Switch
              id="email_enabled"
              checked={preferences?.email_enabled || false}
              onCheckedChange={(value) => handleToggle('email_enabled', value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageCircle className="w-4 h-4 text-muted-foreground" />
              <div>
                <Label htmlFor="whatsapp_enabled" className="font-medium">
                  Notificações por WhatsApp
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receber notificações urgentes por WhatsApp
                </p>
              </div>
            </div>
            <Switch
              id="whatsapp_enabled"
              checked={preferences?.whatsapp_enabled || false}
              onCheckedChange={(value) => handleToggle('whatsapp_enabled', value)}
            />
          </div>
        </div>

        {/* Comunicados Administrativos */}
        <div className="space-y-4">
          <h4 className="font-medium text-sm text-muted-foreground">COMUNICADOS ADMINISTRATIVOS</h4>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="w-4 h-4 text-muted-foreground" />
              <div>
                <Label htmlFor="admin_communications_inapp" className="font-medium">
                  Notificações In-App
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receber comunicados na plataforma
                </p>
              </div>
            </div>
            <Switch
              id="admin_communications_inapp"
              checked={preferences?.admin_communications_inapp !== false}
              onCheckedChange={(value) => handleToggle('admin_communications_inapp', value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <div>
                <Label htmlFor="admin_communications_email" className="font-medium">
                  Comunicados por E-mail
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receber comunicados administrativos por e-mail
                </p>
              </div>
            </div>
            <Switch
              id="admin_communications_email"
              checked={preferences?.admin_communications_email !== false}
              onCheckedChange={(value) => handleToggle('admin_communications_email', value)}
            />
          </div>
        </div>

        <div className="pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            As preferências são salvas automaticamente. Você pode alterar essas configurações a qualquer momento.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
