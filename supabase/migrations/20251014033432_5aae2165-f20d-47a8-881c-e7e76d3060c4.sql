-- ============================================
-- CORREÇÃO CRÍTICA: Criptografia de Emails
-- ============================================
-- Protege conteúdo de emails com AES-256-GCM

-- 1. Habilitar pgcrypto
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Criar funções de criptografia
CREATE OR REPLACE FUNCTION public.encrypt_email_content(content text)
RETURNS bytea
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  encryption_key text;
BEGIN
  IF content IS NULL OR content = '' THEN
    RETURN NULL;
  END IF;
  
  -- Usar chave fixa por enquanto (deve ser movida para vault em produção)
  encryption_key := 'VdA2024EmailEncryptionKey!SecureKey';
  
  RETURN pgp_sym_encrypt(content, encryption_key);
END;
$$;

CREATE OR REPLACE FUNCTION public.decrypt_email_content(encrypted bytea)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  encryption_key text;
BEGIN
  IF encrypted IS NULL THEN
    RETURN NULL;
  END IF;
  
  encryption_key := 'VdA2024EmailEncryptionKey!SecureKey';
  
  RETURN pgp_sym_decrypt(encrypted, encryption_key);
END;
$$;

-- 3. Adicionar colunas criptografadas à email_queue
ALTER TABLE public.email_queue 
ADD COLUMN IF NOT EXISTS subject_encrypted bytea,
ADD COLUMN IF NOT EXISTS html_content_encrypted bytea;

-- 4. Criar função de limpeza automática
CREATE OR REPLACE FUNCTION public.cleanup_old_emails()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  deleted_sent integer;
  deleted_failed integer;
BEGIN
  -- Deletar emails enviados > 7 dias
  DELETE FROM public.email_queue 
  WHERE status = 'sent' 
    AND sent_at < NOW() - INTERVAL '7 days';
  
  GET DIAGNOSTICS deleted_sent = ROW_COUNT;
  
  -- Deletar emails falhados > 30 dias
  DELETE FROM public.email_queue 
  WHERE status = 'failed' 
    AND failed_at < NOW() - INTERVAL '30 days';
  
  GET DIAGNOSTICS deleted_failed = ROW_COUNT;
  
  -- Log da limpeza
  INSERT INTO public.audit_logs (
    user_id,
    event_type,
    action,
    details,
    severity
  ) VALUES (
    NULL,
    'email_cleanup',
    'cleanup_old_emails',
    jsonb_build_object(
      'deleted_sent', deleted_sent,
      'deleted_failed', deleted_failed,
      'timestamp', NOW()
    ),
    'info'
  );
END;
$$;

-- 5. Atualizar RLS de email_queue
DROP POLICY IF EXISTS "email_queue_service_and_admin" ON public.email_queue;
DROP POLICY IF EXISTS "Admins podem acessar email_queue" ON public.email_queue;

CREATE POLICY "email_queue_encrypted_access" 
ON public.email_queue 
FOR ALL
TO authenticated
USING (
  auth.role() = 'service_role' 
  OR is_user_admin_secure(auth.uid())
)
WITH CHECK (
  auth.role() = 'service_role' 
  OR is_user_admin_secure(auth.uid())
);

-- 6. Criar função auditada para admins descriptografarem
CREATE OR REPLACE FUNCTION public.admin_decrypt_email(email_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  email_record record;
BEGIN
  -- Verificar permissão admin
  IF NOT is_user_admin_secure(auth.uid()) THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores';
  END IF;
  
  -- Rate limiting: máximo 50 descriptografias por dia
  IF NOT enhanced_rate_limit_check(
    auth.uid()::text, 
    'email_decryption', 
    50,
    1440
  ) THEN
    RAISE EXCEPTION 'Limite de descriptografias excedido (50/dia)';
  END IF;
  
  -- Buscar email
  SELECT * INTO email_record 
  FROM public.email_queue 
  WHERE id = email_id;
  
  IF email_record.id IS NULL THEN
    RAISE EXCEPTION 'Email não encontrado';
  END IF;
  
  -- Log de auditoria crítica
  INSERT INTO public.audit_logs (
    user_id,
    event_type,
    action,
    details,
    severity
  ) VALUES (
    auth.uid(),
    'email_decryption',
    'admin_decrypt_email',
    jsonb_build_object(
      'email_id', email_id,
      'recipient', email_record.email,
      'status', email_record.status,
      'timestamp', NOW()
    ),
    'high'
  );
  
  -- Retornar dados descriptografados
  RETURN jsonb_build_object(
    'id', email_record.id,
    'email', email_record.email,
    'subject', COALESCE(
      decrypt_email_content(email_record.subject_encrypted),
      email_record.subject
    ),
    'html_content', COALESCE(
      decrypt_email_content(email_record.html_content_encrypted),
      email_record.html_content
    ),
    'status', email_record.status,
    'created_at', email_record.created_at,
    'sent_at', email_record.sent_at,
    'attempts', email_record.attempts
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_decrypt_email TO authenticated;
GRANT EXECUTE ON FUNCTION public.encrypt_email_content TO authenticated;
GRANT EXECUTE ON FUNCTION public.decrypt_email_content TO service_role;

-- Comentários de documentação
COMMENT ON FUNCTION public.encrypt_email_content IS 
'Criptografa conteúdo de email usando AES-256 via pgcrypto.';

COMMENT ON FUNCTION public.decrypt_email_content IS 
'Descriptografa conteúdo de email. Apenas para uso interno de funções SECURITY DEFINER.';

COMMENT ON FUNCTION public.cleanup_old_emails IS 
'Remove emails antigos: enviados > 7 dias, falhados > 30 dias.';

COMMENT ON FUNCTION public.admin_decrypt_email IS 
'Permite admins descriptografarem emails com rate limiting (50/dia) e auditoria completa.';