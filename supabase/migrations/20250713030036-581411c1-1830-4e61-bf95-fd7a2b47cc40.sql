-- Drop triggers first to remove dependencies
DROP TRIGGER IF EXISTS update_wiki_categories_updated_at ON wiki_categories;
DROP TRIGGER IF EXISTS update_wiki_articles_updated_at ON wiki_articles;
DROP FUNCTION IF EXISTS update_wiki_updated_at();

-- Rename wiki tables to glossary format
ALTER TABLE wiki_articles RENAME TO glossary_terms;
ALTER TABLE wiki_categories RENAME TO glossary_categories;
ALTER TABLE wiki_article_relations RENAME TO glossary_term_relations;

-- Update column names to reflect term-based structure
ALTER TABLE glossary_terms RENAME COLUMN content TO definition;
ALTER TABLE glossary_terms RENAME COLUMN excerpt TO short_definition;
ALTER TABLE glossary_terms ADD COLUMN related_terms TEXT[];
ALTER TABLE glossary_terms ADD COLUMN synonyms TEXT[];
ALTER TABLE glossary_terms ADD COLUMN examples TEXT[];

-- Update the view name
DROP VIEW IF EXISTS wiki_articles_with_category;
CREATE VIEW glossary_terms_with_category AS
SELECT 
  gt.*,
  gc.name as category_name,
  gc.slug as category_slug,
  gc.color as category_color,
  gc.icon as category_icon
FROM glossary_terms gt
LEFT JOIN glossary_categories gc ON gt.category_id = gc.id
WHERE gt.is_published = true
ORDER BY gt.title;

-- Update the function name
DROP FUNCTION IF EXISTS increment_wiki_views(uuid);
CREATE OR REPLACE FUNCTION increment_glossary_views(term_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.glossary_terms
  SET view_count = view_count + 1
  WHERE id = term_id;
END;
$$;

-- Create new trigger function
CREATE OR REPLACE FUNCTION update_glossary_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Create new triggers
CREATE TRIGGER update_glossary_terms_updated_at
  BEFORE UPDATE ON glossary_terms
  FOR EACH ROW
  EXECUTE FUNCTION update_glossary_updated_at();

CREATE TRIGGER update_glossary_categories_updated_at
  BEFORE UPDATE ON glossary_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_glossary_updated_at();

-- Clear existing articles and add glossary terms
DELETE FROM glossary_terms;
DELETE FROM glossary_categories;

-- Add glossary categories
INSERT INTO glossary_categories (name, slug, description, icon, color, order_index) VALUES
('Conceitos Básicos', 'conceitos-basicos', 'Termos fundamentais da Inteligência Artificial', 'Brain', '#3B82F6', 1),
('Machine Learning', 'machine-learning', 'Algoritmos e técnicas de aprendizado de máquina', 'Bot', '#10B981', 2),
('Deep Learning', 'deep-learning', 'Redes neurais profundas e arquiteturas avançadas', 'Network', '#8B5CF6', 3),
('NLP', 'nlp', 'Processamento de Linguagem Natural', 'MessageSquare', '#F59E0B', 4),
('Computer Vision', 'computer-vision', 'Visão computacional e processamento de imagens', 'Eye', '#EF4444', 5),
('Modelos e Arquiteturas', 'modelos-arquiteturas', 'Tipos de modelos de IA e suas arquiteturas', 'Cpu', '#06B6D4', 6),
('Ferramentas e Plataformas', 'ferramentas-plataformas', 'Frameworks, bibliotecas e plataformas de IA', 'Wrench', '#84CC16', 7),
('Ética e Governança', 'etica-governanca', 'Aspectos éticos e governança em IA', 'Shield', '#F97316', 8);

-- Add sample glossary terms
INSERT INTO glossary_terms (title, slug, short_definition, definition, category_id, difficulty_level, tags, related_terms, synonyms, examples, is_featured, reading_time_minutes)
SELECT 
  'Inteligência Artificial',
  'inteligencia-artificial',
  'Capacidade de máquinas simularem inteligência humana',
  'A Inteligência Artificial (IA) é um campo da ciência da computação que se concentra na criação de sistemas capazes de realizar tarefas que normalmente requerem inteligência humana, como reconhecimento de padrões, tomada de decisões e processamento de linguagem natural.',
  id,
  'iniciante',
  ARRAY['IA', 'conceitos', 'definição'],
  ARRAY['Machine Learning', 'Deep Learning', 'Algoritmos'],
  ARRAY['IA', 'AI', 'Artificial Intelligence'],
  ARRAY['Assistentes virtuais como Siri e Alexa', 'Sistemas de recomendação do Netflix', 'Carros autônomos'],
  true,
  2
FROM glossary_categories WHERE slug = 'conceitos-basicos';