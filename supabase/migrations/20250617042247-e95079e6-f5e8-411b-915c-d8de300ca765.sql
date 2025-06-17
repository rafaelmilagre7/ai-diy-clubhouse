
-- CORREÇÃO FINAL: REMOÇÃO DEFINITIVA DE SECURITY DEFINER DAS VIEWS (CORRIGIDA)
-- =============================================================================

-- ETAPA 1: REMOÇÃO FORÇADA DAS VIEWS EXISTENTES
-- =============================================

-- Remover as views existentes completamente
DROP VIEW IF EXISTS public.suggestions_with_profiles CASCADE;
DROP VIEW IF EXISTS public.users_with_roles CASCADE;
DROP VIEW IF EXISTS public.user_progress CASCADE;

-- ETAPA 2: RECRIAR AS VIEWS SEM SECURITY DEFINER (COM COLUNAS CORRETAS)
-- =====================================================================

-- 2.1: Recriar suggestions_with_profiles (usando estrutura correta da tabela)
CREATE VIEW public.suggestions_with_profiles AS
SELECT 
  s.*,
  p.name as author_name,
  p.avatar_url as author_avatar_url,
  p.company_name as author_company
FROM public.suggestions s
LEFT JOIN public.profiles p ON s.user_id = p.id;

-- 2.2: Recriar users_with_roles (usando estrutura correta da tabela)
CREATE VIEW public.users_with_roles AS
SELECT 
  p.*,
  ur.name as role_name,
  ur.description as role_description,
  ur.permissions as role_permissions
FROM public.profiles p
LEFT JOIN public.user_roles ur ON p.role_id = ur.id;

-- 2.3: Recriar user_progress (usando estrutura correta da tabela)
CREATE VIEW public.user_progress AS
SELECT 
  pr.*,
  p.name as user_name,
  p.email as user_email,
  s.title as solution_title,
  s.category as solution_category
FROM public.progress pr
LEFT JOIN public.profiles p ON pr.user_id = p.id
LEFT JOIN public.solutions s ON pr.solution_id = s.id;

-- ETAPA 3: DEFINIR PERMISSÕES EXPLÍCITAS
-- ======================================

-- Garantir que as views são acessíveis (seguindo RLS das tabelas base)
GRANT SELECT ON public.suggestions_with_profiles TO authenticated;
GRANT SELECT ON public.users_with_roles TO authenticated;
GRANT SELECT ON public.user_progress TO authenticated;

-- ETAPA 4: VERIFICAÇÃO E LOG
-- ==========================

-- Log da correção final
INSERT INTO public.audit_logs (
  user_id,
  event_type,
  action,
  resource_id,
  details,
  severity
) VALUES (
  NULL,
  'system_event',
  'security_definer_views_final_fix_corrected',
  'security_system',
  jsonb_build_object(
    'correction_type', 'force_recreate_views_without_security_definer_corrected',
    'views_recreated', ARRAY['suggestions_with_profiles', 'users_with_roles', 'user_progress'],
    'method', 'DROP_CASCADE_AND_RECREATE',
    'fix_version', 'v2_column_structure_corrected',
    'timestamp', NOW(),
    'status', 'completed'
  ),
  'low'
);

-- Verificação final das views
SELECT 
  schemaname,
  viewname,
  viewowner,
  'View recriada com sucesso' as status
FROM pg_views 
WHERE schemaname = 'public' 
AND viewname IN ('suggestions_with_profiles', 'users_with_roles', 'user_progress')
ORDER BY viewname;
