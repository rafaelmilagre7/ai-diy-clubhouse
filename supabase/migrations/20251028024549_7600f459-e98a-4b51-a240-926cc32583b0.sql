-- Adicionar coluna order_index na tabela solution_tools para ordenação das ferramentas
ALTER TABLE solution_tools 
ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;

-- Criar índice para melhorar performance de queries ordenadas
CREATE INDEX IF NOT EXISTS idx_solution_tools_order 
ON solution_tools(solution_id, order_index);