
-- Criar tabela principal para certificados de soluções
CREATE TABLE public.solution_certificates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  solution_id UUID NOT NULL REFERENCES public.solutions(id) ON DELETE CASCADE,
  template_id UUID REFERENCES public.solution_certificate_templates(id) ON DELETE SET NULL,
  validation_code TEXT NOT NULL DEFAULT public.generate_certificate_validation_code(),
  implementation_date TIMESTAMP WITH TIME ZONE NOT NULL,
  certificate_url TEXT,
  certificate_filename TEXT,
  issued_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT unique_user_solution_certificate UNIQUE(user_id, solution_id)
);

-- Adicionar validation_code à tabela learning_certificates se não existir
ALTER TABLE public.learning_certificates 
ADD COLUMN IF NOT EXISTS validation_code TEXT DEFAULT public.generate_certificate_validation_code();

-- Atualizar validation_code para registros existentes que não têm
UPDATE public.learning_certificates 
SET validation_code = public.generate_certificate_validation_code() 
WHERE validation_code IS NULL;

-- Tornar validation_code obrigatório
ALTER TABLE public.learning_certificates 
ALTER COLUMN validation_code SET NOT NULL;

-- Adicionar índices para performance
CREATE INDEX IF NOT EXISTS idx_solution_certificates_user_id ON public.solution_certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_solution_certificates_solution_id ON public.solution_certificates(solution_id);
CREATE INDEX IF NOT EXISTS idx_solution_certificates_validation_code ON public.solution_certificates(validation_code);
CREATE INDEX IF NOT EXISTS idx_learning_certificates_validation_code ON public.learning_certificates(validation_code);

-- Habilitar RLS
ALTER TABLE public.solution_certificates ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para solution_certificates
CREATE POLICY "Users can view their own solution certificates" 
  ON public.solution_certificates 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own solution certificates" 
  ON public.solution_certificates 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own solution certificates" 
  ON public.solution_certificates 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Admins podem ver todos os certificados
CREATE POLICY "Admins can view all solution certificates" 
  ON public.solution_certificates 
  FOR ALL 
  USING (public.is_admin());

-- Função para verificar elegibilidade para certificado de solução
CREATE OR REPLACE FUNCTION public.check_solution_certificate_eligibility(p_user_id UUID, p_solution_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  progress_record public.progress;
BEGIN
  -- Buscar progresso do usuário na solução
  SELECT * INTO progress_record
  FROM public.progress
  WHERE user_id = p_user_id AND solution_id = p_solution_id;
  
  -- Se não há progresso, não é elegível
  IF progress_record.id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Verificar se a implementação está completa
  RETURN COALESCE(progress_record.is_completed, FALSE);
END;
$$;

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_solution_certificates_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_update_solution_certificates_updated_at
  BEFORE UPDATE ON public.solution_certificates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_solution_certificates_updated_at();
