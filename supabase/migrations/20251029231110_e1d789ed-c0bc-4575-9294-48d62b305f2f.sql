-- ============================================================================
-- CORREÇÃO DAS POLÍTICAS RLS DE learning_lessons
-- ============================================================================
-- Fix para erro: 42P01: relation "learning_lessons" does not exist
-- Causa: Política RLS com subquery circular/complexa
-- ============================================================================

-- 1. DROPAR as políticas problemáticas
DROP POLICY IF EXISTS "learning_lessons_authenticated_access" ON public.learning_lessons;
DROP POLICY IF EXISTS "learning_lessons_fk_check" ON public.learning_lessons;

-- 2. CRIAR política simples e eficiente para authenticated
-- Esta política permite:
-- - Admins: veem tudo
-- - Usuários autenticados: veem apenas aulas PUBLICADAS
CREATE POLICY "learning_lessons_read_access"
ON public.learning_lessons
FOR SELECT
TO authenticated
USING (
  -- Admin vê tudo
  is_user_admin_secure(auth.uid()) 
  OR 
  -- Usuários autenticados veem apenas aulas publicadas
  (published = true AND can_access_learning_content(auth.uid()))
);

-- 3. RECRIAR política para learning_progress (garantir que está correta)
DROP POLICY IF EXISTS "learning_progress_owner_secure" ON public.learning_progress;

CREATE POLICY "learning_progress_owner_secure"
ON public.learning_progress
FOR ALL
TO authenticated
USING (
  auth.uid() IS NOT NULL 
  AND (
    user_id = auth.uid() 
    OR is_user_admin_secure(auth.uid())
  )
)
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND (
    user_id = auth.uid() 
    OR is_user_admin_secure(auth.uid())
  )
);

-- 4. Adicionar comentários para documentação
COMMENT ON POLICY "learning_lessons_read_access" ON public.learning_lessons IS 
  'Permite admins verem todas as aulas e usuários autenticados verem apenas aulas publicadas';

COMMENT ON POLICY "learning_progress_owner_secure" ON public.learning_progress IS 
  'Permite usuários gerenciarem apenas seu próprio progresso, admins podem ver/editar tudo';

-- 5. Forçar reload do PostgREST
NOTIFY pgrst, 'reload schema';
SELECT pg_notify('pgrst', 'reload schema');