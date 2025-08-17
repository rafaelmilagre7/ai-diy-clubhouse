-- ==========================================
-- LOTE 2: CORREÇÃO DAS FUNÇÕES RESTANTES
-- Processar mais 50 funções inseguras
-- ==========================================

DO $$
DECLARE
    func_record RECORD;
    function_count INTEGER := 0;
    fixed_count INTEGER := 0;
    error_count INTEGER := 0;
    function_sql TEXT;
    original_definition TEXT;
    function_signature TEXT;
BEGIN
    RAISE NOTICE 'Iniciando lote 2 de correções de search_path...';
    
    -- Iterar por todas as funções SECURITY DEFINER inseguras (lote 2)
    FOR func_record IN 
        SELECT 
            p.proname as function_name,
            pg_get_function_arguments(p.oid) as arguments,
            pg_get_functiondef(p.oid) as definition,
            p.oid
        FROM pg_proc p
        INNER JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public'
          AND p.prosecdef = true
          AND (
            NOT EXISTS (
              SELECT 1 FROM unnest(p.proconfig) as config
              WHERE config LIKE 'search_path=public%'
            )
            OR EXISTS (
              SELECT 1 FROM unnest(p.proconfig) as config  
              WHERE config = 'search_path=""'
            )
          )
        ORDER BY p.proname
        OFFSET 50 LIMIT 50  -- Segundo lote
    LOOP
        function_count := function_count + 1;
        
        BEGIN
            original_definition := func_record.definition;
            function_signature := func_record.function_name || '(' || func_record.arguments || ')';
            
            -- Estratégia mais robusta de substituição
            IF original_definition ILIKE '%SET search_path TO ''''%' THEN
                -- Caso 1: search_path vazio -> public
                function_sql := replace(original_definition, 'SET search_path TO ''''', 'SET search_path TO ''public''');
            ELSIF original_definition ILIKE '%SET search_path = ''''%' THEN
                -- Caso 2: search_path com = vazio -> public  
                function_sql := replace(original_definition, 'SET search_path = ''''', 'SET search_path TO ''public''');
            ELSIF original_definition NOT ILIKE '%SET search_path%' THEN
                -- Caso 3: sem search_path -> adicionar
                function_sql := replace(
                    original_definition,
                    'SECURITY DEFINER',
                    E'SECURITY DEFINER\nSET search_path TO ''public'''
                );
            ELSE
                -- Pular se já parece correto
                CONTINUE;
            END IF;
            
            -- Executar correção
            EXECUTE function_sql;
            fixed_count := fixed_count + 1;
            
        EXCEPTION
            WHEN OTHERS THEN
                error_count := error_count + 1;
                RAISE NOTICE 'ERRO [%]: %', function_signature, SQLERRM;
                CONTINUE;
        END;
    END LOOP;
    
    RAISE NOTICE 'LOTE 2 COMPLETO: % processadas, % corrigidas, % erros', function_count, fixed_count, error_count;
    
    -- Log do lote 2
    INSERT INTO audit_logs (
        user_id, event_type, action, details, severity
    ) VALUES (
        NULL, 'security_mass_fix', 'search_path_batch2_correction',
        jsonb_build_object(
            'batch_number', 2,
            'functions_processed', function_count,
            'functions_fixed', fixed_count,
            'functions_errors', error_count,
            'batch_completed_at', now()
        ),
        'info'
    ) ON CONFLICT DO NOTHING;
    
END $$;

-- VALIDAR PROGRESSO
SELECT public.validate_all_functions_security();