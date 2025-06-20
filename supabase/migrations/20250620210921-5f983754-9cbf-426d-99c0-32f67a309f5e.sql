
-- Criar tabela para tracking de entregas de convites
CREATE TABLE IF NOT EXISTS public.invite_deliveries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invite_id UUID REFERENCES public.invites(id) ON DELETE CASCADE NOT NULL,
  channel VARCHAR(20) NOT NULL CHECK (channel IN ('email', 'whatsapp')),
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'opened', 'clicked', 'failed')),
  provider_id TEXT, -- ID retornado pelo provedor (Resend, WhatsApp)
  error_message TEXT,
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  failed_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}', -- Dados extras do provedor
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para preferências de comunicação dos usuários
CREATE TABLE IF NOT EXISTS public.communication_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  email_enabled BOOLEAN DEFAULT true,
  whatsapp_enabled BOOLEAN DEFAULT false,
  whatsapp_number TEXT,
  preferred_channel VARCHAR(20) DEFAULT 'email' CHECK (preferred_channel IN ('email', 'whatsapp', 'both')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Adicionar campos à tabela invites para suporte ao WhatsApp
ALTER TABLE public.invites 
ADD COLUMN IF NOT EXISTS whatsapp_number TEXT,
ADD COLUMN IF NOT EXISTS preferred_channel VARCHAR(20) DEFAULT 'email' CHECK (preferred_channel IN ('email', 'whatsapp', 'both'));

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_invite_deliveries_invite_id ON public.invite_deliveries(invite_id);
CREATE INDEX IF NOT EXISTS idx_invite_deliveries_channel_status ON public.invite_deliveries(channel, status);
CREATE INDEX IF NOT EXISTS idx_communication_preferences_user_id ON public.communication_preferences(user_id);

-- Habilitar RLS nas novas tabelas
ALTER TABLE public.invite_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communication_preferences ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para invite_deliveries (apenas admins podem ver)
CREATE POLICY "Admins can view all invite deliveries" 
  ON public.invite_deliveries 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.user_roles ur ON p.role_id = ur.id
      WHERE p.id = auth.uid() AND ur.name = 'admin'
    )
  );

-- Políticas RLS para communication_preferences
CREATE POLICY "Users can view their own communication preferences" 
  ON public.communication_preferences 
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own communication preferences" 
  ON public.communication_preferences 
  FOR UPDATE 
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own communication preferences" 
  ON public.communication_preferences 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

-- Políticas para admins verem todas as preferências
CREATE POLICY "Admins can view all communication preferences" 
  ON public.communication_preferences 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.user_roles ur ON p.role_id = ur.id
      WHERE p.id = auth.uid() AND ur.name = 'admin'
    )
  );

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_invite_deliveries_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.update_communication_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar triggers
DROP TRIGGER IF EXISTS update_invite_deliveries_updated_at ON public.invite_deliveries;
CREATE TRIGGER update_invite_deliveries_updated_at
  BEFORE UPDATE ON public.invite_deliveries
  FOR EACH ROW EXECUTE FUNCTION public.update_invite_deliveries_updated_at();

DROP TRIGGER IF EXISTS update_communication_preferences_updated_at ON public.communication_preferences;
CREATE TRIGGER update_communication_preferences_updated_at
  BEFORE UPDATE ON public.communication_preferences
  FOR EACH ROW EXECUTE FUNCTION public.update_communication_preferences_updated_at();

-- Função para registrar entrega de convite
CREATE OR REPLACE FUNCTION public.log_invite_delivery(
  p_invite_id UUID,
  p_channel VARCHAR(20),
  p_status VARCHAR(20),
  p_provider_id TEXT DEFAULT NULL,
  p_error_message TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  delivery_id UUID;
  timestamp_field TEXT;
BEGIN
  -- Determinar qual timestamp atualizar baseado no status
  timestamp_field := CASE p_status
    WHEN 'sent' THEN 'sent_at'
    WHEN 'delivered' THEN 'delivered_at'
    WHEN 'opened' THEN 'opened_at'
    WHEN 'clicked' THEN 'clicked_at'
    WHEN 'failed' THEN 'failed_at'
    ELSE NULL
  END;

  -- Verificar se já existe um registro para este convite e canal
  SELECT id INTO delivery_id
  FROM public.invite_deliveries
  WHERE invite_id = p_invite_id AND channel = p_channel;

  IF delivery_id IS NOT NULL THEN
    -- Atualizar registro existente
    EXECUTE format(
      'UPDATE public.invite_deliveries 
       SET status = $1, provider_id = COALESCE($2, provider_id), 
           error_message = $3, metadata = metadata || $4, updated_at = now()%s
       WHERE id = $5',
      CASE WHEN timestamp_field IS NOT NULL THEN ', ' || timestamp_field || ' = now()' ELSE '' END
    ) USING p_status, p_provider_id, p_error_message, p_metadata, delivery_id;
  ELSE
    -- Criar novo registro
    EXECUTE format(
      'INSERT INTO public.invite_deliveries 
       (invite_id, channel, status, provider_id, error_message, metadata%s) 
       VALUES ($1, $2, $3, $4, $5, $6%s) 
       RETURNING id',
      CASE WHEN timestamp_field IS NOT NULL THEN ', ' || timestamp_field ELSE '' END,
      CASE WHEN timestamp_field IS NOT NULL THEN ', now()' ELSE '' END
    ) USING p_invite_id, p_channel, p_status, p_provider_id, p_error_message, p_metadata
    INTO delivery_id;
  END IF;

  RETURN delivery_id;
END;
$$;
