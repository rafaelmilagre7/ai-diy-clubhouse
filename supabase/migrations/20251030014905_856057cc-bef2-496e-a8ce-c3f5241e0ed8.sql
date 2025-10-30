
-- ============================================================================
-- CORREÇÃO DEFINITIVA: safe_upsert com acesso ao auth.uid()
-- ============================================================================
-- PROBLEMA: Em funções SECURITY DEFINER, auth.uid() pode não estar disponível
--           se o search_path não incluir o schema 'auth'
-- SOLUÇÃO: Adicionar 'auth' ao search_path
-- ============================================================================

CREATE OR REPLACE FUNCTION public.safe_upsert_learning_progress(
  p_lesson_id UUID,
  p_progress_percentage INTEGER,
  p_completed_at TIMESTAMPTZ DEFAULT NULL,
  p_last_position_seconds INTEGER DEFAULT 0,
  p_video_progress JSONB DEFAULT '{}'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public, auth, pg_temp  -- ✅ CORRIGIDO: Adicionado 'auth' ao search_path
AS $$
DECLARE
  v_user_id UUID;
  v_timestamp TIMESTAMPTZ;
  v_existing_record RECORD;
  v_result jsonb;
BEGIN
  -- 1. Validar usuário autenticado
  v_user_id := auth.uid();
  
  RAISE LOG 'safe_upsert_learning_progress: user_id=%, lesson_id=%', v_user_id, p_lesson_id;
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuário não autenticado';
  END IF;
  
  -- 2. Validar que a aula existe
  IF NOT EXISTS (SELECT 1 FROM learning_lessons WHERE id = p_lesson_id) THEN
    RAISE EXCEPTION 'Aula não encontrada: %', p_lesson_id;
  END IF;
  
  v_timestamp := NOW();
  
  -- 3. Verificar se já existe registro
  SELECT * INTO v_existing_record
  FROM learning_progress
  WHERE lesson_id = p_lesson_id
    AND user_id = v_user_id;
  
  -- 4. UPSERT
  IF v_existing_record.id IS NOT NULL THEN
    -- UPDATE
    RAISE LOG 'safe_upsert: UPDATE registro existente id=%', v_existing_record.id;
    
    UPDATE learning_progress
    SET 
      progress_percentage = p_progress_percentage,
      completed_at = p_completed_at,
      last_position_seconds = p_last_position_seconds,
      video_progress = p_video_progress,
      updated_at = v_timestamp
    WHERE id = v_existing_record.id
    RETURNING jsonb_build_object(
      'id', id,
      'user_id', user_id,
      'lesson_id', lesson_id,
      'progress_percentage', progress_percentage,
      'started_at', started_at,
      'completed_at', completed_at,
      'last_position_seconds', last_position_seconds,
      'video_progress', video_progress,
      'created_at', created_at,
      'updated_at', updated_at,
      'operation', 'UPDATE'
    ) INTO v_result;
  ELSE
    -- INSERT
    RAISE LOG 'safe_upsert: INSERT novo registro';
    
    INSERT INTO learning_progress (
      user_id,
      lesson_id,
      progress_percentage,
      started_at,
      completed_at,
      last_position_seconds,
      video_progress,
      created_at,
      updated_at
    ) VALUES (
      v_user_id,
      p_lesson_id,
      p_progress_percentage,
      v_timestamp,
      p_completed_at,
      p_last_position_seconds,
      p_video_progress,
      v_timestamp,
      v_timestamp
    )
    RETURNING jsonb_build_object(
      'id', id,
      'user_id', user_id,
      'lesson_id', lesson_id,
      'progress_percentage', progress_percentage,
      'started_at', started_at,
      'completed_at', completed_at,
      'last_position_seconds', last_position_seconds,
      'video_progress', video_progress,
      'created_at', created_at,
      'updated_at', updated_at,
      'operation', 'INSERT'
    ) INTO v_result;
  END IF;
  
  RAISE LOG 'safe_upsert: SUCESSO - operation=%', v_result->>'operation';
  RETURN v_result;
END;
$$;

-- Garantir permissões
GRANT EXECUTE ON FUNCTION public.safe_upsert_learning_progress TO authenticated;

COMMENT ON FUNCTION public.safe_upsert_learning_progress IS 
'Função segura para criar ou atualizar progresso de aula. 
Bypassa RLS usando SECURITY DEFINER e valida permissões internamente.
CRÍTICO: search_path deve incluir "auth" para auth.uid() funcionar corretamente.';
