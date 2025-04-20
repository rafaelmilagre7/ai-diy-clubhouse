
-- Certifica-se que a tabela tool_comments existe e tem relacionamentos corretos
ALTER TABLE IF EXISTS tool_comments 
  DROP CONSTRAINT IF EXISTS tool_comments_user_id_fkey;

-- Adiciona um relacionamento correto para user_id sem usar uma foreign key direta para auth.users
COMMENT ON COLUMN tool_comments.user_id IS 'Referência ao ID do usuário em auth.users (sem foreign key direta)';

-- Adiciona índices para melhorar performance de consultas
CREATE INDEX IF NOT EXISTS idx_tool_comments_tool_id ON tool_comments(tool_id);
CREATE INDEX IF NOT EXISTS idx_tool_comments_user_id ON tool_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_tool_comments_parent_id ON tool_comments(parent_id);

-- Função para carregar perfil de usuário junto com comentário
CREATE OR REPLACE FUNCTION get_comment_with_profile(comment_id uuid)
RETURNS json AS $$
DECLARE
  result json;
BEGIN
  SELECT 
    json_build_object(
      'id', tc.id,
      'content', tc.content,
      'created_at', tc.created_at,
      'likes_count', tc.likes_count,
      'user_id', tc.user_id,
      'tool_id', tc.tool_id,
      'parent_id', tc.parent_id,
      'profiles', json_build_object(
        'name', p.name,
        'avatar_url', p.avatar_url,
        'role', p.role
      )
    ) INTO result
  FROM tool_comments tc
  LEFT JOIN profiles p ON tc.user_id = p.id
  WHERE tc.id = comment_id;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;
