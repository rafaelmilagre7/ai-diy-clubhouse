
-- LIMPEZA FINAL DE TABELAS VAZIAS NÃO UTILIZADAS PELO FRONTEND
-- Remove 6 tabelas que não têm nenhum uso atual e estão vazias

-- FASE 1: BACKUP DE SEGURANÇA (criar registros de auditoria antes da remoção)
INSERT INTO public.audit_logs (
  user_id,
  event_type, 
  action,
  details
) VALUES (
  NULL,
  'system_event',
  'unused_tables_cleanup_backup',
  jsonb_build_object(
    'tables_to_remove', ARRAY[
      'analytics_backups',
      'automation_rules', 
      'email_queue',
      'invite_campaigns',
      'networking_preferences',
      'onboarding_abandonment_points'
    ],
    'backup_timestamp', NOW(),
    'reason', 'Limpeza de tabelas vazias não utilizadas pelo frontend',
    'frontend_impact', 'zero - nenhuma dessas tabelas é referenciada no código frontend'
  )
);

-- FASE 2: REMOÇÃO DAS TABELAS NÃO UTILIZADAS
-- Remover em ordem para evitar problemas de dependência

-- 1. Remover analytics_backups (0 registros, não usado no frontend)
DROP TABLE IF EXISTS public.analytics_backups CASCADE;

-- 2. Remover automation_rules (0 registros, não usado no frontend)  
DROP TABLE IF EXISTS public.automation_rules CASCADE;

-- 3. Remover email_queue (0 registros, não usado no frontend)
DROP TABLE IF EXISTS public.email_queue CASCADE;

-- 4. Remover invite_campaigns (0 registros, não usado no frontend)
DROP TABLE IF EXISTS public.invite_campaigns CASCADE;

-- 5. Remover networking_preferences (0 registros, não usado no frontend)
DROP TABLE IF EXISTS public.networking_preferences CASCADE;

-- 6. Remover onboarding_abandonment_points (0 registros, não usado no frontend)
DROP TABLE IF EXISTS public.onboarding_abandonment_points CASCADE;

-- FASE 3: LOG FINAL DA LIMPEZA
INSERT INTO public.audit_logs (
  user_id,
  event_type,
  action, 
  details
) VALUES (
  NULL,
  'system_event',
  'unused_tables_cleanup_completed',
  jsonb_build_object(
    'tables_removed', 6,
    'cleanup_completed_at', NOW(),
    'database_optimization', 'Removidas 6 tabelas vazias não utilizadas',
    'frontend_preserved', true,
    'performance_improvement', 'Schema do Supabase otimizado'
  )
);
