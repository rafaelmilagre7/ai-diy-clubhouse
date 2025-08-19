-- Função para detectar se usuário completou um curso
CREATE OR REPLACE FUNCTION public.check_course_completion(
  p_user_id uuid,
  p_course_id uuid
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  total_lessons integer;
  completed_lessons integer;
BEGIN
  -- Contar total de aulas do curso
  SELECT COUNT(ll.id) INTO total_lessons
  FROM learning_lessons ll
  INNER JOIN learning_modules lm ON ll.module_id = lm.id
  WHERE lm.course_id = p_course_id
    AND ll.published = true;
  
  -- Contar aulas completadas pelo usuário
  SELECT COUNT(DISTINCT lp.lesson_id) INTO completed_lessons
  FROM learning_progress lp
  INNER JOIN learning_lessons ll ON lp.lesson_id = ll.id
  INNER JOIN learning_modules lm ON ll.module_id = lm.id
  WHERE lm.course_id = p_course_id
    AND lp.user_id = p_user_id
    AND lp.progress_percentage = 100
    AND lp.completed_at IS NOT NULL;
  
  -- Curso está completo se tem pelo menos 1 aula e todas foram completadas
  RETURN total_lessons > 0 AND completed_lessons >= total_lessons;
END;
$$;

-- Função para detectar se usuário completou uma solução
CREATE OR REPLACE FUNCTION public.check_solution_completion(
  p_user_id uuid,
  p_solution_id uuid
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Verificar se existe um checkpoint com 100% de progresso
  RETURN EXISTS (
    SELECT 1 
    FROM implementation_checkpoints ic
    WHERE ic.user_id = p_user_id
      AND ic.solution_id = p_solution_id
      AND ic.progress_percentage >= 100
  );
END;
$$;

-- Função para gerar certificado de curso automaticamente
CREATE OR REPLACE FUNCTION public.auto_generate_course_certificate(
  p_user_id uuid,
  p_course_id uuid
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  certificate_id uuid;
  validation_code text;
  course_record record;
BEGIN
  -- Verificar se curso está completo
  IF NOT public.check_course_completion(p_user_id, p_course_id) THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Curso ainda não foi concluído'
    );
  END IF;
  
  -- Verificar se já existe certificado
  IF EXISTS (
    SELECT 1 FROM learning_certificates 
    WHERE user_id = p_user_id AND course_id = p_course_id
  ) THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Certificado já existe para este curso'
    );
  END IF;
  
  -- Buscar dados do curso
  SELECT * INTO course_record
  FROM learning_courses
  WHERE id = p_course_id;
  
  -- Gerar código de validação único
  validation_code := 'VIA-CURSO-' || EXTRACT(EPOCH FROM NOW())::bigint || '-' || substring(md5(random()::text), 1, 6);
  
  -- Criar certificado
  INSERT INTO learning_certificates (
    user_id,
    course_id,
    validation_code,
    issued_at,
    completion_date
  ) VALUES (
    p_user_id,
    p_course_id,
    validation_code,
    NOW(),
    NOW()
  ) RETURNING id INTO certificate_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'certificate_id', certificate_id,
    'validation_code', validation_code,
    'course_title', course_record.title
  );
END;
$$;

-- Função para gerar certificado de solução automaticamente
CREATE OR REPLACE FUNCTION public.auto_generate_solution_certificate(
  p_user_id uuid,
  p_solution_id uuid
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  certificate_id uuid;
  validation_code text;
  solution_record record;
  implementation_date timestamp with time zone;
BEGIN
  -- Verificar se solução está completa
  IF NOT public.check_solution_completion(p_user_id, p_solution_id) THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Solução ainda não foi implementada completamente'
    );
  END IF;
  
  -- Verificar se já existe certificado
  IF EXISTS (
    SELECT 1 FROM solution_certificates 
    WHERE user_id = p_user_id AND solution_id = p_solution_id
  ) THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Certificado já existe para esta solução'
    );
  END IF;
  
  -- Buscar dados da solução
  SELECT * INTO solution_record
  FROM solutions
  WHERE id = p_solution_id;
  
  -- Buscar data de implementação mais recente
  SELECT MAX(updated_at) INTO implementation_date
  FROM implementation_checkpoints
  WHERE user_id = p_user_id 
    AND solution_id = p_solution_id
    AND progress_percentage >= 100;
  
  -- Gerar código de validação único
  validation_code := 'VIA-SOL-' || EXTRACT(EPOCH FROM NOW())::bigint || '-' || substring(md5(random()::text), 1, 6);
  
  -- Criar certificado
  INSERT INTO solution_certificates (
    user_id,
    solution_id,
    validation_code,
    implementation_date,
    issued_at
  ) VALUES (
    p_user_id,
    p_solution_id,
    validation_code,
    COALESCE(implementation_date, NOW()),
    NOW()
  ) RETURNING id INTO certificate_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'certificate_id', certificate_id,
    'validation_code', validation_code,
    'solution_title', solution_record.title
  );
END;
$$;

-- Função principal para gerar todos os certificados pendentes de um usuário
CREATE OR REPLACE FUNCTION public.generate_pending_certificates(
  p_user_id uuid DEFAULT auth.uid()
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  course_record record;
  solution_record record;
  generated_courses jsonb[] := '{}';
  generated_solutions jsonb[] := '{}';
  result jsonb;
BEGIN
  IF p_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Usuário não autenticado'
    );
  END IF;
  
  -- Verificar cursos completados sem certificado
  FOR course_record IN
    SELECT lc.id, lc.title
    FROM learning_courses lc
    WHERE lc.published = true
      AND public.check_course_completion(p_user_id, lc.id)
      AND NOT EXISTS (
        SELECT 1 FROM learning_certificates 
        WHERE user_id = p_user_id AND course_id = lc.id
      )
  LOOP
    result := public.auto_generate_course_certificate(p_user_id, course_record.id);
    IF result->>'success' = 'true' THEN
      generated_courses := generated_courses || result;
    END IF;
  END LOOP;
  
  -- Verificar soluções implementadas sem certificado
  FOR solution_record IN
    SELECT s.id, s.title
    FROM solutions s
    WHERE s.published = true
      AND public.check_solution_completion(p_user_id, s.id)
      AND NOT EXISTS (
        SELECT 1 FROM solution_certificates 
        WHERE user_id = p_user_id AND solution_id = s.id
      )
  LOOP
    result := public.auto_generate_solution_certificate(p_user_id, solution_record.id);
    IF result->>'success' = 'true' THEN
      generated_solutions := generated_solutions || result;
    END IF;
  END LOOP;
  
  RETURN jsonb_build_object(
    'success', true,
    'generated_courses', generated_courses,
    'generated_solutions', generated_solutions,
    'total_generated', array_length(generated_courses, 1) + array_length(generated_solutions, 1)
  );
END;
$$;

-- Trigger para gerar certificados automaticamente quando progresso atinge 100%
CREATE OR REPLACE FUNCTION public.trigger_certificate_generation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  course_id_from_lesson uuid;
BEGIN
  -- Só processar se progress chegou a 100% e foi marcado como completo
  IF NEW.progress_percentage = 100 AND NEW.completed_at IS NOT NULL AND 
     (OLD.progress_percentage < 100 OR OLD.completed_at IS NULL) THEN
    
    -- Buscar o curso desta lição
    SELECT lm.course_id INTO course_id_from_lesson
    FROM learning_lessons ll
    INNER JOIN learning_modules lm ON ll.module_id = lm.id  
    WHERE ll.id = NEW.lesson_id;
    
    -- Tentar gerar certificado do curso (se elegível)
    PERFORM public.auto_generate_course_certificate(NEW.user_id, course_id_from_lesson);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Criar trigger para learning_progress
DROP TRIGGER IF EXISTS auto_generate_course_certificates ON learning_progress;
CREATE TRIGGER auto_generate_course_certificates
  AFTER UPDATE ON learning_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_certificate_generation();

-- Trigger para gerar certificados de solução quando checkpoint atinge 100%
CREATE OR REPLACE FUNCTION public.trigger_solution_certificate_generation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Só processar se progress chegou a 100%
  IF NEW.progress_percentage >= 100 AND 
     (OLD.progress_percentage < 100 OR OLD.progress_percentage IS NULL) THEN
    
    -- Tentar gerar certificado da solução (se elegível)
    PERFORM public.auto_generate_solution_certificate(NEW.user_id, NEW.solution_id);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Criar trigger para implementation_checkpoints
DROP TRIGGER IF EXISTS auto_generate_solution_certificates ON implementation_checkpoints;
CREATE TRIGGER auto_generate_solution_certificates
  AFTER INSERT OR UPDATE ON implementation_checkpoints
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_solution_certificate_generation();