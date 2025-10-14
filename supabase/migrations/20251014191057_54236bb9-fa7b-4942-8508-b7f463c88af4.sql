-- Adicionar coluna para armazenar a copy gerada pela IA
ALTER TABLE strategic_matches_v2 
ADD COLUMN IF NOT EXISTS connection_copy TEXT;

-- Índice para performance nas buscas
CREATE INDEX IF NOT EXISTS idx_strategic_matches_user_target 
ON strategic_matches_v2(user_id, matched_user_id);

-- Comentário para documentação
COMMENT ON COLUMN strategic_matches_v2.connection_copy IS 'Copy personalizada gerada pela IA explicando por que essa conexão faz sentido';