
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Bell,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  Settings,
  Mail,
  Smartphone
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';

interface AlertRule {
  id: string;
  name: string;
  condition: string;
  severity: string;
  enabled: boolean;
  description: string;
}

interface AlertNotification {
  id: string;
  title: string;
  message: string;
  severity: string;
  created_at: string;
  is_read: boolean;
  data: Record<string, any>;
}

export const SecurityAlertSystem = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AlertNotification[]>([]);
  const [alertRules, setAlertRules] = useState<AlertRule[]>([]);
  const [alertSettings, setAlertSettings] = useState({
    emailEnabled: true,
    whatsappEnabled: false,
    criticalOnly: false,
    quietHours: false
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAlertData();
    setupRealtimeSubscription();
  }, []);

  const loadAlertData = async () => {
    try {
      // Carregar notificações de segurança
      const { data: notificationsData, error: notificationsError } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user?.id)
        .eq('type', 'security_alert')
        .order('created_at', { ascending: false })
        .limit(20);

      if (notificationsError) throw notificationsError;
      setNotifications(notificationsData || []);

      // Carregar configurações de notificação do usuário
      const { data: preferencesData, error: preferencesError } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (!preferencesError && preferencesData) {
        setAlertSettings({
          emailEnabled: preferencesData.email_enabled || false,
          whatsappEnabled: preferencesData.whatsapp_enabled || false,
          criticalOnly: preferencesData.admin_communications_email || false,
          quietHours: false // Esta configuração pode ser adicionada mais tarde
        });
      }

    } catch (error) {
      console.error('Erro ao carregar dados de alerta:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('security-alerts-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user?.id}`
        },
        (payload) => {
          const newNotification = payload.new as AlertNotification;
          if (newNotification.type === 'security_alert') {
            setNotifications(prev => [newNotification, ...prev.slice(0, 19)]);
            
            // Mostrar toast para alertas críticos
            if (newNotification.data?.severity === 'critical') {
              toast.error(`Alerta Crítico: ${newNotification.title}`, {
                description: newNotification.message
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, is_read: true }
            : notification
        )
      );
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
    }
  };

  const updateAlertSettings = async (newSettings: typeof alertSettings) => {
    try {
      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: user?.id,
          email_enabled: newSettings.emailEnabled,
          whatsapp_enabled: newSettings.whatsappEnabled,
          admin_communications_email: newSettings.criticalOnly
        });

      if (error) throw error;

      setAlertSettings(newSettings);
      toast.success('Configurações de alerta atualizadas');
    } catch (error) {
      console.error('Erro ao atualizar configurações:', error);
      toast.error('Erro ao atualizar configurações de alerta');
    }
  };

  const triggerTestAlert = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: user?.id,
          type: 'security_alert',
          title: 'Teste de Alerta de Segurança',
          message: 'Este é um alerta de teste para verificar o sistema de notificações.',
          data: {
            severity: 'medium',
            test: true,
            timestamp: new Date().toISOString()
          }
        });

      if (error) throw error;
      toast.success('Alerta de teste enviado');
    } catch (error) {
      console.error('Erro ao enviar alerta de teste:', error);
      toast.error('Erro ao enviar alerta de teste');
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="h-4 w-4" />;
      case 'high': return <AlertTriangle className="h-4 w-4" />;
      case 'medium': return <Shield className="h-4 w-4" />;
      case 'low': return <CheckCircle className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-gray-200 rounded w-1/3"></div>
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-4 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="space-y-6">
      {/* Resumo de Alertas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Bell className="h-8 w-8 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{notifications.length}</div>
                <div className="text-sm text-muted-foreground">Total de alertas</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-orange-500" />
              <div>
                <div className="text-2xl font-bold">{unreadCount}</div>
                <div className="text-sm text-muted-foreground">Não lidos</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-green-500" />
              <div>
                <div className="text-2xl font-bold">
                  {notifications.filter(n => n.data?.severity === 'critical').length}
                </div>
                <div className="text-sm text-muted-foreground">Críticos</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notificações Recentes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Alertas Recentes
              </span>
              <Button size="sm" variant="outline" onClick={triggerTestAlert}>
                Teste
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum alerta de segurança recente</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      !notification.is_read ? 'bg-blue-50 border-blue-200' : 'hover:bg-muted/50'
                    }`}
                    onClick={() => markNotificationAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {getSeverityIcon(notification.data?.severity || 'low')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={getSeverityColor(notification.data?.severity || 'low') as any}>
                            {notification.data?.severity || 'low'}
                          </Badge>
                          {!notification.is_read && (
                            <Badge variant="secondary">Novo</Badge>
                          )}
                        </div>
                        <h4 className="font-medium text-sm mb-1">
                          {notification.title}
                        </h4>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Clock className="h-3 w-3 mr-1" />
                          {new Date(notification.created_at).toLocaleString('pt-BR')}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Configurações de Alertas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configurações de Alertas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Canais de Notificação */}
            <div>
              <h4 className="font-medium mb-3">Canais de Notificação</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="email-alerts">Email</Label>
                  </div>
                  <Switch
                    id="email-alerts"
                    checked={alertSettings.emailEnabled}
                    onCheckedChange={(checked) =>
                      updateAlertSettings({ ...alertSettings, emailEnabled: checked })
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="whatsapp-alerts">WhatsApp</Label>
                  </div>
                  <Switch
                    id="whatsapp-alerts"
                    checked={alertSettings.whatsappEnabled}
                    onCheckedChange={(checked) =>
                      updateAlertSettings({ ...alertSettings, whatsappEnabled: checked })
                    }
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Filtros de Severidade */}
            <div>
              <h4 className="font-medium mb-3">Filtros de Alerta</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="critical-only">Apenas alertas críticos</Label>
                  <Switch
                    id="critical-only"
                    checked={alertSettings.criticalOnly}
                    onCheckedChange={(checked) =>
                      updateAlertSettings({ ...alertSettings, criticalOnly: checked })
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="quiet-hours">Modo silencioso (22h-8h)</Label>
                  <Switch
                    id="quiet-hours"
                    checked={alertSettings.quietHours}
                    onCheckedChange={(checked) =>
                      updateAlertSettings({ ...alertSettings, quietHours: checked })
                    }
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Status do Sistema */}
            <div>
              <h4 className="font-medium mb-3">Status do Sistema</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Sistema de alertas</span>
                  <Badge variant="default">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Ativo
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Detecção de anomalias</span>
                  <Badge variant="default">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Ativo
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Monitoramento em tempo real</span>
                  <Badge variant="default">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Ativo
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
