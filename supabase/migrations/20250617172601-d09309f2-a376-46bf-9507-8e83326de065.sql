
-- Migração para corrigir o sistema de convites

-- 1. Criar função generate_invite_token se não existir
CREATE OR REPLACE FUNCTION public.generate_invite_token()
RETURNS text
LANGUAGE sql
AS $function$
  -- Gera um token alfanumérico de 12 caracteres sem caracteres ambíguos como 0/O, 1/I/l
  SELECT string_agg(
    substring('ABCDEFGHJKMNPQRSTUVWXYZ23456789', 
    ceil(random() * 32)::integer, 1), '')
  FROM generate_series(1, 12);
$function$;

-- 2. Atualizar a função create_invite_hybrid para melhor compatibilidade
CREATE OR REPLACE FUNCTION public.create_invite_hybrid(
  p_email text, 
  p_role_id uuid,
  p_phone text DEFAULT NULL,
  p_expires_in interval DEFAULT '7 days'::interval, 
  p_notes text DEFAULT NULL::text,
  p_channel_preference text DEFAULT 'email'
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  new_token text;
  new_invite_id uuid;
  created_by_id uuid;
BEGIN
  -- Obter o ID do usuário atual
  created_by_id := auth.uid();
  
  -- Verificar se o usuário tem permissão para criar convites
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = created_by_id AND (ur.name = 'admin')
  ) THEN
    RETURN json_build_object(
      'status', 'error',
      'message', 'Você não tem permissão para criar convites'
    );
  END IF;
  
  -- Validar email
  IF p_email IS NULL OR p_email = '' OR p_email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RETURN json_build_object(
      'status', 'error',
      'message', 'Email inválido'
    );
  END IF;
  
  -- Verificar se já existe um convite pendente para este email
  IF EXISTS (
    SELECT 1 FROM public.invites 
    WHERE email = p_email 
    AND used_at IS NULL 
    AND expires_at > now()
  ) THEN
    RETURN json_build_object(
      'status', 'error',
      'message', 'Já existe um convite pendente para este email'
    );
  END IF;
  
  -- Validar preferência de canal
  IF p_channel_preference NOT IN ('email', 'whatsapp', 'both') THEN
    p_channel_preference := 'email';
  END IF;
  
  -- Validar telefone se necessário
  IF (p_channel_preference = 'whatsapp' OR p_channel_preference = 'both') AND p_phone IS NULL THEN
    RETURN json_build_object(
      'status', 'error',
      'message', 'Telefone é obrigatório para envio via WhatsApp'
    );
  END IF;
  
  -- Gerar token único
  new_token := public.generate_invite_token();
  
  -- Garantir que o token é único
  WHILE EXISTS (SELECT 1 FROM public.invites WHERE token = new_token) LOOP
    new_token := public.generate_invite_token();
  END LOOP;
  
  -- Criar novo convite
  INSERT INTO public.invites (
    email,
    phone,
    role_id,
    token,
    expires_at,
    created_by,
    notes,
    channel_preference,
    send_attempts
  )
  VALUES (
    p_email,
    p_phone,
    p_role_id,
    new_token,
    now() + p_expires_in,
    created_by_id,
    p_notes,
    p_channel_preference,
    0
  )
  RETURNING id INTO new_invite_id;
  
  RETURN json_build_object(
    'status', 'success',
    'message', 'Convite criado com sucesso',
    'invite_id', new_invite_id,
    'token', new_token,
    'expires_at', (now() + p_expires_in)
  );
END;
$function$;

-- 3. Garantir que a tabela invites tem a coluna send_attempts
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'invites' 
    AND column_name = 'send_attempts' 
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE public.invites ADD COLUMN send_attempts INTEGER DEFAULT 0;
  END IF;
END $$;

-- 4. Garantir que a tabela invites tem a coluna last_sent_at
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'invites' 
    AND column_name = 'last_sent_at' 
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE public.invites ADD COLUMN last_sent_at TIMESTAMPTZ;
  END IF;
END $$;

-- 5. Garantir que a tabela invites tem a coluna channel_preference
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'invites' 
    AND column_name = 'channel_preference' 
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE public.invites ADD COLUMN channel_preference TEXT DEFAULT 'email';
  END IF;
END $$;

-- 6. Garantir que a tabela invites tem a coluna phone
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'invites' 
    AND column_name = 'phone' 
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE public.invites ADD COLUMN phone TEXT;
  END IF;
END $$;

-- 7. Criar função para atualizar tentativas de envio
CREATE OR REPLACE FUNCTION public.update_invite_send_attempt(invite_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  UPDATE public.invites
  SET last_sent_at = NOW(),
      send_attempts = send_attempts + 1
  WHERE id = invite_id;
END;
$function$;

-- 8. Criar tabela invite_send_attempts se não existir
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
DROP POLICY IF EXISTS "Admins podem ver todas as tentativas de envio" ON public.invite_send_attempts;
CREATE POLICY "Admins podem ver todas as tentativas de envio"
  ON public.invite_send_attempts FOR ALL
  USING (public.has_role('admin'));

-- Trigger para updated_at
DROP TRIGGER IF EXISTS trigger_update_invite_send_attempts_updated_at ON public.invite_send_attempts;

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
