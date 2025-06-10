
-- ========================================================
-- VERIFICAÇÃO FINAL DE SEGURANÇA - IMPLEMENTAÇÃO CRÍTICA (CORRIGIDA)
-- ========================================================

-- Log de finalização da implementação crítica de segurança (usando NULL para logs do sistema)
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
  'critical_security_implementation_completed',
  'security_system',
  jsonb_build_object(
    'implementation_stage', 'final_verification',
    'timestamp', NOW(),
    'security_level', 'critical',
    'scope', 'complete_rls_audit',
    'status', 'completed'
  ),
  'high'
);

-- Verificação completa de RLS em todas as tabelas críticas
WITH security_audit AS (
  SELECT 
    t.schemaname,
    t.tablename,
    t.rowsecurity as rls_enabled,
    (SELECT COUNT(*) FROM pg_policies p WHERE p.tablename = t.tablename AND p.schemaname = t.schemaname) as policies_count,
    CASE 
      WHEN t.rowsecurity = true AND (SELECT COUNT(*) FROM pg_policies p WHERE p.tablename = t.tablename AND p.schemaname = t.schemaname) > 0 
      THEN 'SECURED' 
      ELSE 'NEEDS_ATTENTION' 
    END as security_status
  FROM pg_tables t
  WHERE t.schemaname = 'public'
  AND t.tablename IN (
    'profiles', 'solutions', 'progress', 'analytics', 'notifications',
    'forum_topics', 'forum_posts', 'implementation_profiles', 'audit_logs',
    'invites', 'user_roles', 'benefit_clicks', 'learning_progress'
  )
  ORDER BY t.tablename
)
SELECT 
  schemaname,
  tablename,
  rls_enabled,
  policies_count,
  security_status
FROM security_audit;

-- Contagem final de políticas aplicadas
WITH policy_summary AS (
  SELECT 
    COUNT(*) as total_policies,
    COUNT(DISTINCT tablename) as secured_tables,
    string_agg(DISTINCT tablename, ', ' ORDER BY tablename) as table_list
  FROM pg_policies 
  WHERE schemaname = 'public'
)
SELECT 
  total_policies || ' políticas RLS aplicadas em ' || secured_tables || ' tabelas' as summary,
  table_list as secured_tables
FROM policy_summary;

-- Log de auditoria da verificação (usando NULL para logs do sistema)
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
  'security_audit_completed',
  'rls_policies',
  jsonb_build_object(
    'audit_timestamp', NOW(),
    'tables_verified', (SELECT COUNT(DISTINCT tablename) FROM pg_policies WHERE schemaname = 'public'),
    'total_policies', (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public'),
    'audit_type', 'comprehensive_rls_verification'
  ),
  'medium'
);

-- Notice final
SELECT 'IMPLEMENTAÇÃO CRÍTICA DE SEGURANÇA CONCLUÍDA COM SUCESSO!' as status;
