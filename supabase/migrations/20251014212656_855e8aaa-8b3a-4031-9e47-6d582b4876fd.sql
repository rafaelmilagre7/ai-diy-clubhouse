-- Limpar matches antigos para permitir regeneração completa
DELETE FROM strategic_matches_v2 
WHERE created_at < NOW() - INTERVAL '1 day';

-- Adicionar índice para melhorar performance de consultas por user_id
CREATE INDEX IF NOT EXISTS idx_strategic_matches_v2_user_created 
ON strategic_matches_v2(user_id, created_at DESC);