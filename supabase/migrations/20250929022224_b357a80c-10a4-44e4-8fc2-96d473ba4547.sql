-- Corrigir função para retornar masters com seus membros de equipe
CREATE OR REPLACE FUNCTION public.get_users_with_filters_corrected(
  p_search_query text DEFAULT NULL,
  p_user_type text DEFAULT 'all',
  p_status text DEFAULT 'all',
  p_onboarding text DEFAULT 'all',
  p_date_range text DEFAULT 'all',
  p_limit integer DEFAULT 100,
  p_offset integer DEFAULT 0
)
RETURNS TABLE(
  id uuid,
  email text,
  name text,
  avatar_url text,
  company_name text,
  industry text,
  role text,
  role_id uuid,
  user_roles jsonb,
  organization_id uuid,
  is_master_user boolean,
  onboarding_completed boolean,
  status text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  organization jsonb
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  base_query text;
  where_conditions text[] := ARRAY[]::text[];
  date_condition text;
BEGIN
  -- Query base
  base_query := '
    SELECT DISTINCT
      p.id,
      p.email,
      p.name,
      p.avatar_url,
      p.company_name,
      p.industry,
      p.role,
      p.role_id,
      jsonb_build_object(
        ''id'', ur.id,
        ''name'', ur.name,
        ''description'', ur.description,
        ''permissions'', ur.permissions
      ) as user_roles,
      p.organization_id,
      p.is_master_user,
      p.onboarding_completed,
      p.status,
      p.created_at,
      p.updated_at,
      CASE 
        WHEN o.id IS NOT NULL THEN 
          jsonb_build_object(
            ''id'', o.id,
            ''name'', o.name,
            ''master_user_id'', o.master_user_id
          )
        ELSE NULL 
      END as organization
    FROM public.profiles p
    LEFT JOIN public.user_roles ur ON p.role_id = ur.id
    LEFT JOIN public.organizations o ON p.organization_id = o.id
  ';

  -- Filtros de busca por texto
  IF p_search_query IS NOT NULL AND trim(p_search_query) != '' THEN
    where_conditions := array_append(where_conditions, format(
      '(p.name ILIKE ''%%%s%%'' OR p.email ILIKE ''%%%s%%'' OR p.company_name ILIKE ''%%%s%%'' OR ur.name ILIKE ''%%%s%%'')',
      p_search_query, p_search_query, p_search_query, p_search_query
    ));
  END IF;

  -- Filtro por tipo de usuário - CORRIGIDO PARA INCLUIR MEMBROS DE EQUIPE
  IF p_user_type != 'all' THEN
    CASE p_user_type
      WHEN 'master' THEN
        -- Para masters: retornar todos os usuários (masters + membros) das organizações que possuem masters
        where_conditions := array_append(where_conditions, 
          '(p.organization_id IN (
            SELECT DISTINCT org.id 
            FROM public.organizations org 
            INNER JOIN public.profiles master_profile ON org.master_user_id = master_profile.id
            WHERE master_profile.is_master_user = true
          ) OR (p.is_master_user = true OR ur.name = ''master''))'
        );
      WHEN 'team_member' THEN
        where_conditions := array_append(where_conditions, 
          '(p.is_master_user = false AND ur.name != ''master'' AND p.organization_id IS NOT NULL)'
        );
      WHEN 'individual' THEN
        where_conditions := array_append(where_conditions, 
          '(p.organization_id IS NULL AND (p.is_master_user = false OR p.is_master_user IS NULL))'
        );
    END CASE;
  END IF;

  -- Filtro por status
  IF p_status != 'all' THEN
    CASE p_status
      WHEN 'active' THEN
        where_conditions := array_append(where_conditions, '(p.status = ''active'' OR p.status IS NULL)');
      WHEN 'inactive' THEN
        where_conditions := array_append(where_conditions, 'p.status = ''inactive''');
    END CASE;
  END IF;

  -- Filtro por onboarding
  IF p_onboarding != 'all' THEN
    CASE p_onboarding
      WHEN 'completed' THEN
        where_conditions := array_append(where_conditions, 'p.onboarding_completed = true');
      WHEN 'incomplete' THEN
        where_conditions := array_append(where_conditions, '(p.onboarding_completed = false OR p.onboarding_completed IS NULL)');
    END CASE;
  END IF;

  -- Filtro por data
  IF p_date_range != 'all' THEN
    CASE p_date_range
      WHEN 'last_7_days' THEN
        date_condition := 'p.created_at >= NOW() - INTERVAL ''7 days''';
      WHEN 'last_30_days' THEN
        date_condition := 'p.created_at >= NOW() - INTERVAL ''30 days''';
      WHEN 'last_90_days' THEN
        date_condition := 'p.created_at >= NOW() - INTERVAL ''90 days''';
      WHEN 'last_year' THEN
        date_condition := 'p.created_at >= NOW() - INTERVAL ''1 year''';
    END CASE;
    
    IF date_condition IS NOT NULL THEN
      where_conditions := array_append(where_conditions, date_condition);
    END IF;
  END IF;

  -- Construir query final
  IF array_length(where_conditions, 1) > 0 THEN
    base_query := base_query || ' WHERE ' || array_to_string(where_conditions, ' AND ');
  END IF;

  -- Ordenação especial para masters: masters primeiro, depois membros por organização
  IF p_user_type = 'master' THEN
    base_query := base_query || ' ORDER BY p.is_master_user DESC NULLS LAST, p.organization_id, ur.name = ''master'' DESC, p.created_at DESC';
  ELSE
    base_query := base_query || ' ORDER BY p.created_at DESC';
  END IF;

  -- Aplicar limit e offset
  base_query := base_query || format(' LIMIT %s OFFSET %s', p_limit, p_offset);

  -- Debug: log da query final
  RAISE NOTICE '[DEBUG] Query final: %', base_query;

  -- Executar query
  RETURN QUERY EXECUTE base_query;
END;
$$;