-- FASE 2: MELHORIAS DE SEGURANÇA E CORREÇÕES DE STORAGE

-- 1. Configurar storage para certificados (se não existir)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'certificates',
  'certificates',
  true,
  10485760, -- 10MB
  ARRAY['application/pdf', 'image/png', 'image/jpeg']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. Políticas de storage para certificados
CREATE POLICY "Certificados são publicamente acessíveis"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'certificates');

CREATE POLICY "Usuários autenticados podem upload certificados"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'certificates' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Admins podem gerenciar certificados"
ON storage.objects FOR ALL
TO authenticated
USING (
  bucket_id = 'certificates' 
  AND is_user_admin(auth.uid())
);

-- 3. Corrigir função generate_certificate_validation_code (se não existir)
CREATE OR REPLACE FUNCTION public.generate_certificate_validation_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN upper(
    substring(encode(gen_random_bytes(4), 'hex'), 1, 4) || '-' ||
    substring(encode(gen_random_bytes(4), 'hex'), 1, 4) || '-' ||
    substring(encode(gen_random_bytes(4), 'hex'), 1, 4)
  );
END;
$function$;

-- 4. Criar tabela rate_limit_blocks (se não existir)
CREATE TABLE IF NOT EXISTS public.rate_limit_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier text NOT NULL,
  action text NOT NULL,
  blocked_until timestamp with time zone NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(identifier, action)
);

-- 5. Habilitar RLS na tabela rate_limit_blocks
ALTER TABLE public.rate_limit_blocks ENABLE ROW LEVEL SECURITY;

-- 6. Política para rate_limit_blocks
CREATE POLICY "rate_limit_blocks_admin_only"
ON public.rate_limit_blocks
FOR ALL
TO authenticated
USING (is_user_admin(auth.uid()));

-- 7. Criar função para limpeza automática de rate limits expirados
CREATE OR REPLACE FUNCTION public.cleanup_expired_rate_limits()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  deleted_count integer;
BEGIN
  DELETE FROM public.rate_limit_blocks
  WHERE blocked_until < now();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$function$;

-- 8. Corrigir mais funções sem search_path definido
CREATE OR REPLACE FUNCTION public.generate_invite_token()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN encode(gen_random_bytes(32), 'base64url');
END;
$function$;

-- 9. Atualizar função update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- 10. Log da correção
INSERT INTO public.audit_logs (
  event_type,
  action,
  details,
  user_id
) VALUES (
  'database_fix',
  'phase_2_security_improvements',
  jsonb_build_object(
    'message', 'FASE 2 - Melhorias de segurança: Storage configurado, rate limiting e funções corrigidas',
    'storage_configured', true,
    'rate_limiting_enabled', true,
    'functions_fixed', ARRAY['generate_certificate_validation_code', 'generate_invite_token', 'update_updated_at_column'],
    'timestamp', now()
  ),
  auth.uid()
);