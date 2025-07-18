-- FASE 3: CORREÇÃO DE FUNCTION SEARCH PATH (LOTE 2 - 20 FUNÇÕES)
-- Corrigir as demais funções que não têm search_path definido

-- 21. FUNÇÕES DE ANÁLISE E RELATÓRIOS
CREATE OR REPLACE FUNCTION public.log_onboarding_event(p_user_id uuid, p_event_type text, p_step integer, p_event_data jsonb DEFAULT '{}'::jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
$function$;

-- 22. FUNÇÕES DE BACKUP E MIGRAÇÃO
CREATE OR REPLACE FUNCTION public.migrate_onboarding_data_to_quick()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  migrated_count INTEGER := 0;
  total_count INTEGER := 0;
  result JSONB;
BEGIN
  -- Contar registros para migração
  SELECT COUNT(*) INTO total_count 
  FROM onboarding_progress op
  WHERE NOT EXISTS (
    SELECT 1 FROM quick_onboarding qo WHERE qo.user_id = op.user_id
  );
  
  -- Migrar dados do onboarding_progress para quick_onboarding
  INSERT INTO quick_onboarding (
    user_id,
    name,
    email,
    is_completed
  )
  SELECT 
    op.user_id,
    COALESCE(op.personal_info->>'name', ''),
    COALESCE(op.personal_info->>'email', ''),
    op.is_completed
  FROM onboarding_progress op
  WHERE NOT EXISTS (
    SELECT 1 FROM quick_onboarding qo WHERE qo.user_id = op.user_id
  )
  ON CONFLICT (user_id) DO NOTHING;
  
  GET DIAGNOSTICS migrated_count = ROW_COUNT;
  
  result := jsonb_build_object(
    'success', true,
    'migrated_count', migrated_count,
    'total_count', total_count,
    'message', format('Migrados %s de %s registros', migrated_count, total_count)
  );
  
  RETURN result;
END;
$function$;

-- 23. FUNÇÕES DE VALIDAÇÃO E SEGURANÇA
CREATE OR REPLACE FUNCTION public.validate_password_strength_server(password text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  checks JSONB;
  score INTEGER;
  strength TEXT;
BEGIN
  checks := jsonb_build_object(
    'length', length(password) >= 8,
    'uppercase', password ~ '[A-Z]',
    'lowercase', password ~ '[a-z]',
    'number', password ~ '[0-9]',
    'special', password ~ '[!@#$%^&*()_+\-=\[\]{};'':"\\|,.<>\/?]'
  );
  
  score := (
    CASE WHEN checks->>'length' = 'true' THEN 1 ELSE 0 END +
    CASE WHEN checks->>'uppercase' = 'true' THEN 1 ELSE 0 END +
    CASE WHEN checks->>'lowercase' = 'true' THEN 1 ELSE 0 END +
    CASE WHEN checks->>'number' = 'true' THEN 1 ELSE 0 END +
    CASE WHEN checks->>'special' = 'true' THEN 1 ELSE 0 END
  );
  
  strength := CASE 
    WHEN score < 3 THEN 'weak'
    WHEN score < 5 THEN 'medium'
    ELSE 'strong'
  END;
  
  RETURN jsonb_build_object(
    'checks', checks,
    'score', score,
    'strength', strength,
    'is_valid', score >= 3
  );
END;
$function$;

-- 24. FUNÇÕES DE NETWORKING E ANÁLISE
CREATE OR REPLACE FUNCTION public.generate_networking_matches_for_user(target_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    user_profile RECORD;
    potential_match RECORD;
    match_count INTEGER := 0;
    current_month TEXT;
BEGIN
    current_month := to_char(now(), 'YYYY-MM');
    
    -- Buscar perfil do usuário alvo
    SELECT p.*, ur.name as user_role 
    INTO user_profile 
    FROM profiles p
    LEFT JOIN user_roles ur ON p.role_id = ur.id
    WHERE p.id = target_user_id;
    
    IF user_profile IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'Usuário não encontrado');
    END IF;
    
    -- Limpar matches existentes do mês atual
    DELETE FROM network_matches 
    WHERE user_id = target_user_id AND month_year = current_month;
    
    -- Gerar matches básicos
    FOR potential_match IN 
        SELECT p.*, ur.name as user_role 
        FROM profiles p
        LEFT JOIN user_roles ur ON p.role_id = ur.id
        WHERE p.id != target_user_id 
        AND ur.name IN ('admin', 'member')
        ORDER BY p.created_at DESC
        LIMIT 5
    LOOP
        INSERT INTO network_matches (
            user_id,
            matched_user_id,
            match_type,
            compatibility_score,
            match_reason,
            month_year,
            status
        ) VALUES (
            target_user_id,
            potential_match.id,
            'professional',
            75 + (random() * 25)::numeric(5,2),
            'Match baseado em perfil profissional',
            current_month,
            'pending'
        );
        match_count := match_count + 1;
    END LOOP;
    
    RETURN jsonb_build_object(
        'success', true, 
        'matches_generated', match_count,
        'user_id', target_user_id,
        'month', current_month
    );
END;
$function$;

-- 25. FUNÇÕES DE ONBOARDING SEGURO
CREATE OR REPLACE FUNCTION public.complete_onboarding_secure(
  p_user_id uuid, 
  p_onboarding_data jsonb, 
  p_ip_address text DEFAULT 'unknown'::text, 
  p_user_agent text DEFAULT 'unknown'::text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    v_existing_record public.onboarding_final;
    v_transaction_id text;
    v_result jsonb;
BEGIN
    v_transaction_id := gen_random_uuid()::text;
    
    -- Verificar se já existe um registro completado
    SELECT * INTO v_existing_record
    FROM public.onboarding_final
    WHERE user_id = p_user_id AND is_completed = TRUE
    LIMIT 1;
    
    -- Se já existe e está completo, retornar informação
    IF v_existing_record.id IS NOT NULL THEN
        RETURN jsonb_build_object(
            'success', true,
            'wasAlreadyCompleted', true,
            'message', 'Onboarding já foi completado anteriormente',
            'transactionId', v_transaction_id,
            'completedAt', v_existing_record.completed_at
        );
    END IF;
    
    -- Atualizar ou criar registro
    INSERT INTO public.onboarding_final (
        user_id,
        personal_info,
        business_info,
        goals_info,
        is_completed,
        current_step,
        completed_steps,
        completed_at
    )
    VALUES (
        p_user_id,
        p_onboarding_data->'personal_info',
        p_onboarding_data->'business_info',
        p_onboarding_data->'goals_info',
        TRUE,
        8,
        ARRAY[1,2,3,4,5,6,7,8],
        now()
    )
    ON CONFLICT (user_id) 
    DO UPDATE SET
        personal_info = EXCLUDED.personal_info,
        business_info = EXCLUDED.business_info,
        goals_info = EXCLUDED.goals_info,
        is_completed = TRUE,
        current_step = 8,
        completed_steps = ARRAY[1,2,3,4,5,6,7,8],
        completed_at = now(),
        updated_at = now();
    
    RETURN jsonb_build_object(
        'success', true,
        'wasAlreadyCompleted', false,
        'message', 'Onboarding finalizado com sucesso',
        'transactionId', v_transaction_id,
        'completedAt', now()
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Erro ao finalizar onboarding: ' || SQLERRM,
            'transactionId', v_transaction_id
        );
END;
$function$;

-- LOG DO LOTE 3
INSERT INTO public.audit_logs (
  event_type,
  action,
  details,
  user_id
) VALUES (
  'security_hardening',
  'phase_3_functions_lote_3',
  jsonb_build_object(
    'message', 'FASE 3 - Correção de search_path em funções (Lote 3)',
    'functions_fixed', 5,
    'functions_corrected', ARRAY[
      'log_onboarding_event',
      'migrate_onboarding_data_to_quick',
      'validate_password_strength_server',
      'generate_networking_matches_for_user',
      'complete_onboarding_secure'
    ],
    'batch', 3,
    'timestamp', now()
  ),
  auth.uid()
);