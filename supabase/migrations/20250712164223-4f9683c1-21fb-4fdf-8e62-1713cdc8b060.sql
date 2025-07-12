-- Remover a view placeholder
DROP VIEW IF EXISTS suggestions_with_profiles;

-- Criar a view correta para sugestões com perfis
CREATE VIEW suggestions_with_profiles AS
SELECT 
  s.*,
  p.name as user_name,
  p.avatar_url as user_avatar
FROM suggestions s
LEFT JOIN profiles p ON s.user_id = p.id;