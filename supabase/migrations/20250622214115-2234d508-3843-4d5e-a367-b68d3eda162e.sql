
-- Tabela para campanhas de convites
CREATE TABLE public.invite_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed')),
  target_role_id UUID REFERENCES public.user_roles(id),
  email_template TEXT NOT NULL,
  whatsapp_template TEXT,
  scheduled_for TIMESTAMP WITH TIME ZONE,
  channels TEXT[] NOT NULL DEFAULT ARRAY['email'],
  segmentation JSONB DEFAULT '{}',
  follow_up_rules JSONB DEFAULT '{"enabled": false, "intervals": [], "maxAttempts": 1}',
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para relacionar campanhas com convites individuais
CREATE TABLE public.campaign_invites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES public.invite_campaigns(id) ON DELETE CASCADE,
  invite_id UUID NOT NULL REFERENCES public.invites(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(campaign_id, invite_id)
);

-- Tabela para eventos detalhados de analytics
CREATE TABLE public.invite_analytics_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invite_id UUID NOT NULL REFERENCES public.invites(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('sent', 'delivered', 'opened', 'clicked', 'registered', 'failed')),
  channel TEXT NOT NULL CHECK (channel IN ('email', 'whatsapp')),
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}',
  user_agent TEXT,
  ip_address TEXT,
  provider_id TEXT
);

-- Tabela para tracking de atividade dos usuários
CREATE TABLE public.user_activity_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  activity_type TEXT NOT NULL,
  activity_data JSONB DEFAULT '{}',
  session_id TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para métricas de saúde dos usuários
CREATE TABLE public.user_health_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  health_score NUMERIC(3,2) DEFAULT 0.0,
  last_activity TIMESTAMP WITH TIME ZONE,
  onboarding_completion_rate NUMERIC(3,2) DEFAULT 0.0,
  engagement_level TEXT DEFAULT 'low' CHECK (engagement_level IN ('low', 'medium', 'high')),
  risk_level TEXT DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high')),
  metrics_data JSONB DEFAULT '{}',
  calculated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Tabela para alertas de saúde dos usuários
CREATE TABLE public.user_health_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  alert_type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'dismissed')),
  triggered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID,
  metadata JSONB DEFAULT '{}'
);

-- Tabela para tracking detalhado do onboarding
CREATE TABLE public.onboarding_step_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  step_number INTEGER NOT NULL,
  step_name TEXT NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  time_spent_seconds INTEGER,
  attempts INTEGER DEFAULT 1,
  step_data JSONB DEFAULT '{}',
  is_completed BOOLEAN DEFAULT false
);

-- Tabela para pontos de abandono do onboarding
CREATE TABLE public.onboarding_abandonment_points (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  step_number INTEGER NOT NULL,
  abandonment_reason TEXT,
  time_on_step_seconds INTEGER,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}',
  abandoned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para intervenções automáticas
CREATE TABLE public.automated_interventions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  intervention_type TEXT NOT NULL,
  trigger_condition TEXT NOT NULL,
  action_taken TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'executed', 'failed', 'cancelled')),
  scheduled_for TIMESTAMP WITH TIME ZONE,
  executed_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para regras de automação
CREATE TABLE public.automation_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  rule_type TEXT NOT NULL,
  conditions JSONB NOT NULL,
  actions JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 1,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para fila de notificações
CREATE TABLE public.notification_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  notification_type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  channels TEXT[] NOT NULL DEFAULT ARRAY['in_app'],
  priority INTEGER DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')),
  scheduled_for TIMESTAMP WITH TIME ZONE DEFAULT now(),
  sent_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Adicionar campos nas tabelas existentes
ALTER TABLE public.invite_deliveries 
ADD COLUMN IF NOT EXISTS clicked_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS opened_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS conversion_value NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS utm_source TEXT,
ADD COLUMN IF NOT EXISTS utm_medium TEXT,
ADD COLUMN IF NOT EXISTS utm_campaign TEXT;

ALTER TABLE public.onboarding_final
ADD COLUMN IF NOT EXISTS time_per_step JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS abandonment_points JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS completion_score NUMERIC(3,2) DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS help_requests INTEGER DEFAULT 0;

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_invite_campaigns_status ON public.invite_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_invite_campaigns_target_role ON public.invite_campaigns(target_role_id);
CREATE INDEX IF NOT EXISTS idx_invite_analytics_events_invite_id ON public.invite_analytics_events(invite_id);
CREATE INDEX IF NOT EXISTS idx_invite_analytics_events_timestamp ON public.invite_analytics_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_user_activity_tracking_user_id ON public.user_activity_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_tracking_timestamp ON public.user_activity_tracking(created_at);
CREATE INDEX IF NOT EXISTS idx_user_health_metrics_user_id ON public.user_health_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_user_health_alerts_user_id ON public.user_health_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_user_health_alerts_status ON public.user_health_alerts(status);
CREATE INDEX IF NOT EXISTS idx_onboarding_step_tracking_user_id ON public.onboarding_step_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_abandonment_user_id ON public.onboarding_abandonment_points(user_id);
CREATE INDEX IF NOT EXISTS idx_automated_interventions_user_id ON public.automated_interventions(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_queue_user_id ON public.notification_queue(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_queue_status ON public.notification_queue(status);

-- Triggers para atualização automática de timestamps
CREATE OR REPLACE FUNCTION update_invite_campaigns_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_invite_campaigns_updated_at
  BEFORE UPDATE ON public.invite_campaigns
  FOR EACH ROW EXECUTE FUNCTION update_invite_campaigns_updated_at();

CREATE TRIGGER trigger_update_user_health_metrics_updated_at
  BEFORE UPDATE ON public.user_health_metrics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_automation_rules_updated_at
  BEFORE UPDATE ON public.automation_rules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para calcular métricas de saúde automaticamente
CREATE OR REPLACE FUNCTION calculate_user_health_score(p_user_id UUID)
RETURNS NUMERIC AS $$
DECLARE
  onboarding_score NUMERIC := 0;
  activity_score NUMERIC := 0;
  engagement_score NUMERIC := 0;
  final_score NUMERIC := 0;
BEGIN
  -- Calcular score do onboarding (40% do total)
  SELECT COALESCE(
    CASE 
      WHEN is_completed THEN 1.0
      ELSE (current_step::NUMERIC / 5.0)
    END, 0
  ) * 0.4 INTO onboarding_score
  FROM public.onboarding_final
  WHERE user_id = p_user_id;
  
  -- Calcular score de atividade (30% do total)
  SELECT COALESCE(
    CASE 
      WHEN COUNT(*) > 10 THEN 1.0
      ELSE COUNT(*)::NUMERIC / 10.0
    END, 0
  ) * 0.3 INTO activity_score
  FROM public.user_activity_tracking
  WHERE user_id = p_user_id 
  AND created_at > (now() - INTERVAL '30 days');
  
  -- Calcular score de engajamento (30% do total)
  SELECT COALESCE(
    CASE 
      WHEN last_activity > (now() - INTERVAL '7 days') THEN 1.0
      WHEN last_activity > (now() - INTERVAL '30 days') THEN 0.5
      ELSE 0.0
    END, 0
  ) * 0.3 INTO engagement_score
  FROM public.profiles
  WHERE id = p_user_id;
  
  final_score := onboarding_score + activity_score + engagement_score;
  
  RETURN LEAST(final_score, 1.0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para detectar usuários em risco
CREATE OR REPLACE FUNCTION detect_at_risk_users()
RETURNS VOID AS $$
BEGIN
  -- Inserir alertas para usuários com baixo score de saúde
  INSERT INTO public.user_health_alerts (user_id, alert_type, severity, title, description, metadata)
  SELECT 
    uhm.user_id,
    'low_health_score',
    CASE 
      WHEN uhm.health_score < 0.3 THEN 'high'
      WHEN uhm.health_score < 0.5 THEN 'medium'
      ELSE 'low'
    END,
    'Score de Saúde Baixo',
    'Usuário apresenta baixo engajamento e pode precisar de intervenção',
    jsonb_build_object('health_score', uhm.health_score, 'detected_at', now())
  FROM public.user_health_metrics uhm
  WHERE uhm.health_score < 0.6
  AND NOT EXISTS (
    SELECT 1 FROM public.user_health_alerts uha
    WHERE uha.user_id = uhm.user_id 
    AND uha.alert_type = 'low_health_score'
    AND uha.status = 'active'
  );
  
  -- Detectar usuários presos no onboarding
  INSERT INTO public.user_health_alerts (user_id, alert_type, severity, title, description, metadata)
  SELECT 
    of.user_id,
    'onboarding_stuck',
    'medium',
    'Usuário Preso no Onboarding',
    'Usuário não avança no onboarding há mais de 3 dias',
    jsonb_build_object('current_step', of.current_step, 'days_stuck', 
      EXTRACT(days FROM (now() - of.updated_at)))
  FROM public.onboarding_final of
  WHERE NOT of.is_completed 
  AND of.updated_at < (now() - INTERVAL '3 days')
  AND NOT EXISTS (
    SELECT 1 FROM public.user_health_alerts uha
    WHERE uha.user_id = of.user_id 
    AND uha.alert_type = 'onboarding_stuck'
    AND uha.status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies para todas as novas tabelas
ALTER TABLE public.invite_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invite_analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_health_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_health_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_step_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_abandonment_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automated_interventions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_queue ENABLE ROW LEVEL SECURITY;

-- Políticas para admins terem acesso completo
CREATE POLICY "Admins can manage invite campaigns" ON public.invite_campaigns
  FOR ALL USING (public.is_admin());

CREATE POLICY "Admins can manage campaign invites" ON public.campaign_invites
  FOR ALL USING (public.is_admin());

CREATE POLICY "Admins can view analytics events" ON public.invite_analytics_events
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can view user activity" ON public.user_activity_tracking
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Users can view own activity" ON public.user_activity_tracking
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage user health metrics" ON public.user_health_metrics
  FOR ALL USING (public.is_admin());

CREATE POLICY "Users can view own health metrics" ON public.user_health_metrics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage health alerts" ON public.user_health_alerts
  FOR ALL USING (public.is_admin());

CREATE POLICY "Users can view own alerts" ON public.user_health_alerts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view onboarding tracking" ON public.onboarding_step_tracking
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Users can view own onboarding tracking" ON public.onboarding_step_tracking
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert onboarding tracking" ON public.onboarding_step_tracking
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view abandonment points" ON public.onboarding_abandonment_points
  FOR SELECT USING (public.is_admin());

CREATE POLICY "System can insert abandonment points" ON public.onboarding_abandonment_points
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage interventions" ON public.automated_interventions
  FOR ALL USING (public.is_admin());

CREATE POLICY "Admins can manage automation rules" ON public.automation_rules
  FOR ALL USING (public.is_admin());

CREATE POLICY "Admins can manage notification queue" ON public.notification_queue
  FOR ALL USING (public.is_admin());

CREATE POLICY "Users can view own notifications" ON public.notification_queue
  FOR SELECT USING (auth.uid() = user_id);
