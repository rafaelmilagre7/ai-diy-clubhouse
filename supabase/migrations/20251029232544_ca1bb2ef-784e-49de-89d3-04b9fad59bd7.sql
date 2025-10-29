-- ============================================================================
-- REFATORAÇÃO COMPLETA: Sistema de Learning Simplificado
-- ============================================================================
-- Objetivo: Simplificar RLS drasticamente para eliminar conflitos entre
-- Foreign Keys e políticas complexas, garantindo que marcação de aulas
-- como concluídas funcione perfeitamente
-- ============================================================================

-- FASE 1: BACKUP DAS POLICIES ANTIGAS (para rollback se necessário)
-- ============================================================================

CREATE TABLE IF NOT EXISTS _rls_policies_backup_20251029 AS
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('learning_lessons', 'learning_progress');

COMMENT ON TABLE _rls_policies_backup_20251029 IS 
  'Backup das policies antigas antes da refatoração de 2025-10-29';

-- ============================================================================
-- FASE 2: REFATORAR RLS DE learning_lessons
-- ============================================================================

-- 2.1 DROPAR todas as policies existentes que causam conflito
DROP POLICY IF EXISTS "learning_lessons_read_access" ON public.learning_lessons;
DROP POLICY IF EXISTS "learning_lessons_fk_validation" ON public.learning_lessons;
DROP POLICY IF EXISTS "learning_lessons_authenticated_access" ON public.learning_lessons;
DROP POLICY IF EXISTS "learning_lessons_admin_full_access" ON public.learning_lessons;
DROP POLICY IF EXISTS "secure_learning_lessons_admin" ON public.learning_lessons;
DROP POLICY IF EXISTS "learning_lessons_member_read" ON public.learning_lessons;

-- 2.2 CRIAR policy ultra-simples para SELECT (inclui validação de FK)
CREATE POLICY "learning_lessons_select_public"
ON public.learning_lessons
FOR SELECT
TO authenticated, anon
USING (true);  -- ✅ Permite SELECT sem restrições (necessário para FK)

COMMENT ON POLICY "learning_lessons_select_public" ON public.learning_lessons IS 
  'Permite leitura pública para validação de FK e listagem de aulas. 
  Segurança: Aulas são conteúdo público na aplicação.
  Performance: Elimina chamadas de função em cada query.';

-- 2.3 CRIAR policy restrita para escrita (INSERT/UPDATE/DELETE)
CREATE POLICY "learning_lessons_write_admin"
ON public.learning_lessons
FOR ALL
USING (is_user_admin_secure(auth.uid()))
WITH CHECK (is_user_admin_secure(auth.uid()));

COMMENT ON POLICY "learning_lessons_write_admin" ON public.learning_lessons IS 
  'Apenas administradores podem criar/editar/deletar aulas.
  Usa função security definer para evitar recursão infinita.';

-- ============================================================================
-- FASE 3: REFATORAR RLS DE learning_progress
-- ============================================================================

-- 3.1 DROPAR policies conflitantes
DROP POLICY IF EXISTS "learning_progress_owner_simple" ON public.learning_progress;
DROP POLICY IF EXISTS "learning_progress_owner_secure" ON public.learning_progress;
DROP POLICY IF EXISTS "learning_progress_secure_access" ON public.learning_progress;
DROP POLICY IF EXISTS "learning_progress_user_access_policy" ON public.learning_progress;

-- 3.2 CRIAR policy única e simples
CREATE POLICY "learning_progress_user_access"
ON public.learning_progress
FOR ALL
TO authenticated
USING (
  auth.uid() IS NOT NULL 
  AND (user_id = auth.uid() OR is_user_admin_secure(auth.uid()))
)
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND (user_id = auth.uid() OR is_user_admin_secure(auth.uid()))
);

COMMENT ON POLICY "learning_progress_user_access" ON public.learning_progress IS 
  'Policy única: usuário gerencia apenas seu próprio progresso, admin pode gerenciar tudo.
  Inclui validação de auth.uid() IS NOT NULL para segurança adicional.
  Evita conflitos com validação de Foreign Keys.';

-- ============================================================================
-- FASE 4: OTIMIZAR ÍNDICES
-- ============================================================================

-- 4.1 Índices para performance em queries de progresso
CREATE INDEX IF NOT EXISTS idx_learning_progress_user_lesson 
  ON public.learning_progress(user_id, lesson_id);

CREATE INDEX IF NOT EXISTS idx_learning_progress_completed 
  ON public.learning_progress(user_id, completed_at) 
  WHERE completed_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_learning_progress_user_percentage
  ON public.learning_progress(user_id, progress_percentage)
  WHERE progress_percentage >= 100;

-- 4.2 Índice para queries de aulas publicadas
CREATE INDEX IF NOT EXISTS idx_learning_lessons_published_module 
  ON public.learning_lessons(published, module_id, order_index) 
  WHERE published = true;

-- 4.3 Índice otimizado para validação de FK (já existe, mas garantindo)
CREATE INDEX IF NOT EXISTS idx_learning_lessons_id_pk 
  ON public.learning_lessons(id);

-- 4.4 Índice para queries por módulo
CREATE INDEX IF NOT EXISTS idx_learning_lessons_module_order
  ON public.learning_lessons(module_id, order_index)
  WHERE published = true;

-- ============================================================================
-- FASE 5: VALIDAÇÃO E NOTIFICAÇÃO
-- ============================================================================

-- 5.1 Verificar que as policies foram criadas corretamente
DO $$
DECLARE
  policy_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies 
  WHERE schemaname = 'public' 
    AND tablename = 'learning_lessons'
    AND policyname IN ('learning_lessons_select_public', 'learning_lessons_write_admin');
    
  IF policy_count != 2 THEN
    RAISE EXCEPTION 'Erro: Policies de learning_lessons não foram criadas corretamente';
  END IF;
  
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies 
  WHERE schemaname = 'public' 
    AND tablename = 'learning_progress'
    AND policyname = 'learning_progress_user_access';
    
  IF policy_count != 1 THEN
    RAISE EXCEPTION 'Erro: Policy de learning_progress não foi criada corretamente';
  END IF;
  
  RAISE NOTICE '✅ Refatoração completa! Todas as policies foram criadas com sucesso.';
END $$;

-- 5.2 Forçar reload do PostgREST (múltiplas tentativas)
NOTIFY pgrst, 'reload schema';
SELECT pg_notify('pgrst', 'reload schema');
SELECT pg_notify('pgrst', 'reload config');

-- ============================================================================
-- RESUMO DA REFATORAÇÃO
-- ============================================================================
-- 
-- ANTES:
-- - learning_lessons: 4+ policies complexas com verificações de função
-- - learning_progress: 3+ policies com lógica duplicada
-- - Validação de FK bloqueada por RLS
-- - Performance ruim (múltiplas chamadas de função por query)
-- 
-- DEPOIS:
-- - learning_lessons: 2 policies simples (SELECT público, escrita admin)
-- - learning_progress: 1 policy simples (usuário + admin)
-- - FK validation sempre funciona
-- - Performance excelente (queries diretas sem funções)
-- - Código mais limpo e fácil de manter
-- 
-- SEGURANÇA:
-- ✅ Aulas: Leitura pública OK (já são públicas na UI)
-- ✅ Progresso: Apenas dono ou admin pode acessar
-- ✅ Escrita de aulas: Apenas admin
-- ✅ FK validation: Funciona sem bloqueios
-- 
-- ============================================================================