-- Corrigir função de finalização do onboarding para transferir dados empresariais
CREATE OR REPLACE FUNCTION public.complete_onboarding_flow(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  onboarding_data record;
  result jsonb;
BEGIN
  -- Buscar dados do onboarding
  SELECT 
    company_name,
    company_segment,
    current_position,
    company_size,
    annual_revenue_range,
    main_challenge,
    current_step,
    is_completed
  INTO onboarding_data
  FROM public.quick_onboarding 
  WHERE user_id = p_user_id;
  
  -- Se não encontrou dados do onboarding, criar registro básico
  IF onboarding_data IS NULL THEN
    RAISE NOTICE '[ONBOARDING] Dados não encontrados para usuário: %', p_user_id;
    
    -- Apenas marcar onboarding como completo no perfil
    UPDATE public.profiles 
    SET 
      onboarding_completed = true,
      updated_at = now()
    WHERE id = p_user_id;
    
    RETURN jsonb_build_object(
      'success', true,
      'message', 'Onboarding finalizado sem dados específicos'
    );
  END IF;
  
  RAISE NOTICE '[ONBOARDING] Transferindo dados para perfil: company_name=%, company_segment=%', 
    onboarding_data.company_name, onboarding_data.company_segment;
  
  -- Atualizar perfil com dados do onboarding
  UPDATE public.profiles 
  SET 
    onboarding_completed = true,
    company_name = COALESCE(onboarding_data.company_name, company_name),
    industry = COALESCE(onboarding_data.company_segment, industry),
    updated_at = now()
  WHERE id = p_user_id;
  
  -- Marcar onboarding como completo
  UPDATE public.quick_onboarding
  SET 
    is_completed = true,
    updated_at = now()
  WHERE user_id = p_user_id;
  
  -- Log da operação
  INSERT INTO public.audit_logs (
    user_id,
    event_type,
    action,
    details,
    severity
  ) VALUES (
    p_user_id,
    'onboarding_completion',
    'data_transfer_to_profile',
    jsonb_build_object(
      'company_name', onboarding_data.company_name,
      'company_segment', onboarding_data.company_segment,
      'current_position', onboarding_data.current_position,
      'transferred_at', now()
    ),
    'info'
  );
  
  result := jsonb_build_object(
    'success', true,
    'message', 'Onboarding finalizado e dados transferidos com sucesso',
    'data_transferred', jsonb_build_object(
      'company_name', onboarding_data.company_name,
      'industry', onboarding_data.company_segment
    )
  );
  
  RETURN result;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '[ONBOARDING] ERRO: % para usuário %', SQLERRM, p_user_id;
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$function$;

-- Função para corrigir dados existentes dos usuários que já completaram onboarding
CREATE OR REPLACE FUNCTION public.fix_existing_onboarding_data()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  user_record record;
  fixed_count integer := 0;
  result jsonb;
BEGIN
  -- Verificar se é admin
  IF NOT public.is_user_admin_secure(auth.uid()) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Acesso negado - apenas administradores'
    );
  END IF;
  
  -- Corrigir usuários que têm onboarding completo mas não têm dados empresariais no perfil
  FOR user_record IN 
    SELECT 
      p.id,
      p.email,
      p.name,
      p.company_name as profile_company,
      p.industry as profile_industry,
      qo.company_name as onboarding_company,
      qo.company_segment as onboarding_industry
    FROM public.profiles p
    INNER JOIN public.quick_onboarding qo ON p.id = qo.user_id
    WHERE p.onboarding_completed = true
    AND (
      (p.company_name IS NULL OR p.company_name = '') 
      OR (p.industry IS NULL OR p.industry = '')
    )
    AND (
      qo.company_name IS NOT NULL 
      OR qo.company_segment IS NOT NULL
    )
  LOOP
    BEGIN
      -- Atualizar perfil com dados do onboarding
      UPDATE public.profiles 
      SET 
        company_name = COALESCE(
          NULLIF(company_name, ''), 
          user_record.onboarding_company
        ),
        industry = COALESCE(
          NULLIF(industry, ''), 
          user_record.onboarding_industry
        ),
        updated_at = now()
      WHERE id = user_record.id;
      
      fixed_count := fixed_count + 1;
      
      RAISE NOTICE '[FIX] Corrigido usuário %: company_name=%, industry=%', 
        user_record.email, user_record.onboarding_company, user_record.onboarding_industry;
        
    EXCEPTION
      WHEN OTHERS THEN
        RAISE NOTICE '[FIX] ERRO ao corrigir usuário %: %', user_record.email, SQLERRM;
        CONTINUE;
    END;
  END LOOP;
  
  result := jsonb_build_object(
    'success', true,
    'message', format('Corrigidos dados de %s usuários', fixed_count),
    'users_fixed', fixed_count
  );
  
  -- Log da operação
  INSERT INTO public.audit_logs (
    user_id,
    event_type,
    action,
    details,
    severity
  ) VALUES (
    auth.uid(),
    'data_correction',
    'fix_onboarding_profile_data',
    result,
    'info'
  );
  
  RETURN result;
END;
$function$;