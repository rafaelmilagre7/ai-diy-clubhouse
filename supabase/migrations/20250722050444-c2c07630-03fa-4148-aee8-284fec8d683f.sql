-- Criar função para gerar token de convite
CREATE OR REPLACE FUNCTION public.generate_invite_token()
RETURNS text
LANGUAGE sql
SET search_path TO ''
AS $$
  SELECT string_agg(
    substring('ABCDEFGHJKMNPQRSTUVWXYZ23456789', 
    ceil(random() * 32)::integer, 1), '')
  FROM generate_series(1, 32);
$$;

-- Criar função híbrida para criar convites
CREATE OR REPLACE FUNCTION public.create_invite_hybrid(
  p_email text,
  p_role_id uuid,
  p_phone text DEFAULT NULL,
  p_expires_in text DEFAULT '7 days',
  p_notes text DEFAULT NULL,
  p_channel_preference text DEFAULT 'email'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_token text;
  v_invite_id uuid;
  v_expires_at timestamp with time zone;
  v_result jsonb;
BEGIN
  -- Verificar se é admin
  IF NOT is_user_admin_secure(auth.uid()) THEN
    RETURN jsonb_build_object(
      'status', 'error',
      'message', 'Acesso negado - apenas administradores podem criar convites'
    );
  END IF;
  
  -- Verificar se email já foi convidado recentemente
  IF EXISTS (
    SELECT 1 FROM public.invites 
    WHERE email = p_email 
    AND expires_at > now() 
    AND used_at IS NULL
  ) THEN
    RETURN jsonb_build_object(
      'status', 'error',
      'message', 'Email já possui convite pendente'
    );
  END IF;
  
  -- Gerar token único
  v_token := public.generate_invite_token();
  
  -- Calcular data de expiração
  v_expires_at := now() + p_expires_in::interval;
  
  -- Inserir convite
  INSERT INTO public.invites (
    email,
    role_id,
    token,
    expires_at,
    created_by,
    notes,
    whatsapp_number,
    preferred_channel
  ) VALUES (
    p_email,
    p_role_id,
    v_token,
    v_expires_at,
    auth.uid(),
    p_notes,
    p_phone,
    p_channel_preference
  ) RETURNING id INTO v_invite_id;
  
  -- Retornar dados do convite
  v_result := jsonb_build_object(
    'status', 'success',
    'invite_id', v_invite_id,
    'token', v_token,
    'expires_at', v_expires_at,
    'email', p_email,
    'phone', p_phone,
    'channel_preference', p_channel_preference,
    'message', 'Convite criado com sucesso'
  );
  
  RETURN v_result;
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'status', 'error',
      'message', 'Erro ao criar convite: ' || SQLERRM
    );
END;
$$;