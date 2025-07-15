-- CORREÇÃO CRÍTICA: Relaxar validações restritivas do onboarding

-- 1. Criar função para identificar usuários travados
CREATE OR REPLACE FUNCTION diagnose_stuck_users()
RETURNS TABLE (
  user_id UUID,
  email TEXT,
  current_step INTEGER,
  completed_steps INTEGER[],
  hours_stuck NUMERIC,
  suggested_action TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id as user_id,
    p.email,
    COALESCE(onb.current_step, 1) as current_step,
    COALESCE(onb.completed_steps, ARRAY[]::INTEGER[]) as completed_steps,
    ROUND(EXTRACT(EPOCH FROM (NOW() - COALESCE(onb.updated_at, onb.created_at)))/3600, 2) as hours_stuck,
    CASE 
      WHEN array_length(COALESCE(onb.completed_steps, ARRAY[]::INTEGER[]), 1) IS NULL THEN 'DESTRAVAR_STEP_1'
      WHEN COALESCE(onb.current_step, 1) = 2 AND array_length(onb.completed_steps, 1) = 1 THEN 'DESTRAVAR_STEP_2'
      WHEN COALESCE(onb.current_step, 1) = 3 AND array_length(onb.completed_steps, 1) = 2 THEN 'DESTRAVAR_STEP_3'
      ELSE 'ANALISAR_MANUALMENTE'
    END as suggested_action
  FROM profiles p
  LEFT JOIN onboarding_final onb ON p.id = onb.user_id
  WHERE p.onboarding_completed = false
    AND EXTRACT(EPOCH FROM (NOW() - COALESCE(onb.updated_at, onb.created_at)))/3600 > 0.5
  ORDER BY hours_stuck DESC;
END;
$$;

-- 2. Função para destrava usuários automaticamente
CREATE OR REPLACE FUNCTION fix_stuck_onboarding_users()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  fixed_count INTEGER := 0;
  user_record RECORD;
BEGIN
  -- Destrava usuários no step 1 que não têm completed_steps
  FOR user_record IN 
    SELECT p.id, p.email, onb.current_step, onb.completed_steps
    FROM profiles p
    LEFT JOIN onboarding_final onb ON p.id = onb.user_id
    WHERE p.onboarding_completed = false
      AND (onb.completed_steps IS NULL OR array_length(onb.completed_steps, 1) IS NULL)
      AND COALESCE(onb.current_step, 1) = 1
  LOOP
    -- Simular que step 1 foi completado com dados mínimos
    UPDATE onboarding_final
    SET 
      completed_steps = ARRAY[1],
      current_step = 2,
      personal_info = COALESCE(personal_info, '{}'::jsonb) || jsonb_build_object(
        'name', COALESCE(personal_info->>'name', 'Usuário'),
        'email', user_record.email
      ),
      updated_at = now()
    WHERE user_id = user_record.id;
    
    fixed_count := fixed_count + 1;
    RAISE NOTICE 'Destravado usuário %: %', user_record.email, user_record.id;
  END LOOP;
  
  -- Destrava usuários no step 2 que ficaram presos
  FOR user_record IN 
    SELECT p.id, p.email, onb.current_step, onb.completed_steps
    FROM profiles p
    LEFT JOIN onboarding_final onb ON p.id = onb.user_id
    WHERE p.onboarding_completed = false
      AND onb.current_step = 2
      AND array_length(onb.completed_steps, 1) = 1
      AND EXTRACT(EPOCH FROM (NOW() - onb.updated_at))/3600 > 1 -- Mais de 1 hora parado
  LOOP
    -- Simular que step 2 foi completado com dados mínimos
    UPDATE onboarding_final
    SET 
      completed_steps = ARRAY[1, 2],
      current_step = 3,
      business_info = COALESCE(business_info, '{}'::jsonb) || jsonb_build_object(
        'position', COALESCE(business_info->>'position', 'Profissional'),
        'business_sector', COALESCE(business_info->>'business_sector', 'Outros')
      ),
      updated_at = now()
    WHERE user_id = user_record.id;
    
    fixed_count := fixed_count + 1;
    RAISE NOTICE 'Destravado step 2 para usuário %: %', user_record.email, user_record.id;
  END LOOP;
  
  RETURN jsonb_build_object(
    'success', true,
    'fixed_users', fixed_count,
    'message', format('Destravados %s usuários do onboarding', fixed_count)
  );
END;
$$;

-- 3. Função para telemetria de onboarding
CREATE OR REPLACE FUNCTION log_onboarding_event(
  p_user_id UUID,
  p_event_type TEXT,
  p_step INTEGER,
  p_event_data JSONB DEFAULT '{}'::jsonb
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO analytics (
    user_id,
    event_type,
    event_data,
    created_at
  ) VALUES (
    p_user_id,
    'onboarding_' || p_event_type,
    p_event_data || jsonb_build_object(
      'step', p_step,
      'timestamp', extract(epoch from now())
    ),
    now()
  );
END;
$$;