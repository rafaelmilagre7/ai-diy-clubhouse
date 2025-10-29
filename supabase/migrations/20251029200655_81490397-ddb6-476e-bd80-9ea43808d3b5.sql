-- =========================================================
-- CORREÇÃO DEFINITIVA: Função SECURITY DEFINER para NPS
-- =========================================================

-- PROBLEMA:
-- RLS policies em learning_lessons bloqueiam validação de FK
-- durante INSERT em learning_lesson_nps

-- SOLUÇÃO:
-- Função SECURITY DEFINER que bypassa RLS mas mantém segurança
-- validando o usuário autenticado e a existência da aula

CREATE OR REPLACE FUNCTION public.safe_insert_or_update_lesson_nps(
  p_lesson_id UUID,
  p_score INTEGER,
  p_feedback TEXT DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id UUID;
  v_existing_id UUID;
  v_existing_score INTEGER;
  v_result jsonb;
BEGIN
  -- 1. Validar usuário autenticado
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuário não autenticado';
  END IF;
  
  -- 2. Validar que a aula existe (BYPASS RLS com SECURITY DEFINER)
  IF NOT EXISTS (SELECT 1 FROM learning_lessons WHERE id = p_lesson_id) THEN
    RAISE EXCEPTION 'Aula não encontrada: %', p_lesson_id;
  END IF;
  
  -- 3. Verificar se já existe avaliação
  SELECT id, score INTO v_existing_id, v_existing_score
  FROM learning_lesson_nps
  WHERE lesson_id = p_lesson_id
    AND user_id = v_user_id;
  
  -- 4. INSERT ou UPDATE
  IF v_existing_id IS NOT NULL THEN
    -- UPDATE: já existe
    UPDATE learning_lesson_nps
    SET 
      score = p_score,
      feedback = p_feedback,
      updated_at = NOW()
    WHERE id = v_existing_id
    RETURNING jsonb_build_object(
      'id', id,
      'lesson_id', lesson_id,
      'user_id', user_id,
      'score', score,
      'feedback', feedback,
      'response_code', response_code,
      'created_at', created_at,
      'updated_at', updated_at,
      'operation', 'UPDATE',
      'previous_score', v_existing_score
    ) INTO v_result;
    
    -- Log da atualização
    PERFORM log_learning_action(
      'nps_updated',
      'lesson',
      p_lesson_id,
      jsonb_build_object(
        'score', p_score,
        'feedback_length', COALESCE(length(p_feedback), 0),
        'previous_score', v_existing_score
      )
    );
  ELSE
    -- INSERT: novo registro
    INSERT INTO learning_lesson_nps (lesson_id, user_id, score, feedback)
    VALUES (p_lesson_id, v_user_id, p_score, p_feedback)
    RETURNING jsonb_build_object(
      'id', id,
      'lesson_id', lesson_id,
      'user_id', user_id,
      'score', score,
      'feedback', feedback,
      'response_code', response_code,
      'created_at', created_at,
      'updated_at', updated_at,
      'operation', 'INSERT'
    ) INTO v_result;
    
    -- Log da nova avaliação
    PERFORM log_learning_action(
      'nps_created',
      'lesson',
      p_lesson_id,
      jsonb_build_object(
        'score', p_score,
        'feedback_length', COALESCE(length(p_feedback), 0),
        'nps_id', (v_result->>'id')::uuid
      )
    );
  END IF;
  
  RETURN v_result;
END;
$$;

-- Comentário explicativo
COMMENT ON FUNCTION public.safe_insert_or_update_lesson_nps IS 
'Função segura para INSERT/UPDATE de NPS que bypassa RLS na validação de FK mas mantém segurança validando auth.uid()';