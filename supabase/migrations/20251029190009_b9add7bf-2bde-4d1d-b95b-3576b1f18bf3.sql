-- Remove a constraint problemática que está bloqueando updates durante transição de estado
-- O trigger ensure_completed_at_consistency já garante a consistência de forma mais flexível

-- Remover constraint se existir
ALTER TABLE learning_progress 
DROP CONSTRAINT IF EXISTS check_completed_consistency;

-- O trigger ensure_completed_at_consistency (criado em migração anterior) já garante:
-- 1. Se progress_percentage >= 100, completed_at é preenchido automaticamente
-- 2. Se progress_percentage < 100, completed_at é limpo automaticamente
-- Isso é feito ANTES do INSERT/UPDATE, evitando violações de constraint