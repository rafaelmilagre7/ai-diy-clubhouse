-- Criar tabela para analytics de networking
CREATE TABLE public.networking_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  event_type TEXT NOT NULL, -- 'match_generated', 'connection_sent', 'connection_accepted', 'message_sent', 'meeting_scheduled'
  event_data JSONB NOT NULL DEFAULT '{}',
  compatibility_score NUMERIC,
  match_type TEXT,
  partner_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  month_year TEXT NOT NULL DEFAULT to_char(now(), 'YYYY-MM')
);

-- Enable RLS
ALTER TABLE public.networking_analytics ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Usuários podem ver suas próprias analytics" 
ON public.networking_analytics 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir suas próprias analytics" 
ON public.networking_analytics 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins podem ver todas as analytics" 
ON public.networking_analytics 
FOR ALL 
USING (is_user_admin(auth.uid()));

-- Indexes para performance
CREATE INDEX idx_networking_analytics_user_month ON public.networking_analytics (user_id, month_year);
CREATE INDEX idx_networking_analytics_event_type ON public.networking_analytics (event_type);
CREATE INDEX idx_networking_analytics_created_at ON public.networking_analytics (created_at);

-- Criar view para métricas agregadas
CREATE OR REPLACE VIEW public.networking_metrics AS
SELECT 
  user_id,
  month_year,
  COUNT(*) FILTER (WHERE event_type = 'match_generated') as matches_generated,
  COUNT(*) FILTER (WHERE event_type = 'connection_sent') as connections_sent,
  COUNT(*) FILTER (WHERE event_type = 'connection_accepted') as connections_accepted,
  COUNT(*) FILTER (WHERE event_type = 'message_sent') as messages_sent,
  COUNT(*) FILTER (WHERE event_type = 'meeting_scheduled') as meetings_scheduled,
  ROUND(
    AVG(compatibility_score) FILTER (WHERE compatibility_score IS NOT NULL), 2
  ) as avg_compatibility_score,
  ROUND(
    (COUNT(*) FILTER (WHERE event_type = 'connection_accepted')::NUMERIC / 
     NULLIF(COUNT(*) FILTER (WHERE event_type = 'connection_sent'), 0)) * 100, 2
  ) as connection_success_rate
FROM public.networking_analytics
GROUP BY user_id, month_year;

-- Grant select permission on view
GRANT SELECT ON public.networking_metrics TO authenticated;