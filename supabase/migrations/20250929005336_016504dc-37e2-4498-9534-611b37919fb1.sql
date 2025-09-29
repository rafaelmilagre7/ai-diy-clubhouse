-- Criar função otimizada para buscar estatísticas avançadas de usuários
CREATE OR REPLACE FUNCTION public.get_enhanced_user_stats_public()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  stats jsonb;
  total_users integer;
  masters integer;
  team_members integer;
  organizations integer;
  individual_users integer;
  active_users integer;
  inactive_users integer;
  onboarding_completed integer;
  onboarding_pending integer;
  new_users_7d integer;
  new_users_30d integer;
  top_roles jsonb;
BEGIN
  -- Verificar se é admin
  IF NOT EXISTS (
    SELECT 1 
    FROM public.profiles p
    INNER JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = auth.uid() AND ur.name = 'admin'
  ) THEN
    RETURN jsonb_build_object('error', 'Acesso negado');
  END IF;
  
  -- Estatísticas básicas
  SELECT COUNT(*) INTO total_users FROM public.profiles;
  SELECT COUNT(*) INTO masters FROM public.profiles WHERE is_master_user = true;
  SELECT COUNT(*) INTO team_members FROM public.profiles WHERE is_master_user = false AND organization_id IS NOT NULL;
  SELECT COUNT(DISTINCT organization_id) INTO organizations FROM public.profiles WHERE organization_id IS NOT NULL;
  individual_users := total_users - masters - team_members;
  
  -- Status ativo/inativo
  SELECT COUNT(*) INTO active_users FROM public.profiles WHERE COALESCE(status, 'active') = 'active';
  inactive_users := total_users - active_users;
  
  -- Onboarding
  SELECT COUNT(*) INTO onboarding_completed FROM public.profiles WHERE onboarding_completed = true;
  onboarding_pending := total_users - onboarding_completed;
  
  -- Novos usuários
  SELECT COUNT(*) INTO new_users_7d 
  FROM public.profiles 
  WHERE created_at > NOW() - INTERVAL '7 days';
  
  SELECT COUNT(*) INTO new_users_30d 
  FROM public.profiles 
  WHERE created_at > NOW() - INTERVAL '30 days';
  
  -- Top 3 roles mais comuns
  SELECT jsonb_agg(
    jsonb_build_object(
      'name', role_name,
      'count', role_count,
      'percentage', ROUND((role_count::numeric / total_users::numeric) * 100, 1)
    )
  ) INTO top_roles
  FROM (
    SELECT 
      COALESCE(ur.name, 'Sem papel') as role_name,
      COUNT(*) as role_count
    FROM public.profiles p
    LEFT JOIN public.user_roles ur ON p.role_id = ur.id
    GROUP BY ur.name
    ORDER BY COUNT(*) DESC
    LIMIT 3
  ) t;
  
  stats := jsonb_build_object(
    'total_users', total_users,
    'masters', masters,
    'team_members', team_members,
    'organizations', organizations,
    'individual_users', individual_users,
    'active_users', active_users,
    'inactive_users', inactive_users,
    'onboarding_completed', onboarding_completed,
    'onboarding_pending', onboarding_pending,
    'new_users_7d', new_users_7d,
    'new_users_30d', new_users_30d,
    'top_roles', top_roles
  );
  
  RETURN stats;
END;
$$;

-- Criar função otimizada para buscar usuários com filtros avançados
CREATE OR REPLACE FUNCTION public.get_users_with_advanced_filters_public(
  p_limit integer DEFAULT 50,
  p_offset integer DEFAULT 0,
  p_search text DEFAULT NULL,
  p_user_type text DEFAULT NULL,
  p_organization_id text DEFAULT NULL,
  p_role_id text DEFAULT NULL,
  p_status text DEFAULT NULL,
  p_onboarding text DEFAULT NULL,
  p_date_filter text DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  email text,
  name text,
  avatar_url text,
  company_name text,
  industry text,
  created_at timestamp with time zone,
  role_id uuid,
  onboarding_completed boolean,
  is_master_user boolean,
  organization_id uuid,
  status text,
  user_roles jsonb,
  organization jsonb,
  total_count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  date_threshold timestamp with time zone;
BEGIN
  -- Verificar se é admin
  IF NOT EXISTS (
    SELECT 1 
    FROM public.profiles p2
    INNER JOIN public.user_roles ur2 ON p2.role_id = ur2.id
    WHERE p2.id = auth.uid() AND ur2.name = 'admin'
  ) THEN
    RETURN;
  END IF;
  
  -- Calcular threshold de data se aplicável
  CASE p_date_filter
    WHEN '7d' THEN date_threshold := NOW() - INTERVAL '7 days';
    WHEN '30d' THEN date_threshold := NOW() - INTERVAL '30 days';
    WHEN '90d' THEN date_threshold := NOW() - INTERVAL '90 days';
    WHEN '1y' THEN date_threshold := NOW() - INTERVAL '1 year';
    ELSE date_threshold := NULL;
  END CASE;
  
  RETURN QUERY
  WITH filtered_users AS (
    SELECT 
      p.id,
      p.email,
      p.name,
      p.avatar_url,
      p.company_name,
      p.industry,
      p.created_at,
      p.role_id,
      p.onboarding_completed,
      p.is_master_user,
      p.organization_id,
      COALESCE(p.status, 'active') as status,
      CASE 
        WHEN ur.id IS NOT NULL THEN 
          jsonb_build_object(
            'id', ur.id,
            'name', ur.name,
            'description', ur.description
          )
        ELSE NULL
      END as user_roles,
      CASE 
        WHEN o.id IS NOT NULL THEN 
          jsonb_build_object(
            'id', o.id,
            'name', o.name,
            'master_user_id', o.master_user_id
          )
        ELSE NULL
      END as organization,
      COUNT(*) OVER() as total_count
    FROM public.profiles p
    LEFT JOIN public.user_roles ur ON p.role_id = ur.id
    LEFT JOIN public.organizations o ON p.organization_id = o.id
    WHERE 1=1
      -- Filtro de busca (nome, email, empresa, indústria)
      AND (p_search IS NULL OR (
        p.name ILIKE '%' || p_search || '%' OR 
        p.email ILIKE '%' || p_search || '%' OR
        p.company_name ILIKE '%' || p_search || '%' OR
        p.industry ILIKE '%' || p_search || '%'
      ))
      -- Filtro de tipo de usuário
      AND (p_user_type IS NULL OR p_user_type = 'all' OR
        (p_user_type = 'master' AND p.is_master_user = true) OR
        (p_user_type = 'team_member' AND p.is_master_user = false AND p.organization_id IS NOT NULL) OR
        (p_user_type = 'individual' AND p.is_master_user = false AND p.organization_id IS NULL)
      )
      -- Filtro de organização
      AND (p_organization_id IS NULL OR p_organization_id = 'all' OR p.organization_id::text = p_organization_id)
      -- Filtro de role
      AND (p_role_id IS NULL OR p_role_id = 'all' OR p.role_id::text = p_role_id)
      -- Filtro de status
      AND (p_status IS NULL OR p_status = 'all' OR 
        (p_status = 'active' AND COALESCE(p.status, 'active') = 'active') OR
        (p_status = 'inactive' AND COALESCE(p.status, 'active') = 'inactive')
      )
      -- Filtro de onboarding
      AND (p_onboarding IS NULL OR p_onboarding = 'all' OR
        (p_onboarding = 'completed' AND p.onboarding_completed = true) OR
        (p_onboarding = 'incomplete' AND p.onboarding_completed = false)
      )
      -- Filtro de data
      AND (date_threshold IS NULL OR p.created_at >= date_threshold)
    ORDER BY p.created_at DESC
    LIMIT p_limit
    OFFSET p_offset
  )
  SELECT * FROM filtered_users;
END;
$$;