-- ============================================
-- CORREÇÃO: Remover Recursão Infinita em RLS
-- ============================================

-- Passo 1: Dropar política problemática que causa recursão infinita
DROP POLICY IF EXISTS "unified_select_authenticated" ON unified_checklists;

-- Passo 2: Criar política SELECT segura sem subconsultas recursivas
CREATE POLICY "unified_select_safe" ON unified_checklists
FOR SELECT
TO authenticated
USING (
  auth.uid() IS NOT NULL 
  AND (
    user_id = auth.uid()  -- Usuário pode ver seus próprios checklists
    OR 
    is_template = true     -- Templates públicos são visíveis para todos
    OR
    EXISTS (               -- Admins podem ver tudo
      SELECT 1 
      FROM profiles p
      JOIN user_roles ur ON p.role_id = ur.id
      WHERE p.id = auth.uid() 
      AND ur.name = 'admin'
    )
  )
);

-- Comentário explicativo:
-- Esta política NÃO faz subconsulta na própria tabela unified_checklists,
-- evitando a recursão infinita que estava bloqueando SELECT e INSERT.