-- Criar tabela para logs de automação
CREATE TABLE IF NOT EXISTS public.automation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id UUID REFERENCES public.automation_rules(id) ON DELETE CASCADE,
  trigger_data JSONB NOT NULL DEFAULT '{}',
  executed_actions JSONB NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'pending',
  error_message TEXT,
  execution_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adicionar RLS para automation_logs
ALTER TABLE public.automation_logs ENABLE ROW LEVEL SECURITY;

-- Política para admins acessarem logs
CREATE POLICY "automation_logs_admin_access" ON public.automation_logs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.user_roles ur ON p.role_id = ur.id
      WHERE p.id = auth.uid() AND ur.name = 'admin'
    )
  );

-- Função para atualizar updated_at em automation_logs
CREATE OR REPLACE FUNCTION public.update_automation_logs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger para automation_logs
CREATE TRIGGER update_automation_logs_updated_at
  BEFORE UPDATE ON public.automation_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_automation_logs_updated_at();

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_automation_logs_rule_id ON public.automation_logs(rule_id);
CREATE INDEX IF NOT EXISTS idx_automation_logs_created_at ON public.automation_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_automation_logs_status ON public.automation_logs(status);
CREATE INDEX IF NOT EXISTS idx_automation_rules_is_active ON public.automation_rules(is_active) WHERE is_active = true;