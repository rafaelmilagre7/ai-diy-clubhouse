-- Dropar funções existentes e recriá-las com search_path correto
DROP FUNCTION IF EXISTS public.check_nps_rate_limit(UUID, UUID);
DROP FUNCTION IF EXISTS public.safe_insert_or_update_lesson_nps(UUID, INTEGER, TEXT);

-- Recriar check_nps_rate_limit com search_path correto
CREATE FUNCTION public.check_nps_rate_limit(
  p_user_id UUID,
  p_lesson_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_last_submission TIMESTAMP WITH TIME ZONE;
BEGIN
  SELECT created_at INTO v_last_submission
  FROM learning_lesson_nps
  WHERE user_id = p_user_id
    AND lesson_id = p_lesson_id
  ORDER BY created_at DESC
  LIMIT 1;
  
  IF v_last_submission IS NULL THEN
    RETURN TRUE;
  END IF;
  
  RETURN (EXTRACT(EPOCH FROM (NOW() - v_last_submission)) > 86400);
END;
$$;

-- Recriar safe_insert_or_update_lesson_nps com search_path correto
CREATE FUNCTION public.safe_insert_or_update_lesson_nps(
  p_lesson_id UUID,
  p_score INTEGER,
  p_feedback TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  lesson_id UUID,
  score INTEGER,
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id UUID;
  v_lesson_exists BOOLEAN;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuário não autenticado';
  END IF;

  SELECT EXISTS(
    SELECT 1 FROM learning_lessons WHERE learning_lessons.id = p_lesson_id
  ) INTO v_lesson_exists;

  IF NOT v_lesson_exists THEN
    RAISE EXCEPTION 'Aula não encontrada';
  END IF;

  IF p_score < 0 OR p_score > 10 THEN
    RAISE EXCEPTION 'Score deve estar entre 0 e 10';
  END IF;

  RETURN QUERY
  INSERT INTO learning_lesson_nps (user_id, lesson_id, score, feedback, created_at, updated_at)
  VALUES (v_user_id, p_lesson_id, p_score, p_feedback, NOW(), NOW())
  ON CONFLICT (user_id, lesson_id)
  DO UPDATE SET
    score = EXCLUDED.score,
    feedback = EXCLUDED.feedback,
    updated_at = NOW()
  RETURNING 
    learning_lesson_nps.id,
    learning_lesson_nps.user_id,
    learning_lesson_nps.lesson_id,
    learning_lesson_nps.score,
    learning_lesson_nps.feedback,
    learning_lesson_nps.created_at,
    learning_lesson_nps.updated_at;
END;
$$;