-- Criar tabela específica para progresso dos usuários nos checklists
CREATE TABLE IF NOT EXISTS public.user_checklists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  solution_id uuid NOT NULL,
  template_id uuid REFERENCES public.implementation_checkpoints(id) ON DELETE CASCADE,
  checklist_data jsonb NOT NULL DEFAULT '{}',
  progress_percentage integer DEFAULT 0,
  completed_items integer DEFAULT 0,
  total_items integer DEFAULT 0,
  is_completed boolean DEFAULT false,
  completed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, solution_id)
);

-- Habilitar RLS
ALTER TABLE public.user_checklists ENABLE ROW LEVEL SECURITY;

-- Política: usuários só veem seu próprio progresso
CREATE POLICY "Users can view their own checklist progress" 
ON public.user_checklists 
FOR SELECT 
USING (auth.uid() = user_id);

-- Política: usuários só podem inserir seu próprio progresso
CREATE POLICY "Users can create their own checklist progress" 
ON public.user_checklists 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Política: usuários só podem atualizar seu próprio progresso
CREATE POLICY "Users can update their own checklist progress" 
ON public.user_checklists 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Política: admins podem ver todo o progresso
CREATE POLICY "Admins can view all checklist progress" 
ON public.user_checklists 
FOR SELECT 
USING (is_user_admin_secure(auth.uid()));

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_user_checklists_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_user_checklists_updated_at
  BEFORE UPDATE ON public.user_checklists
  FOR EACH ROW
  EXECUTE FUNCTION update_user_checklists_updated_at();