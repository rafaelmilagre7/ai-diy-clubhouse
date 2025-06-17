
-- Criar tabela para rastrear tentativas de envio de convites
CREATE TABLE IF NOT EXISTS public.invite_send_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invite_id UUID REFERENCES public.invites(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  method_attempted TEXT NOT NULL, -- 'resend_primary', 'supabase_auth', 'password_reset'
  status TEXT NOT NULL DEFAULT 'attempting', -- 'attempting', 'sent', 'failed'
  email_id TEXT, -- ID retornado pelo serviço de email
  error_message TEXT,
  retry_after TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_invite_send_attempts_invite_id ON public.invite_send_attempts(invite_id);
CREATE INDEX IF NOT EXISTS idx_invite_send_attempts_status ON public.invite_send_attempts(status);
CREATE INDEX IF NOT EXISTS idx_invite_send_attempts_retry_after ON public.invite_send_attempts(retry_after);

-- RLS
ALTER TABLE public.invite_send_attempts ENABLE ROW LEVEL SECURITY;

-- Política para admins
CREATE POLICY "Admins podem ver todas as tentativas de envio"
  ON public.invite_send_attempts FOR ALL
  USING (public.has_role('admin'));

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_invite_send_attempts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_invite_send_attempts_updated_at
  BEFORE UPDATE ON public.invite_send_attempts
  FOR EACH ROW
  EXECUTE FUNCTION update_invite_send_attempts_updated_at();
