-- =====================================================
-- BUILDER - Sistema de Geração de Soluções com IA
-- =====================================================
-- 
-- INSTRUÇÕES DE INSTALAÇÃO:
-- Execute este SQL no SQL Editor do Supabase Dashboard
-- ou use: supabase migration new builder
--
-- =====================================================

-- 1. TABELA PRINCIPAL: ai_generated_solutions
CREATE TABLE IF NOT EXISTS public.ai_generated_solutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Input e Output da IA
  original_idea TEXT NOT NULL,
  short_description TEXT,
  
  -- Estruturas JSON detalhadas
  mind_map JSONB, -- Hierarquia do mapa mental
  required_tools JSONB, -- { "essential": [...], "optional": [...] }
  framework_mapping JSONB, -- { "quadrant1": {...}, "quadrant2": {...}, ... }
  implementation_checklist JSONB, -- [ { "step": "...", "completed": false, ... } ]
  
  -- Metadata da geração
  generation_model VARCHAR(50) DEFAULT 'google/gemini-2.5-pro',
  generation_time_ms INTEGER,
  prompt_tokens INTEGER,
  completion_tokens INTEGER,
  
  -- Estado e interação do usuário
  is_favorited BOOLEAN DEFAULT FALSE,
  implementation_status VARCHAR(20) DEFAULT 'not_started' CHECK (
    implementation_status IN ('not_started', 'in_progress', 'completed')
  ),
  completion_percentage INTEGER DEFAULT 0 CHECK (
    completion_percentage >= 0 AND completion_percentage <= 100
  ),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_builder_solutions_user ON ai_generated_solutions(user_id);
CREATE INDEX idx_builder_solutions_created ON ai_generated_solutions(created_at DESC);
CREATE INDEX idx_builder_solutions_status ON ai_generated_solutions(implementation_status);
CREATE INDEX idx_builder_solutions_favorited ON ai_generated_solutions(is_favorited) WHERE is_favorited = TRUE;

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_builder_solutions_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_builder_solutions_timestamp
BEFORE UPDATE ON ai_generated_solutions
FOR EACH ROW
EXECUTE FUNCTION update_builder_solutions_timestamp();

-- =====================================================

-- 2. TABELA DE CONTROLE DE USO: ai_solution_usage
CREATE TABLE IF NOT EXISTS public.ai_solution_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month_year VARCHAR(7) NOT NULL, -- formato: "2025-01"
  generations_count INTEGER DEFAULT 0 CHECK (generations_count >= 0),
  monthly_limit INTEGER DEFAULT 3 CHECK (monthly_limit > 0),
  last_generation_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, month_year)
);

-- Índice composto para busca rápida
CREATE INDEX idx_builder_usage_user_month ON ai_solution_usage(user_id, month_year);

-- =====================================================

-- 3. RLS POLICIES - ai_generated_solutions

ALTER TABLE ai_generated_solutions ENABLE ROW LEVEL SECURITY;

-- Usuários veem apenas suas próprias soluções
CREATE POLICY "Users view own solutions"
  ON ai_generated_solutions FOR SELECT
  USING (auth.uid() = user_id);

-- Usuários podem inserir suas próprias soluções
CREATE POLICY "Users insert own solutions"
  ON ai_generated_solutions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Usuários podem atualizar suas próprias soluções
CREATE POLICY "Users update own solutions"
  ON ai_generated_solutions FOR UPDATE
  USING (auth.uid() = user_id);

-- Usuários podem deletar suas próprias soluções
CREATE POLICY "Users delete own solutions"
  ON ai_generated_solutions FOR DELETE
  USING (auth.uid() = user_id);

-- Admins têm acesso total (SELECT, INSERT, UPDATE, DELETE)
CREATE POLICY "Admins full access solutions"
  ON ai_generated_solutions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      JOIN user_roles ur ON p.role_id = ur.id
      WHERE p.id = auth.uid() AND ur.name = 'admin'
    )
  );

-- =====================================================

-- 4. RLS POLICIES - ai_solution_usage

ALTER TABLE ai_solution_usage ENABLE ROW LEVEL SECURITY;

-- Usuários veem apenas seu próprio uso
CREATE POLICY "Users view own usage"
  ON ai_solution_usage FOR SELECT
  USING (auth.uid() = user_id);

-- =====================================================

-- 5. FUNÇÃO RPC: check_ai_solution_limit
CREATE OR REPLACE FUNCTION check_ai_solution_limit(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_month_year VARCHAR(7);
  v_usage_record RECORD;
  v_user_role VARCHAR(50);
  v_monthly_limit INTEGER;
  v_generations_count INTEGER;
BEGIN
  -- Obter mês atual no formato YYYY-MM
  v_month_year := TO_CHAR(NOW(), 'YYYY-MM');
  
  -- Obter role do usuário
  SELECT ur.name INTO v_user_role
  FROM profiles p
  JOIN user_roles ur ON p.role_id = ur.id
  WHERE p.id = p_user_id;
  
  -- Definir limite baseado no role
  IF v_user_role = 'admin' THEN
    v_monthly_limit := 999999; -- Ilimitado para admins
  ELSE
    -- Buscar limite customizado para o role (se existir na coluna permissions)
    SELECT COALESCE(
      (ur.permissions->>'builder_limit')::INTEGER,
      3 -- Default: 3 gerações por mês
    ) INTO v_monthly_limit
    FROM profiles p
    JOIN user_roles ur ON p.role_id = ur.id
    WHERE p.id = p_user_id;
  END IF;
  
  -- Buscar registro de uso do mês atual
  SELECT * INTO v_usage_record
  FROM ai_solution_usage
  WHERE user_id = p_user_id AND month_year = v_month_year;
  
  -- Se não existe registro, criar um novo
  IF NOT FOUND THEN
    INSERT INTO ai_solution_usage (user_id, month_year, generations_count, monthly_limit)
    VALUES (p_user_id, v_month_year, 0, v_monthly_limit)
    RETURNING * INTO v_usage_record;
  END IF;
  
  v_generations_count := COALESCE(v_usage_record.generations_count, 0);
  
  -- Retornar status em formato JSON
  RETURN jsonb_build_object(
    'can_generate', v_generations_count < v_monthly_limit,
    'generations_used', v_generations_count,
    'monthly_limit', v_monthly_limit,
    'remaining', v_monthly_limit - v_generations_count,
    'reset_date', TO_CHAR(DATE_TRUNC('month', NOW()) + INTERVAL '1 month', 'YYYY-MM-DD')
  );
END;
$$;

-- =====================================================

-- 6. FUNÇÃO RPC: increment_ai_solution_usage
CREATE OR REPLACE FUNCTION increment_ai_solution_usage(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_month_year VARCHAR(7);
BEGIN
  v_month_year := TO_CHAR(NOW(), 'YYYY-MM');
  
  -- Inserir ou atualizar registro de uso
  INSERT INTO ai_solution_usage (user_id, month_year, generations_count, last_generation_at)
  VALUES (p_user_id, v_month_year, 1, NOW())
  ON CONFLICT (user_id, month_year)
  DO UPDATE SET
    generations_count = ai_solution_usage.generations_count + 1,
    last_generation_at = NOW(),
    updated_at = NOW();
END;
$$;

-- =====================================================

-- 7. ADICIONAR FEATURE NO SISTEMA DE PERMISSÕES

-- Atualizar roles existentes para incluir o Builder
UPDATE user_roles
SET permissions = jsonb_set(
  COALESCE(permissions, '{}'::jsonb),
  '{builder}',
  'true'::jsonb
)
WHERE name IN ('admin', 'member');

-- Adicionar limite customizado (3 por mês para membros, ilimitado para admin)
UPDATE user_roles
SET permissions = jsonb_set(
  COALESCE(permissions, '{}'::jsonb),
  '{builder_limit}',
  '3'::jsonb
)
WHERE name = 'member';

UPDATE user_roles
SET permissions = jsonb_set(
  COALESCE(permissions, '{}'::jsonb),
  '{builder_limit}',
  '999999'::jsonb
)
WHERE name = 'admin';

-- =====================================================

-- 8. COMENTÁRIOS E DOCUMENTAÇÃO

COMMENT ON TABLE ai_generated_solutions IS 'Armazena as soluções de IA geradas pelo Builder';
COMMENT ON TABLE ai_solution_usage IS 'Controla o limite de uso mensal por usuário';
COMMENT ON COLUMN ai_generated_solutions.mind_map IS 'Estrutura hierárquica do mapa mental em JSON';
COMMENT ON COLUMN ai_generated_solutions.framework_mapping IS 'Mapeamento dos 4 quadrantes do framework';
COMMENT ON COLUMN ai_generated_solutions.implementation_checklist IS 'Lista de passos para implementação';
COMMENT ON FUNCTION check_ai_solution_limit IS 'Verifica se o usuário pode gerar nova solução baseado no limite mensal';
COMMENT ON FUNCTION increment_ai_solution_usage IS 'Incrementa o contador de uso mensal do usuário';

-- =====================================================

-- 9. VIEW AUXILIAR: builder_analytics (para admin)
CREATE OR REPLACE VIEW builder_analytics AS
SELECT
  DATE_TRUNC('day', created_at) AS date,
  COUNT(*) AS solutions_generated,
  COUNT(DISTINCT user_id) AS unique_users,
  AVG(generation_time_ms) AS avg_generation_time,
  COUNT(*) FILTER (WHERE implementation_status = 'completed') AS completed_solutions
FROM ai_generated_solutions
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY date DESC;

-- =====================================================
-- FIM DA MIGRATION
-- =====================================================
