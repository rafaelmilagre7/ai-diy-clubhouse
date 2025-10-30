
-- Habilitar RLS na tabela de backup por precaução
ALTER TABLE _rls_policies_backup_20251029 ENABLE ROW LEVEL SECURITY;

-- Política para permitir apenas admins acessarem
CREATE POLICY "_rls_backup_admin_only"
ON _rls_policies_backup_20251029
FOR ALL
TO authenticated
USING (is_user_admin_secure(auth.uid()));

COMMENT ON TABLE _rls_policies_backup_20251029 IS 
'Backup table for RLS policies - Admin access only';
