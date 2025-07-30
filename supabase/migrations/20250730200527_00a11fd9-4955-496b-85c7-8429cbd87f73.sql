-- Temporariamente desabilitar o trigger de escalação de privilégios
DROP TRIGGER IF EXISTS prevent_privilege_escalation ON profiles;

-- Corrigir usuários sem role_id definindo como membro_club
UPDATE profiles 
SET role_id = (SELECT id FROM user_roles WHERE name = 'membro_club' LIMIT 1),
    updated_at = now()
WHERE role_id IS NULL 
  AND email LIKE '%@tuamaeaquelaursa.com';

-- Recriar o trigger de segurança
CREATE TRIGGER prevent_privilege_escalation
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION detect_privilege_escalation();