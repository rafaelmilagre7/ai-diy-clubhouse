-- Limpeza final: remover possíveis referências órfãs de vídeos não-Panda
-- que possam ter restado na tabela solution_resources

-- Verificar e remover qualquer vídeo que não seja do Panda Video
DELETE FROM solution_resources 
WHERE type = 'video' 
AND (
  metadata IS NULL 
  OR (
    metadata::text NOT LIKE '%"provider":"panda"%' 
    AND metadata::text NOT LIKE '%"type":"panda"%'
    AND NOT url LIKE '%pandavideo%'
  )
);

-- Comentário: Esta migração final garante que apenas vídeos do Panda Video
-- permaneçam na tabela solution_resources, removendo qualquer resíduo
-- de YouTube ou upload de vídeo que possa ter escapado da primeira limpeza