-- ============================================
-- CORREÇÃO DE RLS E PERMISSÕES - LEARNING
-- ============================================
-- Corrige problemas de segurança que impediam 
-- a função complete_lesson_v2 de funcionar

-- 1. Garantir RLS habilitado em todas as tabelas de learning
ALTER TABLE learning_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_progress ENABLE ROW LEVEL SECURITY;

-- 2. Criar políticas para learning_lessons (leitura pública, escrita apenas admin)
DROP POLICY IF EXISTS "learning_lessons_select" ON learning_lessons;
CREATE POLICY "learning_lessons_select" ON learning_lessons
  FOR SELECT 
  TO authenticated
  USING (true);

-- 3. Criar políticas para learning_modules (leitura pública, escrita apenas admin)
DROP POLICY IF EXISTS "learning_modules_select" ON learning_modules;
CREATE POLICY "learning_modules_select" ON learning_modules
  FOR SELECT 
  TO authenticated
  USING (true);

-- 4. Criar políticas para learning_courses (leitura pública, escrita apenas admin)
DROP POLICY IF EXISTS "learning_courses_select" ON learning_courses;
CREATE POLICY "learning_courses_select" ON learning_courses
  FOR SELECT 
  TO authenticated
  USING (true);

-- 5. Garantir que learning_progress permite operações do próprio usuário
DROP POLICY IF EXISTS "learning_progress_select" ON learning_progress;
CREATE POLICY "learning_progress_select" ON learning_progress
  FOR SELECT 
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "learning_progress_insert" ON learning_progress;
CREATE POLICY "learning_progress_insert" ON learning_progress
  FOR INSERT 
  TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "learning_progress_update" ON learning_progress;
CREATE POLICY "learning_progress_update" ON learning_progress
  FOR UPDATE 
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 6. Adicionar permissões explícitas para usuários autenticados
GRANT SELECT ON learning_lessons TO authenticated;
GRANT SELECT ON learning_modules TO authenticated;
GRANT SELECT ON learning_courses TO authenticated;
GRANT SELECT, INSERT, UPDATE ON learning_progress TO authenticated;

-- 7. Garantir que a função complete_lesson_v2 está corretamente configurada
-- (A função já existe e tem SECURITY DEFINER + search_path, apenas garantindo que está ok)
CREATE OR REPLACE FUNCTION public.complete_lesson_v2(
  p_lesson_id uuid,
  p_progress_percentage integer DEFAULT 100
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_progress_id uuid;
  v_existing_progress record;
BEGIN
  -- Pegar usuário autenticado
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Usuário não autenticado'
    );
  END IF;

  -- Verificar se já existe progresso para esta aula
  SELECT * INTO v_existing_progress
  FROM learning_progress
  WHERE user_id = v_user_id AND lesson_id = p_lesson_id;

  IF v_existing_progress.id IS NOT NULL THEN
    -- Atualizar progresso existente
    UPDATE learning_progress
    SET 
      progress_percentage = p_progress_percentage,
      completed_at = CASE 
        WHEN p_progress_percentage >= 100 THEN COALESCE(completed_at, now())
        ELSE completed_at
      END,
      last_accessed_at = now()
    WHERE id = v_existing_progress.id
    RETURNING id INTO v_progress_id;
  ELSE
    -- Criar novo progresso
    INSERT INTO learning_progress (user_id, lesson_id, progress_percentage, last_accessed_at, completed_at)
    VALUES (
      v_user_id,
      p_lesson_id,
      p_progress_percentage,
      now(),
      CASE WHEN p_progress_percentage >= 100 THEN now() ELSE NULL END
    )
    RETURNING id INTO v_progress_id;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'progress_id', v_progress_id,
    'message', 'Aula concluída com sucesso'
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;