-- Adicionar GRANTs ausentes para learning_comments
GRANT SELECT, INSERT, UPDATE, DELETE ON public.learning_comments TO authenticated;
GRANT SELECT ON public.learning_comments TO anon;

-- Adicionar GRANTs para learning_comment_likes
GRANT SELECT, INSERT, DELETE ON public.learning_comment_likes TO authenticated;
GRANT SELECT ON public.learning_comment_likes TO anon;

-- Garantir que sequences também têm permissão
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Forçar reload do schema cache do PostgREST
NOTIFY pgrst, 'reload schema';