
-- Remover vídeos do YouTube da tabela solution_resources
DELETE FROM solution_resources 
WHERE type = 'video' 
AND format = 'YouTube';

-- Remover também possíveis vídeos do YouTube que tenham URLs do YouTube
DELETE FROM solution_resources 
WHERE type = 'video' 
AND (
  url LIKE '%youtube.com%' 
  OR url LIKE '%youtu.be%' 
  OR url LIKE '%youtube.com/embed/%'
);

-- Comentário: Esta migração remove especificamente apenas vídeos do YouTube
-- da tabela solution_resources, mantendo outros tipos de recursos intactos
