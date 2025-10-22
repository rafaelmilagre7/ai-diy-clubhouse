-- =====================================================
-- FASE 1: UNIFICAÇÃO DO SISTEMA DE NOTIFICAÇÕES
-- =====================================================
-- Consolidar suggestion_notifications e connection_notifications
-- em uma única tabela: notifications
-- =====================================================

-- 1️⃣ Garantir que a tabela notifications tem todas as colunas necessárias
ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS reference_id UUID,
ADD COLUMN IF NOT EXISTS reference_type TEXT,
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Adicionar índices para performance
CREATE INDEX IF NOT EXISTS idx_notifications_reference ON notifications(reference_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_category ON notifications(category);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read);

-- 2️⃣ Migrar dados de suggestion_notifications para notifications
INSERT INTO notifications (
  user_id,
  actor_id,
  type,
  title,
  message,
  is_read,
  created_at,
  reference_id,
  reference_type,
  category,
  priority,
  metadata
)
SELECT 
  sn.user_id,
  NULL::uuid as actor_id,
  CASE 
    WHEN sn.type::text = 'suggestion_approved' THEN 'suggestion_approved'
    WHEN sn.type::text = 'suggestion_rejected' THEN 'suggestion_rejected'
    WHEN sn.type::text = 'suggestion_comment' THEN 'suggestion_comment_added'
    WHEN sn.type::text = 'suggestion_liked' THEN 'suggestion_liked'
    ELSE sn.type::text
  END as type,
  CASE 
    WHEN sn.type::text = 'suggestion_approved' THEN 'Sugestão aprovada'
    WHEN sn.type::text = 'suggestion_rejected' THEN 'Sugestão rejeitada'
    WHEN sn.type::text = 'suggestion_comment' THEN 'Novo comentário na sua sugestão'
    WHEN sn.type::text = 'suggestion_liked' THEN 'Alguém curtiu sua sugestão'
    ELSE 'Atualização sobre sua sugestão'
  END as title,
  COALESCE(sn.content, 'Confira a atualização') as message,
  sn.is_read,
  sn.created_at,
  sn.suggestion_id as reference_id,
  'suggestion' as reference_type,
  'suggestions' as category,
  2 as priority,
  jsonb_build_object(
    'suggestion_id', sn.suggestion_id,
    'comment_id', sn.comment_id,
    'migrated_from', 'suggestion_notifications'
  ) as metadata
FROM suggestion_notifications sn
WHERE NOT EXISTS (
  SELECT 1 FROM notifications n 
  WHERE n.user_id = sn.user_id 
  AND n.reference_id = sn.suggestion_id 
  AND n.created_at = sn.created_at
);

-- 3️⃣ Migrar dados de connection_notifications para notifications
INSERT INTO notifications (
  user_id,
  actor_id,
  type,
  title,
  message,
  is_read,
  created_at,
  reference_id,
  reference_type,
  action_url,
  category,
  priority,
  metadata
)
SELECT 
  cn.user_id,
  cn.sender_id as actor_id,
  cn.type,
  CASE 
    WHEN cn.type = 'connection_request' THEN 'Nova solicitação de conexão'
    WHEN cn.type = 'connection_accepted' THEN 'Conexão aceita'
    ELSE 'Atualização de conexão'
  END as title,
  CASE 
    WHEN cn.type = 'connection_request' THEN 'Você recebeu uma nova solicitação de conexão'
    WHEN cn.type = 'connection_accepted' THEN 'Sua solicitação de conexão foi aceita'
    ELSE 'Atualização sobre suas conexões'
  END as message,
  cn.is_read,
  cn.created_at,
  cn.sender_id as reference_id,
  'connection' as reference_type,
  '/network/connections' as action_url,
  'social' as category,
  2 as priority,
  jsonb_build_object(
    'sender_id', cn.sender_id,
    'connection_type', cn.type,
    'migrated_from', 'connection_notifications'
  ) as metadata
FROM connection_notifications cn
WHERE NOT EXISTS (
  SELECT 1 FROM notifications n 
  WHERE n.user_id = cn.user_id 
  AND n.actor_id = cn.sender_id 
  AND n.created_at = cn.created_at
  AND n.type = cn.type
);

-- 4️⃣ Criar trigger para manter sincronização temporária
CREATE OR REPLACE FUNCTION sync_suggestion_notifications_to_unified()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications (
    user_id,
    type,
    title,
    message,
    is_read,
    reference_id,
    reference_type,
    category,
    priority,
    metadata
  ) VALUES (
    NEW.user_id,
    NEW.type::text,
    'Nova atualização sobre sua sugestão',
    COALESCE(NEW.content, 'Confira a atualização'),
    NEW.is_read,
    NEW.suggestion_id,
    'suggestion',
    'suggestions',
    2,
    jsonb_build_object(
      'suggestion_id', NEW.suggestion_id,
      'comment_id', NEW.comment_id,
      'auto_synced', true
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER trigger_sync_suggestion_notifications
AFTER INSERT ON suggestion_notifications
FOR EACH ROW
EXECUTE FUNCTION sync_suggestion_notifications_to_unified();

CREATE OR REPLACE FUNCTION sync_connection_notifications_to_unified()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications (
    user_id,
    actor_id,
    type,
    title,
    message,
    is_read,
    reference_id,
    reference_type,
    action_url,
    category,
    priority,
    metadata
  ) VALUES (
    NEW.user_id,
    NEW.sender_id,
    NEW.type,
    CASE 
      WHEN NEW.type = 'connection_request' THEN 'Nova solicitação de conexão'
      WHEN NEW.type = 'connection_accepted' THEN 'Conexão aceita'
      ELSE 'Atualização de conexão'
    END,
    CASE 
      WHEN NEW.type = 'connection_request' THEN 'Você recebeu uma nova solicitação de conexão'
      WHEN NEW.type = 'connection_accepted' THEN 'Sua solicitação de conexão foi aceita'
      ELSE 'Atualização sobre suas conexões'
    END,
    NEW.is_read,
    NEW.sender_id,
    'connection',
    '/network/connections',
    'social',
    2,
    jsonb_build_object(
      'sender_id', NEW.sender_id,
      'connection_type', NEW.type,
      'auto_synced', true
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER trigger_sync_connection_notifications
AFTER INSERT ON connection_notifications
FOR EACH ROW
EXECUTE FUNCTION sync_connection_notifications_to_unified();

-- 5️⃣ Documentação
COMMENT ON TABLE suggestion_notifications IS 'DEPRECATED: Use notifications. Será removida futuramente.';
COMMENT ON TABLE connection_notifications IS 'DEPRECATED: Use notifications. Será removida futuramente.';

COMMENT ON COLUMN notifications.type IS 
'Tipos: community_reply, community_post_liked, comment_liked, comment_replied, connection_request, connection_accepted, event_created, event_reminder_24h, course_available, course_completed, solution_available, solution_updated, suggestion_approved, system_announcement, ai_recommendation';

COMMENT ON COLUMN notifications.category IS 
'Categorias: community, engagement, social, events, learning, solutions, suggestions, system, ai';