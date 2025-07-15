-- =============================================================================
-- CORREÇÃO COMPLETA DO FLUXO DE ONBOARDING - PARTE 1 (BACKEND)
-- =============================================================================

-- 1. REMOVER TRIGGER ANTIGO SE EXISTIR
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 2. REMOVER FUNÇÃO EXISTENTE PARA RECRIAR COM NOVO FORMATO
DROP FUNCTION IF EXISTS public.get_user_profile_safe(uuid);

-- 3. CRIAR FUNÇÃO OTIMIZADA PARA CRIAÇÃO DE PERFIL AUTOMÁTICA
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  invite_record public.invites;
  invite_token text;
  default_role_id uuid;
  extracted_name text;
BEGIN
  -- Log silencioso para debug (sem RAISE NOTICE em produção)
  
  -- Extrair token de convite dos metadados
  invite_token := NEW.raw_user_meta_data->>'invite_token';
  
  -- Se há token de convite, buscar o convite
  IF invite_token IS NOT NULL THEN
    SELECT * INTO invite_record
    FROM public.invites
    WHERE token = invite_token
    AND expires_at > now()
    ORDER BY created_at DESC
    LIMIT 1;
  END IF;
  
  -- Determinar role_id
  IF invite_record.id IS NOT NULL THEN
    -- Usar role do convite
    default_role_id := invite_record.role_id;
    
    -- Marcar convite como usado
    UPDATE public.invites
    SET used_at = now()
    WHERE id = invite_record.id;
  ELSE
    -- Buscar role padrão (member/membro)
    SELECT id INTO default_role_id
    FROM public.user_roles
    WHERE name IN ('member', 'membro')
    ORDER BY name
    LIMIT 1;
  END IF;
  
  -- Extrair nome dos metadados
  extracted_name := COALESCE(
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'display_name',
    invite_record.notes,
    split_part(NEW.email, '@', 1)
  );
  
  -- Criar perfil
  INSERT INTO public.profiles (
    id,
    email,
    role_id,
    name,
    company_name,
    created_at,
    updated_at,
    onboarding_completed
  ) VALUES (
    NEW.id,
    NEW.email,
    default_role_id,
    extracted_name,
    invite_record.notes, -- Pode ser empresa se fornecida nas notas
    now(),
    now(),
    false
  );
  
  -- Inicializar onboarding com dados do convite se disponível
  INSERT INTO public.onboarding_final (
    user_id,
    current_step,
    completed_steps,
    is_completed,
    personal_info,
    business_info,
    ai_experience,
    goals_info,
    personalization,
    status,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    1,
    ARRAY[]::integer[],
    false,
    CASE 
      WHEN invite_record.id IS NOT NULL THEN
        jsonb_build_object(
          'name', extracted_name,
          'email', NEW.email,
          'phone', invite_record.whatsapp_number,
          'from_invite', true
        )
      ELSE
        jsonb_build_object(
          'name', extracted_name,
          'email', NEW.email
        )
    END,
    '{}',
    '{}',
    '{}',
    '{}',
    'in_progress',
    now(),
    now()
  );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Em caso de erro, não bloquear a criação do usuário
    -- Apenas retornar NEW para permitir que o processo continue
    RETURN NEW;
END;
$$;

-- 4. RECRIAR TRIGGER
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. LIMPAR POLÍTICAS RLS CONFLITANTES NA TABELA PROFILES
-- Remover políticas antigas conflitantes
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;
DROP POLICY IF EXISTS "admins_can_update_any_profile" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
DROP POLICY IF EXISTS "users_can_update_own_profile_restricted" ON public.profiles;

-- Criar políticas simplificadas e não conflitantes
CREATE POLICY "profiles_admin_all_access"
  ON public.profiles
  FOR ALL
  USING (is_user_admin(auth.uid()));

CREATE POLICY "profiles_user_own_select"
  ON public.profiles
  FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "profiles_user_own_update"
  ON public.profiles
  FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- 6. RECRIAR FUNÇÃO get_user_profile_safe COM FORMATO CORRETO
CREATE OR REPLACE FUNCTION public.get_user_profile_safe(target_user_id uuid)
RETURNS TABLE(
  id uuid,
  email text,
  name text,
  company_name text,
  role_id uuid,
  onboarding_completed boolean,
  onboarding_completed_at timestamp with time zone,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  user_roles jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.email,
    p.name,
    p.company_name,
    p.role_id,
    p.onboarding_completed,
    p.onboarding_completed_at,
    p.created_at,
    p.updated_at,
    jsonb_build_object(
      'id', ur.id,
      'name', ur.name,
      'description', ur.description,
      'permissions', ur.permissions
    ) as user_roles
  FROM public.profiles p
  LEFT JOIN public.user_roles ur ON p.role_id = ur.id
  WHERE p.id = target_user_id;
END;
$$;