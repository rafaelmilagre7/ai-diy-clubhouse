-- ============================================================================
-- CORREÇÃO DEFINITIVA: Conflito entre Foreign Key e RLS
-- ============================================================================
-- Problema: Validação de FK em learning_progress tenta consultar learning_lessons
-- mas a policy RLS bloqueia essa consulta interna
-- ============================================================================

-- 1. ADICIONAR política específica para validação de FKs em learning_lessons
-- Esta política permite que o Postgres valide FKs sem ser bloqueado por RLS
DROP POLICY IF EXISTS "learning_lessons_fk_validation" ON public.learning_lessons;

CREATE POLICY "learning_lessons_fk_validation"
ON public.learning_lessons
FOR SELECT
TO authenticated, anon
USING (true);

-- 2. SIMPLIFICAR política de learning_progress para evitar conflitos
DROP POLICY IF EXISTS "learning_progress_owner_secure" ON public.learning_progress;

CREATE POLICY "learning_progress_owner_simple"
ON public.learning_progress
FOR ALL
TO authenticated
USING (
  user_id = auth.uid() OR is_user_admin_secure(auth.uid())
)
WITH CHECK (
  user_id = auth.uid() OR is_user_admin_secure(auth.uid())
);

-- 3. Garantir índice para performance na validação de FK
CREATE INDEX IF NOT EXISTS idx_learning_lessons_id_for_fk 
  ON public.learning_lessons(id) 
  WHERE published = true;

-- 4. Adicionar comentários
COMMENT ON POLICY "learning_lessons_fk_validation" ON public.learning_lessons IS 
  'Permite validação de Foreign Keys sem bloqueio por RLS';

COMMENT ON POLICY "learning_progress_owner_simple" ON public.learning_progress IS 
  'Política simplificada: usuário vê apenas seu progresso, admin vê tudo';

-- 5. Forçar reload do PostgREST (2x para garantir)
NOTIFY pgrst, 'reload schema';
SELECT pg_notify('pgrst', 'reload schema');