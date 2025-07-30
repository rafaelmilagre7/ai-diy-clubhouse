-- Adicionar política para permitir que usuários do club vejam templates de checklist
CREATE POLICY "Club members can view checklist templates" 
ON unified_checklists 
FOR SELECT 
TO authenticated 
USING (
  is_template = true 
  AND (
    get_user_role_secure(auth.uid()) IN ('admin', 'membro_club', 'formacao')
    OR can_access_learning_content(auth.uid()) = true
  )
);