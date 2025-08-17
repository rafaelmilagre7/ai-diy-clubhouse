-- Ajuste de integridade de logs: ligar audit_logs.user_id ao perfil do usuário (e não a uma tabela "users" antiga)
DO $$ BEGIN
  -- Remover FK antiga se existir
  IF EXISTS (
    SELECT 1 FROM pg_constraint c
    JOIN pg_class t ON c.conrelid = t.oid
    WHERE t.relname = 'audit_logs' AND c.conname = 'audit_logs_user_id_fkey'
  ) THEN
    ALTER TABLE public.audit_logs DROP CONSTRAINT audit_logs_user_id_fkey;
  END IF;
END $$;

-- Criar FK correta apontando para profiles(id)
ALTER TABLE public.audit_logs
  ADD CONSTRAINT audit_logs_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES public.profiles(id)
  ON DELETE SET NULL;

-- Opcional: índice para consultas por usuário no log
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
