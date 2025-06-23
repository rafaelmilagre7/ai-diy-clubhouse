
-- Drop da função existente antes de recriar
DROP FUNCTION IF EXISTS public.calculate_user_health_score(UUID);

-- Drop da tabela se existir para recriar completamente
DROP TABLE IF EXISTS public.user_health_metrics CASCADE;

-- Criar tabela para métricas de saúde dos usuários
CREATE TABLE public.user_health_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  health_score INTEGER NOT NULL DEFAULT 0 CHECK (health_score >= 0 AND health_score <= 100),
  engagement_score INTEGER NOT NULL DEFAULT 0 CHECK (engagement_score >= 0 AND engagement_score <= 100),
  progress_score INTEGER NOT NULL DEFAULT 0 CHECK (progress_score >= 0 AND progress_score <= 100),
  activity_score INTEGER NOT NULL DEFAULT 0 CHECK (activity_score >= 0 AND activity_score <= 100),
  last_calculated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Habilitar RLS
ALTER TABLE public.user_health_metrics ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Admins can view all health metrics" ON public.user_health_metrics
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Users can view their own health metrics" ON public.user_health_metrics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage health metrics" ON public.user_health_metrics
  FOR ALL USING (public.is_admin());

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_user_health_metrics_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
CREATE TRIGGER update_user_health_metrics_updated_at
  BEFORE UPDATE ON public.user_health_metrics
  FOR EACH ROW
  EXECUTE FUNCTION update_user_health_metrics_updated_at();

-- Função para calcular score de saúde baseado em dados reais
CREATE OR REPLACE FUNCTION calculate_user_health_score(target_user_id UUID DEFAULT NULL)
RETURNS TABLE(
  user_id UUID,
  health_score INTEGER,
  engagement_score INTEGER,
  progress_score INTEGER,
  activity_score INTEGER
) AS $$
DECLARE
  user_record RECORD;
  total_solutions INTEGER := 0;
  completed_solutions INTEGER := 0;
  recent_activity_days INTEGER := 0;
  forum_activity INTEGER := 0;
  learning_progress INTEGER := 0;
  calculated_progress_score INTEGER := 0;
  calculated_engagement_score INTEGER := 0;
  calculated_activity_score INTEGER := 0;
  calculated_health_score INTEGER := 0;
BEGIN
  FOR user_record IN 
    SELECT p.id as uid
    FROM public.profiles p
    WHERE (target_user_id IS NULL OR p.id = target_user_id)
  LOOP
    -- Reset variables for each user
    total_solutions := 0;
    completed_solutions := 0;
    recent_activity_days := 0;
    forum_activity := 0;
    learning_progress := 0;

    -- Calcular progresso em soluções
    SELECT COUNT(*) INTO total_solutions
    FROM public.progress pr
    WHERE pr.user_id = user_record.uid;
    
    SELECT COUNT(*) INTO completed_solutions
    FROM public.progress pr
    WHERE pr.user_id = user_record.uid AND pr.is_completed = true;
    
    -- Calcular atividade recente (últimos 30 dias)
    SELECT COUNT(DISTINCT DATE(created_at)) INTO recent_activity_days
    FROM public.analytics a
    WHERE a.user_id = user_record.uid 
    AND a.created_at > (now() - INTERVAL '30 days');
    
    -- Calcular atividade no fórum
    SELECT COUNT(*) INTO forum_activity
    FROM public.forum_posts fp
    WHERE fp.user_id = user_record.uid
    AND fp.created_at > (now() - INTERVAL '30 days');
    
    -- Calcular progresso em aprendizado
    SELECT COUNT(*) INTO learning_progress
    FROM public.learning_progress lp
    WHERE lp.user_id = user_record.uid
    AND lp.completed_at IS NOT NULL;
    
    -- Calcular scores (0-100)
    calculated_progress_score := CASE 
      WHEN total_solutions = 0 THEN 0
      ELSE LEAST(100, (completed_solutions * 100 / total_solutions))
    END;
    
    calculated_engagement_score := LEAST(100, forum_activity * 10 + learning_progress * 5);
    
    calculated_activity_score := LEAST(100, recent_activity_days * 3);
    
    -- Score geral (média ponderada)
    calculated_health_score := (
      calculated_progress_score * 0.4 + 
      calculated_engagement_score * 0.3 + 
      calculated_activity_score * 0.3
    )::INTEGER;
    
    -- Inserir ou atualizar métricas
    INSERT INTO public.user_health_metrics (
      user_id, health_score, engagement_score, progress_score, activity_score, last_calculated_at
    ) VALUES (
      user_record.uid, calculated_health_score, calculated_engagement_score, 
      calculated_progress_score, calculated_activity_score, now()
    )
    ON CONFLICT (user_id) DO UPDATE SET
      health_score = EXCLUDED.health_score,
      engagement_score = EXCLUDED.engagement_score,
      progress_score = EXCLUDED.progress_score,
      activity_score = EXCLUDED.activity_score,
      last_calculated_at = EXCLUDED.last_calculated_at,
      updated_at = now();
    
    -- Retornar dados calculados
    user_id := user_record.uid;
    health_score := calculated_health_score;
    engagement_score := calculated_engagement_score;
    progress_score := calculated_progress_score;
    activity_score := calculated_activity_score;
    
    RETURN NEXT;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar índices para performance
CREATE INDEX idx_user_health_metrics_user_id ON public.user_health_metrics(user_id);
CREATE INDEX idx_user_health_metrics_health_score ON public.user_health_metrics(health_score);
CREATE INDEX idx_user_health_metrics_last_calculated ON public.user_health_metrics(last_calculated_at);
