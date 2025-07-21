
-- Remover dados de FAQ dos recursos de soluções existentes
UPDATE solution_resources 
SET url = (
  CASE 
    WHEN url::jsonb ? 'faq' THEN 
      (url::jsonb - 'faq')::text
    ELSE url
  END
)
WHERE type = 'resources' 
AND url::jsonb ? 'faq';

-- Comentário: Esta migração remove apenas a propriedade 'faq' do JSON armazenado 
-- na coluna 'url' da tabela solution_resources, mantendo os outros dados intactos
