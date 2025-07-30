-- Usar função segura para alterar roles dos usuários sem role
-- Esses usuários devem ser membros do club

SELECT secure_change_user_role(
  p.id, 
  (SELECT id FROM user_roles WHERE name = 'membro_club' LIMIT 1)
) as result
FROM profiles p 
WHERE p.role_id IS NULL 
  AND p.email LIKE '%@tuamaeaquelaursa.com';