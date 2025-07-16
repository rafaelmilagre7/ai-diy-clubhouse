-- ==========================================
-- FASE FINAL: CONSOLIDAÇÃO E SEGURANÇA COMPLETA
-- ==========================================

-- 🎯 CORREÇÃO FINAL 1: Função de limpeza de dados órfãos
SELECT public.cleanup_onboarding_orphans();

-- 🎯 CORREÇÃO FINAL 2: Verificar e corrigir função create_invite_hybrid se necessário
-- Atualizar função create_invite_hybrid para usar nomenclatura consistente
CREATE OR REPLACE FUNCTION public.create_invite_hybrid(
  p_email text, 
  p_phone text DEFAULT NULL,
  p_role_id uuid, 
  p_expires_in interval DEFAULT '7 days'::interval, 
  p_notes text DEFAULT NULL::text,
  p_channel_preference text DEFAULT 'email'
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  new_token text;
  new_invite_id uuid;
  new_profile_id uuid;
  created_by_id uuid;
  extracted_name text;
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
  
  -- Verificar se já existe perfil para este email
  IF EXISTS (SELECT 1 FROM public.profiles WHERE email = p_email) THEN
    RETURN json_build_object(
      'status', 'error',
      'message', 'Já existe um usuário com este email'
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
  
  -- Gerar ID único para o perfil
  new_profile_id := gen_random_uuid();
  
  -- Extrair nome das notes se parecer ser um nome
  IF p_notes IS NOT NULL AND p_notes ~ '^[A-Za-zÀ-ÿ\s]{2,50}$' THEN
    extracted_name := trim(p_notes);
  END IF;
  
  -- 🎯 CORREÇÃO: Criar perfil pré-existente com status 'invited'
  INSERT INTO public.profiles (
    id,
    email,
    role_id,
    name,
    whatsapp_number,
    status,
    onboarding_completed,
    created_at,
    updated_at
  )
  VALUES (
    new_profile_id,
    p_email,
    p_role_id,
    extracted_name,
    p_phone,
    'invited', -- Status inicial
    false,
    now(),
    now()
  );
  
  -- Criar convite
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
    'message', 'Convite e perfil criados com sucesso',
    'invite_id', new_invite_id,
    'profile_id', new_profile_id,
    'token', new_token,
    'expires_at', (now() + p_expires_in),
    'pre_filled_data', json_build_object(
      'email', p_email,
      'name', extracted_name,
      'whatsapp_number', p_phone
    )
  );
END;
$$;

-- 🎯 CORREÇÃO FINAL 3: Função de monitoramento de onboarding
CREATE OR REPLACE FUNCTION public.monitor_onboarding_flow()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  total_users integer;
  completed_onboarding integer;
  in_progress_onboarding integer;
  abandoned_onboarding integer;
  result jsonb;
BEGIN
  -- Contadores gerais
  SELECT COUNT(*) INTO total_users FROM public.profiles;
  SELECT COUNT(*) INTO completed_onboarding FROM public.profiles WHERE onboarding_completed = true;
  SELECT COUNT(*) INTO in_progress_onboarding FROM public.onboarding_final WHERE status = 'in_progress';
  SELECT COUNT(*) INTO abandoned_onboarding FROM public.onboarding_final WHERE status = 'abandoned';
  
  result := jsonb_build_object(
    'total_users', total_users,
    'completed_onboarding', completed_onboarding,
    'in_progress_onboarding', in_progress_onboarding,
    'abandoned_onboarding', abandoned_onboarding,
    'completion_rate', CASE WHEN total_users > 0 THEN (completed_onboarding::float / total_users::float) * 100 ELSE 0 END,
    'last_updated', now()
  );
  
  RETURN result;
END;
$$;

-- 🎯 CORREÇÃO FINAL 4: Garantir que todas as tabelas críticas tenham RLS habilitado
DO $$
DECLARE
  table_name text;
  tables_to_secure text[] := ARRAY['profiles', 'onboarding_final', 'invites', 'user_roles'];
BEGIN
  FOREACH table_name IN ARRAY tables_to_secure
  LOOP
    -- Habilitar RLS se não estiver habilitado
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', table_name);
  END LOOP;
END $$;

-- 🎯 CORREÇÃO FINAL 5: Criar função de diagnóstico completo
CREATE OR REPLACE FUNCTION public.diagnose_onboarding_system()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  result jsonb;
  rls_status jsonb;
  function_status jsonb;
  policy_count integer;
  orphan_count integer;
BEGIN
  -- Verificar RLS das tabelas críticas
  SELECT jsonb_object_agg(
    tablename, 
    jsonb_build_object(
      'rls_enabled', rowsecurity,
      'status', CASE WHEN rowsecurity THEN 'SECURE' ELSE 'VULNERABLE' END
    )
  ) INTO rls_status
  FROM pg_tables 
  WHERE schemaname = 'public' 
  AND tablename IN ('profiles', 'onboarding_final', 'invites', 'user_roles');
  
  -- Contar políticas
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies 
  WHERE schemaname = 'public' 
  AND tablename IN ('profiles', 'onboarding_final', 'invites', 'user_roles');
  
  -- Verificar funções críticas
  SELECT jsonb_object_agg(
    proname,
    jsonb_build_object(
      'exists', true,
      'security_definer', prosecdef,
      'search_path_set', proconfig IS NOT NULL
    )
  ) INTO function_status
  FROM pg_proc
  WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
  AND proname IN ('is_user_admin', 'get_onboarding_next_step', 'create_invite_hybrid');
  
  -- Verificar dados órfãos
  SELECT COUNT(*) INTO orphan_count
  FROM public.onboarding_final o
  WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = o.user_id);
  
  result := jsonb_build_object(
    'rls_status', rls_status,
    'policy_count', policy_count,
    'function_status', function_status,
    'orphan_records', orphan_count,
    'system_health', CASE 
      WHEN orphan_count = 0 AND policy_count >= 4 THEN 'HEALTHY'
      WHEN orphan_count > 0 OR policy_count < 4 THEN 'NEEDS_ATTENTION'
      ELSE 'UNKNOWN'
    END,
    'diagnosis_timestamp', now()
  );
  
  RETURN result;
END;
$$;

-- 🎯 CORREÇÃO FINAL 6: Executar diagnóstico
SELECT public.diagnose_onboarding_system();