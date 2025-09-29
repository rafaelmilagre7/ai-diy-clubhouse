-- Dropar e recriar a função com lógica correta para masters e suas equipes
DROP FUNCTION IF EXISTS get_users_with_filters_corrected(integer,integer,text,text);

-- Recriar com lógica correta para incluir masters e seus membros
CREATE OR REPLACE FUNCTION get_users_with_filters_corrected(
  p_limit integer DEFAULT 50,
  p_offset integer DEFAULT 0,
  p_search text DEFAULT NULL,
  p_user_type text DEFAULT NULL
)
RETURNS TABLE(
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
  user_roles jsonb,
  organization jsonb,
  total_count integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  base_query text;
  count_query text;
  filter_conditions text := '';
  total_records integer;
BEGIN
  -- Construir condições de filtro
  IF p_search IS NOT NULL AND p_search != '' THEN
    filter_conditions := filter_conditions || 
      ' AND (p.name ILIKE ''%' || p_search || '%'' OR p.email ILIKE ''%' || p_search || '%'' OR p.company_name ILIKE ''%' || p_search || '%'')';
  END IF;
  
  -- Filtros por tipo de usuário
  IF p_user_type IS NOT NULL THEN
    CASE p_user_type
      WHEN 'all' THEN
        -- Sem filtro adicional
        NULL;
      WHEN 'master' THEN
        -- CORRIGIDO: Incluir masters E seus membros de equipe
        filter_conditions := filter_conditions || ' AND (p.id IN (SELECT DISTINCT master_user_id FROM organizations WHERE master_user_id IS NOT NULL) OR p.organization_id IN (SELECT DISTINCT id FROM organizations WHERE master_user_id IS NOT NULL))';
      WHEN 'individual' THEN
        filter_conditions := filter_conditions || ' AND p.organization_id IS NULL AND p.id NOT IN (SELECT DISTINCT master_user_id FROM organizations WHERE master_user_id IS NOT NULL)';
      WHEN 'onboarding_completed' THEN
        filter_conditions := filter_conditions || ' AND p.onboarding_completed = true';
      WHEN 'onboarding_pending' THEN
        filter_conditions := filter_conditions || ' AND (p.onboarding_completed = false OR p.onboarding_completed IS NULL)';
      ELSE
        -- Filtro por role específico
        filter_conditions := filter_conditions || ' AND ur.name = ''' || p_user_type || '''';  
    END CASE;
  END IF;
  
  -- Contar total de registros
  count_query := '
    SELECT COUNT(*)::integer
    FROM profiles p
    LEFT JOIN user_roles ur ON p.role_id = ur.id  
    LEFT JOIN organizations o ON p.organization_id = o.id
    WHERE 1=1' || filter_conditions;
    
  EXECUTE count_query INTO total_records;
  
  -- Query principal com ordenação especial para masters
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
      CASE WHEN p.id IN (SELECT DISTINCT master_user_id FROM organizations WHERE master_user_id IS NOT NULL) THEN true ELSE false END as is_master_user,
      p.organization_id,
      CASE WHEN ur.id IS NOT NULL THEN 
        jsonb_build_object(''id'', ur.id, ''name'', ur.name, ''description'', ur.description)
      ELSE NULL END as user_roles,
      CASE WHEN o.id IS NOT NULL THEN
        jsonb_build_object(''id'', o.id, ''name'', o.name, ''plan_type'', o.plan_type, ''master_user_id'', o.master_user_id)
      ELSE NULL END as organization,
      ' || total_records || ' as total_count
    FROM profiles p
    LEFT JOIN user_roles ur ON p.role_id = ur.id
    LEFT JOIN organizations o ON p.organization_id = o.id  
    WHERE 1=1' || filter_conditions || '
    ORDER BY 
      CASE WHEN p.id IN (SELECT DISTINCT master_user_id FROM organizations WHERE master_user_id IS NOT NULL) THEN 0 ELSE 1 END,
      CASE WHEN p.organization_id IS NOT NULL THEN p.organization_id ELSE ''00000000-0000-0000-0000-000000000000''::uuid END,
      p.created_at DESC
    LIMIT ' || p_limit || ' OFFSET ' || p_offset;
    
  RETURN QUERY EXECUTE base_query;
END;
$$;