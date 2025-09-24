-- Limpeza de regras órfãs e duplicadas
-- Manter apenas as regras funcionais: "Convites Automáticos Hubla" e "Hubla Retry Logic"

-- Deletar todas as regras que não sejam as duas funcionais
DELETE FROM automation_rules 
WHERE name NOT IN ('Convites Automáticos Hubla', 'Hubla Retry Logic') 
OR name IS NULL 
OR name = '' 
OR (
  -- Deletar duplicatas mais antigas se existirem
  name IN ('Convites Automáticos Hubla', 'Hubla Retry Logic') 
  AND id NOT IN (
    SELECT id FROM (
      SELECT id, 
             ROW_NUMBER() OVER (PARTITION BY name ORDER BY created_at DESC) as rn
      FROM automation_rules 
      WHERE name IN ('Convites Automáticos Hubla', 'Hubla Retry Logic')
    ) ranked 
    WHERE rn = 1
  )
);