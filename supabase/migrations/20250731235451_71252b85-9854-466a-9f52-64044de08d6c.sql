-- Remover categorias duplicadas de "Funcionalidade"
-- Primeiro, identificar quantas sugestões usam cada categoria duplicada
-- Depois, mover todas para uma categoria principal e deletar as duplicadas

-- 1. Atualizar sugestões que usam as categorias duplicadas para usar a categoria principal
UPDATE suggestions 
SET category_id = '327d2090-e54b-4906-849d-3b709b3cf865' 
WHERE category_id IN (
  '1072b2aa-1fba-4a96-894d-2c4b04ca98d4',  -- Funcionalidade duplicada
  'aaf30284-742f-4aaf-b461-5fbc3d3699d8'   -- Funcionalidades
);

-- 2. Deletar as categorias duplicadas
DELETE FROM suggestion_categories 
WHERE id IN (
  '1072b2aa-1fba-4a96-894d-2c4b04ca98d4',  -- Funcionalidade duplicada
  'aaf30284-742f-4aaf-b461-5fbc3d3699d8'   -- Funcionalidades
);