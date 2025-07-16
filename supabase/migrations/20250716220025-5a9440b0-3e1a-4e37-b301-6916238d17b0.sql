-- ==========================================
-- FASE 1: CORREÇÕES CRÍTICAS DE ONBOARDING
-- ==========================================

-- 🎯 CORREÇÃO 1: Função get_onboarding_next_step com campos corretos
CREATE OR REPLACE FUNCTION public.get_onboarding_next_step(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
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
      goals_info, -- CORRIGIDO: era 'goals'
      personalization, -- CORRIGIDO: era 'preferences'
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

-- 🎯 CORREÇÃO 2: Consolidar políticas RLS duplicadas em onboarding_final
-- Primeiro, remover políticas existentes que podem estar duplicadas
DROP POLICY IF EXISTS "onboarding_final_secure_insert_policy" ON public.onboarding_final;
DROP POLICY IF EXISTS "onboarding_final_secure_insert" ON public.onboarding_final;
DROP POLICY IF EXISTS "Users can insert own onboarding" ON public.onboarding_final;
DROP POLICY IF EXISTS "onboarding_final_user_select" ON public.onboarding_final;
DROP POLICY IF EXISTS "Users can view own onboarding" ON public.onboarding_final;
DROP POLICY IF EXISTS "onboarding_final_user_update" ON public.onboarding_final;
DROP POLICY IF EXISTS "Users can update own onboarding" ON public.onboarding_final;
DROP POLICY IF EXISTS "onboarding_final_admin_all" ON public.onboarding_final;
DROP POLICY IF EXISTS "Admins can manage all onboarding" ON public.onboarding_final;

-- Criar políticas RLS consolidadas e bem definidas
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
USING (is_user_admin(auth.uid()));

-- 🎯 CORREÇÃO 3: Verificar se trigger de sincronização está ativo
-- O trigger sync_onboarding_final_to_profile já existe, apenas garantir que está funcionando
-- Recriar apenas se necessário
CREATE OR REPLACE TRIGGER onboarding_final_sync_profile
  AFTER INSERT OR UPDATE ON public.onboarding_final
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_onboarding_final_to_profile();

-- 🎯 CORREÇÃO 4: Melhorar function initialize_onboarding_for_user
-- A função já existe e está correta, apenas garantir que está atualizada

-- 🎯 CORREÇÃO 5: Adicionar index para performance
CREATE INDEX IF NOT EXISTS idx_onboarding_final_user_id ON public.onboarding_final(user_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_final_status ON public.onboarding_final(status) WHERE status != 'completed';

-- 🎯 CORREÇÃO 6: Função de limpeza de dados órfãos
CREATE OR REPLACE FUNCTION public.cleanup_onboarding_orphans()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
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