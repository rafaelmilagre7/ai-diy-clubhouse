-- FASE 2.1 CORRIGIDA: Proteger tabela de backup de networking
-- Apenas administradores podem acessar backups

ALTER TABLE public.networking_opportunities_backup ENABLE ROW LEVEL SECURITY;

-- Política: Só admins podem acessar backups (usando role_id correto)
CREATE POLICY "backup_admin_only" 
ON public.networking_opportunities_backup
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
  -- Ou se o email for @viverdeia.ai
  EXISTS (
    SELECT 1 
    FROM public.profiles p
    WHERE p.id = auth.uid()
    AND p.email LIKE '%@viverdeia.ai'
  )
);

COMMENT ON TABLE public.networking_opportunities_backup IS 
'Tabela de backup protegida - acesso restrito a administradores';
