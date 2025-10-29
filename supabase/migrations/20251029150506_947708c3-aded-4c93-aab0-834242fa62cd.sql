-- ============================================================
-- FIX DEFINITIVO: Onboarding à prova de falhas
-- ============================================================

-- 1. Garantir que TODOS os profiles tenham onboarding
INSERT INTO onboarding_final (
  user_id, personal_info, location_info, discovery_info,
  business_info, business_context, goals_info, ai_experience, 
  personalization, current_step, completed_steps, is_completed,
  status, created_at, updated_at
)
SELECT 
  p.id,
  jsonb_build_object('email', p.email, 'name', COALESCE(p.name, 'Usuário')),
  '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, '{}'::jsonb,
  '{}'::jsonb, '{}'::jsonb, '{}'::jsonb,
  0, ARRAY[]::integer[], false, 'not_started',
  NOW(), NOW()
FROM profiles p
LEFT JOIN onboarding_final of ON p.id = of.user_id
WHERE of.user_id IS NULL
ON CONFLICT (user_id) DO NOTHING;

-- 2. Criar função de recuperação automática para usuários órfãos
CREATE OR REPLACE FUNCTION recover_orphaned_users()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Criar onboarding para profiles sem onboarding
  INSERT INTO onboarding_final (
    user_id, personal_info, current_step, completed_steps,
    is_completed, status, created_at, updated_at
  )
  SELECT 
    p.id,
    jsonb_build_object('email', p.email, 'name', COALESCE(p.name, 'Usuário')),
    0, ARRAY[]::integer[], false, 'not_started', NOW(), NOW()
  FROM profiles p
  LEFT JOIN onboarding_final of ON p.id = of.user_id
  WHERE of.user_id IS NULL
  ON CONFLICT (user_id) DO NOTHING;
  
  RAISE NOTICE 'Recuperação de usuários órfãos concluída';
END;
$$;

-- 3. Executar recuperação agora
SELECT recover_orphaned_users();

-- 4. Criar job recorrente de manutenção (previne futuros órfãos)
CREATE OR REPLACE FUNCTION maintenance_fix_orphaned_onboarding()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Auto-completar usuários claramente presos
  UPDATE onboarding_final
  SET 
    is_completed = true,
    completed_at = COALESCE(completed_at, NOW()),
    current_step = 6,
    status = 'completed'
  WHERE 
    is_completed = false
    AND (
      array_length(completed_steps, 1) >= 6
      OR (current_step >= 6 AND updated_at < NOW() - INTERVAL '2 hours')
    );
    
  -- Sincronizar profiles
  UPDATE profiles p
  SET onboarding_completed = true
  FROM onboarding_final of
  WHERE p.id = of.user_id
    AND of.is_completed = true
    AND COALESCE(p.onboarding_completed, false) = false;
END;
$$;