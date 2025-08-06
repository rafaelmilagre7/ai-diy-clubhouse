-- Investigar diretamente as funções que podem ter SECURITY DEFINER
SELECT 
    p.proname as function_name,
    p.prosecdef as is_security_definer,
    n.nspname as schema_name
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
AND p.prosecdef = true
ORDER BY p.proname;