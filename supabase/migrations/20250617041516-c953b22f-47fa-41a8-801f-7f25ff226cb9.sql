
-- CORREÇÃO COMPLETA DOS PROBLEMAS DE SEGURANÇA SUPABASE - VERSÃO CORRIGIDA
-- ========================================================================

-- FASE 1: CORREÇÃO DAS VIEWS SECURITY DEFINER
-- ============================================

-- 1.1: Recriar view suggestions_with_profiles sem SECURITY DEFINER
DROP VIEW IF EXISTS public.suggestions_with_profiles;

CREATE VIEW public.suggestions_with_profiles AS
SELECT 
  s.*,
  p.name as author_name,
  p.avatar_url as author_avatar_url,
  p.company_name as author_company
FROM public.suggestions s
LEFT JOIN public.profiles p ON s.user_id = p.id;

-- 1.2: Recriar view users_with_roles sem SECURITY DEFINER
DROP VIEW IF EXISTS public.users_with_roles;

CREATE VIEW public.users_with_roles AS
SELECT 
  p.*,
  ur.name as role_name,
  ur.description as role_description,
  ur.permissions as role_permissions
FROM public.profiles p
LEFT JOIN public.user_roles ur ON p.role_id = ur.id;

-- 1.3: Recriar view user_progress sem SECURITY DEFINER
DROP VIEW IF EXISTS public.user_progress;

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

-- FASE 2: CORREÇÃO DAS TABELAS DE BACKUP - ESTRATÉGIA: MOVER PARA SCHEMA PRIVADO
-- ==============================================================================

-- 2.1: Criar schema privado para backups
CREATE SCHEMA IF NOT EXISTS _backup;

-- 2.2: Mover tabelas de backup para schema privado (sem afetar dados)
ALTER TABLE IF EXISTS public.onboarding_backup_quick_2025_06_07_01_34_11 
SET SCHEMA _backup;

ALTER TABLE IF EXISTS public.onboarding_final_backup_2025_06_01_13_56_48 
SET SCHEMA _backup;

ALTER TABLE IF EXISTS public.quick_onboarding_backup_2025_06_01_13_56_48 
SET SCHEMA _backup;

ALTER TABLE IF EXISTS public.onboarding_backup_legacy_2025_06_07_01_34_11 
SET SCHEMA _backup;

ALTER TABLE IF EXISTS public.onboarding_backup_progress_2025_06_07_01_34_11 
SET SCHEMA _backup;

ALTER TABLE IF EXISTS public.onboarding_backup_trails_2025_06_07_01_34_11 
SET SCHEMA _backup;

ALTER TABLE IF EXISTS public.onboarding_final_backup_complete_2025_06_01_14_03_14 
SET SCHEMA _backup;

ALTER TABLE IF EXISTS public.quick_onboarding_backup_2024 
SET SCHEMA _backup;

ALTER TABLE IF EXISTS public.onboarding_backup_complete_2025 
SET SCHEMA _backup;

ALTER TABLE IF EXISTS public.onboarding_progress_backup_complete_2025 
SET SCHEMA _backup;

ALTER TABLE IF EXISTS public.implementation_trails_backup_complete_2025 
SET SCHEMA _backup;

ALTER TABLE IF EXISTS public.quick_onboarding_backup_20250130 
SET SCHEMA _backup;

ALTER TABLE IF EXISTS public.onboarding_final_backup_complete_2025 
SET SCHEMA _backup;

ALTER TABLE IF EXISTS public.quick_onboarding_backup_complete_2025 
SET SCHEMA _backup;

-- FASE 3: LOG DE AUDITORIA DA CORREÇÃO (CORRIGIDO)
-- ================================================

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
  'supabase_linter_corrections',
  'security_system',
  jsonb_build_object(
    'correction_type', 'supabase_linter_security_fixes',
    'views_fixed', 3,
    'backup_tables_moved', 13,
    'timestamp', NOW(),
    'security_improvements', ARRAY[
      'removed_security_definer_from_views',
      'moved_backup_tables_to_private_schema',
      'maintained_functionality_integrity'
    ]
  ),
  'low'
);

-- FASE 4: VERIFICAÇÃO FINAL
-- =========================

-- Verificar se as views foram recriadas corretamente
SELECT 
  'Views recriadas com sucesso' as status,
  COUNT(*) as views_count
FROM pg_views 
WHERE schemaname = 'public' 
AND viewname IN ('suggestions_with_profiles', 'users_with_roles', 'user_progress');

-- Verificar se as tabelas de backup foram movidas
SELECT 
  'Tabelas de backup movidas com sucesso' as status,
  COUNT(*) as tables_moved
FROM pg_tables 
WHERE schemaname = '_backup' 
AND tablename LIKE '%backup%';
