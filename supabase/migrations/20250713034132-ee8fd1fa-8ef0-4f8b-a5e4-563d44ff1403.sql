-- Remove todas as tabelas e funcionalidades relacionadas ao glossário

-- Remover a view primeiro
DROP VIEW IF EXISTS public.glossary_terms_with_category;

-- Remover as tabelas na ordem correta (dependências primeiro)
DROP TABLE IF EXISTS public.glossary_term_relations CASCADE;
DROP TABLE IF EXISTS public.glossary_terms CASCADE;
DROP TABLE IF EXISTS public.glossary_categories CASCADE;

-- Remover a função de incrementar views se existir
DROP FUNCTION IF EXISTS public.increment_glossary_views(uuid);

-- Remover trigger e função de update timestamp se existir
DROP TRIGGER IF EXISTS update_glossary_terms_updated_at ON public.glossary_terms;
DROP FUNCTION IF EXISTS public.update_glossary_updated_at();