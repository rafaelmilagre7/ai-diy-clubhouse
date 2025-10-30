-- Corrigir search_path da função generate_pending_certificates
-- Problema: search_path vazio impede acesso às tabelas do schema public
CREATE OR REPLACE FUNCTION public.generate_pending_certificates(p_user_id uuid DEFAULT auth.uid())
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
      AND check_course_completion(p_user_id, lc.id)
      AND NOT EXISTS (
        SELECT 1 FROM learning_certificates 
        WHERE user_id = p_user_id AND course_id = lc.id
      )
  LOOP
    result := auto_generate_course_certificate(p_user_id, course_record.id);
    IF result->>'success' = 'true' THEN
      generated_courses := generated_courses || result;
    END IF;
  END LOOP;
  
  -- Verificar soluções implementadas sem certificado
  FOR solution_record IN
    SELECT s.id, s.title
    FROM solutions s
    WHERE s.published = true
      AND check_solution_completion(p_user_id, s.id)
      AND NOT EXISTS (
        SELECT 1 FROM solution_certificates 
        WHERE user_id = p_user_id AND solution_id = s.id
      )
  LOOP
    result := auto_generate_solution_certificate(p_user_id, solution_record.id);
    IF result->>'success' = 'true' THEN
      generated_solutions := generated_solutions || result;
    END IF;
  END LOOP;
  
  RETURN jsonb_build_object(
    'success', true,
    'generated_courses', generated_courses,
    'generated_solutions', generated_solutions,
    'total_generated', COALESCE(array_length(generated_courses, 1), 0) + COALESCE(array_length(generated_solutions, 1), 0)
  );
END;
$function$;

-- Comentário explicativo
COMMENT ON FUNCTION public.generate_pending_certificates IS 
'Verifica e gera certificados pendentes para cursos e soluções que o usuário completou. Corrigido search_path=public para permitir acesso às tabelas.';