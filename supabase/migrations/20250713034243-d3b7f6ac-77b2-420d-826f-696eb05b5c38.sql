-- Remove funcionalidades do glossário de forma segura

-- Remover a view se existir
DROP VIEW IF EXISTS public.glossary_terms_with_category CASCADE;

-- Remover tabelas se existirem
DROP TABLE IF EXISTS public.glossary_term_relations CASCADE;
DROP TABLE IF EXISTS public.glossary_terms CASCADE; 
DROP TABLE IF EXISTS public.glossary_categories CASCADE;

-- Remover funções se existirem
DROP FUNCTION IF EXISTS public.increment_glossary_views(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.update_glossary_updated_at() CASCADE;