-- Criar tabela para progresso de abas de implementação
CREATE TABLE IF NOT EXISTS public.implementation_tab_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  solution_id UUID NOT NULL,
  tab_id TEXT NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  progress_data JSONB DEFAULT '{}'::jsonb,
  UNIQUE(user_id, solution_id, tab_id)
);

-- Habilitar RLS
ALTER TABLE public.implementation_tab_progress ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view own tab progress" 
ON public.implementation_tab_progress 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tab progress" 
ON public.implementation_tab_progress 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tab progress" 
ON public.implementation_tab_progress 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tab progress" 
ON public.implementation_tab_progress 
FOR DELETE 
USING (auth.uid() = user_id);

-- Função para atualizar timestamp
CREATE OR REPLACE FUNCTION update_implementation_tab_progress_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar timestamp
CREATE TRIGGER implementation_tab_progress_updated_at
  BEFORE UPDATE ON public.implementation_tab_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_implementation_tab_progress_updated_at();