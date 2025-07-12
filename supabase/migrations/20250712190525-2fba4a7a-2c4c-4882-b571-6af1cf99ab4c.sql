-- Habilitar realtime para a tabela connection_notifications
ALTER PUBLICATION supabase_realtime ADD TABLE connection_notifications;

-- Configurar REPLICA IDENTITY para connection_notifications
ALTER TABLE connection_notifications REPLICA IDENTITY FULL;

-- Habilitar realtime para a tabela direct_messages se já existir
ALTER PUBLICATION supabase_realtime ADD TABLE direct_messages;

-- Configurar REPLICA IDENTITY para direct_messages
ALTER TABLE direct_messages REPLICA IDENTITY FULL;