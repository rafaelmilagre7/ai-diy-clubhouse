-- Tabela para armazenar recomendações de conteúdo educacional por solução
CREATE TABLE IF NOT EXISTS solution_learning_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  solution_id UUID NOT NULL REFERENCES ai_generated_solutions(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES learning_lessons(id) ON DELETE CASCADE,
  relevance_score INTEGER NOT NULL CHECK (relevance_score >= 0 AND relevance_score <= 100),
  justification TEXT NOT NULL,
  key_topics JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(solution_id, lesson_id)
);

-- Index para melhorar performance de queries
CREATE INDEX idx_solution_learning_recs_solution ON solution_learning_recommendations(solution_id);
CREATE INDEX idx_solution_learning_recs_score ON solution_learning_recommendations(solution_id, relevance_score DESC);

-- RLS Policies
ALTER TABLE solution_learning_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view recommendations for their solutions"
  ON solution_learning_recommendations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM ai_generated_solutions
      WHERE ai_generated_solutions.id = solution_learning_recommendations.solution_id
      AND ai_generated_solutions.user_id = auth.uid()
    )
  );

CREATE POLICY "Service role can manage all recommendations"
  ON solution_learning_recommendations FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');