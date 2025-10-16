
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Bell, Clock, Mail, MessageSquare, Users, BookOpen, Briefcase, Settings as SettingsIcon } from 'lucide-react';

interface NotificationPreferences {
  learning_comments: boolean;
  learning_new_lessons: boolean;
  learning_course_updates: boolean;
  community_replies: boolean;
  community_mentions: boolean;
  community_new_topics: boolean;
  networking_messages: boolean;
  networking_connections: boolean;
  networking_opportunities: boolean;
  solutions_comments: boolean;
  solutions_new_content: boolean;
  admin_communications: boolean;
  system_updates: boolean;
  digest_frequency: string;
  quiet_hours_start: string;
  quiet_hours_end: string;
  respect_quiet_hours: boolean;
  in_app_enabled: boolean;
  email_enabled: boolean;
}

const NotificationSettingsPage = () => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, [user]);

  const loadPreferences = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setPreferences(data);
      } else {
        // Criar preferências padrão
        const { data: newPrefs, error: createError } = await supabase
          .from('notification_preferences')
          .insert({ user_id: user.id })
          .select()
          .single();

        if (createError) throw createError;
        setPreferences(newPrefs);
      }
    } catch (error: any) {
      console.error('Erro ao carregar preferências:', error);
      toast.error('Erro ao carregar preferências');
    } finally {
      setLoading(false);
    }
  };

  const updatePreference = async (field: keyof NotificationPreferences, value: any) => {
    if (!user || !preferences) return;

    const updatedPrefs = { ...preferences, [field]: value };
    setPreferences(updatedPrefs);

    setSaving(true);
    try {
      const { error } = await supabase
        .from('notification_preferences')
        .update({ [field]: value })
        .eq('user_id', user.id);

      if (error) throw error;
      toast.success('Preferência atualizada');
    } catch (error: any) {
      console.error('Erro ao atualizar preferência:', error);
      toast.error('Erro ao atualizar preferência');
      setPreferences(preferences);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="h-4 bg-muted rounded w-1/2" />
        </div>
      </div>
    );
  }

  if (!preferences) return null;

  return (
    <>
      <Helmet>
        <title>Configurações de Notificação | Viver de IA</title>
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Bell className="h-8 w-8" />
            Configurações de Notificação
          </h1>
          <p className="text-muted-foreground mt-2">
            Personalize como e quando você deseja receber notificações
          </p>
        </div>

        <div className="max-w-3xl space-y-6">
          {/* Canais de Notificação */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SettingsIcon className="h-5 w-5" />
                Canais de Notificação
              </CardTitle>
              <CardDescription>
                Escolha como deseja receber notificações
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Notificações no aplicativo</Label>
                  <div className="text-sm text-muted-foreground">
                    Receber notificações enquanto navega na plataforma
                  </div>
                </div>
                <Switch
                  checked={preferences.in_app_enabled}
                  onCheckedChange={(checked) => updatePreference('in_app_enabled', checked)}
                  disabled={saving}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Notificações por email</Label>
                  <div className="text-sm text-muted-foreground">
                    Receber notificações no seu email
                  </div>
                </div>
                <Switch
                  checked={preferences.email_enabled}
                  onCheckedChange={(checked) => updatePreference('email_enabled', checked)}
                  disabled={saving}
                />
              </div>
            </CardContent>
          </Card>

          {/* Aprendizado */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Aprendizado
              </CardTitle>
              <CardDescription>
                Notificações sobre lições, cursos e comentários
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Comentários em lições</Label>
                  <div className="text-sm text-muted-foreground">
                    Receber notificações quando alguém comentar em suas lições
                  </div>
                </div>
                <Switch
                  checked={preferences.learning_comments}
                  onCheckedChange={(checked) => updatePreference('learning_comments', checked)}
                  disabled={saving}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Novas lições</Label>
                  <div className="text-sm text-muted-foreground">
                    Notificar quando novas lições forem publicadas
                  </div>
                </div>
                <Switch
                  checked={preferences.learning_new_lessons}
                  onCheckedChange={(checked) => updatePreference('learning_new_lessons', checked)}
                  disabled={saving}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Atualizações de cursos</Label>
                  <div className="text-sm text-muted-foreground">
                    Notificar sobre atualizações em cursos que você está fazendo
                  </div>
                </div>
                <Switch
                  checked={preferences.learning_course_updates}
                  onCheckedChange={(checked) => updatePreference('learning_course_updates', checked)}
                  disabled={saving}
                />
              </div>
            </CardContent>
          </Card>

          {/* Comunidade */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Comunidade
              </CardTitle>
              <CardDescription>
                Notificações sobre posts, respostas e menções
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Respostas aos meus posts</Label>
                  <div className="text-sm text-muted-foreground">
                    Notificar quando alguém responder seus posts
                  </div>
                </div>
                <Switch
                  checked={preferences.community_replies}
                  onCheckedChange={(checked) => updatePreference('community_replies', checked)}
                  disabled={saving}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Menções</Label>
                  <div className="text-sm text-muted-foreground">
                    Notificar quando você for mencionado em posts
                  </div>
                </div>
                <Switch
                  checked={preferences.community_mentions}
                  onCheckedChange={(checked) => updatePreference('community_mentions', checked)}
                  disabled={saving}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Novos tópicos</Label>
                  <div className="text-sm text-muted-foreground">
                    Notificar sobre novos tópicos na comunidade
                  </div>
                </div>
                <Switch
                  checked={preferences.community_new_topics}
                  onCheckedChange={(checked) => updatePreference('community_new_topics', checked)}
                  disabled={saving}
                />
              </div>
            </CardContent>
          </Card>

          {/* Networking */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Networking
              </CardTitle>
              <CardDescription>
                Notificações sobre conexões, mensagens e oportunidades
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Mensagens diretas</Label>
                  <div className="text-sm text-muted-foreground">
                    Notificar quando receber novas mensagens
                  </div>
                </div>
                <Switch
                  checked={preferences.networking_messages}
                  onCheckedChange={(checked) => updatePreference('networking_messages', checked)}
                  disabled={saving}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Pedidos de conexão</Label>
                  <div className="text-sm text-muted-foreground">
                    Notificar sobre novos pedidos de conexão
                  </div>
                </div>
                <Switch
                  checked={preferences.networking_connections}
                  onCheckedChange={(checked) => updatePreference('networking_connections', checked)}
                  disabled={saving}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Oportunidades de networking</Label>
                  <div className="text-sm text-muted-foreground">
                    Notificar sobre oportunidades relevantes no marketplace
                  </div>
                </div>
                <Switch
                  checked={preferences.networking_opportunities}
                  onCheckedChange={(checked) => updatePreference('networking_opportunities', checked)}
                  disabled={saving}
                />
              </div>
            </CardContent>
          </Card>

          {/* Soluções */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Soluções
              </CardTitle>
              <CardDescription>
                Notificações sobre comentários e novos conteúdos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Comentários em soluções</Label>
                  <div className="text-sm text-muted-foreground">
                    Notificar sobre comentários nas suas soluções
                  </div>
                </div>
                <Switch
                  checked={preferences.solutions_comments}
                  onCheckedChange={(checked) => updatePreference('solutions_comments', checked)}
                  disabled={saving}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Novos conteúdos</Label>
                  <div className="text-sm text-muted-foreground">
                    Notificar sobre novas soluções disponíveis
                  </div>
                </div>
                <Switch
                  checked={preferences.solutions_new_content}
                  onCheckedChange={(checked) => updatePreference('solutions_new_content', checked)}
                  disabled={saving}
                />
              </div>
            </CardContent>
          </Card>

          {/* Configurações Avançadas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Configurações Avançadas
              </CardTitle>
              <CardDescription>
                Controle quando e como receber notificações
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>Frequência de notificações</Label>
                <Select
                  value={preferences.digest_frequency}
                  onValueChange={(value) => updatePreference('digest_frequency', value)}
                  disabled={saving}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="instant">Instantânea (tempo real)</SelectItem>
                    <SelectItem value="hourly">A cada hora</SelectItem>
                    <SelectItem value="daily">Diária (resumo diário)</SelectItem>
                    <SelectItem value="weekly">Semanal (resumo semanal)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Horário de silêncio</Label>
                  <Switch
                    checked={preferences.respect_quiet_hours}
                    onCheckedChange={(checked) => updatePreference('respect_quiet_hours', checked)}
                    disabled={saving}
                  />
                </div>
                {preferences.respect_quiet_hours && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm">Início</Label>
                      <Input
                        type="time"
                        value={preferences.quiet_hours_start}
                        onChange={(e) => updatePreference('quiet_hours_start', e.target.value)}
                        disabled={saving}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">Fim</Label>
                      <Input
                        type="time"
                        value={preferences.quiet_hours_end}
                        onChange={(e) => updatePreference('quiet_hours_end', e.target.value)}
                        disabled={saving}
                      />
                    </div>
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  Durante o horário de silêncio, você não receberá notificações
                </p>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Comunicações administrativas</Label>
                  <div className="text-sm text-muted-foreground">
                    Notificações importantes do sistema (recomendado)
                  </div>
                </div>
                <Switch
                  checked={preferences.admin_communications}
                  onCheckedChange={(checked) => updatePreference('admin_communications', checked)}
                  disabled={saving}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default NotificationSettingsPage;
