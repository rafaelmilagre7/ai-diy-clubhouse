-- Criar tabela para armazenar eventos de entrega de emails
CREATE TABLE IF NOT EXISTS public.invite_delivery_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invite_id UUID NOT NULL REFERENCES public.invites(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'complained', 'failed'
  event_data JSONB,
  email_id TEXT, -- ID do email no provedor (Resend)
  channel TEXT DEFAULT 'email', -- 'email' ou 'whatsapp'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Índices para performance
  CONSTRAINT valid_event_type CHECK (event_type IN ('sent', 'delivered', 'opened', 'clicked', 'bounced', 'complained', 'failed', 'delivery_delayed'))
);

-- Índices para melhorar performance de queries
CREATE INDEX IF NOT EXISTS idx_delivery_events_invite_id ON public.invite_delivery_events(invite_id);
CREATE INDEX IF NOT EXISTS idx_delivery_events_email_id ON public.invite_delivery_events(email_id);
CREATE INDEX IF NOT EXISTS idx_delivery_events_type ON public.invite_delivery_events(event_type);
CREATE INDEX IF NOT EXISTS idx_delivery_events_created_at ON public.invite_delivery_events(created_at DESC);

-- RLS Policies para a tabela de eventos
ALTER TABLE public.invite_delivery_events ENABLE ROW LEVEL SECURITY;

-- Admins podem ver todos os eventos
CREATE POLICY "Admins can view all delivery events"
  ON public.invite_delivery_events
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Service role pode inserir eventos (para webhooks)
CREATE POLICY "Service role can insert delivery events"
  ON public.invite_delivery_events
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Comentários para documentação
COMMENT ON TABLE public.invite_delivery_events IS 'Armazena eventos de entrega de convites (email/whatsapp) para rastreamento';
COMMENT ON COLUMN public.invite_delivery_events.event_type IS 'Tipo do evento: sent, delivered, opened, clicked, bounced, complained, failed, delivery_delayed';
COMMENT ON COLUMN public.invite_delivery_events.email_id IS 'ID do email no provedor (ex: Resend email ID)';
COMMENT ON COLUMN public.invite_delivery_events.event_data IS 'Dados adicionais do evento em formato JSON';