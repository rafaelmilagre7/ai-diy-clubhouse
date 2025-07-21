
-- Remover vídeos do YouTube e Upload de vídeo da tabela solution_resources
-- Manter apenas vídeos do Panda Video
DELETE FROM solution_resources 
WHERE type = 'video' 
AND (
  format = 'YouTube' 
  OR format = 'MP4'
  OR url LIKE '%youtube.com%' 
  OR url LIKE '%youtu.be%' 
  OR url LIKE '%youtube.com/embed/%'
  OR metadata::text LIKE '%"source":"upload"%'
  OR metadata::text LIKE '%"type":"youtube"%'
  OR metadata::text LIKE '%"type":"video"%'
);

-- Limpar também possíveis registros órfãos de vídeos não-Panda
DELETE FROM solution_resources 
WHERE type = 'video' 
AND (
  metadata IS NULL 
  OR NOT (metadata::text LIKE '%"source":"panda"%' OR metadata::text LIKE '%"type":"panda"%')
)
AND format != 'Panda Video';

-- Comentário: Esta migração remove todos os vídeos que não sejam do Panda Video
-- da tabela solution_resources, limpando YouTube, uploads e outros tipos
