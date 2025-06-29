
-- Função para criar certificados de solução se elegível
CREATE OR REPLACE FUNCTION public.create_solution_certificate_if_eligible(p_user_id UUID, p_solution_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  certificate_id UUID;
  progress_record public.progress;
BEGIN
  -- Verificar se já existe certificado
  SELECT id INTO certificate_id
  FROM public.solution_certificates
  WHERE user_id = p_user_id AND solution_id = p_solution_id;
  
  IF certificate_id IS NOT NULL THEN
    RAISE EXCEPTION 'Usuário já possui certificado para esta solução';
  END IF;

  -- Verificar elegibilidade
  IF NOT public.check_solution_certificate_eligibility(p_user_id, p_solution_id) THEN
    RAISE EXCEPTION 'Usuário não é elegível para certificado desta solução';
  END IF;

  -- Buscar dados do progresso para data de implementação
  SELECT * INTO progress_record
  FROM public.progress
  WHERE user_id = p_user_id AND solution_id = p_solution_id;

  -- Criar certificado
  INSERT INTO public.solution_certificates (
    user_id,
    solution_id,
    implementation_date,
    validation_code,
    issued_at
  )
  VALUES (
    p_user_id,
    p_solution_id,
    COALESCE(progress_record.completed_at, progress_record.last_activity, now()),
    public.generate_certificate_validation_code(),
    now()
  )
  RETURNING id INTO certificate_id;

  RETURN certificate_id;
END;
$$;

-- Função para criar certificados de curso se elegível
CREATE OR REPLACE FUNCTION public.create_learning_certificate_if_eligible(p_user_id UUID, p_course_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  certificate_id UUID;
  completion_date TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Verificar se já existe certificado
  SELECT id INTO certificate_id
  FROM public.learning_certificates
  WHERE user_id = p_user_id AND course_id = p_course_id;
  
  IF certificate_id IS NOT NULL THEN
    RAISE EXCEPTION 'Usuário já possui certificado para este curso';
  END IF;

  -- Verificar se todas as aulas do curso foram completadas
  SELECT MAX(completed_at) INTO completion_date
  FROM public.learning_progress lp
  JOIN public.learning_lessons ll ON lp.lesson_id = ll.id
  JOIN public.learning_modules lm ON ll.module_id = lm.id
  WHERE lp.user_id = p_user_id 
    AND lm.course_id = p_course_id 
    AND lp.progress_percentage = 100
    AND lp.completed_at IS NOT NULL;

  -- Verificar se há pelo menos uma aula completada
  IF completion_date IS NULL THEN
    RAISE EXCEPTION 'Usuário não completou nenhuma aula do curso';
  END IF;

  -- Verificar se todas as aulas foram completadas
  IF EXISTS (
    SELECT 1
    FROM public.learning_lessons ll
    JOIN public.learning_modules lm ON ll.module_id = lm.id
    WHERE lm.course_id = p_course_id
      AND ll.published = true
      AND NOT EXISTS (
        SELECT 1 
        FROM public.learning_progress lp 
        WHERE lp.lesson_id = ll.id 
          AND lp.user_id = p_user_id 
          AND lp.progress_percentage = 100
          AND lp.completed_at IS NOT NULL
      )
  ) THEN
    RAISE EXCEPTION 'Usuário não completou todas as aulas do curso';
  END IF;

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
    public.generate_certificate_validation_code(),
    COALESCE(completion_date, now())
  )
  RETURNING id INTO certificate_id;

  RETURN certificate_id;
END;
$$;

-- Função para gerar certificados retroativos para todos os usuários elegíveis
CREATE OR REPLACE FUNCTION public.generate_retroactive_certificates()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  solution_certificates_created INTEGER := 0;
  learning_certificates_created INTEGER := 0;
  user_record RECORD;
  solution_record RECORD;
  course_record RECORD;
  certificate_id UUID;
BEGIN
  -- Gerar certificados de soluções
  FOR user_record IN 
    SELECT DISTINCT p.user_id, p.solution_id
    FROM public.progress p
    WHERE p.is_completed = true
      AND NOT EXISTS (
        SELECT 1 FROM public.solution_certificates sc 
        WHERE sc.user_id = p.user_id AND sc.solution_id = p.solution_id
      )
  LOOP
    BEGIN
      SELECT public.create_solution_certificate_if_eligible(
        user_record.user_id, 
        user_record.solution_id
      ) INTO certificate_id;
      
      IF certificate_id IS NOT NULL THEN
        solution_certificates_created := solution_certificates_created + 1;
      END IF;
    EXCEPTION
      WHEN OTHERS THEN
        -- Ignorar erros e continuar
        CONTINUE;
    END;
  END LOOP;

  -- Gerar certificados de cursos
  FOR course_record IN
    SELECT DISTINCT lm.course_id, lp.user_id
    FROM public.learning_progress lp
    JOIN public.learning_lessons ll ON lp.lesson_id = ll.id
    JOIN public.learning_modules lm ON ll.module_id = lm.id
    WHERE lp.progress_percentage = 100
      AND lp.completed_at IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM public.learning_certificates lc 
        WHERE lc.user_id = lp.user_id AND lc.course_id = lm.course_id
      )
    GROUP BY lm.course_id, lp.user_id
    HAVING COUNT(*) = (
      SELECT COUNT(*) 
      FROM public.learning_lessons ll2
      JOIN public.learning_modules lm2 ON ll2.module_id = lm2.id
      WHERE lm2.course_id = lm.course_id AND ll2.published = true
    )
  LOOP
    BEGIN
      SELECT public.create_learning_certificate_if_eligible(
        course_record.user_id, 
        course_record.course_id
      ) INTO certificate_id;
      
      IF certificate_id IS NOT NULL THEN
        learning_certificates_created := learning_certificates_created + 1;
      END IF;
    EXCEPTION
      WHEN OTHERS THEN
        -- Ignorar erros e continuar
        CONTINUE;
    END;
  END LOOP;

  RETURN jsonb_build_object(
    'success', true,
    'solution_certificates_created', solution_certificates_created,
    'learning_certificates_created', learning_certificates_created,
    'total_created', solution_certificates_created + learning_certificates_created
  );
END;
$$;
