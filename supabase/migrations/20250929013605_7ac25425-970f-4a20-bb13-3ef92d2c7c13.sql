-- Função para buscar usuários com filtros avançados incluindo membros de masters
CREATE OR REPLACE FUNCTION get_users_with_master_members_public(
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
  base_query TEXT;
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

  -- Filtro por tipo de usuário com lógica especial para masters
  IF p_user_type IS NOT NULL THEN
    CASE p_user_type
      WHEN 'master' THEN
        -- Para masters: incluir masters E seus membros de equipe
        where_clause := where_clause || ' AND (p.is_master_user = true OR ur.name = ''master'' OR EXISTS (
          SELECT 1 FROM profiles pm 
          WHERE pm.organization_id = p.organization_id 
          AND (pm.is_master_user = true OR EXISTS (
            SELECT 1 FROM user_roles urm 
            WHERE urm.id = pm.role_id AND urm.name = ''master''
          ))
        ))';
      WHEN 'team_member' THEN
        where_clause := where_clause || ' AND (ur.name = ''team_member'' OR ur.name ILIKE ''%membro%'' OR ur.name ILIKE ''%equipe%'')';
      WHEN 'individual' THEN
        where_clause := where_clause || ' AND (ur.name = ''individual'' OR ur.name ILIKE ''%individual%'')';
      WHEN 'active' THEN
        where_clause := where_clause || ' AND p.status = ''active''';
      WHEN 'onboarding_completed' THEN
        where_clause := where_clause || ' AND p.onboarding_completed = true';
      WHEN 'onboarding_pending' THEN
        where_clause := where_clause || ' AND p.onboarding_completed = false';
      WHEN 'new_7d' THEN
        where_clause := where_clause || ' AND p.created_at > (NOW() - INTERVAL ''7 days'')';
      WHEN 'new_30d' THEN
        where_clause := where_clause || ' AND p.created_at > (NOW() - INTERVAL ''30 days'')';
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
      CASE WHEN p.is_master_user = true OR ur.name = ''master'' THEN 1 ELSE 2 END,
      p.created_at DESC
    LIMIT ' || p_limit || ' OFFSET ' || p_offset;
END;
$$;