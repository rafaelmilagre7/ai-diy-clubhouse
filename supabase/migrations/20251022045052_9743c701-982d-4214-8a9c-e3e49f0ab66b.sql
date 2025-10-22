-- FASE 2.2 SIMPLIFICADA: Proteger templates de certificados
-- Usuários autenticados podem visualizar, apenas admins modificam

ALTER TABLE public.learning_certificate_templates ENABLE ROW LEVEL SECURITY;

-- Política: Usuários autenticados podem ver templates ativos
CREATE POLICY "templates_view_authenticated" 
ON public.learning_certificate_templates
FOR SELECT
USING (
  auth.uid() IS NOT NULL 
  AND is_active = true
);

-- Política: Só admins podem modificar templates
CREATE POLICY "templates_admin_full_access" 
ON public.learning_certificate_templates
FOR ALL
USING (
  EXISTS (
    SELECT 1 
    FROM public.profiles p
    INNER JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = auth.uid()
    AND ur.name = 'admin'
  )
  OR
  EXISTS (
    SELECT 1 
    FROM public.profiles p
    WHERE p.id = auth.uid()
    AND p.email LIKE '%@viverdeia.ai'
  )
);

COMMENT ON TABLE public.learning_certificate_templates IS 
'Templates de certificados - visualização para autenticados, modificação apenas admins';
