-- Migração: Sistema de Notificações com Avatares
-- Adiciona campo actor_id para identificar quem gerou a notificação

-- 1. Adicionar coluna actor_id na tabela notifications
ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL;

-- 2. Adicionar coluna read_at para timestamp de leitura
ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS read_at TIMESTAMPTZ;

-- 3. Criar índice para performance nas queries com actor_id
CREATE INDEX IF NOT EXISTS idx_notifications_actor_id ON notifications(actor_id);

-- 4. Criar índice composto para queries filtradas por usuário e status de leitura
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read);

-- 5. Comentários descritivos
COMMENT ON COLUMN notifications.actor_id IS 'ID do usuário que gerou a notificação (quem curtiu, comentou, etc)';
COMMENT ON COLUMN notifications.read_at IS 'Timestamp de quando a notificação foi marcada como lida';