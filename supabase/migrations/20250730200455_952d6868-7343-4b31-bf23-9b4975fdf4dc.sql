-- Corrigir usuários sem role_id definindo como membro_club
UPDATE profiles 
SET role_id = (SELECT id FROM user_roles WHERE name = 'membro_club' LIMIT 1),
    updated_at = now()
WHERE role_id IS NULL 
  AND email LIKE '%@tuamaeaquelaursa.com';