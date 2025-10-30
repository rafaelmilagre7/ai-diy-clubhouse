-- Corrigir search_path da função create_learning_certificate_if_eligible
-- Esta é a função chamada pelo hook useRetroactiveCertificates

CREATE OR REPLACE FUNCTION public.create_learning_certificate_if_eligible(p_user_id uuid, p_course_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  certificate_id UUID;
  completion_date TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Verificar se já existe certificado
  SELECT id INTO certificate_id
  FROM learning_certificates
  WHERE user_id = p_user_id AND course_id = p_course_id;
  
  IF certificate_id IS NOT NULL THEN
    RAISE EXCEPTION 'Usuário já possui certificado para este curso';
  END IF;

  -- Verificar se todas as aulas do curso foram completadas
  SELECT MAX(completed_at) INTO completion_date
  FROM learning_progress lp
  JOIN learning_lessons ll ON lp.lesson_id = ll.id
  JOIN learning_modules lm ON ll.module_id = lm.id
  WHERE lp.user_id = p_user_id 
    AND lm.course_id = p_course_id 
    AND lp.progress_percentage = 100
    AND lp.completed_at IS NOT NULL;

  -- Verificar se há pelo menos uma aula completada
  IF completion_date IS NULL THEN
    RAISE EXCEPTION 'Usuário não completou nenhuma aula do curso';
  END IF;

  -- Verificar se todas as aulas foram completadas (100%)
  IF EXISTS (
    SELECT 1
    FROM learning_lessons ll
    JOIN learning_modules lm ON ll.module_id = lm.id
    WHERE lm.course_id = p_course_id
      AND ll.published = true
      AND NOT EXISTS (
        SELECT 1 
        FROM learning_progress lp 
        WHERE lp.lesson_id = ll.id 
          AND lp.user_id = p_user_id 
          AND lp.progress_percentage = 100
          AND lp.completed_at IS NOT NULL
      )
  ) THEN
    RAISE EXCEPTION 'Usuário não completou todas as aulas do curso';
  END IF;

  -- Criar certificado
  INSERT INTO learning_certificates (
    user_id,
    course_id,
    validation_code,
    issued_at
  )
  VALUES (
    p_user_id,
    p_course_id,
    generate_certificate_validation_code(),
    COALESCE(completion_date, now())
  )
  RETURNING id INTO certificate_id;

  RETURN certificate_id;
END;
$function$;

COMMENT ON FUNCTION public.create_learning_certificate_if_eligible IS 
'Gera certificado para usuário que completou 100% das aulas de um curso. Corrigido search_path=public.';