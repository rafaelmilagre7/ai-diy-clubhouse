-- ============================================
-- Etapa 2: Corrigir dados históricos
-- ============================================

-- Atualizar flag is_master_user para usuários com papéis master
UPDATE profiles
SET is_master_user = true
WHERE role_id IN (
  SELECT id 
  FROM user_roles 
  WHERE name IN ('master_user', 'membro_club')
)
AND is_master_user = false;

-- ============================================
-- Etapa 3: Criar trigger para sincronização automática
-- ============================================

-- Função para sincronizar is_master_user automaticamente
CREATE OR REPLACE FUNCTION sync_is_master_user()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Atualizar flag baseado no papel
  NEW.is_master_user := EXISTS (
    SELECT 1 
    FROM user_roles 
    WHERE id = NEW.role_id 
    AND name IN ('master_user', 'membro_club')
  );
  
  RETURN NEW;
END;
$$;

-- Trigger para INSERT
DROP TRIGGER IF EXISTS trigger_sync_is_master_user_insert ON profiles;
CREATE TRIGGER trigger_sync_is_master_user_insert
BEFORE INSERT ON profiles
FOR EACH ROW
EXECUTE FUNCTION sync_is_master_user();

-- Trigger para UPDATE (quando role_id mudar)
DROP TRIGGER IF EXISTS trigger_sync_is_master_user_update ON profiles;
CREATE TRIGGER trigger_sync_is_master_user_update
BEFORE UPDATE OF role_id ON profiles
FOR EACH ROW
WHEN (OLD.role_id IS DISTINCT FROM NEW.role_id)
EXECUTE FUNCTION sync_is_master_user();