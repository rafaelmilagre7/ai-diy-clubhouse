-- Atualizar função get_users_with_filters_v2 para incluir member_count
CREATE OR REPLACE FUNCTION public.get_users_with_filters_v2(
  p_limit integer DEFAULT 100,
  p_offset integer DEFAULT 0,
  p_search_query text DEFAULT NULL,
  p_filter_type text DEFAULT 'all'
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
  is_master_user boolean,
  member_count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN QUERY
  WITH user_data AS (
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
      p.organization_id,
      COALESCE(
        (o.master_user_id = p.id),
        p.is_master_user,
        false
      ) as is_master_user,
      -- Contar membros da organização (excluindo o próprio master)
      CASE 
        WHEN COALESCE((o.master_user_id = p.id), p.is_master_user, false) = true THEN
          (SELECT COUNT(*)::bigint 
           FROM profiles p2 
           WHERE p2.organization_id = p.organization_id 
           AND p2.id != p.id)
        ELSE 0::bigint
      END as member_count
    FROM public.profiles p
    LEFT JOIN public.user_roles ur ON p.role_id = ur.id
    LEFT JOIN public.organizations o ON p.organization_id = o.id
    WHERE
      (p_search_query IS NULL OR 
       p.name ILIKE '%' || p_search_query || '%' OR 
       p.email ILIKE '%' || p_search_query || '%' OR
       p.company_name ILIKE '%' || p_search_query || '%' OR
       ur.name ILIKE '%' || p_search_query || '%')
  )
  SELECT *
  FROM user_data
  WHERE
    CASE p_filter_type
      WHEN 'masters' THEN is_master_user = true
      WHEN 'members' THEN is_master_user = false
      ELSE true
    END
  ORDER BY created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;