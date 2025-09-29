-- Corrigir função get_user_stats_corrected para resolver coluna ambígua
CREATE OR REPLACE FUNCTION public.get_user_stats_corrected()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  total_users integer;
  masters integer;
  onboarding_completed_count integer;
  onboarding_pending_count integer;
BEGIN
  -- Total de usuários
  SELECT COUNT(*) INTO total_users FROM public.profiles;
  
  -- Masters (usuários que são referenciados como master_email por outros)
  SELECT COUNT(DISTINCT p.email) INTO masters
  FROM public.profiles p
  WHERE EXISTS (
    SELECT 1 FROM public.profiles p2 
    WHERE p2.master_email = p.email 
    AND p2.id != p.id
  );
  
  -- Onboarding completo
  SELECT COUNT(*) INTO onboarding_completed_count
  FROM public.profiles p
  WHERE p.onboarding_completed = true;
  
  -- Onboarding pendente
  SELECT COUNT(*) INTO onboarding_pending_count
  FROM public.profiles p  
  WHERE p.onboarding_completed = false OR p.onboarding_completed IS NULL;
  
  RETURN jsonb_build_object(
    'total_users', total_users,
    'masters', masters,
    'onboarding_completed', onboarding_completed_count,
    'onboarding_pending', onboarding_pending_count
  );
END;
$function$;

-- Corrigir função get_users_with_filters_corrected
CREATE OR REPLACE FUNCTION public.get_users_with_filters_corrected(
  p_filter_type text DEFAULT NULL,
  p_search_query text DEFAULT NULL,
  p_limit integer DEFAULT 100,
  p_offset integer DEFAULT 0
)
RETURNS TABLE(
  id uuid,
  email text,
  name text,
  avatar_url text,
  role text,
  role_id uuid,
  company_name text,
  industry text,
  created_at timestamp with time zone,
  onboarding_completed boolean,
  master_email text,
  member_count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF p_filter_type = 'master' THEN
    -- Filtro por Masters: usuários que são referenciados como master_email
    RETURN QUERY
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
      p.onboarding_completed,
      p.master_email,
      COUNT(pm.id) as member_count
    FROM public.profiles p
    LEFT JOIN public.profiles pm ON pm.master_email = p.email AND pm.id != p.id
    WHERE EXISTS (
      SELECT 1 FROM public.profiles p2 
      WHERE p2.master_email = p.email AND p2.id != p.id
    )
    AND (p_search_query IS NULL OR 
         p.name ILIKE '%' || p_search_query || '%' OR 
         p.email ILIKE '%' || p_search_query || '%' OR
         p.company_name ILIKE '%' || p_search_query || '%')
    GROUP BY p.id, p.email, p.name, p.avatar_url, p.role, p.role_id, 
             p.company_name, p.industry, p.created_at, p.onboarding_completed, p.master_email
    ORDER BY member_count DESC, p.created_at DESC
    LIMIT p_limit OFFSET p_offset;
    
  ELSIF p_filter_type = 'member' THEN
    -- Filtro por Membros: usuários que têm master_email preenchido
    RETURN QUERY
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
      p.onboarding_completed,
      p.master_email,
      0::bigint as member_count
    FROM public.profiles p
    WHERE p.master_email IS NOT NULL 
    AND p.master_email != ''
    AND (p_search_query IS NULL OR 
         p.name ILIKE '%' || p_search_query || '%' OR 
         p.email ILIKE '%' || p_search_query || '%' OR
         p.company_name ILIKE '%' || p_search_query || '%')
    ORDER BY p.created_at DESC
    LIMIT p_limit OFFSET p_offset;
    
  ELSIF p_filter_type = 'onboarding_completed' THEN
    -- Filtro por onboarding completo
    RETURN QUERY
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
      p.onboarding_completed,
      p.master_email,
      0::bigint as member_count
    FROM public.profiles p
    WHERE p.onboarding_completed = true
    AND (p_search_query IS NULL OR 
         p.name ILIKE '%' || p_search_query || '%' OR 
         p.email ILIKE '%' || p_search_query || '%' OR
         p.company_name ILIKE '%' || p_search_query || '%')
    ORDER BY p.created_at DESC
    LIMIT p_limit OFFSET p_offset;
    
  ELSIF p_filter_type = 'onboarding_pending' THEN
    -- Filtro por onboarding pendente
    RETURN QUERY
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
      p.onboarding_completed,
      p.master_email,
      0::bigint as member_count
    FROM public.profiles p
    WHERE (p.onboarding_completed = false OR p.onboarding_completed IS NULL)
    AND (p_search_query IS NULL OR 
         p.name ILIKE '%' || p_search_query || '%' OR 
         p.email ILIKE '%' || p_search_query || '%' OR
         p.company_name ILIKE '%' || p_search_query || '%')
    ORDER BY p.created_at DESC
    LIMIT p_limit OFFSET p_offset;
    
  ELSE
    -- Sem filtro: todos os usuários
    RETURN QUERY
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
      p.onboarding_completed,
      p.master_email,
      CASE 
        WHEN EXISTS (
          SELECT 1 FROM public.profiles p2 
          WHERE p2.master_email = p.email AND p2.id != p.id
        ) THEN (
          SELECT COUNT(*)::bigint FROM public.profiles pm 
          WHERE pm.master_email = p.email AND pm.id != p.id
        )
        ELSE 0::bigint
      END as member_count
    FROM public.profiles p
    WHERE (p_search_query IS NULL OR 
           p.name ILIKE '%' || p_search_query || '%' OR 
           p.email ILIKE '%' || p_search_query || '%' OR
           p.company_name ILIKE '%' || p_search_query || '%')
    ORDER BY p.created_at DESC
    LIMIT p_limit OFFSET p_offset;
  END IF;
END;
$function$;