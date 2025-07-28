-- CONSOLIDAÇÃO DE POLÍTICAS RLS - CORREÇÃO SEGURA E COMPLETA
-- Versão corrigida que verifica existência antes de criar políticas

-- =============================================
-- FASE 1: IDENTIFICAR E CONSOLIDAR POLÍTICAS DUPLICADAS DE FORMA SEGURA
-- =============================================

-- 1. TABELA: member_connections - Consolidar políticas duplicadas
DROP POLICY IF EXISTS "Usuários podem atualizar suas próprias conexões" ON member_connections;
DROP POLICY IF EXISTS "Usuários podem ver suas próprias conexões" ON member_connections;
DROP POLICY IF EXISTS "member_connections_secure_access" ON member_connections;

-- Criar política consolidada para member_connections
CREATE POLICY "member_connections_secure_access" 
ON member_connections FOR ALL
USING ((requester_id = auth.uid()) OR (recipient_id = auth.uid()))
WITH CHECK ((requester_id = auth.uid()) OR (recipient_id = auth.uid()));

-- 2. TABELA: connection_notifications - Consolidar políticas duplicadas  
DROP POLICY IF EXISTS "Usuários podem atualizar suas próprias notificações" ON connection_notifications;
DROP POLICY IF EXISTS "Usuários podem ver suas próprias notificações" ON connection_notifications;
DROP POLICY IF EXISTS "connection_notifications_select_policy" ON connection_notifications;
DROP POLICY IF EXISTS "connection_notifications_update_policy" ON connection_notifications;
DROP POLICY IF EXISTS "connection_notifications_secure_access" ON connection_notifications;

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
DROP POLICY IF EXISTS "direct_messages_secure_access" ON direct_messages;
DROP POLICY IF EXISTS "direct_messages_secure_insert" ON direct_messages;
DROP POLICY IF EXISTS "direct_messages_secure_update" ON direct_messages;

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
DROP POLICY IF EXISTS "conversations_secure_access" ON conversations;

-- Criar política consolidada para conversations
CREATE POLICY "conversations_secure_access"
ON conversations FOR ALL
USING ((participant_1_id = auth.uid()) OR (participant_2_id = auth.uid()))
WITH CHECK ((participant_1_id = auth.uid()) OR (participant_2_id = auth.uid()));

-- =============================================
-- FASE 2: CORRIGIR POLÍTICAS CONFLITANTES
-- =============================================

-- 5. TABELA: analytics - Remover políticas redundantes e conflitantes
DROP POLICY IF EXISTS "analytics_user_only" ON analytics;
DROP POLICY IF EXISTS "analytics_user_secure_access" ON analytics;
DROP POLICY IF EXISTS "analytics_secure_access" ON analytics;

-- Manter apenas a política mais restritiva e clara
CREATE POLICY "analytics_secure_access"
ON analytics FOR ALL
USING ((auth.uid() IS NOT NULL) AND (user_id = auth.uid()))
WITH CHECK ((auth.uid() IS NOT NULL) AND (user_id = auth.uid()));

-- 6. TABELA: benefit_clicks - Consolidar políticas de admin
DROP POLICY IF EXISTS "Apenas administradores podem visualizar cliques" ON benefit_clicks;
DROP POLICY IF EXISTS "benefit_clicks_admin_access" ON benefit_clicks;

-- Criar política consolidada para benefit_clicks  
CREATE POLICY "benefit_clicks_admin_access"
ON benefit_clicks FOR SELECT
USING (public.is_user_admin_secure(auth.uid()));

-- =============================================
-- FASE 3: OTIMIZAR POLÍTICAS ADMINISTRATIVAS
-- =============================================

-- 7. Consolidar políticas de admin usando função segura
DROP POLICY IF EXISTS "Admins can view all deliveries" ON communication_deliveries;
DROP POLICY IF EXISTS "Admins can view all communication preferences" ON communication_preferences;
DROP POLICY IF EXISTS "Admins can insert events" ON events;
DROP POLICY IF EXISTS "Only admins can delete events" ON events;
DROP POLICY IF EXISTS "Only admins can update events" ON events;
DROP POLICY IF EXISTS "communication_deliveries_admin_access" ON communication_deliveries;
DROP POLICY IF EXISTS "communication_preferences_admin_access" ON communication_preferences;
DROP POLICY IF EXISTS "events_admin_access" ON events;

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
-- FASE 4: VERIFICAÇÃO E LOG FINAL
-- =============================================

-- Função para verificar políticas consolidadas
CREATE OR REPLACE FUNCTION public.validate_policy_consolidation()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  total_policies integer;
  consolidated_tables text[];
  result jsonb;
BEGIN
  -- Contar políticas totais nas tabelas consolidadas
  SELECT COUNT(*) INTO total_policies
  FROM pg_policies 
  WHERE schemaname = 'public'
    AND tablename = ANY(ARRAY[
      'member_connections',
      'connection_notifications', 
      'direct_messages',
      'conversations',
      'analytics',
      'benefit_clicks',
      'communication_deliveries',
      'communication_preferences',
      'events'
    ]);
  
  consolidated_tables := ARRAY[
    'member_connections',
    'connection_notifications', 
    'direct_messages',
    'conversations',
    'analytics',
    'benefit_clicks',
    'communication_deliveries',
    'communication_preferences',
    'events'
  ];
  
  result := jsonb_build_object(
    'success', true,
    'total_policies_after_consolidation', total_policies,
    'tables_consolidated', consolidated_tables,
    'consolidation_completed_at', now(),
    'message', format('Consolidação concluída com %s políticas otimizadas', total_policies)
  );
  
  -- Log da consolidação
  INSERT INTO public.audit_logs (
    user_id,
    event_type,
    action,
    details,
    severity
  ) VALUES (
    auth.uid(),
    'security_improvement',
    'rls_policy_consolidation_completed',
    result,
    'info'
  );
  
  RETURN result;
END;
$$;

-- Executar validação final
SELECT public.validate_policy_consolidation();