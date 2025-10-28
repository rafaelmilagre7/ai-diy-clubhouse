-- ============================================================================
-- MIGRATION: Habilitar Realtime para tabela profiles
-- Necessário para notificações em tempo real quando roles são alterados
-- ============================================================================

-- Verificar se a publicação já existe e adicionar a tabela profiles
DO $$ 
BEGIN
  -- Tentar adicionar a tabela profiles à publicação realtime
  -- Se a publicação não existir, será criada pelo Supabase automaticamente
  ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
EXCEPTION 
  WHEN duplicate_object THEN 
    -- Tabela já está na publicação, ignorar
    RAISE NOTICE 'Tabela profiles já está na publicação realtime';
  WHEN undefined_object THEN
    -- Publicação não existe, será criada automaticamente pelo Supabase
    RAISE NOTICE 'Publicação supabase_realtime será criada automaticamente';
END $$;