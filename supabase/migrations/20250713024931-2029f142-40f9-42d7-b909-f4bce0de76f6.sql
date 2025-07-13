-- Criar tabela para categorias do wiki
CREATE TABLE public.wiki_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  color TEXT DEFAULT '#6366f1',
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar tabela para artigos do wiki
CREATE TABLE public.wiki_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL,
  excerpt TEXT,
  category_id UUID REFERENCES public.wiki_categories(id) ON DELETE SET NULL,
  tags TEXT[],
  difficulty_level TEXT CHECK (difficulty_level IN ('iniciante', 'intermediario', 'avancado')) DEFAULT 'iniciante',
  reading_time_minutes INTEGER,
  view_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT true,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar tabela para relacionamentos entre artigos
CREATE TABLE public.wiki_article_relations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID REFERENCES public.wiki_articles(id) ON DELETE CASCADE,
  related_article_id UUID REFERENCES public.wiki_articles(id) ON DELETE CASCADE,
  relation_type TEXT DEFAULT 'related' CHECK (relation_type IN ('related', 'prerequisite', 'next_step')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(article_id, related_article_id)
);

-- Habilitar RLS
ALTER TABLE public.wiki_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wiki_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wiki_article_relations ENABLE ROW LEVEL SECURITY;

-- Políticas para categorias do wiki
CREATE POLICY "Todos podem ver categorias do wiki ativas" 
ON public.wiki_categories 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins podem gerenciar categorias do wiki" 
ON public.wiki_categories 
FOR ALL 
USING (is_user_admin(auth.uid()));

-- Políticas para artigos do wiki
CREATE POLICY "Todos podem ver artigos publicados" 
ON public.wiki_articles 
FOR SELECT 
USING (is_published = true);

CREATE POLICY "Admins podem gerenciar artigos do wiki" 
ON public.wiki_articles 
FOR ALL 
USING (is_user_admin(auth.uid()));

-- Políticas para relacionamentos
CREATE POLICY "Todos podem ver relacionamentos de artigos" 
ON public.wiki_article_relations 
FOR SELECT 
USING (true);

CREATE POLICY "Admins podem gerenciar relacionamentos" 
ON public.wiki_article_relations 
FOR ALL 
USING (is_user_admin(auth.uid()));

-- Triggers para updated_at
CREATE OR REPLACE FUNCTION update_wiki_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_wiki_categories_updated_at
  BEFORE UPDATE ON public.wiki_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_wiki_updated_at();

CREATE TRIGGER update_wiki_articles_updated_at
  BEFORE UPDATE ON public.wiki_articles
  FOR EACH ROW
  EXECUTE FUNCTION update_wiki_updated_at();

-- Função para incrementar visualizações
CREATE OR REPLACE FUNCTION increment_wiki_views(article_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.wiki_articles
  SET view_count = view_count + 1
  WHERE id = article_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Inserir categorias iniciais
INSERT INTO public.wiki_categories (name, slug, description, icon, color, order_index) VALUES
('Fundamentos de IA', 'fundamentos-ia', 'Conceitos básicos e definições sobre Inteligência Artificial', 'Brain', '#3b82f6', 1),
('Machine Learning', 'machine-learning', 'Algoritmos e técnicas de aprendizado de máquina', 'Zap', '#10b981', 2),
('Agentes de IA', 'agentes-ia', 'Sistemas autônomos e agentes inteligentes', 'Bot', '#8b5cf6', 3),
('Automação', 'automacao', 'Processos automatizados e RPA', 'Cog', '#f59e0b', 4),
('LLMs e NLP', 'llms-nlp', 'Modelos de linguagem e processamento de texto', 'MessageSquare', '#ef4444', 5),
('Computer Vision', 'computer-vision', 'Visão computacional e análise de imagens', 'Eye', '#06b6d4', 6),
('Ferramentas e Plataformas', 'ferramentas', 'Plataformas, APIs e ferramentas de IA', 'Wrench', '#84cc16', 7),
('Ética e Governança', 'etica-governanca', 'Ética, responsabilidade e governança em IA', 'Shield', '#6366f1', 8);

-- Inserir alguns artigos de exemplo
INSERT INTO public.wiki_articles (title, slug, content, excerpt, category_id, tags, difficulty_level, reading_time_minutes, is_featured) VALUES
('O que é Inteligência Artificial?', 'o-que-e-inteligencia-artificial', 
'# O que é Inteligência Artificial?

A **Inteligência Artificial (IA)** é uma área da ciência da computação que se concentra em criar sistemas capazes de realizar tarefas que normalmente requerem inteligência humana.

## Definição

IA refere-se à capacidade de máquinas de simular processos de pensamento humano, incluindo:

- **Aprendizado**: Adquirir informações e regras para usar essas informações
- **Raciocínio**: Usar regras para chegar a conclusões aproximadas ou definitivas
- **Autocorreção**: Ajustar algoritmos baseado em feedback

## Tipos de IA

### IA Fraca (Narrow AI)
- Projetada para tarefas específicas
- Exemplos: Siri, Alexa, sistemas de recomendação

### IA Forte (General AI)
- Capacidade de entender, aprender e aplicar conhecimento em qualquer domínio
- Ainda não existe, mas é o objetivo a longo prazo

## Aplicações Práticas

- **Assistentes virtuais**
- **Carros autônomos**
- **Sistemas de recomendação**
- **Diagnóstico médico**
- **Tradução automática**

A IA está transformando praticamente todos os setores da economia e da sociedade.',
'Introdução completa aos conceitos fundamentais da Inteligência Artificial, tipos e aplicações práticas.',
(SELECT id FROM public.wiki_categories WHERE slug = 'fundamentos-ia'),
ARRAY['IA', 'conceitos básicos', 'definição'],
'iniciante',
5,
true),

('Agentes de IA: Como Funcionam', 'agentes-ia-como-funcionam',
'# Agentes de IA: Como Funcionam

Um **agente de IA** é um sistema autônomo que percebe seu ambiente através de sensores e age sobre esse ambiente através de atuadores para alcançar objetivos específicos.

## Características dos Agentes

### Autonomia
- Operam sem intervenção humana direta
- Tomam decisões baseadas em suas percepções

### Reatividade
- Respondem em tempo hábil a mudanças no ambiente
- Adaptam comportamento conforme necessário

### Proatividade
- Não apenas reagem, mas tomam iniciativa
- Buscam ativamente seus objetivos

### Habilidade Social
- Interagem com outros agentes ou humanos
- Comunicam-se e cooperam quando necessário

## Tipos de Agentes

### Agente Reativo Simples
- Responde diretamente a percepções atuais
- Não considera histórico ou estado interno

### Agente Baseado em Modelo
- Mantém estado interno do mundo
- Usa modelo para tomar decisões

### Agente Baseado em Objetivos
- Age para alcançar objetivos específicos
- Planeja sequências de ações

### Agente Baseado em Utilidade
- Maximiza uma função de utilidade
- Considera múltiplos critérios de performance

## Exemplos Práticos

- **Chatbots inteligentes**
- **Assistentes pessoais**
- **Sistemas de trading automático**
- **Robôs de limpeza**
- **Agentes de atendimento ao cliente**',
'Compreenda como funcionam os agentes de IA, suas características e diferentes tipos de implementação.',
(SELECT id FROM public.wiki_categories WHERE slug = 'agentes-ia'),
ARRAY['agentes', 'autonomia', 'sistemas inteligentes'],
'intermediario',
8,
true);

-- Criar view para artigos com informações da categoria
CREATE OR REPLACE VIEW public.wiki_articles_with_category AS
SELECT 
  a.*,
  c.name as category_name,
  c.slug as category_slug,
  c.color as category_color,
  c.icon as category_icon,
  p.name as author_name,
  p.avatar_url as author_avatar
FROM public.wiki_articles a
LEFT JOIN public.wiki_categories c ON a.category_id = c.id
LEFT JOIN public.profiles p ON a.created_by = p.id;

-- Habilitar realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.wiki_categories;
ALTER PUBLICATION supabase_realtime ADD TABLE public.wiki_articles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.wiki_article_relations;