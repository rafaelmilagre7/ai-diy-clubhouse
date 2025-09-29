-- Simplificar função de busca de usuários com filtros reais
CREATE OR REPLACE FUNCTION get_users_with_filters_public(
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0,
  p_search TEXT DEFAULT NULL,
  p_user_type TEXT DEFAULT NULL
)
RETURNS TABLE(
  id UUID,
  email TEXT,
  name TEXT,
  avatar_url TEXT,
  company_name TEXT,
  industry TEXT,
  role_id UUID,
  role TEXT,
  user_roles JSONB,
  organization_id UUID,
  organization JSONB,
  is_master_user BOOLEAN,
  onboarding_completed BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE,
  total_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  where_clause TEXT := '';
  total_count_val BIGINT;
BEGIN
  -- Verificar se é admin
  IF NOT is_user_admin_secure(auth.uid()) THEN
    RAISE EXCEPTION 'Acesso negado - apenas administradores';
  END IF;

  -- Construir cláusula WHERE baseada nos filtros
  IF p_search IS NOT NULL AND p_search != '' THEN
    where_clause := where_clause || ' AND (p.name ILIKE ''%' || p_search || '%'' OR p.email ILIKE ''%' || p_search || '%'' OR p.company_name ILIKE ''%' || p_search || '%'')';
  END IF;

  -- Filtros simplificados baseados na estrutura real do banco
  IF p_user_type IS NOT NULL THEN
    CASE p_user_type
      WHEN 'master' THEN
        where_clause := where_clause || ' AND p.is_master_user = true';
      WHEN 'individual' THEN
        where_clause := where_clause || ' AND (p.is_master_user = false OR p.is_master_user IS NULL)';
      WHEN 'onboarding_completed' THEN
        where_clause := where_clause || ' AND p.onboarding_completed = true';
      WHEN 'onboarding_pending' THEN
        where_clause := where_clause || ' AND (p.onboarding_completed = false OR p.onboarding_completed IS NULL)';
    END CASE;
  END IF;

  -- Contar total de registros
  EXECUTE 'SELECT COUNT(*) FROM profiles p
    LEFT JOIN user_roles ur ON p.role_id = ur.id
    LEFT JOIN organizations o ON p.organization_id = o.id
    WHERE 1=1' || where_clause
  INTO total_count_val;

  -- Query principal com paginação
  RETURN QUERY EXECUTE '
    SELECT 
      p.id,
      p.email,
      p.name,
      p.avatar_url,
      p.company_name,
      p.industry,
      p.role_id,
      p.role,
      jsonb_build_object(
        ''id'', ur.id,
        ''name'', ur.name,
        ''description'', ur.description
      ) as user_roles,
      p.organization_id,
      CASE WHEN o.id IS NOT NULL THEN
        jsonb_build_object(
          ''id'', o.id,
          ''name'', o.name,
          ''master_user_id'', o.master_user_id
        )
      ELSE NULL END as organization,
      p.is_master_user,
      p.onboarding_completed,
      p.created_at,
      ' || total_count_val || '::BIGINT as total_count
    FROM profiles p
    LEFT JOIN user_roles ur ON p.role_id = ur.id
    LEFT JOIN organizations o ON p.organization_id = o.id
    WHERE 1=1' || where_clause || '
    ORDER BY 
      CASE WHEN p.is_master_user = true THEN 1 ELSE 2 END,
      p.created_at DESC
    LIMIT ' || p_limit || ' OFFSET ' || p_offset;
END;
$$;

-- Atualizar função de estatísticas para refletir dados reais
CREATE OR REPLACE FUNCTION get_simplified_user_stats_public()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  stats JSONB;
  total_users INTEGER;
  masters INTEGER;
  individual_users INTEGER;
  onboarding_completed INTEGER;
  onboarding_pending INTEGER;
BEGIN
  -- Verificar se é admin
  IF NOT is_user_admin_secure(auth.uid()) THEN
    RETURN jsonb_build_object('error', 'Acesso negado - apenas administradores');
  END IF;

  -- Contar estatísticas reais
  SELECT COUNT(*) INTO total_users FROM profiles;
  SELECT COUNT(*) INTO masters FROM profiles WHERE is_master_user = true;
  SELECT COUNT(*) INTO individual_users FROM profiles WHERE (is_master_user = false OR is_master_user IS NULL);
  SELECT COUNT(*) INTO onboarding_completed FROM profiles WHERE onboarding_completed = true;
  SELECT COUNT(*) INTO onboarding_pending FROM profiles WHERE (onboarding_completed = false OR onboarding_completed IS NULL);

  -- Construir objeto de resposta simplificado
  stats := jsonb_build_object(
    'total_users', total_users,
    'masters', masters,
    'individual_users', individual_users,
    'onboarding_completed', onboarding_completed,
    'onboarding_pending', onboarding_pending
  );

  RETURN stats;
END;
$$;