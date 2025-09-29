-- Dropar função atual com todas as versões possíveis
DROP FUNCTION IF EXISTS public.get_users_with_filters_v2(text, text, integer, integer);
DROP FUNCTION IF EXISTS public.get_users_with_filters_v2(integer, integer, text, text);

-- Recriar função COMPLETA com TODOS os campos necessários
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
  member_count BIGINT,
  is_master_user BOOLEAN,
  onboarding_completed BOOLEAN,
  master_email TEXT,
  organization JSONB,
  total_count BIGINT
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
  WITH filtered_users AS (
    SELECT 
      p.id,
      p.email,
      p.name,
      p.avatar_url,
      p.role,
      p.role_id,
      p.company_name,
      p.industry,
      p.created_at,
      p.organization_id,
      p.onboarding_completed,
      o.master_user_id,
      o.id as org_id,
      o.name as org_name,
      ur.id as user_role_id,
      ur.name as user_role_name,
      ur.description as user_role_description
    FROM profiles p
    LEFT JOIN user_roles ur ON p.role_id = ur.id
    LEFT JOIN organizations o ON p.organization_id = o.id
    WHERE
      -- Filtro de tipo
      CASE 
        WHEN p_filter_type = 'masters' THEN 
          EXISTS (
            SELECT 1 FROM organizations org 
            WHERE org.master_user_id = p.id
          )
        WHEN p_filter_type = 'team_members' THEN 
          p.organization_id IS NOT NULL 
          AND EXISTS (
            SELECT 1 FROM organizations org 
            WHERE org.id = p.organization_id 
            AND org.master_user_id IS NOT NULL 
            AND org.master_user_id != p.id
          )
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
  ),
  member_counts AS (
    SELECT 
      o.master_user_id,
      COUNT(DISTINCT p.id) as member_count
    FROM organizations o
    INNER JOIN profiles p ON p.organization_id = o.id
    WHERE o.master_user_id IS NOT NULL
    GROUP BY o.master_user_id
  )
  SELECT 
    fu.id,
    fu.email,
    fu.name,
    fu.avatar_url,
    fu.role,
    fu.role_id,
    jsonb_build_object(
      'id', fu.user_role_id,
      'name', fu.user_role_name,
      'description', fu.user_role_description
    ) AS user_roles,
    fu.company_name,
    fu.industry,
    fu.created_at,
    fu.organization_id,
    fu.master_user_id,
    COALESCE(mc.member_count, 0) as member_count,
    -- Campo calculado: é master se é master de alguma organização
    EXISTS (
      SELECT 1 FROM organizations org 
      WHERE org.master_user_id = fu.id
    ) as is_master_user,
    fu.onboarding_completed,
    -- Email do master (se for membro de equipe)
    (
      SELECT mp.email 
      FROM profiles mp 
      WHERE mp.id = fu.master_user_id
      LIMIT 1
    ) as master_email,
    -- Objeto organization completo
    CASE 
      WHEN fu.org_id IS NOT NULL THEN
        jsonb_build_object(
          'id', fu.org_id,
          'name', fu.org_name,
          'master_user_id', fu.master_user_id
        )
      ELSE NULL
    END as organization,
    -- WINDOW FUNCTION para total count (soluciona problema de paginação)
    COUNT(*) OVER() as total_count
  FROM filtered_users fu
  LEFT JOIN member_counts mc ON fu.id = mc.master_user_id
  ORDER BY fu.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

COMMENT ON FUNCTION public.get_users_with_filters_v2 IS 'Versão COMPLETA - retorna TODOS os campos necessários incluindo total_count, is_master_user, onboarding_completed, master_email e organization. Ordem: (search_query, filter_type, limit, offset)';