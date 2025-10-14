-- Limpar textos antigos para forçar regeneração com o novo prompt
UPDATE strategic_matches_v2 
SET connection_copy = NULL 
WHERE connection_copy IS NOT NULL;