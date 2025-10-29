-- Corrigir função RPC safe_insert_or_update_lesson_nps
-- PROBLEMA: A função estava falhando com erro "relation learning_lessons does not exist"
-- CAUSA: O search_path não estava sendo aplicado corretamente na subquery EXISTS
-- SOLUÇÃO: Qualificar explicitamente as tabelas com "public." e simplificar a subquery

CREATE OR REPLACE FUNCTION public.safe_insert_or_update_lesson_nps(
  p_lesson_id UUID,
  p_score INTEGER,
  p_feedback TEXT DEFAULT NULL
)
RETURNS TABLE(
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
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_lesson_exists BOOLEAN;
BEGIN
  -- Obter ID do usuário autenticado
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuário não autenticado';
  END IF;

  -- Verificar se a aula existe (CORRIGIDO: usar public. explicitamente e simplificar)
  SELECT EXISTS(
    SELECT 1 FROM public.learning_lessons WHERE id = p_lesson_id
  ) INTO v_lesson_exists;

  IF NOT v_lesson_exists THEN
    RAISE EXCEPTION 'Aula não encontrada';
  END IF;

  -- Validar range do score
  IF p_score < 0 OR p_score > 10 THEN
    RAISE EXCEPTION 'Score deve estar entre 0 e 10';
  END IF;

  -- Inserir ou atualizar o NPS (CORRIGIDO: usar public. explicitamente)
  RETURN QUERY
  INSERT INTO public.learning_lesson_nps (
    user_id,
    lesson_id,
    score,
    feedback,
    created_at,
    updated_at
  )
  VALUES (
    v_user_id,
    p_lesson_id,
    p_score,
    p_feedback,
    NOW(),
    NOW()
  )
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