-- Dropar função existente e recriar com assinatura correta
DROP FUNCTION IF EXISTS public.get_users_with_advanced_filters_public(integer,integer,text,text,text,text,text,text,text);

-- Recriar função com assinatura correta
CREATE OR REPLACE FUNCTION public.get_users_with_advanced_filters_public(
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0,
  p_search TEXT DEFAULT NULL,
  p_user_type TEXT DEFAULT NULL,
  p_organization_id TEXT DEFAULT NULL,
  p_role_id TEXT DEFAULT NULL,
  p_status TEXT DEFAULT NULL,
  p_onboarding TEXT DEFAULT NULL,
  p_date_filter TEXT DEFAULT NULL
)
RETURNS TABLE(
  id UUID,
  email TEXT,
  name TEXT,
  avatar_url TEXT,
  company_name TEXT,
  industry TEXT,
  created_at TIMESTAMPTZ,
  role_id UUID,
  onboarding_completed BOOLEAN,
  is_master_user BOOLEAN,
  organization_id UUID,
  user_roles JSONB,
  organization JSONB,
  status TEXT,
  total_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  base_query TEXT;
  where_conditions TEXT[];
  final_query TEXT;
  total_count_val BIGINT;
BEGIN
  -- Construir query base
  base_query := '
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
    CASE 
      WHEN ur.id IS NOT NULL THEN 
        jsonb_build_object(''id'', ur.id, ''name'', ur.name, ''description'', ur.description)
      ELSE NULL 
    END as user_roles,
    CASE 
      WHEN o.id IS NOT NULL THEN 
        jsonb_build_object(''id'', o.id, ''name'', o.name)
      ELSE NULL 
    END as organization,
    COALESCE(p.status, ''active'') as status
  FROM profiles p
  LEFT JOIN user_roles ur ON p.role_id = ur.id
  LEFT JOIN organizations o ON p.organization_id = o.id
  ';
  
  -- Inicializar array de condições
  where_conditions := ARRAY[]::TEXT[];
  
  -- Adicionar filtros condicionais
  IF p_search IS NOT NULL AND length(trim(p_search)) > 0 THEN
    where_conditions := array_append(where_conditions, 
      format('(p.name ILIKE %L OR p.email ILIKE %L OR p.company_name ILIKE %L)', 
        '%' || p_search || '%', '%' || p_search || '%', '%' || p_search || '%'));
  END IF;
  
  IF p_user_type IS NOT NULL AND p_user_type != 'all' THEN
    CASE p_user_type
      WHEN 'master' THEN
        where_conditions := array_append(where_conditions, '(p.is_master_user = true OR ur.name = ''master'')');
      WHEN 'team_member' THEN
        where_conditions := array_append(where_conditions, 'ur.name IN (''team_member'', ''membro_equipe'', ''equipe'')');
      WHEN 'individual' THEN
        where_conditions := array_append(where_conditions, '(p.organization_id IS NULL AND (p.is_master_user = false OR p.is_master_user IS NULL))');
    END CASE;
  END IF;
  
  IF p_organization_id IS NOT NULL AND p_organization_id != 'all' THEN
    where_conditions := array_append(where_conditions, format('p.organization_id = %L::UUID', p_organization_id));
  END IF;
  
  IF p_role_id IS NOT NULL AND p_role_id != 'all' THEN
    where_conditions := array_append(where_conditions, format('p.role_id = %L::UUID', p_role_id));
  END IF;
  
  IF p_status IS NOT NULL AND p_status != 'all' THEN
    where_conditions := array_append(where_conditions, format('COALESCE(p.status, ''active'') = %L', p_status));
  END IF;
  
  IF p_onboarding IS NOT NULL AND p_onboarding != 'all' THEN
    IF p_onboarding = 'completed' THEN
      where_conditions := array_append(where_conditions, 'p.onboarding_completed = true');
    ELSIF p_onboarding = 'pending' THEN
      where_conditions := array_append(where_conditions, '(p.onboarding_completed = false OR p.onboarding_completed IS NULL)');
    END IF;
  END IF;
  
  IF p_date_filter IS NOT NULL AND p_date_filter != 'all' THEN
    CASE p_date_filter
      WHEN 'today' THEN
        where_conditions := array_append(where_conditions, 'p.created_at >= CURRENT_DATE');
      WHEN '7d' THEN
        where_conditions := array_append(where_conditions, 'p.created_at > (now() - interval ''7 days'')');
      WHEN '30d' THEN
        where_conditions := array_append(where_conditions, 'p.created_at > (now() - interval ''30 days'')');
      WHEN '90d' THEN
        where_conditions := array_append(where_conditions, 'p.created_at > (now() - interval ''90 days'')');
    END CASE;
  END IF;
  
  -- Montar query final
  IF array_length(where_conditions, 1) > 0 THEN
    final_query := base_query || ' WHERE ' || array_to_string(where_conditions, ' AND ');
  ELSE
    final_query := base_query;
  END IF;
  
  -- Contar total de registros primeiro
  EXECUTE 'SELECT COUNT(*) FROM (' || final_query || ') as count_query' INTO total_count_val;
  
  -- Adicionar ordenação, limit e offset
  final_query := final_query || ' ORDER BY p.created_at DESC LIMIT ' || p_limit || ' OFFSET ' || p_offset;
  
  -- Executar query e retornar resultados
  RETURN QUERY EXECUTE '
  SELECT 
    q.*,
    ' || total_count_val || '::BIGINT as total_count
  FROM (' || final_query || ') q';
  
END;
$function$;