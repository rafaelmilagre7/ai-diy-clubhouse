-- ================================================================
-- NETWORKING AI 2.0 - Database Schema
-- Sistema completo de networking inteligente com IA
-- ================================================================

-- ================================================================
-- TABELA: networking_profiles_v2
-- Perfis enriquecidos com contexto estratégico para IA
-- ================================================================
CREATE TABLE IF NOT EXISTS public.networking_profiles_v2 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Dados estratégicos coletados no onboarding
  value_proposition TEXT NOT NULL, -- "O que sua empresa faz de único?"
  looking_for TEXT[] NOT NULL DEFAULT ARRAY['customer', 'partner'], -- Tipos de conexão buscados
  main_challenge TEXT, -- Principal desafio atual
  keywords TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[], -- 3 palavras-chave profissionais
  
  -- Análise da IA
  ai_persona JSONB NOT NULL DEFAULT '{}'::JSONB, -- Persona gerada pela IA
  match_compatibility_vector JSONB DEFAULT '{}'::JSONB, -- Vetor de compatibilidade
  networking_score INTEGER DEFAULT 0 CHECK (networking_score >= 0 AND networking_score <= 100),
  
  -- Metadados
  profile_completed_at TIMESTAMP WITH TIME ZONE,
  last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(user_id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_networking_profiles_v2_user_id ON public.networking_profiles_v2(user_id);
CREATE INDEX IF NOT EXISTS idx_networking_profiles_v2_keywords ON public.networking_profiles_v2 USING GIN(keywords);
CREATE INDEX IF NOT EXISTS idx_networking_profiles_v2_looking_for ON public.networking_profiles_v2 USING GIN(looking_for);
CREATE INDEX IF NOT EXISTS idx_networking_profiles_v2_score ON public.networking_profiles_v2(networking_score DESC);

-- RLS Policies
ALTER TABLE public.networking_profiles_v2 ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own networking profile"
  ON public.networking_profiles_v2 FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own networking profile"
  ON public.networking_profiles_v2 FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own networking profile"
  ON public.networking_profiles_v2 FOR UPDATE
  USING (auth.uid() = user_id);

-- ================================================================
-- TABELA: strategic_matches_v2
-- Matches gerados pela IA com análise contextual profunda
-- ================================================================
CREATE TABLE IF NOT EXISTS public.strategic_matches_v2 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  matched_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Score e tipo
  compatibility_score INTEGER NOT NULL CHECK (compatibility_score >= 0 AND compatibility_score <= 100),
  match_type TEXT NOT NULL CHECK (match_type IN ('commercial_opportunity', 'strategic_partnership', 'knowledge_exchange', 'supplier', 'investor')),
  
  -- Insights da IA
  why_connect TEXT NOT NULL, -- Razão estratégica para conectar
  ice_breaker TEXT NOT NULL, -- Mensagem inicial sugerida
  opportunities TEXT[] DEFAULT ARRAY[]::TEXT[], -- Lista de oportunidades identificadas
  ai_analysis JSONB DEFAULT '{}'::JSONB, -- Análise completa da IA
  
  -- Status e interação
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'expired')),
  viewed_at TIMESTAMP WITH TIME ZONE,
  responded_at TIMESTAMP WITH TIME ZONE,
  message_sent TEXT, -- Mensagem que foi enviada (se foi customizada)
  
  -- Metadados
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days'),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(user_id, matched_user_id),
  CHECK (user_id != matched_user_id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_strategic_matches_v2_user_id ON public.strategic_matches_v2(user_id);
CREATE INDEX IF NOT EXISTS idx_strategic_matches_v2_matched_user_id ON public.strategic_matches_v2(matched_user_id);
CREATE INDEX IF NOT EXISTS idx_strategic_matches_v2_status ON public.strategic_matches_v2(status);
CREATE INDEX IF NOT EXISTS idx_strategic_matches_v2_score ON public.strategic_matches_v2(compatibility_score DESC);
CREATE INDEX IF NOT EXISTS idx_strategic_matches_v2_type ON public.strategic_matches_v2(match_type);
CREATE INDEX IF NOT EXISTS idx_strategic_matches_v2_created_at ON public.strategic_matches_v2(created_at DESC);

-- RLS Policies
ALTER TABLE public.strategic_matches_v2 ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their matches"
  ON public.strategic_matches_v2 FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their matches"
  ON public.strategic_matches_v2 FOR UPDATE
  USING (auth.uid() = user_id);

-- ================================================================
-- TABELA: connection_interactions
-- Histórico de interações para métricas executivas
-- ================================================================
CREATE TABLE IF NOT EXISTS public.connection_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id UUID REFERENCES public.member_connections(id) ON DELETE CASCADE,
  match_id UUID REFERENCES public.strategic_matches_v2(id) ON DELETE SET NULL,
  
  -- Tipo de interação
  interaction_type TEXT NOT NULL CHECK (interaction_type IN (
    'match_viewed',
    'match_accepted', 
    'match_rejected',
    'message_sent',
    'contact_requested',
    'meeting_scheduled',
    'meeting_completed',
    'deal_opportunity',
    'deal_closed'
  )),
  
  -- Dados da interação
  interaction_value JSONB DEFAULT '{}'::JSONB, -- Detalhes específicos
  estimated_value NUMERIC, -- Valor estimado da oportunidade (em reais)
  
  -- Metadados
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_connection_interactions_connection_id ON public.connection_interactions(connection_id);
CREATE INDEX IF NOT EXISTS idx_connection_interactions_match_id ON public.connection_interactions(match_id);
CREATE INDEX IF NOT EXISTS idx_connection_interactions_type ON public.connection_interactions(interaction_type);
CREATE INDEX IF NOT EXISTS idx_connection_interactions_created_at ON public.connection_interactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_connection_interactions_created_by ON public.connection_interactions(created_by);

-- RLS Policies
ALTER TABLE public.connection_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own interactions"
  ON public.connection_interactions FOR SELECT
  USING (
    auth.uid() = created_by OR
    connection_id IN (
      SELECT id FROM public.member_connections 
      WHERE requester_id = auth.uid() OR recipient_id = auth.uid()
    )
  );

CREATE POLICY "Users can create interactions"
  ON public.connection_interactions FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- ================================================================
-- TRIGGER: Atualizar timestamp em strategic_matches_v2
-- ================================================================
CREATE OR REPLACE FUNCTION update_strategic_matches_v2_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_strategic_matches_v2_timestamp
  BEFORE UPDATE ON public.strategic_matches_v2
  FOR EACH ROW
  EXECUTE FUNCTION update_strategic_matches_v2_timestamp();

-- ================================================================
-- TRIGGER: Log de interação ao aceitar match
-- ================================================================
CREATE OR REPLACE FUNCTION log_match_acceptance()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'accepted' AND OLD.status = 'pending' THEN
    INSERT INTO public.connection_interactions (
      match_id,
      interaction_type,
      created_by,
      interaction_value
    ) VALUES (
      NEW.id,
      'match_accepted',
      auth.uid(),
      jsonb_build_object(
        'compatibility_score', NEW.compatibility_score,
        'match_type', NEW.match_type
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_log_match_acceptance
  AFTER UPDATE ON public.strategic_matches_v2
  FOR EACH ROW
  WHEN (NEW.status = 'accepted' AND OLD.status = 'pending')
  EXECUTE FUNCTION log_match_acceptance();

-- ================================================================
-- COMENTÁRIOS
-- ================================================================
COMMENT ON TABLE public.networking_profiles_v2 IS 'Perfis enriquecidos com contexto estratégico para matching de IA';
COMMENT ON TABLE public.strategic_matches_v2 IS 'Matches gerados pela IA com análise contextual e insights';
COMMENT ON TABLE public.connection_interactions IS 'Histórico de interações para métricas executivas e ROI';

COMMENT ON COLUMN public.networking_profiles_v2.value_proposition IS 'Proposta de valor única da empresa em uma frase';
COMMENT ON COLUMN public.networking_profiles_v2.ai_persona IS 'Persona gerada pela IA com análise do perfil profissional';
COMMENT ON COLUMN public.strategic_matches_v2.why_connect IS 'Insight da IA sobre por que essa conexão é estratégica';
COMMENT ON COLUMN public.strategic_matches_v2.ice_breaker IS 'Mensagem inicial sugerida pela IA para facilitar conexão';
COMMENT ON COLUMN public.connection_interactions.estimated_value IS 'Valor estimado da oportunidade de negócio em reais';