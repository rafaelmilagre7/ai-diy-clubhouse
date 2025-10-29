-- Correção DEFINITIVA de permissões para community_posts

-- 1. Revogar todas as permissões anteriores
REVOKE ALL ON public.community_posts FROM authenticated;
REVOKE ALL ON public.community_posts FROM anon;

-- 2. Conceder permissões específicas de forma explícita
GRANT SELECT ON public.community_posts TO authenticated;
GRANT SELECT ON public.community_posts TO anon;
GRANT INSERT ON public.community_posts TO authenticated;
GRANT UPDATE ON public.community_posts TO authenticated;
GRANT DELETE ON public.community_posts TO authenticated;

-- 3. Garantir que profiles também tem permissões corretas
GRANT SELECT ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;

-- 4. Garantir que topics também tem permissões corretas
GRANT SELECT ON public.community_topics TO authenticated;
GRANT SELECT ON public.community_topics TO anon;

-- 5. Verificar se RLS está habilitado (apenas confirma, não altera)
DO $$
BEGIN
  IF NOT (SELECT relrowsecurity FROM pg_class WHERE relname = 'community_posts' AND relnamespace = 'public'::regnamespace) THEN
    RAISE NOTICE 'AVISO: RLS não está habilitado em community_posts';
  END IF;
END $$;