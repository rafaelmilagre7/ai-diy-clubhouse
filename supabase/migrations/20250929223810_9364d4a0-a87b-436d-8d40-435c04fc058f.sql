-- Criar tabela de log de sincronização Master/Membros
CREATE TABLE IF NOT EXISTS public.master_member_sync_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  master_email TEXT NOT NULL,
  member_email TEXT,
  operation TEXT NOT NULL CHECK (operation IN ('master_created', 'member_created', 'member_updated', 'organization_created', 'skipped', 'error')),
  sync_status TEXT NOT NULL CHECK (sync_status IN ('success', 'error', 'warning')) DEFAULT 'success',
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  synced_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index para buscar logs por email
CREATE INDEX IF NOT EXISTS idx_sync_log_master_email ON public.master_member_sync_log(master_email);
CREATE INDEX IF NOT EXISTS idx_sync_log_member_email ON public.master_member_sync_log(member_email);
CREATE INDEX IF NOT EXISTS idx_sync_log_status ON public.master_member_sync_log(sync_status);
CREATE INDEX IF NOT EXISTS idx_sync_log_synced_at ON public.master_member_sync_log(synced_at DESC);

-- Habilitar RLS
ALTER TABLE public.master_member_sync_log ENABLE ROW LEVEL SECURITY;

-- Apenas admins podem acessar
CREATE POLICY "Admins podem acessar logs de sincronização"
  ON public.master_member_sync_log
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      INNER JOIN public.user_roles ur ON p.role_id = ur.id
      WHERE p.id = auth.uid() AND ur.name = 'admin'
    )
  );

-- Comentários
COMMENT ON TABLE public.master_member_sync_log IS 'Log de operações de sincronização entre masters e membros via CSV';
COMMENT ON COLUMN public.master_member_sync_log.operation IS 'Tipo de operação: master_created, member_created, member_updated, organization_created, skipped, error';
COMMENT ON COLUMN public.master_member_sync_log.sync_status IS 'Status da operação: success, error, warning';