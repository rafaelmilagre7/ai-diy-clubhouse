
-- Tabela para comentários de ferramentas se ainda não existir
CREATE TABLE IF NOT EXISTS tool_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES tool_comments(id) ON DELETE CASCADE,
  likes_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para curtidas de comentários
CREATE TABLE IF NOT EXISTS tool_comment_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES tool_comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(comment_id, user_id)
);

-- Adicionar funções para incrementar e decrementar contadores se não existirem
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_proc WHERE proname = 'increment') THEN
    CREATE OR REPLACE FUNCTION increment(row_id uuid, table_name text, column_name text)
    RETURNS void AS $$
    BEGIN
      EXECUTE format('UPDATE %I SET %I = %I + 1 WHERE id = $1', table_name, column_name, column_name)
      USING row_id;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
  END IF;

  IF NOT EXISTS (SELECT FROM pg_proc WHERE proname = 'decrement') THEN
    CREATE OR REPLACE FUNCTION decrement(row_id uuid, table_name text, column_name text)
    RETURNS void AS $$
    BEGIN
      EXECUTE format('UPDATE %I SET %I = GREATEST(0, %I - 1) WHERE id = $1', table_name, column_name, column_name)
      USING row_id;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
  END IF;
END
$$;

-- Triggers para atualizar o timestamp updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tool_comments_updated_at
BEFORE UPDATE ON tool_comments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Políticas de segurança (RLS)
ALTER TABLE tool_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_comment_likes ENABLE ROW LEVEL SECURITY;

-- Política para visualização de comentários (qualquer pessoa autenticada pode ver)
CREATE POLICY "Qualquer pessoa pode ver comentários" ON tool_comments
  FOR SELECT USING (true);

-- Política para inserção de comentários (usuários autenticados podem criar)
CREATE POLICY "Usuários autenticados podem criar comentários" ON tool_comments
  FOR INSERT TO authenticated USING (true) WITH CHECK (auth.uid() = user_id);

-- Política para atualização de comentários (apenas o autor pode atualizar)
CREATE POLICY "Apenas o autor pode atualizar comentários" ON tool_comments
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Política para exclusão de comentários (autor ou admin pode excluir)
CREATE POLICY "Autor ou admin pode excluir comentários" ON tool_comments
  FOR DELETE TO authenticated USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Políticas para curtidas
CREATE POLICY "Qualquer pessoa pode ver curtidas" ON tool_comment_likes
  FOR SELECT USING (true);

CREATE POLICY "Usuários autenticados podem curtir" ON tool_comment_likes
  FOR INSERT TO authenticated USING (true) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem remover suas próprias curtidas" ON tool_comment_likes
  FOR DELETE TO authenticated USING (auth.uid() = user_id);
