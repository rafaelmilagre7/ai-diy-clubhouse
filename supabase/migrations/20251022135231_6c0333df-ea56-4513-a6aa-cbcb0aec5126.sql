-- Limpeza definitiva do Builder: remover tabelas legacy de checklist

-- Drop tabelas antigas que foram substituídas por unified_checklists
DROP TABLE IF EXISTS public.implementation_progress CASCADE;
DROP TABLE IF EXISTS public.implementation_checkpoints CASCADE;

-- Comentário: Essas tabelas foram substituídas por unified_checklists
-- que oferece um sistema Kanban unificado e mais flexível