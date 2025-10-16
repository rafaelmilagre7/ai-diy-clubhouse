-- ============================================
-- FASE 2: REMOÇÃO DO MARKETPLACE - BACKEND
-- ============================================
-- 
-- Este script faz backup e remove a tabela networking_opportunities
-- de forma segura usando CASCADE para limpar todas as dependências

-- 1. BACKUP dos dados (para possível rollback)
CREATE TABLE IF NOT EXISTS networking_opportunities_backup AS 
SELECT * FROM networking_opportunities;

-- Registrar informações do backup
DO $$
BEGIN
  RAISE NOTICE '📦 BACKUP: Criada tabela networking_opportunities_backup com % registros', 
    (SELECT COUNT(*) FROM networking_opportunities_backup);
END $$;

-- 2. DELETAR tabela principal
-- CASCADE vai remover automaticamente:
-- - Foreign keys
-- - RLS policies
-- - Triggers
-- - Indexes
DROP TABLE IF EXISTS networking_opportunities CASCADE;

-- Log de conclusão
DO $$
BEGIN
  RAISE NOTICE '✅ TABELA REMOVIDA: networking_opportunities deletada com sucesso';
  RAISE NOTICE '✅ BACKUP DISPONÍVEL: networking_opportunities_backup mantida para rollback';
END $$;