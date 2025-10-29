-- Correção de permissões para sistema de comentários da comunidade

-- 1. Conceder permissão de INSERT para usuários autenticados
GRANT INSERT ON public.community_posts TO authenticated;

-- 2. Garantir permissão de SELECT na tabela de posts
GRANT SELECT ON public.community_posts TO authenticated;
GRANT SELECT ON public.community_posts TO anon;

-- 3. Garantir permissão de SELECT na tabela de perfis
GRANT SELECT ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;

-- 4. Comentário explicativo
COMMENT ON TABLE public.community_posts IS 
  'Tabela de posts da comunidade. 
   Usuários autenticados podem INSERT (respeitando RLS).
   Todos podem SELECT (respeitando RLS de privacidade).';
