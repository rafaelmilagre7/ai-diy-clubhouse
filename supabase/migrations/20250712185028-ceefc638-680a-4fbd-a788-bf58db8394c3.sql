-- Verificar os tipos permitidos na tabela network_matches
SELECT 
    con.conname as constraint_name,
    pg_get_constraintdef(con.oid) as constraint_definition
FROM pg_constraint con
    INNER JOIN pg_class rel ON rel.oid = con.conrelid
    INNER JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
WHERE nsp.nspname = 'public'
    AND rel.relname = 'network_matches'
    AND con.contype = 'c';