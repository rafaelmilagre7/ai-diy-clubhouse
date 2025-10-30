-- ============================================
-- CORREÇÃO: Habilitar RLS em learning_lessons
-- ============================================
-- Isso resolve o erro 404 "relation learning_lessons does not exist"
-- que ocorre quando learning_progress tenta fazer PATCH

-- 1. Habilitar RLS na tabela learning_lessons
ALTER TABLE learning_lessons ENABLE ROW LEVEL SECURITY;

-- 2. Criar política de SELECT para usuários autenticados
-- Permite que usuários vejam aulas publicadas
CREATE POLICY "learning_lessons_authenticated_select" 
ON learning_lessons 
FOR SELECT 
TO authenticated
USING (published = true OR published IS NULL);

-- 3. Criar política de SELECT para admins (todas as aulas)
CREATE POLICY "learning_lessons_admin_select_all" 
ON learning_lessons 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    JOIN user_roles ur ON p.role_id = ur.id
    WHERE p.id = auth.uid() 
      AND ur.name = 'admin'
  )
);

-- 4. Criar política de INSERT/UPDATE/DELETE para admins
CREATE POLICY "learning_lessons_admin_manage" 
ON learning_lessons 
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    JOIN user_roles ur ON p.role_id = ur.id
    WHERE p.id = auth.uid() 
      AND ur.name = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles p
    JOIN user_roles ur ON p.role_id = ur.id
    WHERE p.id = auth.uid() 
      AND ur.name = 'admin'
  )
);

-- 5. Verificar e habilitar RLS em learning_modules se necessário
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
      AND tablename = 'learning_modules' 
      AND rowsecurity = true
  ) THEN
    ALTER TABLE learning_modules ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "learning_modules_authenticated_select" 
    ON learning_modules 
    FOR SELECT 
    TO authenticated
    USING (true);
    
    CREATE POLICY "learning_modules_admin_manage" 
    ON learning_modules 
    FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM profiles p
        JOIN user_roles ur ON p.role_id = ur.id
        WHERE p.id = auth.uid() 
          AND ur.name = 'admin'
      )
    );
  END IF;
END $$;

-- 6. Verificar e habilitar RLS em learning_courses se necessário
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
      AND tablename = 'learning_courses' 
      AND rowsecurity = true
  ) THEN
    ALTER TABLE learning_courses ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "learning_courses_authenticated_select" 
    ON learning_courses 
    FOR SELECT 
    TO authenticated
    USING (true);
    
    CREATE POLICY "learning_courses_admin_manage" 
    ON learning_courses 
    FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM profiles p
        JOIN user_roles ur ON p.role_id = ur.id
        WHERE p.id = auth.uid() 
          AND ur.name = 'admin'
      )
    );
  END IF;
END $$;