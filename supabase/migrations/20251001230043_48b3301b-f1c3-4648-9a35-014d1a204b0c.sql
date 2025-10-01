-- Atualizar função get_users_with_filters_v2 para suportar todos os filtros do frontend
CREATE OR REPLACE FUNCTION public.get_users_with_filters_v2(
  p_search_query text DEFAULT NULL::text, 
  p_filter_type text DEFAULT 'all'::text, 
  p_limit integer DEFAULT 50, 
  p_offset integer DEFAULT 0
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
  organization_id uuid, 
  member_count bigint, 
  total_count bigint, 
  is_master_user boolean, 
  onboarding_completed boolean, 
  master_email text, 
  organization jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Validar p_filter_type - agora aceita todos os filtros do frontend
  IF p_filter_type NOT IN (
    'all', 
    'masters', 
    'team_members', 
    'team_member',  -- Aceitar ambos (singular e plural)
    'individual', 
    'onboarding_completed', 
    'onboarding_pending'
  ) THEN
    p_filter_type := 'all';
  END IF;

  -- Normalizar 'team_member' para 'team_members'
  IF p_filter_type = 'team_member' THEN
    p_filter_type := 'team_members';
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
      jsonb_build_object(
        'id', ur.id, 
        'name', ur.name, 
        'description', ur.description
      ) AS user_roles_json,
      -- Calcular member_count
      COALESCE((
        SELECT COUNT(*)::bigint 
        FROM profiles p2 
        WHERE p2.organization_id = p.organization_id 
        AND p2.id != p.id
      ), 0) AS member_count,
      -- Verificar se é master
      EXISTS (
        SELECT 1 FROM organizations org WHERE org.master_user_id = p.id
      ) AS is_master_user,
      -- Email do master (se for team member)
      (
        SELECT master.email 
        FROM organizations o2 
        JOIN profiles master ON master.id = o2.master_user_id
        WHERE o2.id = p.organization_id
        LIMIT 1
      ) AS master_email,
      -- Dados completos da organização
      (
        SELECT jsonb_build_object(
          'id', o3.id,
          'name', o3.name,
          'created_at', o3.created_at,
          'master_user_id', o3.master_user_id
        )
        FROM organizations o3
        WHERE o3.id = p.organization_id
        LIMIT 1
      ) AS organization_data
    FROM profiles p
    LEFT JOIN user_roles ur ON p.role_id = ur.id
    WHERE 
      -- Aplicar filtro de busca
      (
        p_search_query IS NULL OR 
        p.name ILIKE '%' || p_search_query || '%' OR 
        p.email ILIKE '%' || p_search_query || '%' OR
        p.company_name ILIKE '%' || p_search_query || '%' OR
        ur.name ILIKE '%' || p_search_query || '%'
      )
      AND
      -- Aplicar filtro de tipo (EXPANDIDO)
      (
        (p_filter_type = 'all') OR
        
        -- Masters: usuários que são donos de organizações
        (p_filter_type = 'masters' AND EXISTS (
          SELECT 1 FROM organizations org WHERE org.master_user_id = p.id
        )) OR
        
        -- Team Members: usuários que pertencem a organizações mas não são masters
        (p_filter_type = 'team_members' AND 
          p.organization_id IS NOT NULL AND
          NOT EXISTS (
            SELECT 1 FROM organizations org WHERE org.master_user_id = p.id
          )
        ) OR
        
        -- Individual: usuários sem master e sem organização
        (p_filter_type = 'individual' AND 
          p.organization_id IS NULL AND
          NOT EXISTS (
            SELECT 1 FROM organizations org WHERE org.master_user_id = p.id
          )
        ) OR
        
        -- Onboarding Completo
        (p_filter_type = 'onboarding_completed' AND 
          p.onboarding_completed = true
        ) OR
        
        -- Onboarding Pendente
        (p_filter_type = 'onboarding_pending' AND 
          (p.onboarding_completed = false OR p.onboarding_completed IS NULL)
        )
      )
  )
  SELECT 
    fu.id,
    fu.email,
    fu.name,
    fu.avatar_url,
    fu.role,
    fu.role_id,
    fu.user_roles_json AS user_roles,
    fu.company_name,
    fu.industry,
    fu.created_at,
    fu.organization_id,
    fu.member_count,
    COUNT(*) OVER() AS total_count,
    fu.is_master_user,
    fu.onboarding_completed,
    fu.master_email,
    fu.organization_data AS organization
  FROM filtered_users fu
  ORDER BY fu.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;