-- FASE 4: LIMPEZA DE LOGS - LOG DA IMPLEMENTAÇÃO
-- ==============================================

-- Log da fase 4 concluída
INSERT INTO public.audit_logs (
  event_type,
  action,
  details,
  user_id
) VALUES (
  'system_optimization',
  'phase_4_log_cleanup',
  jsonb_build_object(
    'message', 'FASE 4 - Sistema de logging condicional implementado',
    'improvements', jsonb_build_array(
      'Sistema conditionalLogger criado',
      'Logs de analytics otimizados',
      'Debug mode configurável',
      'Performance melhorada'
    ),
    'next_phase', 'phase_5_legacy_removal',
    'timestamp', now()
  ),
  auth.uid()
);

-- FASE 5: REMOÇÃO DE CÓDIGO LEGACY 
-- ================================

-- 1. Verificar tabelas/views legacy ainda em uso
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%legacy%'
ORDER BY table_name;

-- 2. Função para identificar referências legacy no sistema
CREATE OR REPLACE FUNCTION public.audit_legacy_references()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  legacy_count integer := 0;
  legacy_tables text[];
  result jsonb;
BEGIN
  -- Contar tabelas com 'legacy' no nome
  SELECT COUNT(*), array_agg(table_name)
  INTO legacy_count, legacy_tables
  FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name LIKE '%legacy%';
  
  -- Verificar funções legacy
  result := jsonb_build_object(
    'legacy_tables_count', legacy_count,
    'legacy_tables', legacy_tables,
    'is_legacy_user_function_exists', EXISTS(
      SELECT 1 FROM pg_proc 
      WHERE proname = 'is_legacy_user'
    ),
    'cleanup_recommendations', jsonb_build_array(
      'Remover is_legacy_user checks do frontend',
      'Consolidar sistema de tipos único',
      'Eliminar referências /types/legacy'
    ),
    'audit_timestamp', now()
  );
  
  RETURN result;
END;
$function$;

-- Log da implementação da Fase 5
INSERT INTO public.audit_logs (
  event_type,
  action,
  details,
  user_id
) VALUES (
  'system_optimization',
  'phase_5_legacy_audit_ready',
  jsonb_build_object(
    'message', 'FASE 5 - Auditoria de código legacy configurada',
    'audit_function', 'audit_legacy_references',
    'next_steps', jsonb_build_array(
      'Executar auditoria legacy',
      'Remover código legacy frontend',
      'Preparar Fase 6 - Performance'
    ),
    'timestamp', now()
  ),
  auth.uid()
);