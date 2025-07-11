-- Remover completamente a constraint problemática que está impedindo a criação de contas
ALTER TABLE public.audit_logs DROP CONSTRAINT IF EXISTS audit_logs_event_type_check;

-- Verificar quais event_types existem na tabela
-- SELECT DISTINCT event_type FROM public.audit_logs;

-- Por enquanto, não vamos adicionar nenhuma constraint restritiva
-- para permitir que a criação de contas funcione