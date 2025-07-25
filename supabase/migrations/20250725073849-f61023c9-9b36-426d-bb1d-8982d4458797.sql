-- CORREÇÃO GLOBAL - Adicionando search_path a todas as funções SECURITY DEFINER restantes
-- Usando ALTER FUNCTION para evitar conflitos de assinatura

-- Funções restantes que aparecem na lista de 34 funções sem search_path
DO $$
DECLARE
    func_record RECORD;
    sql_stmt TEXT;
BEGIN
    -- Buscar todas as funções SECURITY DEFINER que não têm search_path
    FOR func_record IN 
        SELECT 
            n.nspname as schema_name,
            p.proname as function_name,
            pg_get_function_arguments(p.oid) as arguments
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public'
          AND p.prosecdef = true  -- SECURITY DEFINER functions
          AND (p.proconfig IS NULL OR NOT EXISTS (
            SELECT 1 FROM unnest(p.proconfig) AS config
            WHERE config LIKE 'search_path=%'
          ))
        ORDER BY p.proname
    LOOP
        BEGIN
            -- Construir e executar ALTER FUNCTION
            sql_stmt := format('ALTER FUNCTION %I.%I(%s) SET search_path = ''public''', 
                              func_record.schema_name, 
                              func_record.function_name, 
                              func_record.arguments);
            
            EXECUTE sql_stmt;
            
            RAISE NOTICE 'Search path adicionado para função: %', func_record.function_name;
            
        EXCEPTION 
            WHEN OTHERS THEN
                RAISE NOTICE 'Erro ao alterar função %: %', func_record.function_name, SQLERRM;
                CONTINUE;
        END;
    END LOOP;
END $$;