-- Fase 4: Analytics - Criar tabela de logs de networking
CREATE TABLE IF NOT EXISTS networking_match_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('generated', 'viewed', 'connected', 'rejected')),
  matches_count INTEGER,
  processing_time_ms INTEGER,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_networking_match_logs_user_id ON networking_match_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_networking_match_logs_action ON networking_match_logs(action);
CREATE INDEX IF NOT EXISTS idx_networking_match_logs_created_at ON networking_match_logs(created_at DESC);

-- RLS policies
ALTER TABLE networking_match_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own match logs"
  ON networking_match_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert match logs"
  ON networking_match_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id OR auth.role() = 'service_role');

-- Fase 3: Automatização - Adicionar campo last_match_generation
ALTER TABLE networking_profiles_v2 
  ADD COLUMN IF NOT EXISTS last_match_generation TIMESTAMPTZ;

-- Criar função para disparar regeneração de matches
CREATE OR REPLACE FUNCTION queue_match_regeneration()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Apenas se mudou há mais de 7 dias
  IF (NEW.last_updated_at - OLD.last_updated_at > INTERVAL '7 days') THEN
    -- Log da regeneração
    RAISE NOTICE '[TRIGGER] Agendando regeneração de matches para usuário: %', NEW.user_id;
    
    -- Nota: O trigger só registra, a edge function cron-regenerate-matches
    -- será responsável por processar os perfis que precisam de regeneração
  END IF;
  
  RETURN NEW;
END;
$$;

-- Criar trigger de atualização
DROP TRIGGER IF EXISTS regenerate_matches_on_profile_update ON networking_profiles_v2;
CREATE TRIGGER regenerate_matches_on_profile_update
  AFTER UPDATE OF last_updated_at ON networking_profiles_v2
  FOR EACH ROW
  WHEN (NEW.last_updated_at IS DISTINCT FROM OLD.last_updated_at)
  EXECUTE FUNCTION queue_match_regeneration();

COMMENT ON TABLE networking_match_logs IS 'Registra todos os eventos de networking para analytics';
COMMENT ON COLUMN networking_profiles_v2.last_match_generation IS 'Timestamp da última geração de matches para este perfil';