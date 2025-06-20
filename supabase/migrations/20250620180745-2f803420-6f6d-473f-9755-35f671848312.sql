
-- Criação da tabela email_queue para sistema de fallback
CREATE TABLE IF NOT EXISTS public.email_queue (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  html_content TEXT NOT NULL,
  invite_id UUID REFERENCES public.invites(id) ON DELETE SET NULL,
  priority INTEGER DEFAULT 5,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'sent', 'failed')),
  attempts INTEGER DEFAULT 0,
  last_attempt_at TIMESTAMP WITH TIME ZONE,
  retry_after TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  external_id TEXT,
  last_error TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sent_at TIMESTAMP WITH TIME ZONE,
  failed_at TIMESTAMP WITH TIME ZONE
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_email_queue_status_retry ON public.email_queue(status, retry_after) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_email_queue_invite_id ON public.email_queue(invite_id);
CREATE INDEX IF NOT EXISTS idx_email_queue_created_at ON public.email_queue(created_at);

-- Função RPC para atualizar tentativas de envio de convite
CREATE OR REPLACE FUNCTION public.update_invite_send_attempt(invite_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.invites
  SET last_sent_at = NOW(),
      send_attempts = send_attempts + 1
  WHERE id = invite_id;
END;
$$;

-- Políticas RLS para email_queue
ALTER TABLE public.email_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins podem acessar email_queue" ON public.email_queue
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.user_roles ur ON p.role_id = ur.id
      WHERE p.id = auth.uid() AND ur.name = 'admin'
    )
  );

-- Comentários para documentação
COMMENT ON TABLE public.email_queue IS 'Fila de emails para sistema de fallback e retry automático';
COMMENT ON COLUMN public.email_queue.priority IS 'Prioridade do email (1=alta, 5=normal, 10=baixa)';
COMMENT ON COLUMN public.email_queue.retry_after IS 'Timestamp para próxima tentativa de envio';
