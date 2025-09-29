-- CORREÇÃO CRÍTICA: Funções SQL para Admin de Usuários
-- Corrigindo problemas de autenticação e contadores zerados

-- 1. Função simplificada para estatísticas (sem dependência de auth.uid)
CREATE OR REPLACE FUNCTION get_user_stats_corrected()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  result jsonb;
  total_users_count integer;
  masters_count integer;
  individual_users_count integer;
  onboarding_completed_count integer;
  onboarding_pending_count integer;
BEGIN
  -- Contar total de usuários
  SELECT COUNT(*) INTO total_users_count FROM profiles;
  
  -- Contar masters (usuarios que são master de alguma organização)
  SELECT COUNT(DISTINCT master_user_id) INTO masters_count 
  FROM organizations 
  WHERE master_user_id IS NOT NULL;
  
  -- Contar usuários individuais (não masters e não membros de organizações)
  SELECT COUNT(*) INTO individual_users_count
  FROM profiles p 
  WHERE p.organization_id IS NULL 
  AND p.id NOT IN (
    SELECT DISTINCT master_user_id 
    FROM organizations 
    WHERE master_user_id IS NOT NULL
  );
  
  -- Contar onboarding completo
  SELECT COUNT(*) INTO onboarding_completed_count
  FROM profiles 
  WHERE onboarding_completed = true;
  
  -- Contar onboarding pendente  
  SELECT COUNT(*) INTO onboarding_pending_count
  FROM profiles 
  WHERE onboarding_completed = false OR onboarding_completed IS NULL;
  
  result := jsonb_build_object(
    'total_users', total_users_count,
    'masters', masters_count, 
    'individual_users', individual_users_count,
    'onboarding_completed', onboarding_completed_count,
    'onboarding_pending', onboarding_pending_count
  );
  
  RETURN result;
END;
$$;

-- 2. Função corrigida para buscar usuários com filtros
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
  total_count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  base_query text;
  count_query text;
  filter_conditions text := '';
  total_records bigint;
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
        filter_conditions := filter_conditions || ' AND p.id IN (SELECT DISTINCT master_user_id FROM organizations WHERE master_user_id IS NOT NULL)';
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
    SELECT COUNT(*)
    FROM profiles p
    LEFT JOIN user_roles ur ON p.role_id = ur.id  
    LEFT JOIN organizations o ON p.organization_id = o.id
    WHERE 1=1' || filter_conditions;
    
  EXECUTE count_query INTO total_records;
  
  -- Query principal
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
        jsonb_build_object(''id'', o.id, ''name'', o.name, ''plan_type'', o.plan_type)
      ELSE NULL END as organization,
      ' || total_records || ' as total_count
    FROM profiles p
    LEFT JOIN user_roles ur ON p.role_id = ur.id
    LEFT JOIN organizations o ON p.organization_id = o.id  
    WHERE 1=1' || filter_conditions || '
    ORDER BY p.created_at DESC
    LIMIT ' || p_limit || ' OFFSET ' || p_offset;
    
  RETURN QUERY EXECUTE base_query;
END;
$$;

-- 3. Atualizar usuários masters para terem o role correto
DO $$
DECLARE
  master_role_id uuid;
  master_user_record record;
BEGIN
  -- Buscar ID do role master_user
  SELECT id INTO master_role_id FROM user_roles WHERE name = 'master_user';
  
  IF master_role_id IS NOT NULL THEN
    -- Atualizar todos os usuários que são masters de organizações
    FOR master_user_record IN 
      SELECT DISTINCT master_user_id 
      FROM organizations 
      WHERE master_user_id IS NOT NULL
    LOOP
      UPDATE profiles 
      SET role_id = master_role_id, updated_at = now()
      WHERE id = master_user_record.master_user_id 
      AND (role_id IS NULL OR role_id != master_role_id);
    END LOOP;
    
    RAISE NOTICE 'Usuários masters atualizados com role master_user';
  ELSE
    RAISE WARNING 'Role master_user não encontrado';
  END IF;
END;
$$;

-- 4. Função para obter membros de um master
CREATE OR REPLACE FUNCTION get_master_members_count(master_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  members_count integer := 0;
BEGIN
  -- Contar membros diretos da organização
  SELECT COUNT(*) INTO members_count
  FROM profiles p
  INNER JOIN organizations o ON p.organization_id = o.id
  WHERE o.master_user_id = master_id;
  
  RETURN members_count;
END;
$$;