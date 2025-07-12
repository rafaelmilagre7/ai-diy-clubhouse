-- Habilitar realtime para todas as tabelas relevantes
ALTER TABLE network_matches REPLICA IDENTITY FULL;
ALTER TABLE member_connections REPLICA IDENTITY FULL;
ALTER TABLE connection_notifications REPLICA IDENTITY FULL;
ALTER TABLE direct_messages REPLICA IDENTITY FULL;

-- Adicionar tabelas à publicação do realtime
ALTER publication supabase_realtime ADD TABLE network_matches;
ALTER publication supabase_realtime ADD TABLE member_connections;
ALTER publication supabase_realtime ADD TABLE connection_notifications;
ALTER publication supabase_realtime ADD TABLE direct_messages;