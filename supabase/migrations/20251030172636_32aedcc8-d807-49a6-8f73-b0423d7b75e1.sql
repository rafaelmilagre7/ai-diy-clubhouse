-- Corrigir search_path de todas as funções de certificados
-- Problema: search_path vazio impede acesso às tabelas

-- 1. Corrigir check_course_completion
CREATE OR REPLACE FUNCTION public.check_course_completion(p_user_id uuid, p_course_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  total_lessons integer;
  completed_lessons integer;
BEGIN
  SELECT COUNT(ll.id) INTO total_lessons
  FROM learning_lessons ll
  INNER JOIN learning_modules lm ON ll.module_id = lm.id
  WHERE lm.course_id = p_course_id
    AND ll.published = true;
  
  SELECT COUNT(DISTINCT lp.lesson_id) INTO completed_lessons
  FROM learning_progress lp
  INNER JOIN learning_lessons ll ON lp.lesson_id = ll.id
  INNER JOIN learning_modules lm ON ll.module_id = lm.id
  WHERE lm.course_id = p_course_id
    AND lp.user_id = p_user_id
    AND lp.progress_percentage = 100
    AND lp.completed_at IS NOT NULL;
  
  RETURN total_lessons > 0 AND completed_lessons >= total_lessons;
END;
$function$;

-- 2. Corrigir auto_generate_course_certificate
CREATE OR REPLACE FUNCTION public.auto_generate_course_certificate(p_user_id uuid, p_course_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  certificate_id uuid;
  validation_code text;
  course_record record;
BEGIN
  IF NOT check_course_completion(p_user_id, p_course_id) THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Curso ainda não foi concluído'
    );
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM learning_certificates 
    WHERE user_id = p_user_id AND course_id = p_course_id
  ) THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Certificado já existe para este curso'
    );
  END IF;
  
  SELECT * INTO course_record
  FROM learning_courses
  WHERE id = p_course_id;
  
  validation_code := 'VIA-CURSO-' || EXTRACT(EPOCH FROM NOW())::bigint || '-' || substring(md5(random()::text), 1, 6);
  
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
$function$;

-- 3. Corrigir check_solution_completion
CREATE OR REPLACE FUNCTION public.check_solution_completion(p_user_id uuid, p_solution_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  has_implementation boolean;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM user_solution_implementations
    WHERE user_id = p_user_id
      AND solution_id = p_solution_id
      AND status = 'completed'
  ) INTO has_implementation;
  
  RETURN has_implementation;
END;
$function$;

-- 4. Corrigir auto_generate_solution_certificate
CREATE OR REPLACE FUNCTION public.auto_generate_solution_certificate(p_user_id uuid, p_solution_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  certificate_id uuid;
  validation_code text;
  solution_record record;
  implementation_record record;
BEGIN
  IF NOT check_solution_completion(p_user_id, p_solution_id) THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Solução ainda não foi implementada'
    );
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM solution_certificates 
    WHERE user_id = p_user_id AND solution_id = p_solution_id
  ) THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Certificado já existe para esta solução'
    );
  END IF;
  
  SELECT * INTO solution_record
  FROM solutions
  WHERE id = p_solution_id;
  
  SELECT implementation_date INTO implementation_record
  FROM user_solution_implementations
  WHERE user_id = p_user_id AND solution_id = p_solution_id
  ORDER BY implementation_date DESC
  LIMIT 1;
  
  validation_code := 'VIA-SOL-' || EXTRACT(EPOCH FROM NOW())::bigint || '-' || substring(md5(random()::text), 1, 6);
  
  INSERT INTO solution_certificates (
    user_id,
    solution_id,
    validation_code,
    issued_at,
    implementation_date
  ) VALUES (
    p_user_id,
    p_solution_id,
    validation_code,
    NOW(),
    COALESCE(implementation_record.implementation_date, NOW())
  ) RETURNING id INTO certificate_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'certificate_id', certificate_id,
    'validation_code', validation_code,
    'solution_title', solution_record.title
  );
END;
$function$;

-- Comentários
COMMENT ON FUNCTION public.check_course_completion IS 
'Verifica se usuário completou todas aulas de um curso. Corrigido search_path=public.';

COMMENT ON FUNCTION public.auto_generate_course_certificate IS 
'Gera certificado para curso concluído. Corrigido search_path=public.';

COMMENT ON FUNCTION public.check_solution_completion IS 
'Verifica se usuário completou implementação de solução. Corrigido search_path=public.';

COMMENT ON FUNCTION public.auto_generate_solution_certificate IS 
'Gera certificado para solução implementada. Corrigido search_path=public.';