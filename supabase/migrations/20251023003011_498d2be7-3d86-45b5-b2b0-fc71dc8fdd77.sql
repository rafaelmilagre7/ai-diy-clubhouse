-- ============================================
-- SQL COMPLETO: FASES 2, 3 e 4
-- ============================================
-- Habilitar Realtime em todas as tabelas necessárias

-- FASE 2: Presença (usa Presence API, não precisa de SQL)
-- Não requer alterações no banco

-- FASE 3: Chat Realtime
ALTER TABLE direct_messages REPLICA IDENTITY FULL;
ALTER TABLE conversations REPLICA IDENTITY FULL;

-- Verificar se já estão na publicação antes de adicionar
DO $$
BEGIN
  -- direct_messages
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'direct_messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE direct_messages;
  END IF;

  -- conversations
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'conversations'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
  END IF;
END $$;

-- FASE 4: Live Updates
-- Habilitar nas tabelas que existirem
DO $$
BEGIN
  -- profiles (útil para updates de avatar, status, etc)
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'profiles') THEN
    ALTER TABLE profiles REPLICA IDENTITY FULL;
    
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables 
      WHERE pubname = 'supabase_realtime' 
      AND tablename = 'profiles'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
    END IF;
  END IF;

  -- suggestions (se existir)
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'suggestions') THEN
    ALTER TABLE suggestions REPLICA IDENTITY FULL;
    
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables 
      WHERE pubname = 'supabase_realtime' 
      AND tablename = 'suggestions'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE suggestions;
    END IF;
  END IF;

  -- suggestion_votes (se existir)
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'suggestion_votes') THEN
    ALTER TABLE suggestion_votes REPLICA IDENTITY FULL;
    
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables 
      WHERE pubname = 'supabase_realtime' 
      AND tablename = 'suggestion_votes'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE suggestion_votes;
    END IF;
  END IF;
END $$;

-- Verificar todas as tabelas habilitadas
SELECT tablename, schemaname
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime'
ORDER BY tablename;