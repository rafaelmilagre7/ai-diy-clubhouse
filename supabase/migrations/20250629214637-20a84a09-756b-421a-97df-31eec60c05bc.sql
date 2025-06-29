
-- ===============================================================
-- MIGRAÇÃO FINAL: Criação das tabelas que realmente faltam
-- ===============================================================

-- 1. CRIAR TABELA implementation_trails
-- ===============================================================
CREATE TABLE IF NOT EXISTS public.implementation_trails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  trail_data JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'draft',
  generation_attempts INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Inserir dados do backup (2 registros válidos)
INSERT INTO public.implementation_trails (
  id, user_id, trail_data, status, generation_attempts, error_message, created_at, updated_at
)
SELECT 
  id, user_id, trail_data, status, generation_attempts, error_message, created_at, updated_at
FROM public.cleanup_backup_implementation_trails
WHERE user_id IS NOT NULL 
  AND trail_data IS NOT NULL
ON CONFLICT (id) DO NOTHING;

-- 2. CRIAR TABELA community_reports  
-- ===============================================================
CREATE TABLE IF NOT EXISTS public.community_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL,
  reported_user_id UUID,
  topic_id UUID,
  post_id UUID,
  report_type TEXT NOT NULL CHECK (report_type IN ('spam', 'inappropriate', 'harassment', 'misinformation', 'other')),
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  resolution_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. CONFIGURAR RLS PARA implementation_trails
-- ===============================================================
ALTER TABLE public.implementation_trails ENABLE ROW LEVEL SECURITY;

-- Política para visualizar apenas suas próprias trilhas
CREATE POLICY "users_can_view_own_trails" ON public.implementation_trails
  FOR SELECT 
  USING (user_id = auth.uid());

-- Política para inserir apenas para si mesmo
CREATE POLICY "users_can_create_own_trails" ON public.implementation_trails
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

-- Política para atualizar apenas suas próprias trilhas
CREATE POLICY "users_can_update_own_trails" ON public.implementation_trails
  FOR UPDATE 
  USING (user_id = auth.uid());

-- Admins podem ver tudo
CREATE POLICY "admins_can_manage_all_trails" ON public.implementation_trails
  FOR ALL 
  USING (public.is_user_admin(auth.uid()));

-- 4. CONFIGURAR RLS PARA community_reports
-- ===============================================================
ALTER TABLE public.community_reports ENABLE ROW LEVEL SECURITY;

-- Usuários podem criar reports
CREATE POLICY "users_can_create_reports" ON public.community_reports
  FOR INSERT 
  WITH CHECK (reporter_id = auth.uid());

-- Usuários podem ver seus próprios reports
CREATE POLICY "users_can_view_own_reports" ON public.community_reports
  FOR SELECT 
  USING (reporter_id = auth.uid());

-- Admins podem gerenciar todos os reports
CREATE POLICY "admins_can_manage_all_reports" ON public.community_reports
  FOR ALL 
  USING (public.is_user_admin(auth.uid()));

-- 5. TRIGGERS E ÍNDICES
-- ===============================================================

-- Trigger para updated_at em implementation_trails
CREATE TRIGGER update_implementation_trails_updated_at 
    BEFORE UPDATE ON public.implementation_trails 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger para updated_at em community_reports
CREATE TRIGGER update_community_reports_updated_at 
    BEFORE UPDATE ON public.community_reports 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_implementation_trails_user_id ON public.implementation_trails(user_id);
CREATE INDEX IF NOT EXISTS idx_implementation_trails_status ON public.implementation_trails(status);
CREATE INDEX IF NOT EXISTS idx_community_reports_reporter_id ON public.community_reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_community_reports_status ON public.community_reports(status);
CREATE INDEX IF NOT EXISTS idx_community_reports_reported_user_id ON public.community_reports(reported_user_id) WHERE reported_user_id IS NOT NULL;

-- 6. VERIFICAÇÃO FINAL
-- ===============================================================
SELECT 
  'implementation_trails' as table_name,
  COUNT(*) as total_records,
  COUNT(*) FILTER (WHERE status = 'completed') as completed_count,
  COUNT(*) FILTER (WHERE status = 'draft') as draft_count
FROM public.implementation_trails
UNION ALL
SELECT 
  'community_reports' as table_name,
  COUNT(*) as total_records,
  COUNT(*) FILTER (WHERE status = 'resolved') as resolved_count,
  COUNT(*) FILTER (WHERE status = 'pending') as pending_count
FROM public.community_reports;

-- Verificar se todas as tabelas críticas existem
SELECT 
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'solutions') THEN '✅' ELSE '❌' END as solutions,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'progress') THEN '✅' ELSE '❌' END as progress,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'learning_modules') THEN '✅' ELSE '❌' END as learning_modules,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'implementation_trails') THEN '✅' ELSE '❌' END as implementation_trails,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'community_reports') THEN '✅' ELSE '❌' END as community_reports;
