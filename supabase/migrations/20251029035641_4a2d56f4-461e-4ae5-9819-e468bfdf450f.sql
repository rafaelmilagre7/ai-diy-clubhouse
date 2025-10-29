-- ============================================
-- CORREÇÃO DEFINITIVA: SISTEMA DE COMENTÁRIOS DA COMUNIDADE
-- ============================================

-- ETAPA 1: Corrigir Políticas RLS em community_topics
-- Problema: Triggers de FK não conseguem acessar community_topics devido a RLS restritiva
-- Solução: Criar política permissiva para SELECT (tópicos são públicos na comunidade)

-- 1.1: Remover política restritiva atual
DROP POLICY IF EXISTS "forum_topics_authenticated_only" ON public.community_topics;

-- 1.2: Criar nova política permissiva para SELECT
CREATE POLICY "forum_topics_public_read"
ON public.community_topics
FOR SELECT
TO public
USING (true);

-- 1.3: Reforçar política de INSERT (apenas autenticados podem criar tópicos)
DROP POLICY IF EXISTS "forum_topics_secure_insert" ON public.community_topics;
CREATE POLICY "forum_topics_secure_insert"
ON public.community_topics
FOR INSERT
TO public
WITH CHECK (user_id = auth.uid() AND auth.uid() IS NOT NULL);

-- ETAPA 2: Melhorar Política de INSERT em community_posts
-- Problema: Política não valida explicitamente se o tópico existe e não está bloqueado
-- Solução: Adicionar validação explícita na política

-- 2.1: Remover política atual
DROP POLICY IF EXISTS "forum_posts_secure_insert" ON public.community_posts;

-- 2.2: Criar nova com validação explícita de tópico
CREATE POLICY "forum_posts_secure_insert"
ON public.community_posts
FOR INSERT
TO public
WITH CHECK (
  user_id = auth.uid() 
  AND auth.uid() IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM public.community_topics 
    WHERE id = community_posts.topic_id
    AND NOT is_locked
  )
);

-- ETAPA 3: Adicionar Índices para Performance
-- Problema: Validações podem ser lentas sem índices adequados
-- Solução: Criar índices específicos

-- 3.1: Índice para FK de topic_id
CREATE INDEX IF NOT EXISTS idx_community_posts_topic_id 
ON public.community_posts(topic_id);

-- 3.2: Índice para FK de user_id
CREATE INDEX IF NOT EXISTS idx_community_posts_user_id 
ON public.community_posts(user_id);

-- 3.3: Índice composto para queries comuns (tópico + data)
CREATE INDEX IF NOT EXISTS idx_community_posts_topic_created 
ON public.community_posts(topic_id, created_at DESC);

-- ============================================
-- RESULTADO ESPERADO
-- ============================================
-- ✅ Triggers de FK funcionam corretamente
-- ✅ SELECT em community_topics é público
-- ✅ INSERT valida tópico não bloqueado
-- ✅ Performance otimizada com índices
-- ✅ Segurança mantida (apenas autenticados podem criar posts)
-- ============================================