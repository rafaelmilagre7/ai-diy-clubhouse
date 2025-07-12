-- Criar tabela solution_comments que está sendo referenciada no código mas não existe
CREATE TABLE public.solution_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  solution_id UUID NOT NULL,
  user_id UUID NOT NULL,
  parent_id UUID REFERENCES public.solution_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  likes_count INTEGER NOT NULL DEFAULT 0,
  is_hidden BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_solution_comments_solution_id ON public.solution_comments(solution_id);
CREATE INDEX idx_solution_comments_user_id ON public.solution_comments(user_id);
CREATE INDEX idx_solution_comments_parent_id ON public.solution_comments(parent_id);

-- Habilitar RLS
ALTER TABLE public.solution_comments ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Anyone can view solution comments"
ON public.solution_comments
FOR SELECT
USING (NOT is_hidden);

CREATE POLICY "Authenticated users can insert solution comments"
ON public.solution_comments
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own solution comments"
ON public.solution_comments
FOR UPDATE
USING (auth.uid() = user_id::uuid);

CREATE POLICY "Users and admins can delete solution comments"
ON public.solution_comments
FOR DELETE
USING (
  auth.uid() = user_id::uuid 
  OR 
  EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = auth.uid() AND ur.name = 'admin'
  )
);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_solution_comments_updated_at
BEFORE UPDATE ON public.solution_comments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();