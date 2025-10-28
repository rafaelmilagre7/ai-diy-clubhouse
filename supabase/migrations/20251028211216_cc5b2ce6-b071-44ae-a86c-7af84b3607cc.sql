-- 🛡️ IMPLEMENTAÇÃO COMPLETA DO PLANO DE SEGURANÇA
-- Adicionar SET search_path = 'public' em funções SECURITY DEFINER sem proteção

-- =============================================================================
-- FASE 1: FUNÇÃO DE CONVITES
-- =============================================================================

-- Corrigir create_invite_hybrid
DROP FUNCTION IF EXISTS public.create_invite_hybrid(text, uuid, text, interval, text, text) CASCADE;

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
SET search_path = 'public'
AS $function$
DECLARE
  new_token text;
  new_invite_id uuid;
  created_by_id uuid;
BEGIN
  -- Obter o ID do usuário atual
  created_by_id := auth.uid();
  
  -- Verificar se o usuário tem permissão para criar convites
  -- Permitir admin, master_user e membro_club
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = created_by_id 
      AND (
        ur.name IN ('admin', 'master_user', 'membro_club')
        OR p.is_master_user = true
      )
  ) THEN
    RETURN json_build_object(
      'status', 'error',
      'message', 'Você não tem permissão para criar convites'
    );
  END IF;
  
  -- Validar preferência de canal
  IF p_channel_preference NOT IN ('email', 'whatsapp', 'both') THEN
    RETURN json_build_object(
      'status', 'error',
      'message', 'Preferência de canal inválida'
    );
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
  
  -- Criar novo convite
  INSERT INTO public.invites (
    email,
    whatsapp_number,
    role_id,
    token,
    expires_at,
    created_by,
    notes,
    preferred_channel
  )
  VALUES (
    p_email,
    p_phone,
    p_role_id,
    new_token,
    now() + p_expires_in,
    created_by_id,
    p_notes,
    p_channel_preference
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

COMMENT ON FUNCTION public.create_invite_hybrid IS '🛡️ PROTEGIDO - Cria convites com validação de permissões';

-- =============================================================================
-- FASE 2: FUNÇÃO DE SUPORTE - INCREMENT CLICKS
-- =============================================================================

-- Corrigir increment_benefit_clicks
DROP FUNCTION IF EXISTS public.increment_benefit_clicks(uuid) CASCADE;

CREATE OR REPLACE FUNCTION public.increment_benefit_clicks(tool_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  UPDATE public.tools
  SET benefit_clicks = COALESCE(benefit_clicks, 0) + 1
  WHERE id = tool_id;
END;
$$;

COMMENT ON FUNCTION public.increment_benefit_clicks IS '🛡️ PROTEGIDO - Incrementa contador de cliques em benefícios';

-- =============================================================================
-- FASE 3: FUNÇÃO DE LOGGING
-- =============================================================================

-- Corrigir log_orphan_profile_creation
DROP FUNCTION IF EXISTS public.log_orphan_profile_creation(uuid, text, jsonb) CASCADE;

CREATE OR REPLACE FUNCTION public.log_orphan_profile_creation(
  p_user_id uuid,
  p_created_by text,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Log simples para rastreamento
  RAISE NOTICE '[ORPHAN-FIX] Profile criado manualmente: user_id=% by=% metadata=%', 
    p_user_id, p_created_by, p_metadata;
END;
$$;

COMMENT ON FUNCTION public.log_orphan_profile_creation IS '🛡️ PROTEGIDO - Registra criação manual de profiles';

-- =============================================================================
-- VERIFICAÇÃO DE SEGURANÇA PÓS-IMPLEMENTAÇÃO
-- =============================================================================

-- Criar função de verificação de segurança
CREATE OR REPLACE FUNCTION public.verify_security_implementation()
RETURNS TABLE(
  function_name text,
  has_search_path boolean,
  search_path_value text,
  is_secure boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.proname::text as function_name,
    (p.proconfig IS NOT NULL AND 
     ('search_path=public' = ANY(p.proconfig) OR 'search_path=' = ANY(p.proconfig))) as has_search_path,
    COALESCE(
      (SELECT unnest FROM unnest(p.proconfig) WHERE unnest LIKE 'search_path=%'),
      'NONE'
    )::text as search_path_value,
    CASE 
      WHEN p.proconfig IS NOT NULL AND 
           ('search_path=public' = ANY(p.proconfig) OR 'search_path=' = ANY(p.proconfig))
      THEN true
      ELSE false
    END as is_secure
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname = 'public'
    AND p.prosecdef = true
    AND p.proname IN (
      'create_invite_hybrid',
      'increment_benefit_clicks',
      'log_orphan_profile_creation',
      'validate_profile_roles',
      'sync_profile_roles',
      'audit_role_assignments',
      'is_admin',
      'is_user_admin'
    )
  ORDER BY p.proname;
END;
$$;

COMMENT ON FUNCTION public.verify_security_implementation IS 'Verifica se todas as funções críticas estão protegidas com search_path';

-- =============================================================================
-- ✅ RESULTADO ESPERADO
-- =============================================================================
-- Todas as funções SECURITY DEFINER agora têm SET search_path = 'public'
-- Protegendo contra ataques de schema hijacking
-- Zero impacto na funcionalidade da plataforma
-- =============================================================================