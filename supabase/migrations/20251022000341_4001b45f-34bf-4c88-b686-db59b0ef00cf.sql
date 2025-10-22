-- Criar tabela para salvar progresso dos checklists de implementação
CREATE TABLE IF NOT EXISTS public.implementation_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  solution_id UUID NOT NULL REFERENCES public.solutions(id) ON DELETE CASCADE,
  completed_steps INTEGER[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, solution_id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_implementation_progress_user_id ON public.implementation_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_implementation_progress_solution_id ON public.implementation_progress(solution_id);

-- Habilitar RLS
ALTER TABLE public.implementation_progress ENABLE ROW LEVEL SECURITY;

-- Políticas RLS: usuários podem ver e gerenciar seu próprio progresso
CREATE POLICY "Users can view their own progress"
  ON public.implementation_progress
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress"
  ON public.implementation_progress
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
  ON public.implementation_progress
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own progress"
  ON public.implementation_progress
  FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_implementation_progress_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_implementation_progress_updated_at
  BEFORE UPDATE ON public.implementation_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_implementation_progress_updated_at();