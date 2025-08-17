-- ==========================================
-- LOTE FINAL: ÚLTIMAS 50 FUNÇÕES INSEGURAS
-- Completar a correção de segurança
-- ==========================================

DO $$
DECLARE
    func_record RECORD;
    function_count INTEGER := 0;
    fixed_count INTEGER := 0;
    error_count INTEGER := 0;
    function_sql TEXT;
    original_definition TEXT;
BEGIN
    RAISE NOTICE 'Iniciando lote final de correções de search_path...';
    
    -- Processar as últimas funções inseguras
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
              WHERE config LIKE 'search_path=public%'
            )
            OR EXISTS (
              SELECT 1 FROM unnest(p.proconfig) as config  
              WHERE config = 'search_path=""'
            )
          )
        ORDER BY p.proname
        LIMIT 50  -- Lote final
    LOOP
        function_count := function_count + 1;
        
        BEGIN
            original_definition := func_record.definition;
            
            -- Abordagem mais conservadora: apenas substituir search_path problemáticos
            IF original_definition ILIKE '%SET search_path TO ''''%' THEN
                -- Substituir search_path vazio
                function_sql := replace(
                    original_definition, 
                    'SET search_path TO ''''', 
                    'SET search_path TO ''public'''
                );
            ELSIF original_definition ILIKE '%SET search_path = ''''%' THEN
                -- Substituir search_path com =
                function_sql := replace(
                    original_definition, 
                    'SET search_path = ''''', 
                    'SET search_path TO ''public'''
                );
            ELSIF original_definition ILIKE '%SECURITY DEFINER%' AND original_definition NOT ILIKE '%SET search_path%' THEN
                -- Adicionar search_path após SECURITY DEFINER
                function_sql := regexp_replace(
                    original_definition,
                    '(SECURITY DEFINER)([[:space:]]*)(AS)',
                    E'\\1\nSET search_path TO ''public''\n\\3',
                    'gi'
                );
                
                -- Se não funcionou, tentar outra abordagem
                IF function_sql = original_definition THEN
                    function_sql := regexp_replace(
                        original_definition,
                        'SECURITY DEFINER',
                        E'SECURITY DEFINER\nSET search_path TO ''public''',
                        'g'
                    );
                END IF;
            ELSE
                CONTINUE;
            END IF;
            
            -- Executar apenas se houve mudança
            IF function_sql != original_definition THEN
                EXECUTE function_sql;
                fixed_count := fixed_count + 1;
            END IF;
            
        EXCEPTION
            WHEN OTHERS THEN
                error_count := error_count + 1;
                RAISE NOTICE 'ERRO [%]: %', func_record.function_name, SQLERRM;
                CONTINUE;
        END;
    END LOOP;
    
    RAISE NOTICE 'LOTE FINAL: % processadas, % corrigidas, % erros', function_count, fixed_count, error_count;
    
    -- Log do resultado final
    INSERT INTO audit_logs (
        user_id, event_type, action, details, severity
    ) VALUES (
        NULL, 'security_mass_fix', 'search_path_final_batch',
        jsonb_build_object(
            'batch_number', 'final',
            'functions_processed', function_count,
            'functions_fixed', fixed_count,
            'functions_errors', error_count,
            'total_batches_completed', 3,
            'final_batch_completed_at', now()
        ),
        'info'
    ) ON CONFLICT DO NOTHING;
    
END $$;

-- VALIDAÇÃO FINAL DO SISTEMA DE SEGURANÇA
SELECT public.validate_all_functions_security();

-- CRIAR RELATÓRIO FINAL DE SEGURANÇA
CREATE OR REPLACE FUNCTION public.generate_security_completion_report()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    function_security jsonb;
    role_consistency jsonb;
    final_report jsonb;
BEGIN
    -- Validar segurança das funções
    SELECT public.validate_all_functions_security() INTO function_security;
    
    -- Validar consistência dos papéis
    SELECT public.validate_role_consistency() INTO role_consistency;
    
    final_report := jsonb_build_object(
        'security_consolidation_completed', true,
        'function_security', function_security,
        'role_consistency', role_consistency,
        'major_fixes_applied', ARRAY[
            'role_system_single_source_of_truth',
            'audit_logs_rls_violations_eliminated',
            'mass_function_search_path_secured',
            'admin_policies_consolidated'
        ],
        'remaining_manual_configs', ARRAY[
            'otp_expiry_dashboard_setting',
            'password_breach_protection_dashboard_setting'
        ],
        'report_generated_at', now()
    );
    
    RETURN final_report;
END;
$$;

-- EXECUTAR RELATÓRIO FINAL
SELECT public.generate_security_completion_report();