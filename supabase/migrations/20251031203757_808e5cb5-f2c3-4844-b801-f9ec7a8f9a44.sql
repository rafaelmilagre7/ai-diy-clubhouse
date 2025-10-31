-- ============================================
-- CORREÇÃO: Adicionar SET search_path na função complete_onboarding_final_flow
-- ============================================
-- Esta função foi perdendo o SET search_path em uma migration anterior,
-- causando erro "relation 'profiles' does not exist"
-- Esta correção restaura a configuração original que estava funcionando

CREATE OR REPLACE FUNCTION public.complete_onboarding_final_flow(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_onboarding_data record;
  v_profile_exists boolean;
BEGIN
  RAISE NOTICE '[ONBOARDING_RPC] 🎬 Iniciando para user: %', p_user_id;
  
  -- Verificar se o profile existe
  SELECT EXISTS(SELECT 1 FROM public.profiles WHERE id = p_user_id) INTO v_profile_exists;
  
  IF NOT v_profile_exists THEN
    RAISE NOTICE '[ONBOARDING_RPC] ❌ Profile não existe para user %', p_user_id;
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Profile não encontrado'
    );
  END IF;
  
  RAISE NOTICE '[ONBOARDING_RPC] ✅ Profile existe';
  
  -- Buscar dados do onboarding
  SELECT * INTO v_onboarding_data
  FROM public.onboarding_final 
  WHERE user_id = p_user_id;
  
  -- Se não existir onboarding, criar e finalizar
  IF v_onboarding_data IS NULL THEN
    RAISE NOTICE '[ONBOARDING_RPC] ⚠️ Criando onboarding básico';
    
    INSERT INTO public.onboarding_final (
      user_id, current_step, completed_steps, is_completed, 
      completed_at, created_at, updated_at
    ) VALUES (
      p_user_id, 6, ARRAY[1,2,3,4,5,6], true, now(), now(), now()
    );
    
    UPDATE public.profiles 
    SET onboarding_completed = true, updated_at = now()
    WHERE id = p_user_id;
    
    RAISE NOTICE '[ONBOARDING_RPC] ✅ Criado e finalizado';
    RETURN jsonb_build_object('success', true, 'message', 'Criado do zero');
  END IF;
  
  RAISE NOTICE '[ONBOARDING_RPC] 📊 Finalizando onboarding existente';
  
  -- Atualizar onboarding_final
  UPDATE public.onboarding_final
  SET 
    is_completed = true,
    completed_at = now(),
    current_step = 6,
    completed_steps = CASE 
      WHEN 6 = ANY(completed_steps) THEN completed_steps
      ELSE array_append(completed_steps, 6)
    END,
    updated_at = now()
  WHERE user_id = p_user_id;
  
  RAISE NOTICE '[ONBOARDING_RPC] ✅ onboarding_final OK';
  
  -- Atualizar profile com dados do onboarding
  UPDATE public.profiles 
  SET 
    onboarding_completed = true,
    name = COALESCE(v_onboarding_data.personal_info->>'name', name),
    company_name = COALESCE(v_onboarding_data.business_info->>'company_name', company_name),
    industry = COALESCE(v_onboarding_data.business_info->>'business_sector', industry),
    updated_at = now()
  WHERE id = p_user_id;
  
  RAISE NOTICE '[ONBOARDING_RPC] ✅ profiles OK';
  
  -- Registrar no audit log
  INSERT INTO public.audit_logs (
    user_id, event_type, action, details, severity
  ) VALUES (
    p_user_id, 'onboarding_completion', 'final_onboarding_completed',
    jsonb_build_object('completed_at', now(), 'step', 6), 'info'
  );
  
  RAISE NOTICE '[ONBOARDING_RPC] 🎉 Concluído!';
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Onboarding finalizado',
    'completed_at', now()
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '[ONBOARDING_RPC] ❌ ERRO: %', SQLERRM;
    RAISE NOTICE '[ONBOARDING_RPC] ❌ DETAIL: %', SQLSTATE;
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM,
      'sqlstate', SQLSTATE
    );
END;
$function$;

-- Adicionar comentário de documentação
COMMENT ON FUNCTION public.complete_onboarding_final_flow(uuid) IS 
'Finaliza o fluxo de onboarding do usuário. SECURITY DEFINER com SET search_path = public para prevenir erros de schema ambíguo ao acessar tabelas do schema public.';