-- ============================================
-- CORREÇÃO DEFINITIVA: RLS Bloqueando Comentários
-- ============================================

-- 1. Criar função SECURITY DEFINER para verificar se tópico permite posts
CREATE OR REPLACE FUNCTION public.topic_allows_posts(_topic_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.community_topics
    WHERE id = _topic_id
      AND NOT is_locked
  )
$$;

-- 2. Adicionar comentário explicativo na função
COMMENT ON FUNCTION public.topic_allows_posts IS 
  'Verifica se um tópico existe e aceita novos posts (não está bloqueado). 
   Usa SECURITY DEFINER para evitar problemas de RLS em subqueries.';

-- 3. Remover política RLS antiga de INSERT
DROP POLICY IF EXISTS "forum_posts_secure_insert" ON public.community_posts;

-- 4. Criar nova política de INSERT usando a função SECURITY DEFINER
CREATE POLICY "forum_posts_secure_insert"
ON public.community_posts
FOR INSERT
TO public
WITH CHECK (
  user_id = auth.uid() 
  AND auth.uid() IS NOT NULL
  AND public.topic_allows_posts(topic_id)
);

-- ============================================
-- RESULTADO ESPERADO
-- ============================================
-- Após esta migração:
-- ✓ Usuários autenticados poderão comentar normalmente
-- ✓ A função SECURITY DEFINER resolve o problema de contexto RLS
-- ✓ Tópicos bloqueados continuam protegidos
-- ✓ Segurança mantida (user_id = auth.uid())
-- ============================================