-- Criar tabela de tags para lições
CREATE TABLE public.lesson_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT NOT NULL DEFAULT '#6366f1',
  category TEXT DEFAULT 'geral',
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de relacionamento muitos-para-muitos entre lições e tags
CREATE TABLE public.learning_lesson_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id UUID NOT NULL REFERENCES public.learning_lessons(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.lesson_tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(lesson_id, tag_id)
);

-- Habilitar RLS nas tabelas
ALTER TABLE public.lesson_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_lesson_tags ENABLE ROW LEVEL SECURITY;

-- Políticas para lesson_tags
CREATE POLICY "Todos podem visualizar tags ativas"
  ON public.lesson_tags FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins podem gerenciar tags"
  ON public.lesson_tags FOR ALL
  USING (is_user_admin(auth.uid()));

-- Políticas para learning_lesson_tags
CREATE POLICY "Todos podem visualizar associações de tags"
  ON public.learning_lesson_tags FOR SELECT
  USING (true);

CREATE POLICY "Admins podem gerenciar associações de tags"
  ON public.learning_lesson_tags FOR ALL
  USING (is_user_admin(auth.uid()));

-- Trigger para atualizar updated_at
CREATE TRIGGER update_lesson_tags_updated_at
  BEFORE UPDATE ON public.lesson_tags
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Índices para performance
CREATE INDEX idx_lesson_tags_category ON public.lesson_tags(category);
CREATE INDEX idx_lesson_tags_name ON public.lesson_tags(name);
CREATE INDEX idx_learning_lesson_tags_lesson_id ON public.learning_lesson_tags(lesson_id);
CREATE INDEX idx_learning_lesson_tags_tag_id ON public.learning_lesson_tags(tag_id);

-- Inserir algumas tags padrão
INSERT INTO public.lesson_tags (name, description, color, category, order_index) VALUES
  ('vendas', 'Aulas relacionadas a vendas e negociação', '#22c55e', 'tema', 1),
  ('marketing', 'Estratégias de marketing e promoção', '#3b82f6', 'tema', 2),
  ('automacao', 'Automação de processos e ferramentas', '#f97316', 'tema', 3),
  ('atendimento', 'Atendimento ao cliente e suporte', '#8b5cf6', 'tema', 4),
  ('typebot', 'Ferramenta Typebot para chatbots', '#1f2937', 'ferramenta', 5),
  ('make', 'Automação com Make (antigo Integromat)', '#ef4444', 'ferramenta', 6),
  ('openai', 'Inteligência Artificial e OpenAI', '#eab308', 'ferramenta', 7),
  ('meta-ads', 'Anúncios no Facebook e Instagram', '#0ea5e9', 'ferramenta', 8),
  ('iniciante', 'Conteúdo para iniciantes', '#22c55e', 'nivel', 9),
  ('intermediario', 'Conteúdo intermediário', '#f97316', 'nivel', 10),
  ('avancado', 'Conteúdo avançado', '#ef4444', 'nivel', 11),
  ('hotseat', 'Sessões de hotseat ao vivo', '#a855f7', 'formato', 12),
  ('aula-pratica', 'Aulas práticas hands-on', '#3b82f6', 'formato', 13),
  ('case-study', 'Estudos de caso reais', '#eab308', 'formato', 14);