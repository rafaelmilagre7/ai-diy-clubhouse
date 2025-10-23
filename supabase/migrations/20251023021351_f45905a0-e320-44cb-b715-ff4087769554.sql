-- Adicionar campo is_complete para controlar carregamento em duas etapas
ALTER TABLE ai_generated_solutions 
ADD COLUMN IF NOT EXISTS is_complete BOOLEAN DEFAULT false;

-- Atualizar soluções antigas como completas
UPDATE ai_generated_solutions 
SET is_complete = true 
WHERE is_complete IS NULL OR (
  implementation_checklist IS NOT NULL 
  AND required_tools IS NOT NULL 
  AND architecture_flowchart IS NOT NULL
);