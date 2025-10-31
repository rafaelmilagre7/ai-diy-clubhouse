-- =====================================================
-- CORREÇÃO: Mass Assignment em profiles
-- Bloqueia modificação de campos sensíveis por usuários
-- =====================================================

-- 1. Remover política vulnerável
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;

-- 2. Criar política granular que permite apenas campos seguros
CREATE POLICY "profiles_update_safe_fields_only"
ON profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id
  AND id = (SELECT id FROM profiles WHERE id = auth.uid())
  AND email = (SELECT email FROM profiles WHERE id = auth.uid())
  AND COALESCE(role_id, '00000000-0000-0000-0000-000000000000'::uuid) = 
      COALESCE((SELECT role_id FROM profiles WHERE id = auth.uid()), '00000000-0000-0000-0000-000000000000'::uuid)
  AND COALESCE(organization_id, '00000000-0000-0000-0000-000000000000'::uuid) = 
      COALESCE((SELECT organization_id FROM profiles WHERE id = auth.uid()), '00000000-0000-0000-0000-000000000000'::uuid)
  AND COALESCE(is_master_user, false) = COALESCE((SELECT is_master_user FROM profiles WHERE id = auth.uid()), false)
  AND COALESCE(status, 'active') = COALESCE((SELECT status FROM profiles WHERE id = auth.uid()), 'active')
  AND COALESCE(onboarding_completed, false) = COALESCE((SELECT onboarding_completed FROM profiles WHERE id = auth.uid()), false)
);

-- 3. Criar função de auditoria para detectar tentativas de mass assignment
CREATE OR REPLACE FUNCTION audit_profile_update()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Detectar tentativas de alterar campos bloqueados
  IF (OLD.role_id IS DISTINCT FROM NEW.role_id) OR
     (OLD.organization_id IS DISTINCT FROM NEW.organization_id) OR
     (OLD.is_master_user IS DISTINCT FROM NEW.is_master_user) OR
     (OLD.status IS DISTINCT FROM NEW.status) OR
     (OLD.email IS DISTINCT FROM NEW.email) OR
     (OLD.onboarding_completed IS DISTINCT FROM NEW.onboarding_completed) THEN
    
    -- Logar tentativa suspeita
    INSERT INTO audit_logs (
      user_id,
      event_type,
      action,
      details,
      severity
    ) VALUES (
      auth.uid(),
      'security_violation',
      'attempted_mass_assignment',
      jsonb_build_object(
        'attempted_changes', jsonb_build_object(
          'role_id_changed', (OLD.role_id IS DISTINCT FROM NEW.role_id),
          'organization_id_changed', (OLD.organization_id IS DISTINCT FROM NEW.organization_id),
          'is_master_user_changed', (OLD.is_master_user IS DISTINCT FROM NEW.is_master_user),
          'status_changed', (OLD.status IS DISTINCT FROM NEW.status),
          'email_changed', (OLD.email IS DISTINCT FROM NEW.email),
          'onboarding_completed_changed', (OLD.onboarding_completed IS DISTINCT FROM NEW.onboarding_completed)
        ),
        'target_user_id', OLD.id,
        'timestamp', now()
      ),
      'critical'
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- 4. Criar trigger para auditoria
DROP TRIGGER IF EXISTS trigger_audit_profile_update ON profiles;
CREATE TRIGGER trigger_audit_profile_update
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION audit_profile_update();

-- Comentários para documentação
COMMENT ON POLICY "profiles_update_safe_fields_only" ON profiles IS 
'Permite usuários editarem apenas campos seguros de seu próprio perfil. Campos como role_id, organization_id, is_master_user, status e onboarding_completed são bloqueados para prevenir Mass Assignment.';

COMMENT ON FUNCTION audit_profile_update() IS
'Detecta e loga tentativas de modificar campos sensíveis em profiles via Mass Assignment.';