-- Corrigir função de estatísticas para funcionar sem auth
CREATE OR REPLACE FUNCTION get_admin_user_stats_public()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  stats jsonb;
BEGIN
  -- Calcular estatísticas sem verificação de auth (para uso público na interface admin)
  SELECT jsonb_build_object(
    'total_users', COUNT(*),
    'masters', COUNT(CASE WHEN COALESCE(is_master_user, false) = true THEN 1 END),
    'team_members', COUNT(CASE WHEN organization_id IS NOT NULL AND COALESCE(is_master_user, false) != true THEN 1 END),
    'organizations', (SELECT COUNT(DISTINCT id) FROM organizations),
    'individual_users', COUNT(CASE WHEN organization_id IS NULL AND COALESCE(is_master_user, false) != true THEN 1 END)
  ) INTO stats
  FROM profiles;
  
  RETURN stats;
END;
$$;

-- Função para buscar usuários com paginação (versão pública para interface admin)
CREATE OR REPLACE FUNCTION get_users_paginated_public(
  p_limit integer DEFAULT 50,
  p_offset integer DEFAULT 0,
  p_search text DEFAULT NULL,
  p_user_type text DEFAULT NULL,
  p_organization_id uuid DEFAULT NULL
)
RETURNS TABLE(
  id uuid,
  email text,
  name text,
  avatar_url text,
  role text,
  role_id uuid,
  user_roles jsonb,
  company_name text,
  industry text,
  created_at timestamp with time zone,
  is_master_user boolean,
  organization_id uuid,
  organization jsonb,
  total_count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  WITH filtered_users AS (
    SELECT 
      p.id,
      p.email,
      p.name,
      p.avatar_url,
      p.role,
      p.role_id,
      jsonb_build_object('id', ur.id, 'name', ur.name, 'description', ur.description) AS user_roles,
      p.company_name,
      p.industry,
      p.created_at,
      COALESCE(p.is_master_user, false) as is_master_user,
      p.organization_id,
      CASE 
        WHEN o.id IS NOT NULL THEN 
          jsonb_build_object('id', o.id, 'name', o.name, 'master_user_id', o.master_user_id)
        ELSE NULL 
      END as organization,
      COUNT(*) OVER() as total_count
    FROM profiles p
    LEFT JOIN user_roles ur ON p.role_id = ur.id
    LEFT JOIN organizations o ON p.organization_id = o.id
    WHERE 
      (p_search IS NULL OR 
       p.name ILIKE '%' || p_search || '%' OR 
       p.email ILIKE '%' || p_search || '%' OR
       p.company_name ILIKE '%' || p_search || '%' OR
       ur.name ILIKE '%' || p_search || '%' OR
       o.name ILIKE '%' || p_search || '%')
      AND (p_user_type IS NULL OR 
           (p_user_type = 'master' AND COALESCE(p.is_master_user, false) = true) OR
           (p_user_type = 'team_member' AND p.organization_id IS NOT NULL AND COALESCE(p.is_master_user, false) != true) OR
           (p_user_type = 'individual' AND p.organization_id IS NULL AND COALESCE(p.is_master_user, false) != true))
      AND (p_organization_id IS NULL OR p.organization_id = p_organization_id)
    ORDER BY COALESCE(p.is_master_user, false) DESC, p.created_at DESC
    LIMIT p_limit
    OFFSET p_offset
  )
  SELECT * FROM filtered_users;
END;
$$;