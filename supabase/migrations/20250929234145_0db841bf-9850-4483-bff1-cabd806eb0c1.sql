-- Remover todas as versões ambíguas da função
DROP FUNCTION IF EXISTS public.get_users_with_filters_v2(text, text, integer, integer);
DROP FUNCTION IF EXISTS public.get_users_with_filters_v2(integer, integer, text, text);

-- Recriar função consolidada com ordem de parâmetros correta
-- Ordem: p_search_query, p_filter_type, p_limit, p_offset
CREATE OR REPLACE FUNCTION public.get_users_with_filters_v2(
  p_search_query TEXT DEFAULT NULL,
  p_filter_type TEXT DEFAULT 'all',
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  email TEXT,
  name TEXT,
  avatar_url TEXT,
  role TEXT,
  role_id UUID,
  user_roles JSONB,
  company_name TEXT,
  industry TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  organization_id UUID,
  master_user_id UUID,
  member_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verificar acesso admin
  IF NOT public.is_user_admin_secure(auth.uid()) THEN
    RAISE EXCEPTION 'Acesso negado - apenas administradores';
  END IF;

  RETURN QUERY
  WITH master_member_counts AS (
    SELECT 
      o.master_user_id,
      COUNT(DISTINCT p.id) as member_count
    FROM organizations o
    INNER JOIN profiles p ON p.organization_id = o.id
    WHERE o.master_user_id IS NOT NULL
    GROUP BY o.master_user_id
  )
  SELECT 
    p.id,
    p.email,
    p.name,
    p.avatar_url,
    p.role,
    p.role_id,
    jsonb_build_object(
      'id', ur.id,
      'name', ur.name,
      'description', ur.description
    ) AS user_roles,
    p.company_name,
    p.industry,
    p.created_at,
    p.organization_id,
    o.master_user_id,
    COALESCE(mmc.member_count, 0) as member_count
  FROM profiles p
  LEFT JOIN user_roles ur ON p.role_id = ur.id
  LEFT JOIN organizations o ON p.organization_id = o.id
  LEFT JOIN master_member_counts mmc ON p.id = mmc.master_user_id
  WHERE
    -- Filtro de tipo
    CASE 
      WHEN p_filter_type = 'masters' THEN o.master_user_id = p.id
      WHEN p_filter_type = 'team_members' THEN o.master_user_id IS NOT NULL AND o.master_user_id != p.id
      ELSE TRUE
    END
    AND
    -- Filtro de busca
    (
      p_search_query IS NULL OR
      p.name ILIKE '%' || p_search_query || '%' OR
      p.email ILIKE '%' || p_search_query || '%' OR
      p.company_name ILIKE '%' || p_search_query || '%' OR
      ur.name ILIKE '%' || p_search_query || '%'
    )
  ORDER BY p.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

COMMENT ON FUNCTION public.get_users_with_filters_v2 IS 'Versão consolidada final - busca usuários com filtros e contagem de membros. Ordem de parâmetros: (search_query, filter_type, limit, offset)';