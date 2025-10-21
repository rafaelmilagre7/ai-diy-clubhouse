-- Proteção dos Templates de Certificado
-- Remove acesso público e permite apenas usuários autenticados

-- 1. Remover política antiga que permitia acesso sem autenticação
DROP POLICY IF EXISTS "Users can view active learning certificate templates" ON learning_certificate_templates;

-- 2. Nova política: apenas usuários logados podem ver templates ativos
CREATE POLICY "authenticated_users_view_active_templates" 
ON learning_certificate_templates 
FOR SELECT 
USING (
  auth.role() = 'authenticated' AND is_active = true
);

-- 3. Garantir que a política de admins continue funcionando
-- (já existe: "Admins can manage learning certificate templates")

COMMENT ON POLICY "authenticated_users_view_active_templates" ON learning_certificate_templates IS 
'Permite que usuários autenticados vejam templates ativos. Certificados individuais continuam públicos via storage bucket.';