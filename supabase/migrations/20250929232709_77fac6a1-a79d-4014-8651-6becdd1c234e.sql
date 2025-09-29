-- ============================================
-- FASE 1: Corrigir Função SQL de Filtro
-- ============================================
-- Problema: Função usava master_email (vazio) para identificar masters
-- Solução: Usar organizations.master_user_id + is_master_user

-- Criar nova função com nome atualizado para evitar conflito
CREATE OR REPLACE FUNCTION public.get_users_with_filters_v2(
  p_search_query TEXT DEFAULT NULL,
  p_filter_type TEXT DEFAULT 'all',
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0
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
  master_email text,
  user_roles jsonb,
  organization jsonb,
  total_count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  base_query TEXT;
  count_query TEXT;
  total_count_val BIGINT;
BEGIN
  -- Construir WHERE clause baseado no filtro
  base_query := 'SELECT 
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
    p.master_email,
    jsonb_build_object(''id'', ur.id, ''name'', ur.name, ''description'', ur.description) AS user_roles,
    CASE 
      WHEN o.id IS NOT NULL THEN jsonb_build_object(''id'', o.id, ''name'', o.name)
      ELSE NULL
    END AS organization
  FROM public.profiles p
  LEFT JOIN public.user_roles ur ON p.role_id = ur.id
  LEFT JOIN public.organizations o ON p.organization_id = o.id
  WHERE 1=1';

  -- ✅ NOVA LÓGICA CORRIGIDA: Filtros usando organizations ao invés de master_email
  IF p_filter_type = 'master' THEN
    base_query := base_query || ' AND (
      EXISTS (SELECT 1 FROM public.organizations org WHERE org.master_user_id = p.id)
      OR p.is_master_user = true
    )';
  ELSIF p_filter_type = 'team_member' THEN
    base_query := base_query || ' AND p.organization_id IS NOT NULL
      AND NOT EXISTS (SELECT 1 FROM public.organizations org WHERE org.master_user_id = p.id)
      AND p.is_master_user = false';
  ELSIF p_filter_type = 'onboarding_completed' THEN
    base_query := base_query || ' AND p.onboarding_completed = true';
  ELSIF p_filter_type = 'onboarding_pending' THEN
    base_query := base_query || ' AND (p.onboarding_completed = false OR p.onboarding_completed IS NULL)';
  END IF;

  -- Busca por query
  IF p_search_query IS NOT NULL AND p_search_query != '' THEN
    base_query := base_query || ' AND (
      p.name ILIKE ''%' || p_search_query || '%'' OR
      p.email ILIKE ''%' || p_search_query || '%'' OR
      p.company_name ILIKE ''%' || p_search_query || '%''
    )';
  END IF;

  -- Contar total de registros antes da paginação
  count_query := 'SELECT COUNT(*) FROM (' || base_query || ') AS count_subquery';
  EXECUTE count_query INTO total_count_val;

  -- Adicionar ordenação e paginação
  base_query := base_query || ' ORDER BY p.created_at DESC LIMIT ' || p_limit || ' OFFSET ' || p_offset;

  -- Retornar resultado com total_count
  RETURN QUERY EXECUTE '
    SELECT 
      subq.id, subq.email, subq.name, subq.avatar_url, 
      subq.company_name, subq.industry, subq.created_at,
      subq.role_id, subq.onboarding_completed, subq.is_master_user,
      subq.organization_id, subq.master_email, subq.user_roles,
      subq.organization, ' || total_count_val || '::bigint AS total_count
    FROM (' || base_query || ') AS subq
  ';
END;
$$;

COMMENT ON FUNCTION public.get_users_with_filters_v2 IS 
'Versão 2: Retorna usuários filtrados usando organizations.master_user_id ao invés de master_email';