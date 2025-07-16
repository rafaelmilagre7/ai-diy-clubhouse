-- ==========================================
-- CORREÇÕES CRÍTICAS DE SEGURANÇA E ONBOARDING
-- ==========================================

-- 🔒 CORREÇÃO 1: Corrigir Security Definer Views sem search_path
-- Views críticas que acessam auth.users devem ter search_path definido

-- View: tools (corrigir se existir)
DROP VIEW IF EXISTS public.tools;
CREATE VIEW public.tools 
WITH (security_invoker = true) AS
SELECT * FROM public.benefits;

-- View: learning_lessons_with_relations (corrigir se existir)  
DROP VIEW IF EXISTS public.learning_lessons_with_relations;

-- 🔒 CORREÇÃO 2: Funções SECURITY DEFINER sem search_path
-- Adicionar SET search_path = '' às funções críticas

-- Função: is_user_admin
CREATE OR REPLACE FUNCTION public.is_user_admin(check_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.profiles p
    JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = check_user_id 
    AND ur.name = 'admin'
  );
$$;

-- Função: is_admin_user (fallback)
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT public.is_user_admin(auth.uid());
$$;

-- 🔒 CORREÇÃO 3: Corrigir políticas duplicadas e conflitantes

-- Limpar políticas duplicadas em onboarding_final
DROP POLICY IF EXISTS "onboarding_final_secure_insert_policy" ON public.onboarding_final;
DROP POLICY IF EXISTS "onboarding_final_secure_insert" ON public.onboarding_final;
DROP POLICY IF EXISTS "Users can insert own onboarding" ON public.onboarding_final;
DROP POLICY IF EXISTS "Users can view own onboarding" ON public.onboarding_final;
DROP POLICY IF EXISTS "Users can update own onboarding" ON public.onboarding_final;
DROP POLICY IF EXISTS "Admins can manage all onboarding" ON public.onboarding_final;

-- Recriar políticas consolidadas para onboarding_final
CREATE POLICY "onboarding_final_user_select" 
ON public.onboarding_final 
FOR SELECT 
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "onboarding_final_user_insert" 
ON public.onboarding_final 
FOR INSERT 
TO authenticated
WITH CHECK (user_id = auth.uid() AND auth.uid() IS NOT NULL);

CREATE POLICY "onboarding_final_user_update" 
ON public.onboarding_final 
FOR UPDATE 
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "onboarding_final_admin_all" 
ON public.onboarding_final 
FOR ALL 
TO authenticated
USING (public.is_user_admin(auth.uid()));

-- 🔒 CORREÇÃO 4: Função de limpeza de onboarding melhorada
CREATE OR REPLACE FUNCTION public.get_onboarding_next_step(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_profile public.profiles;
  v_onboarding public.onboarding_final;
  v_step integer;
  v_redirect_url text;
  v_is_completed boolean;
BEGIN
  -- Buscar perfil do usuário
  SELECT * INTO v_profile FROM public.profiles WHERE id = p_user_id;
  
  -- Se não existe perfil, retornar erro
  IF v_profile.id IS NULL THEN
    RETURN jsonb_build_object(
      'error', 'user_not_found',
      'message', 'Usuário não encontrado',
      'redirect_url', '/login'
    );
  END IF;
  
  -- Se onboarding já está marcado como completo no perfil
  IF v_profile.onboarding_completed = true THEN
    RETURN jsonb_build_object(
      'is_completed', true,
      'current_step', 7,
      'redirect_url', '/dashboard',
      'message', 'Onboarding já completado'
    );
  END IF;
  
  -- Buscar dados de onboarding
  SELECT * INTO v_onboarding FROM public.onboarding_final WHERE user_id = p_user_id;
  
  -- Se não existe onboarding, inicializar automaticamente
  IF v_onboarding.id IS NULL THEN
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
      status
    ) VALUES (
      p_user_id,
      1,
      ARRAY[]::integer[],
      false,
      '{}',
      '{}',
      '{}',
      '{}',
      '{}',
      'in_progress'
    ) RETURNING * INTO v_onboarding;
  END IF;
  
  -- Verificar se está completo
  v_is_completed := v_onboarding.is_completed;
  v_step := COALESCE(v_onboarding.current_step, 1);
  
  -- Se completado, redirecionar para dashboard
  IF v_is_completed THEN
    v_redirect_url := '/dashboard';
  ELSE
    -- Determinar próximo passo baseado no current_step
    CASE v_step
      WHEN 1 THEN v_redirect_url := '/onboarding/step/1';
      WHEN 2 THEN v_redirect_url := '/onboarding/step/2';
      WHEN 3 THEN v_redirect_url := '/onboarding/step/3';
      WHEN 4 THEN v_redirect_url := '/onboarding/step/4';
      WHEN 5 THEN v_redirect_url := '/onboarding/step/5';
      WHEN 6 THEN v_redirect_url := '/onboarding/step/6';
      ELSE v_redirect_url := '/dashboard';
    END CASE;
  END IF;
  
  RETURN jsonb_build_object(
    'current_step', v_step,
    'is_completed', v_is_completed,
    'redirect_url', v_redirect_url,
    'completed_steps', COALESCE(v_onboarding.completed_steps, ARRAY[]::integer[]),
    'status', COALESCE(v_onboarding.status, 'in_progress')
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Erro em get_onboarding_next_step: %', SQLERRM;
    RETURN jsonb_build_object(
      'error', 'internal_error',
      'message', 'Erro interno: ' || SQLERRM,
      'redirect_url', '/dashboard'
    );
END;
$$;

-- 🔒 CORREÇÃO 5: Garantir indexes de performance
CREATE INDEX IF NOT EXISTS idx_onboarding_final_user_id ON public.onboarding_final(user_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_final_status ON public.onboarding_final(status) WHERE status != 'completed';
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(id);
CREATE INDEX IF NOT EXISTS idx_profiles_role_id ON public.profiles(role_id);

-- 🔒 CORREÇÃO 6: Função de limpeza de dados órfãos
CREATE OR REPLACE FUNCTION public.cleanup_onboarding_orphans()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  orphan_count integer := 0;
BEGIN
  -- Limpar registros de onboarding sem perfil correspondente
  DELETE FROM public.onboarding_final 
  WHERE user_id NOT IN (SELECT id FROM public.profiles);
  
  GET DIAGNOSTICS orphan_count = ROW_COUNT;
  
  RETURN jsonb_build_object(
    'success', true,
    'orphans_cleaned', orphan_count,
    'timestamp', now()
  );
END;
$$;