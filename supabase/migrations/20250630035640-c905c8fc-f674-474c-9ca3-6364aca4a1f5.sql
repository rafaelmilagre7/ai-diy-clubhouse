
-- ===============================================================================
-- PLANO DE LIMPEZA E SINCRONIZAÇÃO BACKEND - MANTER FRONTEND 100% INTACTO (CORRIGIDO)
-- ===============================================================================

-- FASE 1: LIMPEZA DE TABELAS DE BACKUP DESNECESSÁRIAS
-- Remove 7 tabelas de backup antigas (73 registros no total)

-- Remover todas as tabelas de backup antigas
DROP TABLE IF EXISTS cleanup_backup_progress CASCADE;
DROP TABLE IF EXISTS cleanup_backup_solutions CASCADE;
DROP TABLE IF EXISTS cleanup_backup_modules CASCADE;
DROP TABLE IF EXISTS cleanup_backup_forum_topics CASCADE;
DROP TABLE IF EXISTS cleanup_backup_forum_posts CASCADE;
DROP TABLE IF EXISTS cleanup_backup_suggestions CASCADE;
DROP TABLE IF EXISTS cleanup_backup_implementation_trails CASCADE;

-- FASE 2: IMPLEMENTAÇÃO DE POLÍTICAS RLS PARA TABELAS DE SEGURANÇA

-- Verificar se as tabelas existem antes de criar políticas
DO $$
BEGIN
  -- Políticas para security_logs (se a tabela existir)
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'security_logs') THEN
    ALTER TABLE public.security_logs ENABLE ROW LEVEL SECURITY;
    
    -- Apenas admins podem ver logs de segurança
    CREATE POLICY "security_logs_admin_only" ON public.security_logs
      FOR ALL 
      USING (public.is_user_admin(auth.uid()));
  END IF;

  -- Políticas para security_metrics (se a tabela existir)
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'security_metrics') THEN
    ALTER TABLE public.security_metrics ENABLE ROW LEVEL SECURITY;
    
    -- Apenas admins podem ver métricas de segurança
    CREATE POLICY "security_metrics_admin_only" ON public.security_metrics
      FOR ALL 
      USING (public.is_user_admin(auth.uid()));
  END IF;
END $$;

-- Políticas para benefit_access_control
ALTER TABLE public.benefit_access_control ENABLE ROW LEVEL SECURITY;

-- Apenas admins podem gerenciar controle de acesso a benefícios
CREATE POLICY "benefit_access_control_admin_select" ON public.benefit_access_control
  FOR SELECT 
  USING (public.is_user_admin(auth.uid()));

CREATE POLICY "benefit_access_control_admin_insert" ON public.benefit_access_control
  FOR INSERT 
  WITH CHECK (public.is_user_admin(auth.uid()));

CREATE POLICY "benefit_access_control_admin_update" ON public.benefit_access_control
  FOR UPDATE 
  USING (public.is_user_admin(auth.uid()));

CREATE POLICY "benefit_access_control_admin_delete" ON public.benefit_access_control
  FOR DELETE 
  USING (public.is_user_admin(auth.uid()));

-- Políticas para event_access_control
ALTER TABLE public.event_access_control ENABLE ROW LEVEL SECURITY;

-- Apenas admins podem gerenciar controle de acesso a eventos
CREATE POLICY "event_access_control_admin_select" ON public.event_access_control
  FOR SELECT 
  USING (public.is_user_admin(auth.uid()));

CREATE POLICY "event_access_control_admin_insert" ON public.event_access_control
  FOR INSERT 
  WITH CHECK (public.is_user_admin(auth.uid()));

CREATE POLICY "event_access_control_admin_update" ON public.event_access_control
  FOR UPDATE 
  USING (public.is_user_admin(auth.uid()));

CREATE POLICY "event_access_control_admin_delete" ON public.event_access_control
  FOR DELETE 
  USING (public.is_user_admin(auth.uid()));

-- FASE 3: OTIMIZAÇÃO E LIMPEZA DE REGISTROS ÓRFÃOS

-- Limpar registros órfãos em benefit_access_control (ferramentas que não existem mais)
DELETE FROM public.benefit_access_control 
WHERE tool_id NOT IN (SELECT id FROM public.tools WHERE id IS NOT NULL);

-- Limpar registros órfãos em event_access_control (eventos que não existem mais)
DELETE FROM public.event_access_control 
WHERE event_id NOT IN (SELECT id FROM public.events WHERE id IS NOT NULL);

-- Limpar registros órfãos em course_access_control (cursos que não existem mais)
DELETE FROM public.course_access_control 
WHERE course_id NOT IN (SELECT id FROM public.learning_courses WHERE id IS NOT NULL);

-- FASE 4: LOG DA LIMPEZA (CORRIGIDO)

-- Log da limpeza realizada com event_type válido
INSERT INTO public.audit_logs (
  user_id,
  event_type,
  action,
  details
) VALUES (
  NULL,
  'system_event',
  'backend_cleanup_and_sync',
  jsonb_build_object(
    'cleanup_phase', 'complete',
    'tables_removed', 7,
    'rls_policies_added', 8,
    'orphan_records_cleaned', true,
    'frontend_impact', 'none',
    'timestamp', NOW()
  )
);
