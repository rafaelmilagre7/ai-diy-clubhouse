-- =====================================================
-- BACKUP E LIMPEZA MASTER/MEMBROS (CORRIGIDO)
-- =====================================================

-- 1. Criar tabela de backup
CREATE TABLE IF NOT EXISTS master_member_backup (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  backup_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  profiles_backup JSONB NOT NULL,
  organizations_backup JSONB NOT NULL,
  sync_log_backup JSONB NOT NULL,
  backup_reason TEXT NOT NULL DEFAULT 'pre_correction'
);

-- 2. Fazer backup dos dados atuais
INSERT INTO master_member_backup (
  profiles_backup,
  organizations_backup,
  sync_log_backup,
  backup_reason
)
SELECT 
  COALESCE(jsonb_agg(DISTINCT p.*) FILTER (WHERE p.id IS NOT NULL), '[]'::jsonb) as profiles_backup,
  COALESCE(jsonb_agg(DISTINCT o.*) FILTER (WHERE o.id IS NOT NULL), '[]'::jsonb) as organizations_backup,
  COALESCE(jsonb_agg(DISTINCT s.*) FILTER (WHERE s.id IS NOT NULL), '[]'::jsonb) as sync_log_backup,
  'pre_full_correction' as backup_reason
FROM profiles p
FULL OUTER JOIN organizations o ON p.organization_id = o.id
FULL OUTER JOIN master_member_sync_log s ON s.master_email = p.email;

-- 3. Limpar associações incorretas
UPDATE profiles 
SET organization_id = NULL, updated_at = NOW()
WHERE organization_id IS NOT NULL
AND is_master_user = FALSE
AND id IN (
  SELECT p.id 
  FROM profiles p
  JOIN organizations o ON p.organization_id = o.id
  WHERE o.master_user_id != p.id
);

-- 4. Limpar flags incorretos de master
UPDATE profiles
SET is_master_user = FALSE, updated_at = NOW()
WHERE is_master_user = TRUE
AND id NOT IN (
  SELECT master_user_id 
  FROM organizations 
  WHERE master_user_id IS NOT NULL
);

-- 5. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_profiles_master_user ON profiles(is_master_user) WHERE is_master_user = TRUE;
CREATE INDEX IF NOT EXISTS idx_profiles_organization_id ON profiles(organization_id) WHERE organization_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_organizations_master_user_id ON organizations(master_user_id);
CREATE INDEX IF NOT EXISTS idx_sync_log_master_email ON master_member_sync_log(master_email);
CREATE INDEX IF NOT EXISTS idx_sync_log_operation ON master_member_sync_log(operation);

-- 6. Adicionar RLS para backup
ALTER TABLE master_member_backup ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view backups"
ON master_member_backup
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    INNER JOIN user_roles ur ON p.role_id = ur.id
    WHERE p.id = auth.uid() AND ur.name = 'admin'
  )
);