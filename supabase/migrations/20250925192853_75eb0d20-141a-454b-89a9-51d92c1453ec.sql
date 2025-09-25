-- Criar tabela para controle de acesso específico por solução
CREATE TABLE public.solution_access_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  solution_id UUID NOT NULL REFERENCES public.solutions(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES public.user_roles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Garantir que não há duplicatas
  UNIQUE(solution_id, role_id)
);

-- Habilitar RLS
ALTER TABLE public.solution_access_overrides ENABLE ROW LEVEL SECURITY;

-- Política para admins poderem gerenciar
CREATE POLICY "Admins can manage solution access overrides"
  ON public.solution_access_overrides
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      INNER JOIN public.user_roles ur ON p.role_id = ur.id
      WHERE p.id = auth.uid() AND ur.name = 'admin'
    )
  );

-- Política para usuários poderem ver apenas seus próprios acessos específicos
CREATE POLICY "Users can view their own solution access overrides"
  ON public.solution_access_overrides
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role_id = solution_access_overrides.role_id
    )
  );

-- Trigger para updated_at
CREATE TRIGGER update_solution_access_overrides_updated_at
  BEFORE UPDATE ON public.solution_access_overrides
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();