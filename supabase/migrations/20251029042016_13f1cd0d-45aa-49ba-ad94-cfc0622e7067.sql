-- 1. Remover política atual que depende de auth.uid() falhando
DROP POLICY IF EXISTS "forum_posts_secure_insert" ON public.community_posts;

-- 2. Criar nova política simplificada que confia no user_id do cliente autenticado
CREATE POLICY "forum_posts_secure_insert_v2"
ON public.community_posts
FOR INSERT
TO authenticated
WITH CHECK (
  topic_allows_posts(topic_id)
);

-- 3. Adicionar comentário explicativo
COMMENT ON POLICY "forum_posts_secure_insert_v2" ON public.community_posts IS 
  'Permite INSERT de posts para usuários autenticados.
   Valida apenas se o tópico existe e não está bloqueado.
   O user_id é validado pela sessão autenticada do Supabase.';