-- MIGRAÇÃO ESTRUTURAL: Unificação do sistema de checklists
-- Esta migração cria uma única tabela unificada para todos os checklists

-- 1. Criar nova tabela unificada para checklists
CREATE TABLE IF NOT EXISTS public.unified_checklists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  solution_id UUID NOT NULL,
  template_id UUID NULL, -- Referência ao template usado
  checklist_type TEXT NOT NULL DEFAULT 'implementation', -- 'implementation', 'user', 'verification'
  
  -- Dados do checklist
  checklist_data JSONB NOT NULL DEFAULT '{}',
  completed_items INTEGER DEFAULT 0,
  total_items INTEGER DEFAULT 0,
  progress_percentage INTEGER DEFAULT 0,
  
  -- Controle de estado
  is_completed BOOLEAN DEFAULT false,
  is_template BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE NULL,
  
  -- Metadados
  metadata JSONB DEFAULT '{}'
);

-- 2. Habilitar RLS
ALTER TABLE public.unified_checklists ENABLE ROW LEVEL SECURITY;

-- 3. Criar políticas de segurança
CREATE POLICY "Users can view their own checklists" 
ON public.unified_checklists 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own checklists" 
ON public.unified_checklists 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own checklists" 
ON public.unified_checklists 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own checklists" 
ON public.unified_checklists 
FOR DELETE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all checklists" 
ON public.unified_checklists 
FOR ALL 
USING (is_user_admin_secure(auth.uid()));

CREATE POLICY "Admins can create templates" 
ON public.unified_checklists 
FOR INSERT 
WITH CHECK ((is_template = true AND is_user_admin_secure(auth.uid())) OR (is_template = false AND auth.uid() = user_id));

-- 4. Criar índices para performance
CREATE INDEX idx_unified_checklists_user_solution ON public.unified_checklists(user_id, solution_id);
CREATE INDEX idx_unified_checklists_solution_template ON public.unified_checklists(solution_id, is_template);
CREATE INDEX idx_unified_checklists_type ON public.unified_checklists(checklist_type);
CREATE INDEX idx_unified_checklists_completed ON public.unified_checklists(is_completed);

-- 5. Criar função para atualizar timestamp
CREATE OR REPLACE FUNCTION public.update_unified_checklists_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Criar trigger para timestamp automático
CREATE TRIGGER update_unified_checklists_updated_at
  BEFORE UPDATE ON public.unified_checklists
  FOR EACH ROW
  EXECUTE FUNCTION public.update_unified_checklists_updated_at();

-- 7. Migrar dados existentes de implementation_checkpoints
INSERT INTO public.unified_checklists (
  user_id, 
  solution_id, 
  template_id,
  checklist_type,
  checklist_data,
  completed_items,
  total_items,
  progress_percentage,
  is_completed,
  is_template,
  created_at,
  updated_at,
  completed_at,
  metadata
)
SELECT 
  user_id,
  solution_id,
  template_id,
  'implementation',
  checkpoint_data,
  COALESCE(array_length(completed_steps, 1), 0),
  COALESCE(total_steps, 0),
  COALESCE(progress_percentage, 0),
  CASE WHEN last_completed_step IS NOT NULL THEN true ELSE false END,
  COALESCE(is_template, false),
  created_at,
  updated_at,
  CASE WHEN last_completed_step IS NOT NULL THEN updated_at ELSE NULL END,
  '{}'::jsonb
FROM public.implementation_checkpoints
ON CONFLICT DO NOTHING;

-- 8. Migrar dados existentes de user_checklists (se existirem)
INSERT INTO public.unified_checklists (
  user_id, 
  solution_id,
  checklist_type,
  checklist_data,
  is_completed,
  is_template,
  created_at,
  updated_at,
  metadata
)
SELECT 
  user_id,
  solution_id,
  'user',
  COALESCE(checked_items, '{}'::jsonb),
  false,
  false,
  created_at,
  updated_at,
  '{}'::jsonb
FROM public.user_checklists
WHERE NOT EXISTS (
  SELECT 1 FROM public.unified_checklists 
  WHERE unified_checklists.user_id = user_checklists.user_id 
  AND unified_checklists.solution_id = user_checklists.solution_id
  AND unified_checklists.checklist_type = 'user'
)
ON CONFLICT DO NOTHING;

-- 9. Criar função auxiliar para buscar checklist unificado
CREATE OR REPLACE FUNCTION public.get_unified_checklist(
  p_user_id UUID,
  p_solution_id UUID,
  p_checklist_type TEXT DEFAULT 'implementation'
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  solution_id UUID,
  template_id UUID,
  checklist_type TEXT,
  checklist_data JSONB,
  completed_items INTEGER,
  total_items INTEGER,
  progress_percentage INTEGER,
  is_completed BOOLEAN,
  is_template BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB
)
SECURITY DEFINER
LANGUAGE SQL
AS $$
  SELECT 
    id, user_id, solution_id, template_id, checklist_type,
    checklist_data, completed_items, total_items, progress_percentage,
    is_completed, is_template, created_at, updated_at, completed_at, metadata
  FROM public.unified_checklists
  WHERE unified_checklists.user_id = p_user_id 
    AND unified_checklists.solution_id = p_solution_id
    AND unified_checklists.checklist_type = p_checklist_type
    AND unified_checklists.is_template = false
  ORDER BY created_at DESC
  LIMIT 1;
$$;