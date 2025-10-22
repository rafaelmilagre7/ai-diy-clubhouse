-- ============================================
-- CONFIGURAÇÃO REALTIME PARA NOTIFICAÇÕES
-- ============================================
-- Execute este SQL no Supabase SQL Editor
-- para habilitar notificações em tempo real

-- 1. Habilitar REPLICA IDENTITY FULL
-- Isso garante que todos os dados da linha sejam capturados durante updates
ALTER TABLE notifications REPLICA IDENTITY FULL;

-- 2. Adicionar tabela à publicação do Supabase Realtime
-- Isso permite que o Supabase transmita mudanças via WebSocket
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- 3. Verificar se está habilitado (opcional, para debug)
SELECT schemaname, tablename, rulename
FROM pg_rules
WHERE tablename = 'notifications';

-- 4. Verificar publicação (opcional, para debug)
SELECT * FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' 
AND tablename = 'notifications';

-- ============================================
-- RESULTADO ESPERADO
-- ============================================
-- Após executar esses comandos, a tabela notifications
-- estará configurada para realtime e qualquer INSERT,
-- UPDATE ou DELETE será transmitido automaticamente
-- para todos os clientes conectados via WebSocket.
-- ============================================
