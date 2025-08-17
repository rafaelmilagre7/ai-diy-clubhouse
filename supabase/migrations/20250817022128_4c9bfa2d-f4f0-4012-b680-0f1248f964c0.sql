-- ==========================================
-- CORREÇÃO AUTOMÁTICA MASSIVA: TODAS AS FUNÇÕES INSEGURAS
-- Aplicar SET search_path = 'public' em todas as funções SECURITY DEFINER
-- ==========================================

-- FUNÇÃO PARA CORRIGIR TODAS AS FUNÇÕES AUTOMATICAMENTE
DO $$
DECLARE
    func_record RECORD;
    function_count INTEGER := 0;
    fixed_count INTEGER := 0;
    error_count INTEGER := 0;
    function_sql TEXT;
    original_definition TEXT;
BEGIN
    -- Iterar por todas as funções SECURITY DEFINER inseguras
    FOR func_record IN 
        SELECT 
            p.proname as function_name,
            pg_get_function_arguments(p.oid) as arguments,
            pg_get_functiondef(p.oid) as definition
        FROM pg_proc p
        INNER JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public'
          AND p.prosecdef = true
          AND (
            NOT EXISTS (
              SELECT 1 FROM unnest(p.proconfig) as config
              WHERE config LIKE 'search_path=%'
            )
            OR EXISTS (
              SELECT 1 FROM unnest(p.proconfig) as config  
              WHERE config = 'search_path=""'
            )
          )
        ORDER BY p.proname
        LIMIT 50  -- Processar em lotes para evitar timeout
    LOOP
        function_count := function_count + 1;
        
        BEGIN
            -- Extrair definição original
            original_definition := func_record.definition;
            
            -- Se a função não tem search_path configurado, adicionar
            IF original_definition NOT ILIKE '%SET search_path%' THEN
                -- Substituir SECURITY DEFINER por SECURITY DEFINER SET search_path TO 'public'
                function_sql := regexp_replace(
                    original_definition,
                    'SECURITY DEFINER',
                    'SECURITY DEFINER\nSET search_path TO ''public''',
                    'g'
                );
            ELSIF original_definition ILIKE '%SET search_path TO ''''%' OR original_definition ILIKE '%SET search_path = ''''%' THEN
                -- Substituir search_path vazio por 'public'
                function_sql := regexp_replace(
                    original_definition,
                    'SET search_path (TO|=) ''''',
                    'SET search_path TO ''public''',
                    'g'
                );
            ELSE
                -- Pular se já tem search_path válido
                CONTINUE;
            END IF;
            
            -- Executar a correção
            EXECUTE function_sql;
            fixed_count := fixed_count + 1;
            
            RAISE NOTICE 'Função corrigida: % (%)', func_record.function_name, func_record.arguments;
            
        EXCEPTION
            WHEN OTHERS THEN
                error_count := error_count + 1;
                RAISE NOTICE 'ERRO ao corrigir função %: %', func_record.function_name, SQLERRM;
                -- Continuar com a próxima função
                CONTINUE;
        END;
    END LOOP;
    
    RAISE NOTICE 'RESUMO: % funções processadas, % corrigidas, % erros', function_count, fixed_count, error_count;
    
    -- Log do resultado
    INSERT INTO audit_logs (
        user_id, event_type, action, details, severity
    ) VALUES (
        NULL, 'security_mass_fix', 'search_path_batch_correction',
        jsonb_build_object(
            'functions_processed', function_count,
            'functions_fixed', fixed_count,
            'functions_errors', error_count,
            'batch_completed_at', now()
        ),
        'info'
    ) ON CONFLICT DO NOTHING;
    
END $$;

-- LOG FINAL
INSERT INTO audit_logs (
  user_id, event_type, action, details, severity
) VALUES (
  NULL, 'system_migration', 'mass_function_security_fix',
  jsonb_build_object(
    'migration_type', 'automated_mass_correction',
    'target', 'all_insecure_functions',
    'approach', 'regex_replace_search_path',
    'batch_size', 50,
    'completed_at', now()
  ),
  'info'
) ON CONFLICT DO NOTHING;