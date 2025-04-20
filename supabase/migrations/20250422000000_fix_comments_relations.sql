
-- Certifica-se que a tabela tool_comments existe e tem relacionamentos corretos
ALTER TABLE IF EXISTS tool_comments 
  DROP CONSTRAINT IF EXISTS tool_comments_user_id_fkey;

-- Adiciona um relacionamento correto para user_id sem usar uma foreign key direta para auth.users
COMMENT ON COLUMN tool_comments.user_id IS 'Referência ao ID do usuário em auth.users (sem foreign key direta)';

-- Adiciona índices para melhorar performance de consultas
CREATE INDEX IF NOT EXISTS idx_tool_comments_tool_id ON tool_comments(tool_id);
CREATE INDEX IF NOT EXISTS idx_tool_comments_user_id ON tool_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_tool_comments_parent_id ON tool_comments(parent_id);

-- Habilitar replicação para funcionalidade em tempo real
ALTER TABLE tool_comments REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE tool_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE tool_comment_likes;
