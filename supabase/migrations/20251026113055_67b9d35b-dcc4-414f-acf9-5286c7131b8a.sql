-- Corrigir função check_ai_solution_limit para lidar com NULL values
CREATE OR REPLACE FUNCTION check_ai_solution_limit(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_month_year VARCHAR(7);
  v_usage_record RECORD;
  v_user_role VARCHAR(50);
  v_monthly_limit INTEGER;
  v_generations_count INTEGER;
  v_builder_limit_text TEXT;
BEGIN
  v_month_year := TO_CHAR(NOW(), 'YYYY-MM');
  
  -- Buscar role do usuário
  SELECT ur.name INTO v_user_role
  FROM profiles p
  JOIN user_roles ur ON p.role_id = ur.id
  WHERE p.id = p_user_id;
  
  -- Se admin, limite infinito
  IF v_user_role = 'admin' THEN
    v_monthly_limit := 999999;
  ELSE
    -- Buscar builder_limit como TEXT primeiro
    SELECT ur.permissions->>'builder_limit' INTO v_builder_limit_text
    FROM profiles p
    JOIN user_roles ur ON p.role_id = ur.id
    WHERE p.id = p_user_id;
    
    -- Converter para INTEGER com fallback para 3
    IF v_builder_limit_text IS NULL OR v_builder_limit_text = '' THEN
      v_monthly_limit := 3;
    ELSE
      BEGIN
        v_monthly_limit := v_builder_limit_text::INTEGER;
      EXCEPTION WHEN OTHERS THEN
        v_monthly_limit := 3;
      END;
    END IF;
  END IF;
  
  -- Buscar ou criar registro de uso mensal
  SELECT * INTO v_usage_record
  FROM ai_solution_usage
  WHERE user_id = p_user_id AND month_year = v_month_year;
  
  IF NOT FOUND THEN
    INSERT INTO ai_solution_usage (user_id, month_year, generations_count, monthly_limit)
    VALUES (p_user_id, v_month_year, 0, v_monthly_limit)
    RETURNING * INTO v_usage_record;
  END IF;
  
  v_generations_count := COALESCE(v_usage_record.generations_count, 0);
  
  RETURN jsonb_build_object(
    'can_generate', v_generations_count < v_monthly_limit,
    'generations_used', v_generations_count,
    'monthly_limit', v_monthly_limit,
    'remaining', v_monthly_limit - v_generations_count,
    'reset_date', TO_CHAR(DATE_TRUNC('month', NOW()) + INTERVAL '1 month', 'YYYY-MM-DD')
  );
END;
$$;

-- Atualizar user_roles para incluir builder_limit padrão
UPDATE user_roles
SET permissions = jsonb_set(
  permissions,
  '{builder_limit}',
  '10'::jsonb
)
WHERE name IN ('hands_on', 'membro_club')
AND (permissions->>'builder_limit') IS NULL;