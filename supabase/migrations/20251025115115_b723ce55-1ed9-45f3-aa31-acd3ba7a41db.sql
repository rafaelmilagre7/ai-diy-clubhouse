-- Fase 2: Correção em massa de todas as funções SECURITY DEFINER
-- Aplica search_path = '' em todas as funções públicas para máxima segurança

DO $$
DECLARE
  func_record RECORD;
  total_fixed INTEGER := 0;
BEGIN
  -- Iterar sobre todas as funções SECURITY DEFINER no schema public
  FOR func_record IN 
    SELECT 
      p.oid,
      p.proname as function_name,
      pg_get_function_identity_arguments(p.oid) as arguments
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
      AND p.prosecdef = true
      AND (p.proconfig IS NULL OR 'search_path=public' = ANY(p.proconfig))
  LOOP
    BEGIN
      -- Aplicar ALTER FUNCTION com assinatura completa
      EXECUTE format(
        'ALTER FUNCTION public.%I(%s) SET search_path = ''''',
        func_record.function_name,
        func_record.arguments
      );
      
      total_fixed := total_fixed + 1;
      
    EXCEPTION WHEN OTHERS THEN
      -- Log de erro mas continua o processo
      RAISE NOTICE 'Erro ao corrigir função %: %', func_record.function_name, SQLERRM;
    END;
  END LOOP;
  
  RAISE NOTICE 'Total de funções corrigidas: %', total_fixed;
END $$;