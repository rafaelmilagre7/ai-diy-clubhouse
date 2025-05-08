
-- Criar tabela para armazenar os threads do assistente OpenAI
CREATE TABLE IF NOT EXISTS public.assistant_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES public.learning_lessons(id) ON DELETE CASCADE,
  thread_id TEXT NOT NULL,
  assistant_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Adicionar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_assistant_threads_user_id ON public.assistant_threads(user_id);
CREATE INDEX IF NOT EXISTS idx_assistant_threads_lesson_id ON public.assistant_threads(lesson_id);

-- Adicionar políticas RLS para garantir que usuários só acessem seus próprios threads
ALTER TABLE public.assistant_threads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver seus próprios threads"
  ON public.assistant_threads
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar seus próprios threads"
  ON public.assistant_threads
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios threads"
  ON public.assistant_threads
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Adicionar trigger para atualizar o updated_at
CREATE OR REPLACE FUNCTION public.update_assistant_threads_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_assistant_threads_timestamp
BEFORE UPDATE ON public.assistant_threads
FOR EACH ROW
EXECUTE FUNCTION public.update_assistant_threads_updated_at();
