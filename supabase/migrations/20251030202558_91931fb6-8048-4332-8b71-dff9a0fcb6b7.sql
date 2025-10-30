-- ============================================
-- CORREÇÃO: Adicionar GRANTs para Sistema de Comentários
-- ============================================
-- 
-- Problema: Erro 404 ao tentar fazer POST em /rest/v1/learning_comments
-- Causa: Falta de permissões GRANT para roles authenticated e anon
-- Solução: Adicionar todos os GRANTs necessários para o sistema funcionar
--
-- ============================================

-- 1. GRANT na tabela de comentários de aprendizado
GRANT SELECT, INSERT, UPDATE, DELETE ON public.learning_comments TO authenticated;
GRANT SELECT ON public.learning_comments TO anon;

-- 2. GRANT na tabela de curtidas de comentários
GRANT SELECT, INSERT, DELETE ON public.learning_comment_likes TO authenticated;
GRANT SELECT ON public.learning_comment_likes TO anon;

-- 3. GRANT na view pública de perfis (necessária para exibir nomes)
GRANT SELECT ON public.profiles_community_public TO authenticated, anon;

-- 4. GRANT nas tabelas relacionadas (necessárias para validação de FK)
GRANT SELECT ON public.learning_lessons TO authenticated, anon;
GRANT SELECT ON public.learning_modules TO authenticated, anon;
GRANT SELECT ON public.learning_courses TO authenticated, anon;

-- 5. Garantir que sequences sejam acessíveis
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated, anon;

-- 6. Notificar PostgREST para recarregar o schema
NOTIFY pgrst, 'reload schema';
SELECT pg_notify('pgrst', 'reload schema');