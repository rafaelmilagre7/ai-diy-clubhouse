-- Corrigir sistema de comentários e likes das aulas (versão corrigida)

-- 1. Criar função para atualizar contador de likes em tempo real
CREATE OR REPLACE FUNCTION public.handle_learning_comment_like_change()
RETURNS TRIGGER
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Incrementar contador quando curtida é adicionada
    UPDATE learning_comments 
    SET likes_count = likes_count + 1 
    WHERE id = NEW.comment_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrementar contador quando curtida é removida
    UPDATE learning_comments 
    SET likes_count = GREATEST(0, likes_count - 1) 
    WHERE id = OLD.comment_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- 2. Criar trigger para manter contador sincronizado
DROP TRIGGER IF EXISTS learning_comment_likes_trigger ON learning_comment_likes;
CREATE TRIGGER learning_comment_likes_trigger
  AFTER INSERT OR DELETE ON learning_comment_likes
  FOR EACH ROW
  EXECUTE FUNCTION handle_learning_comment_like_change();

-- 3. Sincronizar contadores existentes com dados reais
UPDATE learning_comments 
SET likes_count = (
  SELECT COUNT(*) 
  FROM learning_comment_likes 
  WHERE learning_comment_likes.comment_id = learning_comments.id
);

-- 4. Tentar habilitar realtime para learning_comment_likes (ignorar erro se já estiver)
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE learning_comment_likes;
  EXCEPTION 
    WHEN duplicate_object THEN
      -- Ignorar se já estiver na publicação
      RAISE NOTICE 'learning_comment_likes já está na publicação realtime';
  END;
END $$;

-- 5. Garantir que RLS está funcionando corretamente para likes
DROP POLICY IF EXISTS "Qualquer pessoa pode ver curtidas" ON learning_comment_likes;
DROP POLICY IF EXISTS "Usuários podem curtir" ON learning_comment_likes;
DROP POLICY IF EXISTS "Users can manage comment likes" ON learning_comment_likes;

-- Nova política mais robusta para visualização de likes
CREATE POLICY "Users can view comment likes" ON learning_comment_likes
  FOR SELECT USING (true);

-- Nova política para adicionar likes (apenas usuários autenticados)
CREATE POLICY "Authenticated users can add likes" ON learning_comment_likes
  FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = user_id);

-- Nova política para remover likes (apenas seus próprios)
CREATE POLICY "Users can remove own likes" ON learning_comment_likes
  FOR DELETE 
  TO authenticated 
  USING (auth.uid() = user_id);

-- 6. Melhorar política de inserção de comentários para garantir que funcionem
DROP POLICY IF EXISTS "learning_comments_secure_insert" ON learning_comments;
CREATE POLICY "Authenticated users can add comments" ON learning_comments
  FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = user_id);

-- 7. Log para verificar se tudo funcionou
SELECT 'Migração concluída: sistema de comentários e likes corrigido' as status;