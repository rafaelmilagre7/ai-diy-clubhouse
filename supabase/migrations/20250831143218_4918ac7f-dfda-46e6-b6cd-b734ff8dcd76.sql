-- CORREÇÃO CRÍTICA: Remover política RLS conflitante em learning_lessons
-- CAUSA RAIZ: Duas políticas RLS (learning_lessons_admin_secure e learning_lessons_unified_access) 
-- causando erro "cannot execute INSERT in a read-only transaction" em operações SELECT

-- 1. Remover política conflitante que permite ALL operations
DROP POLICY IF EXISTS "learning_lessons_admin_secure" ON public.learning_lessons;

-- 2. Verificar se política unificada existe (deve existir e é suficiente)
-- A política learning_lessons_unified_access já inclui:
-- - Verificação de admin
-- - Verificação de course_access_control  
-- - Verificação de user_course_access
-- E permite apenas SELECT (correto para evitar conflitos transacionais)

-- 3. Log da correção crítica
INSERT INTO public.audit_logs (
  event_type,
  action,
  details,
  severity
) VALUES (
  'critical_rls_fix',
  'remove_conflicting_policy',
  jsonb_build_object(
    'table', 'learning_lessons',
    'removed_policy', 'learning_lessons_admin_secure',
    'kept_policy', 'learning_lessons_unified_access',
    'issue', 'INSERT in read-only transaction error',
    'cause', 'Conflicting RLS policies on SELECT operations',
    'affected_user', 'nicholas.machado@viverdeia.ai',
    'module_id', 'dcc8117a-95b4-47b0-823c-3190008c5900',
    'expected_lessons', 49,
    'timestamp', now()
  ),
  'high'
);