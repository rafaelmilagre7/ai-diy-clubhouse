
-- Políticas RLS para certificados de cursos (learning_certificates)

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "Users can view own certificates" ON public.learning_certificates;
DROP POLICY IF EXISTS "Users can create own certificates" ON public.learning_certificates;
DROP POLICY IF EXISTS "Users can read own learning certificates" ON public.learning_certificates;
DROP POLICY IF EXISTS "Users can insert own learning certificates" ON public.learning_certificates;

-- Habilitar RLS na tabela
ALTER TABLE public.learning_certificates ENABLE ROW LEVEL SECURITY;

-- Política para leitura: usuários podem ver apenas seus próprios certificados
CREATE POLICY "Users can read own learning certificates"
  ON public.learning_certificates
  FOR SELECT
  USING (auth.uid() = user_id);

-- Política para inserção: usuários podem criar certificados para si mesmos
CREATE POLICY "Users can insert own learning certificates"
  ON public.learning_certificates
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política para atualização: usuários podem atualizar apenas seus próprios certificados
CREATE POLICY "Users can update own learning certificates"
  ON public.learning_certificates
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Políticas RLS para certificados de soluções (solution_certificates)

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "Users can view own solution certificates" ON public.solution_certificates;
DROP POLICY IF EXISTS "Users can create own solution certificates" ON public.solution_certificates;
DROP POLICY IF EXISTS "Users can read own solution certificates" ON public.solution_certificates;
DROP POLICY IF EXISTS "Users can insert own solution certificates" ON public.solution_certificates;

-- Habilitar RLS na tabela
ALTER TABLE public.solution_certificates ENABLE ROW LEVEL SECURITY;

-- Política para leitura: usuários podem ver apenas seus próprios certificados
CREATE POLICY "Users can read own solution certificates"
  ON public.solution_certificates
  FOR SELECT
  USING (auth.uid() = user_id);

-- Política para inserção: usuários podem criar certificados para si mesmos
CREATE POLICY "Users can insert own solution certificates"
  ON public.solution_certificates
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política para atualização: usuários podem atualizar apenas seus próprios certificados
CREATE POLICY "Users can update own solution certificates"
  ON public.solution_certificates
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Políticas administrativas para ambas as tabelas

-- Admins podem ver todos os certificados de cursos
CREATE POLICY "Admins can read all learning certificates"
  ON public.learning_certificates
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.user_roles ur ON p.role_id = ur.id
      WHERE p.id = auth.uid() AND ur.name = 'admin'
    )
  );

-- Admins podem ver todos os certificados de soluções
CREATE POLICY "Admins can read all solution certificates"
  ON public.solution_certificates
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.user_roles ur ON p.role_id = ur.id
      WHERE p.id = auth.uid() AND ur.name = 'admin'
    )
  );

-- Comentários para documentação
COMMENT ON TABLE public.learning_certificates IS 'Certificados de conclusão de cursos LMS';
COMMENT ON TABLE public.solution_certificates IS 'Certificados de implementação de soluções';

-- Criar função melhorada para verificar elegibilidade de certificado de curso
CREATE OR REPLACE FUNCTION public.check_course_certificate_eligibility(p_user_id uuid, p_course_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  is_eligible BOOLEAN := false;
  progress_record RECORD;
BEGIN
  -- Verificar se o usuário completou o curso
  SELECT * INTO progress_record
  FROM public.learning_progress
  WHERE user_id = p_user_id 
    AND course_id = p_course_id 
    AND is_completed = true;
  
  IF progress_record.id IS NOT NULL THEN
    is_eligible := true;
  END IF;
  
  RETURN is_eligible;
END;
$$;

-- Criar função para gerar certificado de curso se elegível
CREATE OR REPLACE FUNCTION public.create_course_certificate_if_eligible(p_user_id uuid, p_course_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  is_eligible BOOLEAN;
  existing_cert_id UUID;
  new_cert_id UUID;
  validation_code TEXT;
BEGIN
  -- Verificar elegibilidade
  SELECT public.check_course_certificate_eligibility(p_user_id, p_course_id) INTO is_eligible;
  
  IF NOT is_eligible THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Usuário não é elegível para certificado deste curso'
    );
  END IF;
  
  -- Verificar se já possui certificado
  SELECT id INTO existing_cert_id
  FROM public.learning_certificates
  WHERE user_id = p_user_id AND course_id = p_course_id;
  
  IF existing_cert_id IS NOT NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Usuário já possui certificado para este curso',
      'certificate_id', existing_cert_id
    );
  END IF;
  
  -- Gerar código de validação
  SELECT public.generate_certificate_validation_code() INTO validation_code;
  
  -- Criar certificado
  INSERT INTO public.learning_certificates (
    user_id,
    course_id,
    validation_code,
    issued_at
  )
  VALUES (
    p_user_id,
    p_course_id,
    validation_code,
    NOW()
  )
  RETURNING id INTO new_cert_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Certificado criado com sucesso',
    'certificate_id', new_cert_id,
    'validation_code', validation_code
  );
END;
$$;

-- Comentários nas funções
COMMENT ON FUNCTION public.check_course_certificate_eligibility(uuid, uuid) IS 'Verifica se usuário é elegível para certificado do curso';
COMMENT ON FUNCTION public.create_course_certificate_if_eligible(uuid, uuid) IS 'Cria certificado de curso se usuário for elegível';
