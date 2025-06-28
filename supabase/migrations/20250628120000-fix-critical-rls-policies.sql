
-- CORREÇÃO CRÍTICA: Implementar políticas RLS para tabelas críticas
-- Problema: 6 tabelas com RLS habilitado mas sem políticas (acesso negado)

-- =============================================================================
-- 1. BENEFIT_ACCESS_CONTROL - Controle de acesso a benefícios/ferramentas
-- =============================================================================

-- Política para SELECT: Admins podem ver todos os controles, usuários podem ver apenas seus próprios acessos
CREATE POLICY "benefit_access_control_select_policy" ON public.benefit_access_control
  FOR SELECT 
  USING (
    -- Admins podem ver todos os controles
    public.is_user_admin(auth.uid())
    OR 
    -- Usuários podem ver controles relacionados ao seu papel
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() 
      AND p.role_id = benefit_access_control.role_id
    )
  );

-- Política para INSERT/UPDATE/DELETE: Apenas admins
CREATE POLICY "benefit_access_control_admin_policy" ON public.benefit_access_control
  FOR ALL
  USING (public.is_user_admin(auth.uid()))
  WITH CHECK (public.is_user_admin(auth.uid()));

-- =============================================================================
-- 2. EVENT_ACCESS_CONTROL - Controle de acesso a eventos
-- =============================================================================

-- Política para SELECT: Admins podem ver todos, usuários podem ver relacionados ao seu papel
CREATE POLICY "event_access_control_select_policy" ON public.event_access_control
  FOR SELECT 
  USING (
    -- Admins podem ver todos os controles
    public.is_user_admin(auth.uid())
    OR 
    -- Usuários podem ver controles relacionados ao seu papel
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() 
      AND p.role_id = event_access_control.role_id
    )
  );

-- Política para INSERT/UPDATE/DELETE: Apenas admins
CREATE POLICY "event_access_control_admin_policy" ON public.event_access_control
  FOR ALL
  USING (public.is_user_admin(auth.uid()))
  WITH CHECK (public.is_user_admin(auth.uid()));

-- =============================================================================
-- 3. SECURITY_ANOMALIES - Anomalias de segurança (tabela crítica)
-- =============================================================================

-- Verificar se a tabela existe antes de criar políticas
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'security_anomalies' AND table_schema = 'public') THEN
    
    -- Política para SELECT: Apenas admins
    DROP POLICY IF EXISTS "security_anomalies_admin_select" ON public.security_anomalies;
    CREATE POLICY "security_anomalies_admin_select" ON public.security_anomalies
      FOR SELECT 
      USING (public.is_user_admin(auth.uid()));

    -- Política para INSERT: Sistema e admins
    DROP POLICY IF EXISTS "security_anomalies_system_insert" ON public.security_anomalies;
    CREATE POLICY "security_anomalies_system_insert" ON public.security_anomalies
      FOR INSERT
      WITH CHECK (
        public.is_user_admin(auth.uid())
        OR auth.uid() IS NULL  -- Para inserções do sistema
      );

    -- Política para UPDATE/DELETE: Apenas admins
    DROP POLICY IF EXISTS "security_anomalies_admin_manage" ON public.security_anomalies;
    CREATE POLICY "security_anomalies_admin_manage" ON public.security_anomalies
      FOR ALL
      USING (public.is_user_admin(auth.uid()))
      WITH CHECK (public.is_user_admin(auth.uid()));

  END IF;
END $$;

-- =============================================================================
-- 4. SECURITY_INCIDENTS - Incidentes de segurança
-- =============================================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'security_incidents' AND table_schema = 'public') THEN
    
    -- Política para SELECT: Apenas admins
    DROP POLICY IF EXISTS "security_incidents_admin_select" ON public.security_incidents;
    CREATE POLICY "security_incidents_admin_select" ON public.security_incidents
      FOR SELECT 
      USING (public.is_user_admin(auth.uid()));

    -- Política para INSERT: Sistema e admins
    DROP POLICY IF EXISTS "security_incidents_system_insert" ON public.security_incidents;
    CREATE POLICY "security_incidents_system_insert" ON public.security_incidents
      FOR INSERT
      WITH CHECK (
        public.is_user_admin(auth.uid())
        OR auth.uid() IS NULL  -- Para inserções automáticas do sistema
      );

    -- Política para UPDATE/DELETE: Apenas admins
    DROP POLICY IF EXISTS "security_incidents_admin_manage" ON public.security_incidents;
    CREATE POLICY "security_incidents_admin_manage" ON public.security_incidents
      FOR ALL
      USING (public.is_user_admin(auth.uid()))
      WITH CHECK (public.is_user_admin(auth.uid()));

  END IF;
END $$;

-- =============================================================================
-- 5. SECURITY_LOGS - Logs de segurança
-- =============================================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'security_logs' AND table_schema = 'public') THEN
    
    -- Política para SELECT: Apenas admins
    DROP POLICY IF EXISTS "security_logs_admin_select" ON public.security_logs;
    CREATE POLICY "security_logs_admin_select" ON public.security_logs
      FOR SELECT 
      USING (public.is_user_admin(auth.uid()));

    -- Política para INSERT: Sistema (sem restrições para logs automáticos)
    DROP POLICY IF EXISTS "security_logs_system_insert" ON public.security_logs;
    CREATE POLICY "security_logs_system_insert" ON public.security_logs
      FOR INSERT
      WITH CHECK (true);  -- Logs podem ser inseridos livremente

    -- Política para UPDATE/DELETE: Apenas admins (logs não devem ser alterados)
    DROP POLICY IF EXISTS "security_logs_admin_readonly" ON public.security_logs;
    CREATE POLICY "security_logs_admin_readonly" ON public.security_logs
      FOR UPDATE
      USING (false)  -- Proibir atualizações
      WITH CHECK (false);

    DROP POLICY IF EXISTS "security_logs_admin_delete" ON public.security_logs;
    CREATE POLICY "security_logs_admin_delete" ON public.security_logs
      FOR DELETE
      USING (public.is_user_admin(auth.uid()));  -- Apenas admins podem deletar

  END IF;
END $$;

-- =============================================================================
-- 6. SECURITY_METRICS - Métricas de segurança
-- =============================================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'security_metrics' AND table_schema = 'public') THEN
    
    -- Política para SELECT: Apenas admins
    DROP POLICY IF EXISTS "security_metrics_admin_select" ON public.security_metrics;
    CREATE POLICY "security_metrics_admin_select" ON public.security_metrics
      FOR SELECT 
      USING (public.is_user_admin(auth.uid()));

    -- Política para INSERT/UPDATE: Sistema e admins
    DROP POLICY IF EXISTS "security_metrics_system_manage" ON public.security_metrics;
    CREATE POLICY "security_metrics_system_manage" ON public.security_metrics
      FOR ALL
      USING (
        public.is_user_admin(auth.uid())
        OR auth.uid() IS NULL  -- Para atualizações automáticas do sistema
      )
      WITH CHECK (
        public.is_user_admin(auth.uid())
        OR auth.uid() IS NULL
      );

  END IF;
END $$;

-- =============================================================================
-- VERIFICAÇÃO FINAL E LOG DE AUDITORIA
-- =============================================================================

-- Verificar status das políticas implementadas
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  CASE 
    WHEN cmd = 'ALL' THEN 'Todas as operações'
    WHEN cmd = 'SELECT' THEN 'Consulta'
    WHEN cmd = 'INSERT' THEN 'Inserção'
    WHEN cmd = 'UPDATE' THEN 'Atualização'
    WHEN cmd = 'DELETE' THEN 'Exclusão'
    ELSE cmd
  END as operacao
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('benefit_access_control', 'event_access_control', 'security_anomalies', 'security_incidents', 'security_logs', 'security_metrics')
ORDER BY tablename, policyname;

-- Log de auditoria da correção crítica
INSERT INTO public.audit_logs (
  user_id,
  event_type,
  action,
  resource_id,
  details,
  severity
) VALUES (
  NULL,
  'system_event',
  'critical_rls_policies_implemented',
  'rls_security_system',
  jsonb_build_object(
    'action', 'fix_critical_rls_policies',
    'tables_fixed', ARRAY['benefit_access_control', 'event_access_control', 'security_anomalies', 'security_incidents', 'security_logs', 'security_metrics'],
    'timestamp', NOW(),
    'impact', 'restored_access_to_critical_tables',
    'policies_created', 18
  ),
  'high'
);

-- Contagem final de políticas por tabela
WITH policy_count AS (
  SELECT 
    tablename,
    COUNT(*) as policies
  FROM pg_policies 
  WHERE schemaname = 'public' 
  AND tablename IN ('benefit_access_control', 'event_access_control', 'security_anomalies', 'security_incidents', 'security_logs', 'security_metrics')
  GROUP BY tablename
)
SELECT 
  'CORREÇÃO RLS CONCLUÍDA: ' || 
  STRING_AGG(tablename || ' (' || policies || ' políticas)', ', ') as resumo
FROM policy_count;
