-- ============================================================================
-- REFATORAÇÃO: Sistema simplificado de conclusão de aulas
-- ============================================================================
-- OBJETIVO: Substituir safe_upsert_learning_progress por versão atômica
-- VANTAGENS:
--   - 1 query em vez de 3+ (muito mais rápido)
--   - Operação atômica (sem race conditions)
--   - Código limpo e manutenível
--   - Usa UNIQUE constraint existente em (user_id, lesson_id)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.complete_lesson_v2(
  p_lesson_id UUID,
  p_progress_percentage INTEGER DEFAULT 100,
  p_completed_at TIMESTAMPTZ DEFAULT NOW()
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public, auth, pg_temp
AS $$
DECLARE
  v_user_id UUID;
  v_result JSONB;
BEGIN
  -- Validar usuário autenticado
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuário não autenticado';
  END IF;
  
  -- UPSERT atômico usando UNIQUE constraint (user_id, lesson_id)
  INSERT INTO public.learning_progress (
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
    NOW(),
    p_completed_at,
    0,
    '{}'::jsonb,
    NOW(),
    NOW()
  )
  ON CONFLICT (user_id, lesson_id) 
  DO UPDATE SET
    progress_percentage = EXCLUDED.progress_percentage,
    completed_at = EXCLUDED.completed_at,
    updated_at = NOW()
  RETURNING jsonb_build_object(
    'id', id,
    'user_id', user_id,
    'lesson_id', lesson_id,
    'progress_percentage', progress_percentage,
    'started_at', started_at,
    'completed_at', completed_at,
    'created_at', created_at,
    'updated_at', updated_at
  ) INTO v_result;
  
  -- Log da ação para auditoria
  RAISE LOG 'complete_lesson_v2: user=%, lesson=%, progress=%', v_user_id, p_lesson_id, p_progress_percentage;
  
  RETURN v_result;
END;
$$;

-- Garantir permissões
GRANT EXECUTE ON FUNCTION public.complete_lesson_v2 TO authenticated;

COMMENT ON FUNCTION public.complete_lesson_v2 IS 
'Função simplificada para marcar aula como concluída.
Usa INSERT ON CONFLICT para operação atômica (thread-safe).
Muito mais rápida e confiável que a versão anterior.';