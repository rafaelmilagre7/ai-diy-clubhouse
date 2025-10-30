-- ============================================
-- CORREÇÃO DEFINITIVA: RLS + Foreign Key Validation
-- ============================================
-- Problema: Políticas com "TO authenticated" bloqueiam validação
-- de foreign key em contextos internos do Postgres
-- Solução: Usar "TO public" para permitir validação em qualquer contexto

-- 1. LEARNING_LESSONS: Permitir SELECT para todos
DROP POLICY IF EXISTS "learning_lessons_select_for_authenticated" ON learning_lessons;
DROP POLICY IF EXISTS "learning_lessons_authenticated_select" ON learning_lessons;

CREATE POLICY "learning_lessons_select_for_all" 
ON learning_lessons 
FOR SELECT 
TO public  -- Cobre 'authenticated' + 'anon' + validações internas
USING (true);

-- 2. LEARNING_MODULES: Permitir SELECT para todos
DROP POLICY IF EXISTS "learning_modules_select_for_authenticated" ON learning_modules;

CREATE POLICY "learning_modules_select_for_all" 
ON learning_modules 
FOR SELECT 
TO public 
USING (true);

-- 3. LEARNING_COURSES: Permitir SELECT para todos
DROP POLICY IF EXISTS "learning_courses_authenticated_view" ON learning_courses;
DROP POLICY IF EXISTS "learning_courses_select" ON learning_courses;

CREATE POLICY "learning_courses_select_for_all" 
ON learning_courses 
FOR SELECT 
TO public 
USING (true);

-- ✅ BENEFÍCIOS:
-- - Foreign key validation funciona em qualquer contexto
-- - UPDATE/INSERT em learning_progress funcionará corretamente
-- - Usuários autenticados e anônimos podem ver aulas
-- - Segurança mantida: INSERT/UPDATE/DELETE ainda restritos a admins