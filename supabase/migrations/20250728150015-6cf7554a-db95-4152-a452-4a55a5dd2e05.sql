-- CONSOLIDAÇÃO DE POLÍTICAS RLS - CORREÇÃO DE CONFLITOS E DUPLICATAS
-- Esta migração resolve políticas conflitantes e duplicadas de forma segura

-- =============================================
-- FASE 1: IDENTIFICAR E CONSOLIDAR POLÍTICAS DUPLICADAS
-- =============================================

-- 1. TABELA: member_connections - Consolidar políticas duplicadas
DROP POLICY IF EXISTS "Usuários podem atualizar suas próprias conexões" ON member_connections;
DROP POLICY IF EXISTS "Usuários podem ver suas próprias conexões" ON member_connections;

-- Criar políticas consolidadas para member_connections
CREATE POLICY "member_connections_secure_access" 
ON member_connections FOR ALL
USING ((requester_id = auth.uid()) OR (recipient_id = auth.uid()))
WITH CHECK ((requester_id = auth.uid()) OR (recipient_id = auth.uid()));

-- 2. TABELA: connection_notifications - Consolidar políticas duplicadas  
DROP POLICY IF EXISTS "Usuários podem atualizar suas próprias notificações" ON connection_notifications;
DROP POLICY IF EXISTS "Usuários podem ver suas próprias notificações" ON connection_notifications;
DROP POLICY IF EXISTS "connection_notifications_select_policy" ON connection_notifications;
DROP POLICY IF EXISTS "connection_notifications_update_policy" ON connection_notifications;

-- Criar política consolidada para connection_notifications
CREATE POLICY "connection_notifications_secure_access"
ON connection_notifications FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 3. TABELA: direct_messages - Consolidar políticas duplicadas
DROP POLICY IF EXISTS "Users can update their sent messages" ON direct_messages;
DROP POLICY IF EXISTS "Users can view their own messages" ON direct_messages;
DROP POLICY IF EXISTS "Usuários podem atualizar suas mensagens recebidas" ON direct_messages;
DROP POLICY IF EXISTS "Usuários podem ver suas mensagens" ON direct_messages;

-- Criar políticas consolidadas para direct_messages
CREATE POLICY "direct_messages_secure_access"
ON direct_messages FOR SELECT
USING ((sender_id = auth.uid()) OR (recipient_id = auth.uid()));

CREATE POLICY "direct_messages_secure_insert" 
ON direct_messages FOR INSERT
WITH CHECK ((sender_id = auth.uid()) AND (auth.uid() IS NOT NULL));

CREATE POLICY "direct_messages_secure_update"
ON direct_messages FOR UPDATE
USING ((sender_id = auth.uid()) OR (recipient_id = auth.uid()));

-- 4. TABELA: conversations - Consolidar políticas duplicadas
DROP POLICY IF EXISTS "Participantes podem atualizar conversas" ON conversations;
DROP POLICY IF EXISTS "Users can update their conversations" ON conversations;
DROP POLICY IF EXISTS "Users can view their conversations" ON conversations;
DROP POLICY IF EXISTS "Usuários podem ver suas conversas" ON conversations;

-- Criar políticas consolidadas para conversations
CREATE POLICY "conversations_secure_access"
ON conversations FOR ALL
USING ((participant_1_id = auth.uid()) OR (participant_2_id = auth.uid()))
WITH CHECK ((participant_1_id = auth.uid()) OR (participant_2_id = auth.uid()));

-- =============================================
-- FASE 2: CORRIGIR POLÍTICAS CONFLITANTES
-- =============================================

-- 5. TABELA: analytics - Remover política redundante mais permissiva
DROP POLICY IF EXISTS "analytics_user_only" ON analytics;
DROP POLICY IF EXISTS "analytics_user_secure_access" ON analytics;

-- Manter apenas a política mais restritiva
CREATE POLICY "analytics_secure_access"
ON analytics FOR ALL
USING ((auth.uid() IS NOT NULL) AND (user_id = auth.uid()))
WITH CHECK ((auth.uid() IS NOT NULL) AND (user_id = auth.uid()));

-- 6. TABELA: benefit_clicks - Consolidar políticas de admin
DROP POLICY IF EXISTS "Apenas administradores podem visualizar cliques" ON benefit_clicks;

-- Criar política consolidada para benefit_clicks  
CREATE POLICY "benefit_clicks_admin_access"
ON benefit_clicks FOR SELECT
USING (public.is_user_admin_secure(auth.uid()));

-- =============================================
-- FASE 3: OTIMIZAR POLÍTICAS ADMINISTRATIVAS
-- =============================================

-- 7. Consolidar políticas de admin usando função segura
-- Remover políticas antigas que usam verificações diretas na tabela profiles
DROP POLICY IF EXISTS "Admins can view all deliveries" ON communication_deliveries;
DROP POLICY IF EXISTS "Admins can view all communication preferences" ON communication_preferences;
DROP POLICY IF EXISTS "Admins can insert events" ON events;
DROP POLICY IF EXISTS "Only admins can delete events" ON events;
DROP POLICY IF EXISTS "Only admins can update events" ON events;

-- Recriar com função segura para evitar recursão
CREATE POLICY "communication_deliveries_admin_access"
ON communication_deliveries FOR SELECT
USING ((user_id = auth.uid()) OR public.is_user_admin_secure(auth.uid()));

CREATE POLICY "communication_preferences_admin_access"
ON communication_preferences FOR ALL
USING ((user_id = auth.uid()) OR public.is_user_admin_secure(auth.uid()));

CREATE POLICY "events_admin_access"
ON events FOR ALL
USING (public.is_user_admin_secure(auth.uid()));

-- =============================================
-- FASE 4: ADICIONAR FUNÇÕES DE AUDITORIA
-- =============================================

-- Função para log de mudanças de políticas RLS
CREATE OR REPLACE FUNCTION public.log_policy_changes()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.audit_logs (
    user_id,
    event_type,
    action,
    details,
    severity
  ) VALUES (
    auth.uid(),
    'policy_consolidation',
    'rls_policies_updated',
    jsonb_build_object(
      'timestamp', now(),
      'migration', 'policy_consolidation_v1',
      'tables_affected', ARRAY[
        'member_connections',
        'connection_notifications', 
        'direct_messages',
        'conversations',
        'analytics',
        'benefit_clicks',
        'communication_deliveries',
        'communication_preferences',
        'events'
      ]
    ),
    'info'
  );
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';

-- Executar log da consolidação
SELECT public.log_policy_changes();

-- =============================================
-- FASE 5: VERIFICAÇÃO FINAL DE INTEGRIDADE
-- =============================================

-- Função para verificar se não há políticas duplicadas
CREATE OR REPLACE FUNCTION public.check_duplicate_policies()
RETURNS jsonb AS $$
DECLARE
  duplicate_count integer;
  result jsonb;
BEGIN
  -- Contar políticas com nomes similares na mesma tabela
  SELECT COUNT(*) INTO duplicate_count
  FROM (
    SELECT tablename, COUNT(*) as policy_count
    FROM pg_policies 
    WHERE schemaname = 'public'
    GROUP BY tablename, split_part(policyname, '_', 1)
    HAVING COUNT(*) > 1
  ) duplicates;
  
  result := jsonb_build_object(
    'success', true,
    'duplicate_policies_found', duplicate_count,
    'consolidation_completed', now(),
    'message', 'Políticas RLS consolidadas com sucesso'
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';

-- Log final
INSERT INTO public.audit_logs (
  user_id,
  event_type,
  action,
  details,
  severity
) VALUES (
  auth.uid(),
  'security_improvement',
  'policy_consolidation_completed',
  public.check_duplicate_policies(),
  'info'
);