-- Primeiro, remover a função existente para poder alterar o tipo de retorno
DROP FUNCTION IF EXISTS public.get_users_with_filters_corrected(text,text,text,text,text,integer,integer);

-- Adicionar campo master_email na tabela profiles para relação master-membro baseada em email
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS master_email text;

-- Migrar dados existentes: usuários com organization_id mas não são masters têm o master_email preenchido
UPDATE public.profiles 
SET master_email = (
  SELECT master_profiles.email 
  FROM public.profiles master_profiles
  INNER JOIN public.organizations o ON o.master_user_id = master_profiles.id
  WHERE o.id = profiles.organization_id
)
WHERE organization_id IS NOT NULL 
  AND (is_master_user = false OR is_master_user IS NULL)
  AND master_email IS NULL;

-- Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_profiles_master_email ON public.profiles(master_email);

-- Atualizar função de estatísticas para remover usuários individuais
CREATE OR REPLACE FUNCTION public.get_user_stats_corrected()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  total_users integer;
  masters integer;
  onboarding_completed integer;
  onboarding_pending integer;
  result jsonb;
BEGIN
  -- Total de usuários
  SELECT COUNT(*) INTO total_users FROM public.profiles;
  
  -- Masters: usuários que têm pelo menos 1 membro vinculado ao seu email
  SELECT COUNT(DISTINCT p.email) INTO masters
  FROM public.profiles p
  WHERE EXISTS (
    SELECT 1 FROM public.profiles members 
    WHERE members.master_email = p.email
  );
  
  -- Onboarding completo
  SELECT COUNT(*) INTO onboarding_completed 
  FROM public.profiles 
  WHERE onboarding_completed = true;
  
  -- Onboarding pendente
  SELECT COUNT(*) INTO onboarding_pending 
  FROM public.profiles 
  WHERE onboarding_completed = false OR onboarding_completed IS NULL;
  
  result := jsonb_build_object(
    'total_users', total_users,
    'masters', masters,
    'onboarding_completed', onboarding_completed,
    'onboarding_pending', onboarding_pending
  );
  
  RETURN result;
END;
$$;

-- Recriar função de busca para usar master_email
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
  master_email text,
  is_master_user boolean,
  onboarding_completed boolean,
  status text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  total_count bigint
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
  -- Query base com total_count
  base_query := '
    SELECT 
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
      p.master_email,
      p.is_master_user,
      p.onboarding_completed,
      p.status,
      p.created_at,
      p.updated_at,
      COUNT(*) OVER() as total_count
    FROM public.profiles p
    LEFT JOIN public.user_roles ur ON p.role_id = ur.id
  ';

  -- Filtros de busca por texto
  IF p_search_query IS NOT NULL AND trim(p_search_query) != '' THEN
    where_conditions := array_append(where_conditions, format(
      '(p.name ILIKE ''%%%s%%'' OR p.email ILIKE ''%%%s%%'' OR p.company_name ILIKE ''%%%s%%'' OR ur.name ILIKE ''%%%s%%'')',
      p_search_query, p_search_query, p_search_query, p_search_query
    ));
  END IF;

  -- Filtro por tipo de usuário baseado em master_email
  IF p_user_type != 'all' THEN
    CASE p_user_type
      WHEN 'master' THEN
        -- Masters: usuários que SÃO masters (têm membros vinculados) E seus membros
        where_conditions := array_append(where_conditions, 
          '(EXISTS (SELECT 1 FROM public.profiles members WHERE members.master_email = p.email) OR p.master_email IS NOT NULL)'
        );
      WHEN 'team_member' THEN
        -- Membros: usuários que têm master_email preenchido
        where_conditions := array_append(where_conditions, 
          'p.master_email IS NOT NULL'
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

  -- Ordenação especial para masters: masters primeiro, depois membros agrupados por master_email
  IF p_user_type = 'master' THEN
    base_query := base_query || ' ORDER BY 
      CASE WHEN EXISTS (SELECT 1 FROM public.profiles members WHERE members.master_email = p.email) THEN 0 ELSE 1 END,
      p.master_email NULLS FIRST, 
      p.created_at DESC';
  ELSE
    base_query := base_query || ' ORDER BY p.created_at DESC';
  END IF;

  -- Aplicar limit e offset
  base_query := base_query || format(' LIMIT %s OFFSET %s', p_limit, p_offset);

  -- Executar query
  RETURN QUERY EXECUTE base_query;
END;
$$;