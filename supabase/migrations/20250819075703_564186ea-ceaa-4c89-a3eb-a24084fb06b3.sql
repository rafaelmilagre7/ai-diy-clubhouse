-- Criar tabela para armazenar webhooks da Hubla
CREATE TABLE public.hubla_webhooks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  headers JSONB,
  received_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed BOOLEAN NOT NULL DEFAULT false,
  processing_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_hubla_webhooks_event_type ON public.hubla_webhooks(event_type);
CREATE INDEX idx_hubla_webhooks_received_at ON public.hubla_webhooks(received_at DESC);
CREATE INDEX idx_hubla_webhooks_processed ON public.hubla_webhooks(processed);

-- RLS para acesso apenas de admins
ALTER TABLE public.hubla_webhooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Apenas admins podem acessar webhooks da Hubla"
ON public.hubla_webhooks
FOR ALL
USING (
  EXISTS (
    SELECT 1 
    FROM public.profiles p
    INNER JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = auth.uid() AND ur.name = 'admin'
  )
);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_hubla_webhooks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_hubla_webhooks_updated_at
  BEFORE UPDATE ON public.hubla_webhooks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_hubla_webhooks_updated_at();

-- Comentários para documentação
COMMENT ON TABLE public.hubla_webhooks IS 'Armazena todos os webhooks recebidos da Hubla para análise e processamento';
COMMENT ON COLUMN public.hubla_webhooks.event_type IS 'Tipo do evento (payment.approved, subscription.created, etc.)';
COMMENT ON COLUMN public.hubla_webhooks.payload IS 'Dados completos do webhook enviado pela Hubla';
COMMENT ON COLUMN public.hubla_webhooks.headers IS 'Headers HTTP do webhook (incluindo assinatura)';
COMMENT ON COLUMN public.hubla_webhooks.processed IS 'Indica se o webhook foi processado com sucesso';
COMMENT ON COLUMN public.hubla_webhooks.processing_notes IS 'Notas sobre o processamento do webhook';