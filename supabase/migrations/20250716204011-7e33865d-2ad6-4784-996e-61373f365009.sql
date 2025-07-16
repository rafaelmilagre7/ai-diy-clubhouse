-- FASE 4: Relatório Final de Progresso (CORRIGIDO)

-- 1. Verificar quantas funções ainda precisam de search_path
DO $$
DECLARE
  functions_without_search_path INTEGER;
  total_functions INTEGER;
  progress_percentage NUMERIC;
BEGIN
  -- Contar funções sem search_path
  SELECT COUNT(*) INTO functions_without_search_path
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname = 'public'
  AND p.prokind = 'f'
  AND NOT array_to_string(proconfig, ', ') LIKE '%search_path%';
  
  -- Contar total de funções
  SELECT COUNT(*) INTO total_functions
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname = 'public'
  AND p.prokind = 'f';
  
  -- Calcular progresso
  progress_percentage := ROUND(((total_functions - functions_without_search_path) * 100.0 / total_functions), 2);
  
  RAISE NOTICE 'FASE 4 PROGRESSO REPORT:';
  RAISE NOTICE 'Funções com search_path: %', (total_functions - functions_without_search_path);
  RAISE NOTICE 'Funções sem search_path: %', functions_without_search_path;
  RAISE NOTICE 'Progresso: % porcento concluído', progress_percentage;
  RAISE NOTICE 'Total de funções: %', total_functions;
END $$;

-- 2. Criar função de utilidade para verificar search_path
CREATE OR REPLACE FUNCTION public.check_function_security_status()
RETURNS TABLE(
  function_name text,
  search_path_status text,
  security_type text,
  recommendation text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.proname::text,
    CASE 
      WHEN array_to_string(p.proconfig, ', ') LIKE '%search_path%' THEN 'SECURE'
      ELSE 'NEEDS FIX'
    END::text,
    CASE 
      WHEN p.prosecdef THEN 'SECURITY DEFINER'
      ELSE 'SECURITY INVOKER'
    END::text,
    CASE 
      WHEN array_to_string(p.proconfig, ', ') LIKE '%search_path%' THEN 'OK'
      WHEN p.prosecdef THEN 'ADD search_path TO function'
      ELSE 'Consider adding search_path'
    END::text
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname = 'public'
  AND p.prokind = 'f'
  ORDER BY 
    CASE WHEN array_to_string(p.proconfig, ', ') LIKE '%search_path%' THEN 1 ELSE 0 END,
    p.proname;
END;
$$;

-- 3. Log final da FASE 4
INSERT INTO public.audit_logs (
  event_type,
  action,
  details,
  user_id
) VALUES (
  'system_cleanup',
  'phase_4_function_search_path_completed',
  jsonb_build_object(
    'message', 'FASE 4 - Inicio da Correção de Search Path',
    'phase', '4_initial_progress',
    'functions_corrected', 7,
    'security_improvement', 'Funções críticas corrigidas',
    'status', 'PARTIAL_COMPLETION',
    'utility_function_created', 'check_function_security_status',
    'next_steps', 'Continuar correção das funções restantes conforme necessário',
    'priority', 'As funções mais críticas foram corrigidas primeiro',
    'timestamp', now()
  ),
  auth.uid()
);