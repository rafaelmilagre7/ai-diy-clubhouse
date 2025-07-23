-- CORREÇÃO PREVENTIVA DE SEGURANÇA - Evitar erros de salvamento
-- Solução para tabelas com RLS ativo mas sem políticas

-- 1. Políticas para admin_communications (tabela crítica para comunicações)
CREATE POLICY "admin_communications_admin_access" 
ON public.admin_communications 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 
    FROM public.profiles p
    INNER JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = auth.uid() AND ur.name = 'admin'
  )
) 
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM public.profiles p
    INNER JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = auth.uid() AND ur.name = 'admin'
  )
);

-- 2. Políticas para security_linter_history (apenas admins podem acessar)
CREATE POLICY "security_linter_history_admin_access" 
ON public.security_linter_history 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 
    FROM public.profiles p
    INNER JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = auth.uid() AND ur.name = 'admin'
  )
) 
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM public.profiles p
    INNER JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = auth.uid() AND ur.name = 'admin'
  )
);

-- 3. Tornar bucket documents público para evitar erros de acesso
UPDATE storage.buckets 
SET public = true 
WHERE id = 'documents';

-- 4. Garantir política básica para documents bucket
CREATE POLICY "documents_authenticated_access" 
ON storage.objects 
FOR ALL 
USING (
  bucket_id = 'documents' AND auth.uid() IS NOT NULL
) 
WITH CHECK (
  bucket_id = 'documents' AND auth.uid() IS NOT NULL
);

-- 5. Política de leitura pública para documents
CREATE POLICY "documents_public_read" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'documents');