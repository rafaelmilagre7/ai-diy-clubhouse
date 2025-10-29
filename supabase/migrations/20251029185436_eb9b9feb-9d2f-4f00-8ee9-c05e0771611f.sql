-- =====================================================
-- Migration: Fix Lesson Completion Flow
-- Data: 2025-10-29
-- Descrição: Adiciona trigger de validação e corrige dados inconsistentes
-- =====================================================

-- 1. CORRIGIR DADOS INCONSISTENTES
-- =====================================================

-- Corrigir aulas com 1% para 5% (novo padrão STARTED)
UPDATE learning_progress
SET progress_percentage = 5
WHERE progress_percentage = 1 
  AND completed_at IS NULL;

-- Adicionar completed_at onde progress >= 100 mas está NULL
UPDATE learning_progress
SET completed_at = updated_at
WHERE progress_percentage >= 100 
  AND completed_at IS NULL;

-- Remover completed_at onde progress < 100 mas tem data
UPDATE learning_progress
SET completed_at = NULL
WHERE progress_percentage < 100 
  AND completed_at IS NOT NULL;

-- 2. CRIAR FUNÇÃO DE VALIDAÇÃO
-- =====================================================

-- Função para garantir consistência entre progress_percentage e completed_at
CREATE OR REPLACE FUNCTION ensure_completed_at_consistency()
RETURNS TRIGGER AS $$
BEGIN
  -- Se marcar como concluída (>= 100) mas não tiver completed_at, adicionar
  IF NEW.progress_percentage >= 100 AND NEW.completed_at IS NULL THEN
    NEW.completed_at := NOW();
    RAISE NOTICE 'Auto-adicionando completed_at para lesson_id: %', NEW.lesson_id;
  END IF;
  
  -- Se desmarcar como concluída (< 100) mas tiver completed_at, remover
  IF NEW.progress_percentage < 100 AND NEW.completed_at IS NOT NULL THEN
    NEW.completed_at := NULL;
    RAISE NOTICE 'Auto-removendo completed_at para lesson_id: %', NEW.lesson_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. CRIAR TRIGGER
-- =====================================================

-- Drop trigger se já existir
DROP TRIGGER IF EXISTS learning_progress_ensure_completed ON learning_progress;

-- Criar trigger para validação automática
CREATE TRIGGER learning_progress_ensure_completed
  BEFORE INSERT OR UPDATE ON learning_progress
  FOR EACH ROW
  EXECUTE FUNCTION ensure_completed_at_consistency();

-- 4. ADICIONAR COMENTÁRIOS
-- =====================================================

COMMENT ON FUNCTION ensure_completed_at_consistency() IS 
  'Garante consistência entre progress_percentage e completed_at:
   - Se progress >= 100: completed_at deve ser NOT NULL
   - Se progress < 100: completed_at deve ser NULL';

COMMENT ON TRIGGER learning_progress_ensure_completed ON learning_progress IS
  'Trigger que valida e corrige automaticamente a consistência de completed_at';

-- 5. VALIDAR MIGRAÇÃO
-- =====================================================

-- Verificar que não há mais inconsistências
DO $$
DECLARE
  inconsistent_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO inconsistent_count
  FROM learning_progress
  WHERE 
    (progress_percentage >= 100 AND completed_at IS NULL)
    OR
    (progress_percentage < 100 AND completed_at IS NOT NULL);
  
  IF inconsistent_count > 0 THEN
    RAISE WARNING 'Ainda existem % registros inconsistentes após migração', inconsistent_count;
  ELSE
    RAISE NOTICE 'Migração concluída com sucesso! Todos os registros estão consistentes.';
  END IF;
END $$;