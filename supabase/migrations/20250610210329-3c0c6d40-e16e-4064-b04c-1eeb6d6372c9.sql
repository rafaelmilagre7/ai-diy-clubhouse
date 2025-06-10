
-- Correção das políticas RLS para a tabela invites
-- Esta migration resolve problemas de validação de tokens de convite

-- 1. Remover políticas RLS existentes da tabela invites
DROP POLICY IF EXISTS "Allow public to read invites for validation" ON public.invites;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.invites;
DROP POLICY IF EXISTS "Users can read invites" ON public.invites;

-- 2. Criar política para permitir validação pública de tokens
CREATE POLICY "Allow public invite token validation"
  ON public.invites
  FOR SELECT
  USING (true);

-- 3. Garantir que RLS está ativo na tabela invites
ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;

-- 4. Criar função melhorada para validação de tokens com busca case-insensitive
CREATE OR REPLACE FUNCTION public.validate_invite_token_enhanced(p_token text)
RETURNS SETOF public.invites
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  -- Busca principal: token exato (case-insensitive)
  SELECT * FROM public.invites 
  WHERE UPPER(token) = UPPER(p_token)
  AND used_at IS NULL 
  AND expires_at > NOW()
  
  UNION ALL
  
  -- Busca fallback: primeiros 8 caracteres (case-insensitive)
  SELECT * FROM public.invites 
  WHERE UPPER(token) LIKE (UPPER(SUBSTRING(p_token, 1, 8)) || '%')
  AND used_at IS NULL 
  AND expires_at > NOW()
  AND NOT EXISTS (
    SELECT 1 FROM public.invites 
    WHERE UPPER(token) = UPPER(p_token)
    AND used_at IS NULL 
    AND expires_at > NOW()
  )
  LIMIT 1;
$$;

-- 5. Criar função para log de tentativas de validação
CREATE OR REPLACE FUNCTION public.log_invite_validation_attempt(
  p_token text,
  p_success boolean,
  p_error_message text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.audit_logs (
    user_id,
    event_type,
    action,
    resource_id,
    details
  ) VALUES (
    auth.uid(),
    'invite_validation',
    CASE WHEN p_success THEN 'validation_success' ELSE 'validation_failed' END,
    p_token,
    jsonb_build_object(
      'token_length', LENGTH(p_token),
      'token_preview', SUBSTRING(p_token, 1, 4) || '***',
      'success', p_success,
      'error_message', p_error_message,
      'timestamp', NOW(),
      'ip_address', NULL -- Could be populated from request headers
    )
  );
EXCEPTION
  WHEN OTHERS THEN
    -- Falhar silenciosamente para não quebrar validação principal
    NULL;
END;
$$;

-- 6. Comentários de validação
COMMENT ON POLICY "Allow public invite token validation" ON public.invites IS 'Política para permitir validação pública de tokens de convite';
COMMENT ON FUNCTION public.validate_invite_token_enhanced(text) IS 'Função melhorada para validação de tokens com busca case-insensitive e fallback';
COMMENT ON FUNCTION public.log_invite_validation_attempt(text, boolean, text) IS 'Função para registrar tentativas de validação de convites';
