-- CORREÇÃO FINAL DAS ÚLTIMAS 8 FUNÇÕES DE SISTEMA SEM SEARCH_PATH
-- Estas são funções do sistema Supabase nos schemas graphql e pgbouncer

-- Verificar e corrigir funções do schema graphql se existirem
DO $$
DECLARE
    func_record RECORD;
BEGIN
    -- Buscar funções sem search_path definido nos schemas sistema
    FOR func_record IN 
        SELECT 
            n.nspname as schema_name,
            p.proname as function_name,
            pg_get_function_identity_arguments(p.oid) as args
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE p.prosecdef = true  -- SECURITY DEFINER
        AND n.nspname IN ('graphql', 'pgbouncer', 'extensions')
        AND NOT EXISTS (
            SELECT 1 FROM pg_proc p2 
            WHERE p2.oid = p.oid 
            AND 'search_path' = ANY(p2.proconfig)
        )
    LOOP
        BEGIN
            -- Tentar aplicar search_path para essas funções do sistema
            EXECUTE format('ALTER FUNCTION %I.%I(%s) SET search_path = %L', 
                func_record.schema_name, 
                func_record.function_name, 
                func_record.args,
                func_record.schema_name || ', public'
            );
            
            RAISE NOTICE 'Aplicado search_path para função de sistema: %.%()', 
                func_record.schema_name, func_record.function_name;
                
        EXCEPTION
            WHEN OTHERS THEN
                RAISE NOTICE 'Não foi possível alterar função de sistema %.%(%): %', 
                    func_record.schema_name, func_record.function_name, func_record.args, SQLERRM;
        END;
    END LOOP;
END $$;

-- Verificar se ainda restam funções sem search_path no schema public
DO $$
DECLARE
    func_record RECORD;
    func_count INTEGER := 0;
BEGIN
    FOR func_record IN 
        SELECT 
            p.proname as function_name,
            pg_get_function_identity_arguments(p.oid) as args
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE p.prosecdef = true  -- SECURITY DEFINER
        AND n.nspname = 'public'
        AND NOT EXISTS (
            SELECT 1 FROM pg_proc p2 
            WHERE p2.oid = p.oid 
            AND 'search_path' = ANY(p2.proconfig)
        )
    LOOP
        func_count := func_count + 1;
        RAISE NOTICE 'Função pública ainda sem search_path: %(%) ', 
            func_record.function_name, func_record.args;
    END LOOP;
    
    IF func_count = 0 THEN
        RAISE NOTICE 'SUCESSO: Todas as funções públicas têm search_path configurado!';
    ELSE
        RAISE NOTICE 'ATENÇÃO: % funções públicas ainda precisam de search_path', func_count;
    END IF;
END $$;