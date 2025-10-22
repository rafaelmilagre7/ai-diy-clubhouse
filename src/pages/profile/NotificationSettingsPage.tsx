import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase/client';
import { toast } from '@/hooks/use-toast';
import { 
  Bell, 
  Clock, 
  Mail, 
  MessageSquare, 
  Lightbulb,
  Briefcase,
  Calendar,
  Shield,
  Users,
  Sparkles
} from 'lucide-react';
import { Input } from '@/components/ui/input';

interface NotificationPreferences {
  id: string;
  user_id: string;
  
  // Canais
  email_enabled: boolean;
  in_app_enabled: boolean;
  whatsapp_enabled: boolean;
  
  // Fase 1: Sugestões
  suggestions_new_suggestion: boolean;
  suggestions_status_changed: boolean;
  suggestions_new_comment: boolean;
  suggestions_comment_reply: boolean;
  suggestions_upvoted: boolean;
  suggestions_milestone: boolean;
  
  // Fase 2: Soluções
  solutions_new_solution: boolean;
  solutions_updated: boolean;
  solutions_new_comment: boolean;
  solutions_reply: boolean;
  solutions_access_granted: boolean;
  solutions_weekly_digest: boolean;
  
  // Fase 3: Eventos
  events_new_event: boolean;
  events_reminder: boolean;
  events_registration_confirmed: boolean;
  events_updated: boolean;
  events_cancelled: boolean;
  events_starting_soon: boolean;
  
  // Fase 4: Sistema & Admin
  system_maintenance: boolean;
  system_new_feature: boolean;
  system_security_alert: boolean;
  admin_broadcast: boolean;
  admin_direct_message: boolean;
  user_role_changed: boolean;
  user_achievement: boolean;
  
  // Fase 5: Comunidade
  community_new_topic: boolean;
  community_topic_reply: boolean;
  community_post_reply: boolean;
  community_topic_solved: boolean;
  community_topic_pinned: boolean;
  community_mention: boolean;
  community_post_liked: boolean;
  community_moderated: boolean;
  community_weekly_digest: boolean;
  community_achievement: boolean;
  
  // Configurações Avançadas
  digest_frequency: string;
  quiet_hours_enabled: boolean;
  quiet_hours_start: string;
  quiet_hours_end: string;
}

const DEFAULT_PREFERENCES: Partial<NotificationPreferences> = {
  email_enabled: true,
  in_app_enabled: true,
  whatsapp_enabled: false,
  suggestions_new_suggestion: true,
  suggestions_status_changed: true,
  suggestions_new_comment: true,
  suggestions_comment_reply: true,
  suggestions_upvoted: true,
  suggestions_milestone: true,
  solutions_new_solution: true,
  solutions_updated: true,
  solutions_new_comment: true,
  solutions_reply: true,
  solutions_access_granted: true,
  solutions_weekly_digest: true,
  events_new_event: true,
  events_reminder: true,
  events_registration_confirmed: true,
  events_updated: true,
  events_cancelled: true,
  events_starting_soon: true,
  system_maintenance: true,
  system_new_feature: true,
  system_security_alert: true,
  admin_broadcast: true,
  admin_direct_message: true,
  user_role_changed: true,
  user_achievement: true,
  community_new_topic: true,
  community_topic_reply: true,
  community_post_reply: true,
  community_topic_solved: true,
  community_topic_pinned: true,
  community_mention: true,
  community_post_liked: true,
  community_moderated: true,
  community_weekly_digest: true,
  community_achievement: true,
  digest_frequency: 'instant',
  quiet_hours_enabled: false,
  quiet_hours_start: '22:00',
  quiet_hours_end: '08:00',
};

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
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setPreferences(data);
      } else {
        // Criar preferências com tudo ativado
        const { data: newPrefs, error: createError } = await supabase
          .from('notification_preferences')
          .insert({ 
            user_id: user.id,
            ...DEFAULT_PREFERENCES
          })
          .select()
          .single();

        if (createError) throw createError;
        setPreferences(newPrefs);
      }
    } catch (error: any) {
      console.error('Erro ao carregar preferências:', error);
      toast({
        title: 'Erro ao carregar preferências',
        description: error.message,
        variant: 'destructive',
      });
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
      
      toast({
        title: 'Preferência atualizada',
        description: 'Suas configurações foram salvas com sucesso.',
      });
    } catch (error: any) {
      console.error('Erro ao atualizar preferência:', error);
      toast({
        title: 'Erro ao atualizar',
        description: error.message,
        variant: 'destructive',
      });
      setPreferences(preferences);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="animate-pulse space-y-md">
          <div className="h-10 bg-surface-elevated rounded w-1/3" />
          <div className="h-6 bg-surface-elevated rounded w-1/2" />
          <div className="grid gap-md mt-lg">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-64 bg-surface-elevated rounded-xl" />
            ))}
          </div>
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

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="mb-lg">
          <div className="flex items-center gap-sm mb-sm">
            <div className="p-sm bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl">
              <Bell className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-4xl font-bold">Notificações</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Configure como e quando deseja receber notificações da plataforma
          </p>
        </div>

        <div className="space-y-lg">
          {/* Canais de Entrega */}
          <Card className="p-lg border-border/50 hover:border-primary/30 transition-colors">
            <div className="flex items-start gap-md mb-md">
              <div className="p-sm bg-primary/10 rounded-lg">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold mb-xs">Canais de Entrega</h2>
                <p className="text-sm text-muted-foreground">
                  Escolha onde deseja receber suas notificações
                </p>
              </div>
            </div>

            <div className="space-y-md">
              <div className="flex items-center justify-between p-md bg-surface-elevated rounded-lg">
                <div>
                  <Label className="text-base font-medium">Notificações no App</Label>
                  <p className="text-sm text-muted-foreground mt-xs">
                    Receba alertas enquanto navega na plataforma
                  </p>
                </div>
                <Switch
                  checked={preferences.in_app_enabled}
                  onCheckedChange={(checked) => updatePreference('in_app_enabled', checked)}
                  disabled={saving}
                />
              </div>

              <div className="flex items-center justify-between p-md bg-surface-elevated rounded-lg">
                <div>
                  <Label className="text-base font-medium">Notificações por Email</Label>
                  <p className="text-sm text-muted-foreground mt-xs">
                    Receba resumos e alertas importantes no seu email
                  </p>
                </div>
                <Switch
                  checked={preferences.email_enabled}
                  onCheckedChange={(checked) => updatePreference('email_enabled', checked)}
                  disabled={saving}
                />
              </div>

              <div className="flex items-center justify-between p-md bg-surface-elevated rounded-lg">
                <div>
                  <Label className="text-base font-medium">Notificações por WhatsApp</Label>
                  <p className="text-sm text-muted-foreground mt-xs">
                    Alertas urgentes via WhatsApp (em breve)
                  </p>
                </div>
                <Switch
                  checked={preferences.whatsapp_enabled}
                  onCheckedChange={(checked) => updatePreference('whatsapp_enabled', checked)}
                  disabled={true}
                />
              </div>
            </div>
          </Card>

          {/* Sugestões */}
          <Card className="p-lg border-border/50 hover:border-primary/30 transition-colors">
            <div className="flex items-start gap-md mb-md">
              <div className="p-sm bg-accent/10 rounded-lg">
                <Lightbulb className="h-5 w-5 text-accent" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold mb-xs">Sugestões</h2>
                <p className="text-sm text-muted-foreground">
                  Acompanhe novidades e interações em sugestões da comunidade
                </p>
              </div>
            </div>

            <div className="grid gap-sm">
              {[
                { key: 'suggestions_new_suggestion', label: 'Novas sugestões', desc: 'Quando alguém criar uma nova sugestão' },
                { key: 'suggestions_status_changed', label: 'Mudança de status', desc: 'Quando o status de uma sugestão mudar' },
                { key: 'suggestions_new_comment', label: 'Novos comentários', desc: 'Comentários em sugestões que você criou' },
                { key: 'suggestions_comment_reply', label: 'Respostas aos seus comentários', desc: 'Quando alguém responder seus comentários' },
                { key: 'suggestions_upvoted', label: 'Votos nas suas sugestões', desc: 'Quando suas sugestões receberem votos' },
                { key: 'suggestions_milestone', label: 'Marcos importantes', desc: 'Quando suas sugestões atingirem marcos (10, 50, 100 votos)' },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between p-sm hover:bg-surface-elevated rounded-lg transition-colors">
                  <div className="flex-1 min-w-0">
                    <Label className="text-sm font-medium">{item.label}</Label>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch
                    checked={preferences[item.key as keyof NotificationPreferences] as boolean}
                    onCheckedChange={(checked) => updatePreference(item.key as keyof NotificationPreferences, checked)}
                    disabled={saving}
                  />
                </div>
              ))}
            </div>
          </Card>

          {/* Soluções */}
          <Card className="p-lg border-border/50 hover:border-primary/30 transition-colors">
            <div className="flex items-start gap-md mb-md">
              <div className="p-sm bg-viverblue/10 rounded-lg">
                <Briefcase className="h-5 w-5 text-viverblue" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold mb-xs">Soluções</h2>
                <p className="text-sm text-muted-foreground">
                  Novidades sobre soluções e conteúdos disponíveis
                </p>
              </div>
            </div>

            <div className="grid gap-sm">
              {[
                { key: 'solutions_new_solution', label: 'Novas soluções', desc: 'Quando uma nova solução for publicada' },
                { key: 'solutions_updated', label: 'Atualizações', desc: 'Quando soluções que você acompanha forem atualizadas' },
                { key: 'solutions_new_comment', label: 'Novos comentários', desc: 'Comentários em soluções que você criou' },
                { key: 'solutions_reply', label: 'Respostas', desc: 'Quando alguém responder seus comentários' },
                { key: 'solutions_access_granted', label: 'Acesso liberado', desc: 'Quando você ganhar acesso a uma nova solução' },
                { key: 'solutions_weekly_digest', label: 'Resumo semanal', desc: 'Principais novidades de soluções da semana' },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between p-sm hover:bg-surface-elevated rounded-lg transition-colors">
                  <div className="flex-1 min-w-0">
                    <Label className="text-sm font-medium">{item.label}</Label>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch
                    checked={preferences[item.key as keyof NotificationPreferences] as boolean}
                    onCheckedChange={(checked) => updatePreference(item.key as keyof NotificationPreferences, checked)}
                    disabled={saving}
                  />
                </div>
              ))}
            </div>
          </Card>

          {/* Eventos */}
          <Card className="p-lg border-border/50 hover:border-primary/30 transition-colors">
            <div className="flex items-start gap-md mb-md">
              <div className="p-sm bg-status-success/10 rounded-lg">
                <Calendar className="h-5 w-5 text-status-success" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold mb-xs">Eventos</h2>
                <p className="text-sm text-muted-foreground">
                  Fique atualizado sobre eventos, inscrições e lembretes
                </p>
              </div>
            </div>

            <div className="grid gap-sm">
              {[
                { key: 'events_new_event', label: 'Novos eventos', desc: 'Quando um novo evento for criado' },
                { key: 'events_reminder', label: 'Lembretes', desc: 'Lembretes de eventos que você se inscreveu' },
                { key: 'events_registration_confirmed', label: 'Inscrição confirmada', desc: 'Confirmação de suas inscrições' },
                { key: 'events_updated', label: 'Atualizações', desc: 'Mudanças em eventos que você participará' },
                { key: 'events_cancelled', label: 'Cancelamentos', desc: 'Quando um evento for cancelado' },
                { key: 'events_starting_soon', label: 'Começando em breve', desc: 'Alertas 1h antes dos eventos' },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between p-sm hover:bg-surface-elevated rounded-lg transition-colors">
                  <div className="flex-1 min-w-0">
                    <Label className="text-sm font-medium">{item.label}</Label>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch
                    checked={preferences[item.key as keyof NotificationPreferences] as boolean}
                    onCheckedChange={(checked) => updatePreference(item.key as keyof NotificationPreferences, checked)}
                    disabled={saving}
                  />
                </div>
              ))}
            </div>
          </Card>

          {/* Comunidade */}
          <Card className="p-lg border-border/50 hover:border-primary/30 transition-colors">
            <div className="flex items-start gap-md mb-md">
              <div className="p-sm bg-status-warning/10 rounded-lg">
                <MessageSquare className="h-5 w-5 text-status-warning" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold mb-xs">Comunidade</h2>
                <p className="text-sm text-muted-foreground">
                  Interações, menções e atividades na comunidade
                </p>
              </div>
            </div>

            <div className="grid gap-sm">
              {[
                { key: 'community_new_topic', label: 'Novos tópicos', desc: 'Quando novos tópicos forem criados' },
                { key: 'community_topic_reply', label: 'Respostas em tópicos', desc: 'Respostas em tópicos que você criou ou participa' },
                { key: 'community_post_reply', label: 'Respostas aos seus posts', desc: 'Quando alguém responder diretamente seu comentário' },
                { key: 'community_topic_solved', label: 'Tópico resolvido', desc: 'Quando um tópico for marcado como resolvido' },
                { key: 'community_topic_pinned', label: 'Tópico fixado', desc: 'Quando seu tópico for fixado pela moderação' },
                { key: 'community_mention', label: 'Menções (@você)', desc: 'Quando alguém te mencionar em um post' },
                { key: 'community_post_liked', label: 'Curtidas nos seus posts', desc: 'Marcos de curtidas (1, 5, 10, 25, 50, 100)' },
                { key: 'community_moderated', label: 'Moderação', desc: 'Quando seu conteúdo for moderado' },
                { key: 'community_weekly_digest', label: 'Resumo semanal', desc: 'Top 5 tópicos mais ativos da semana' },
                { key: 'community_achievement', label: 'Conquistas', desc: 'Quando desbloquear conquistas na comunidade' },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between p-sm hover:bg-surface-elevated rounded-lg transition-colors">
                  <div className="flex-1 min-w-0">
                    <Label className="text-sm font-medium">{item.label}</Label>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch
                    checked={preferences[item.key as keyof NotificationPreferences] as boolean}
                    onCheckedChange={(checked) => updatePreference(item.key as keyof NotificationPreferences, checked)}
                    disabled={saving}
                  />
                </div>
              ))}
            </div>
          </Card>

          {/* Sistema & Admin */}
          <Card className="p-lg border-border/50 hover:border-primary/30 transition-colors">
            <div className="flex items-start gap-md mb-md">
              <div className="p-sm bg-status-info/10 rounded-lg">
                <Shield className="h-5 w-5 text-status-info" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold mb-xs">Sistema & Administração</h2>
                <p className="text-sm text-muted-foreground">
                  Comunicações importantes da plataforma e equipe
                </p>
              </div>
            </div>

            <div className="grid gap-sm">
              {[
                { key: 'system_maintenance', label: 'Manutenção programada', desc: 'Avisos sobre manutenções e downtime' },
                { key: 'system_new_feature', label: 'Novos recursos', desc: 'Quando novos recursos forem lançados' },
                { key: 'system_security_alert', label: 'Alertas de segurança', desc: 'Notificações importantes de segurança' },
                { key: 'admin_broadcast', label: 'Comunicados da equipe', desc: 'Mensagens gerais da administração' },
                { key: 'admin_direct_message', label: 'Mensagens diretas', desc: 'Mensagens diretas da equipe para você' },
                { key: 'user_role_changed', label: 'Mudança de perfil', desc: 'Quando seu papel na plataforma mudar' },
                { key: 'user_achievement', label: 'Conquistas da plataforma', desc: 'Quando desbloquear conquistas gerais' },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between p-sm hover:bg-surface-elevated rounded-lg transition-colors">
                  <div className="flex-1 min-w-0">
                    <Label className="text-sm font-medium">{item.label}</Label>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch
                    checked={preferences[item.key as keyof NotificationPreferences] as boolean}
                    onCheckedChange={(checked) => updatePreference(item.key as keyof NotificationPreferences, checked)}
                    disabled={saving}
                  />
                </div>
              ))}
            </div>
          </Card>

          {/* Configurações Avançadas */}
          <Card className="p-lg border-border/50 hover:border-primary/30 transition-colors">
            <div className="flex items-start gap-md mb-md">
              <div className="p-sm bg-muted rounded-lg">
                <Clock className="h-5 w-5 text-foreground" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold mb-xs">Configurações Avançadas</h2>
                <p className="text-sm text-muted-foreground">
                  Personalize quando e com que frequência receber notificações
                </p>
              </div>
            </div>

            <div className="space-y-md">
              <div className="p-md bg-surface-elevated rounded-lg">
                <Label className="text-base font-medium mb-sm block">Frequência de Notificações</Label>
                <Select
                  value={preferences.digest_frequency}
                  onValueChange={(value) => updatePreference('digest_frequency', value)}
                  disabled={saving}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="instant">
                      <div>
                        <div className="font-medium">Instantânea</div>
                        <div className="text-xs text-muted-foreground">Receba notificações em tempo real</div>
                      </div>
                    </SelectItem>
                    <SelectItem value="hourly">
                      <div>
                        <div className="font-medium">A cada hora</div>
                        <div className="text-xs text-muted-foreground">Resumo a cada 60 minutos</div>
                      </div>
                    </SelectItem>
                    <SelectItem value="daily">
                      <div>
                        <div className="font-medium">Diária</div>
                        <div className="text-xs text-muted-foreground">Um resumo por dia</div>
                      </div>
                    </SelectItem>
                    <SelectItem value="weekly">
                      <div>
                        <div className="font-medium">Semanal</div>
                        <div className="text-xs text-muted-foreground">Um resumo por semana</div>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="p-md bg-surface-elevated rounded-lg">
                <div className="flex items-center justify-between mb-sm">
                  <div>
                    <Label className="text-base font-medium">Horário de Silêncio</Label>
                    <p className="text-xs text-muted-foreground mt-xs">
                      Não receber notificações durante determinado período
                    </p>
                  </div>
                  <Switch
                    checked={preferences.quiet_hours_enabled}
                    onCheckedChange={(checked) => updatePreference('quiet_hours_enabled', checked)}
                    disabled={saving}
                  />
                </div>

                {preferences.quiet_hours_enabled && (
                  <div className="grid grid-cols-2 gap-md mt-md">
                    <div>
                      <Label className="text-sm mb-sm block">Início</Label>
                      <Input
                        type="time"
                        value={preferences.quiet_hours_start}
                        onChange={(e) => updatePreference('quiet_hours_start', e.target.value)}
                        disabled={saving}
                      />
                    </div>
                    <div>
                      <Label className="text-sm mb-sm block">Fim</Label>
                      <Input
                        type="time"
                        value={preferences.quiet_hours_end}
                        onChange={(e) => updatePreference('quiet_hours_end', e.target.value)}
                        disabled={saving}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Footer Info */}
        <div className="mt-lg p-md bg-surface-elevated border border-border rounded-lg">
          <div className="flex items-start gap-sm">
            <Sparkles className="h-5 w-5 text-primary flex-shrink-0 mt-xs" />
            <div>
              <p className="text-sm font-medium mb-xs">Sistema de Notificações Inteligente</p>
              <p className="text-xs text-muted-foreground">
                Todas as notificações são otimizadas para não sobrecarregar você. 
                Agrupamos notificações similares e respeitamos seus horários de silêncio. 
                Você sempre terá controle total sobre o que recebe.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotificationSettingsPage;
