-- ==========================================
-- ETAPA 1: CORREÇÕES CRÍTICAS DO BANCO DE DADOS
-- ==========================================

-- 🎯 CORREÇÃO 1: Corrigir função create_invite_hybrid
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
  
  -- VERIFICAÇÃO DE SESSÃO ATIVA
  IF created_by_id IS NULL THEN
    RETURN json_build_object(
      'status', 'error',
      'message', 'Sessão inválida ou expirada'
    );
  END IF;
  
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

-- 🎯 CORREÇÃO 2: Melhorar handle_new_user para trabalhar com perfis pre-existentes
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  profile_record public.profiles;
  default_role_id uuid;
  user_name text;
BEGIN
  -- Buscar perfil pré-existente pelo email (status 'invited')
  SELECT * INTO profile_record
  FROM public.profiles
  WHERE email = NEW.email AND status = 'invited';
  
  -- Se encontrou perfil pré-existente, ativar
  IF profile_record.id IS NOT NULL THEN
    -- Extrair nome dos metadados se disponível
    user_name := COALESCE(
      NEW.raw_user_meta_data->>'name',
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'display_name',
      profile_record.name
    );
    
    -- Atualizar perfil existente para ativo
    UPDATE public.profiles
    SET 
      id = NEW.id, -- Conectar ao auth.users
      name = COALESCE(user_name, name),
      status = 'active',
      updated_at = now()
    WHERE email = NEW.email AND status = 'invited';
    
    -- Marcar convite como usado se existir
    UPDATE public.invites
    SET used_at = now()
    WHERE email = NEW.email AND used_at IS NULL;
    
    RETURN NEW;
  END IF;
  
  -- Se não há perfil pré-existente, criar novo com role padrão
  SELECT id INTO default_role_id
  FROM public.user_roles
  WHERE name = 'member'
  LIMIT 1;
  
  -- Extrair nome dos metadados
  user_name := COALESCE(
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'display_name',
    split_part(NEW.email, '@', 1)
  );
  
  -- Criar novo perfil
  INSERT INTO public.profiles (
    id,
    email,
    name,
    role_id,
    status,
    onboarding_completed,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    user_name,
    default_role_id,
    'active',
    false,
    now(),
    now()
  );
  
  RETURN NEW;
END;
$$;

-- 🎯 CORREÇÃO 3: Função de limpeza de dados órfãos
CREATE OR REPLACE FUNCTION public.cleanup_onboarding_orphans()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  orphaned_onboarding integer := 0;
  orphaned_profiles integer := 0;
  fixed_count integer := 0;
BEGIN
  -- Limpar onboarding_final órfãos (sem perfil correspondente)
  DELETE FROM public.onboarding_final
  WHERE user_id NOT IN (SELECT id FROM public.profiles);
  GET DIAGNOSTICS orphaned_onboarding = ROW_COUNT;
  
  -- Identificar perfis órfãos (sem role válido)
  SELECT COUNT(*) INTO orphaned_profiles
  FROM public.profiles p
  WHERE p.role_id IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.user_roles ur WHERE ur.id = p.role_id
  );
  
  -- Corrigir perfis órfãos atribuindo role padrão
  UPDATE public.profiles
  SET role_id = (
    SELECT id FROM public.user_roles 
    WHERE name = 'member' 
    LIMIT 1
  )
  WHERE role_id IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.user_roles ur WHERE ur.id = profiles.role_id
  );
  GET DIAGNOSTICS fixed_count = ROW_COUNT;
  
  RETURN jsonb_build_object(
    'orphaned_onboarding_removed', orphaned_onboarding,
    'orphaned_profiles_found', orphaned_profiles,
    'profiles_fixed', fixed_count,
    'cleanup_timestamp', now()
  );
END;
$$;

-- 🎯 CORREÇÃO 4: Reforçar RLS em tabelas críticas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_final ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 🎯 CORREÇÃO 5: Política mais segura para profiles
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
DROP POLICY IF EXISTS "Permitir acesso público de leitura" ON public.profiles;

CREATE POLICY "profiles_authenticated_select" ON public.profiles
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "profiles_own_update" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "profiles_admin_all" ON public.profiles
  FOR ALL USING (is_user_admin(auth.uid()));

-- 🎯 EXECUTAR LIMPEZA
SELECT public.cleanup_onboarding_orphans();

-- 🎯 FUNÇÃO DE MONITORAMENTO
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