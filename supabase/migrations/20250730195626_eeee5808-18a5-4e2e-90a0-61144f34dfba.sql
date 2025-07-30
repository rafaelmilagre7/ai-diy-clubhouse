-- Corrigir usuários sem role atribuído
-- Usuários convidados devem ter role membro_club por padrão

UPDATE profiles 
SET role_id = (SELECT id FROM user_roles WHERE name = 'membro_club' LIMIT 1)
WHERE role_id IS NULL 
  AND email LIKE '%@tuamaeaquelaursa.com';