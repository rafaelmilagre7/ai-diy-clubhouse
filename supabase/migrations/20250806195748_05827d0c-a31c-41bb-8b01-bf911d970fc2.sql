-- Função para calcular compatibilidade de negócio baseada no onboarding
CREATE OR REPLACE FUNCTION public.calculate_business_compatibility(user1_id uuid, user2_id uuid)
RETURNS numeric
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  user1_data record;
  user2_data record;
  compatibility_score numeric := 0.0;
  segment_bonus numeric := 0.0;
  ai_level_bonus numeric := 0.0;
  goal_bonus numeric := 0.0;
  company_size_bonus numeric := 0.0;
BEGIN
  -- Buscar dados do onboarding dos usuários
  SELECT 
    qo.company_segment,
    qo.ai_level,
    qo.main_goal,
    qo.company_size,
    p.company_name,
    p.industry
  INTO user1_data
  FROM public.quick_onboarding qo
  LEFT JOIN public.profiles p ON p.id = qo.user_id
  WHERE qo.user_id = user1_id AND qo.is_completed = true;
  
  SELECT 
    qo.company_segment,
    qo.ai_level,
    qo.main_goal,
    qo.company_size,
    p.company_name,
    p.industry
  INTO user2_data
  FROM public.quick_onboarding qo
  LEFT JOIN public.profiles p ON p.id = qo.user_id
  WHERE qo.user_id = user2_id AND qo.is_completed = true;
  
  -- Se não há dados de onboarding, retornar score baixo
  IF user1_data IS NULL OR user2_data IS NULL THEN
    RETURN 0.3;
  END IF;
  
  -- Compatibilidade por segmento (segmentos complementares ganham mais pontos)
  IF user1_data.company_segment = user2_data.company_segment THEN
    segment_bonus := 0.2; -- Mesmo segmento
  ELSIF (
    (user1_data.company_segment = 'ecommerce' AND user2_data.company_segment = 'logistica') OR
    (user1_data.company_segment = 'logistica' AND user2_data.company_segment = 'ecommerce') OR
    (user1_data.company_segment = 'financeiro' AND user2_data.company_segment = 'contabilidade') OR
    (user1_data.company_segment = 'contabilidade' AND user2_data.company_segment = 'financeiro') OR
    (user1_data.company_segment = 'marketing' AND user2_data.company_segment = 'vendas') OR
    (user1_data.company_segment = 'vendas' AND user2_data.company_segment = 'marketing')
  ) THEN
    segment_bonus := 0.35; -- Segmentos complementares
  ELSE
    segment_bonus := 0.1; -- Segmentos diferentes
  END IF;
  
  -- Compatibilidade por nível de IA (mentor/pupilo recebe bonus)
  IF user1_data.ai_level = user2_data.ai_level THEN
    ai_level_bonus := 0.15; -- Mesmo nível
  ELSIF (
    (user1_data.ai_level = 'beginner' AND user2_data.ai_level = 'advanced') OR
    (user1_data.ai_level = 'advanced' AND user2_data.ai_level = 'beginner') OR
    (user1_data.ai_level = 'intermediate' AND user2_data.ai_level = 'advanced') OR
    (user1_data.ai_level = 'advanced' AND user2_data.ai_level = 'intermediate')
  ) THEN
    ai_level_bonus := 0.25; -- Mentor/Pupilo
  ELSE
    ai_level_bonus := 0.1;
  END IF;
  
  -- Compatibilidade por objetivo principal
  IF user1_data.main_goal = user2_data.main_goal THEN
    goal_bonus := 0.2; -- Mesmo objetivo
  ELSIF (
    (user1_data.main_goal = 'process_automation' AND user2_data.main_goal = 'efficiency_improvement') OR
    (user1_data.main_goal = 'efficiency_improvement' AND user2_data.main_goal = 'process_automation') OR
    (user1_data.main_goal = 'cost_reduction' AND user2_data.main_goal = 'efficiency_improvement') OR
    (user1_data.main_goal = 'efficiency_improvement' AND user2_data.main_goal = 'cost_reduction')
  ) THEN
    goal_bonus := 0.15; -- Objetivos complementares
  ELSE
    goal_bonus := 0.05;
  END IF;
  
  -- Compatibilidade por tamanho da empresa
  IF user1_data.company_size = user2_data.company_size THEN
    company_size_bonus := 0.1; -- Mesmo tamanho
  ELSIF (
    (user1_data.company_size = 'startup' AND user2_data.company_size IN ('pequena', 'media')) OR
    (user2_data.company_size = 'startup' AND user1_data.company_size IN ('pequena', 'media')) OR
    (user1_data.company_size = 'pequena' AND user2_data.company_size = 'media') OR
    (user1_data.company_size = 'media' AND user2_data.company_size = 'pequena')
  ) THEN
    company_size_bonus := 0.15; -- Tamanhos complementares
  ELSE
    company_size_bonus := 0.05;
  END IF;
  
  -- Calcular score final
  compatibility_score := 0.3 + segment_bonus + ai_level_bonus + goal_bonus + company_size_bonus;
  
  -- Garantir que não exceda 1.0
  IF compatibility_score > 1.0 THEN
    compatibility_score := 1.0;
  END IF;
  
  RETURN compatibility_score;
END;
$$;

-- Função para gerar matches inteligentes baseados no onboarding
CREATE OR REPLACE FUNCTION public.generate_smart_networking_matches(target_user_id uuid, max_matches integer DEFAULT 10)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  target_user_data record;
  potential_match record;
  compatibility_score numeric;
  match_reason text;
  ai_analysis jsonb;
  matches_created integer := 0;
  current_month text;
BEGIN
  current_month := to_char(now(), 'YYYY-MM');
  
  -- Buscar dados do usuário alvo
  SELECT 
    qo.company_segment,
    qo.ai_level,
    qo.main_goal,
    qo.company_size,
    p.name,
    p.company_name,
    p.industry
  INTO target_user_data
  FROM public.quick_onboarding qo
  LEFT JOIN public.profiles p ON p.id = qo.user_id
  WHERE qo.user_id = target_user_id AND qo.is_completed = true;
  
  IF target_user_data IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Dados de onboarding não encontrados');
  END IF;
  
  -- Buscar usuários compatíveis
  FOR potential_match IN
    SELECT DISTINCT
      p.id,
      p.name,
      p.company_name,
      p.industry,
      qo.company_segment,
      qo.ai_level,
      qo.main_goal,
      qo.company_size
    FROM public.profiles p
    INNER JOIN public.quick_onboarding qo ON qo.user_id = p.id
    WHERE p.id != target_user_id
      AND qo.is_completed = true
      AND p.name IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM public.network_matches nm
        WHERE nm.user_id = target_user_id 
        AND nm.matched_user_id = p.id
        AND nm.month_year = current_month
      )
    ORDER BY random()
    LIMIT max_matches * 3 -- Buscar mais para filtrar os melhores
  LOOP
    -- Calcular compatibilidade
    compatibility_score := public.calculate_business_compatibility(target_user_id, potential_match.id);
    
    -- Só criar match se score for alto o suficiente
    IF compatibility_score >= 0.6 AND matches_created < max_matches THEN
      -- Determinar tipo de match e razão
      IF target_user_data.company_segment = potential_match.company_segment THEN
        match_reason := format('Ambos atuam no segmento %s e podem trocar experiências específicas do setor', target_user_data.company_segment);
      ELSIF (
        (target_user_data.company_segment = 'ecommerce' AND potential_match.company_segment = 'logistica') OR
        (target_user_data.company_segment = 'logistica' AND potential_match.company_segment = 'ecommerce')
      ) THEN
        match_reason := 'Segmentos complementares: E-commerce e Logística podem formar uma parceria estratégica';
      ELSIF target_user_data.main_goal = potential_match.main_goal THEN
        match_reason := format('Objetivos alinhados em %s - podem colaborar e trocar estratégias', target_user_data.main_goal);
      ELSE
        match_reason := 'Perfis complementares que podem agregar valor mútuo aos negócios';
      END IF;
      
      -- Gerar análise de IA
      ai_analysis := jsonb_build_object(
        'strengths', ARRAY[
          'Compatibilidade de negócio alta',
          format('Segmentos: %s ↔ %s', target_user_data.company_segment, potential_match.company_segment),
          format('Níveis de IA: %s ↔ %s', target_user_data.ai_level, potential_match.ai_level)
        ],
        'opportunities', ARRAY[
          'Troca de experiências em automação',
          'Potencial para parcerias comerciais',
          'Compartilhamento de soluções de IA'
        ],
        'recommended_approach', CASE
          WHEN target_user_data.ai_level = 'beginner' AND potential_match.ai_level = 'advanced' THEN
            'Procure orientação sobre implementação de IA. Pergunte sobre primeiros passos e cases de sucesso.'
          WHEN target_user_data.ai_level = 'advanced' AND potential_match.ai_level = 'beginner' THEN
            'Ofereça mentoria em IA. Compartilhe sua experiência e casos práticos de implementação.'
          ELSE
            'Inicie a conversa compartilhando um desafio específico do seu negócio e pergunte sobre soluções similares.'
        END
      );
      
      -- Criar o match
      INSERT INTO public.network_matches (
        user_id,
        matched_user_id,
        match_type,
        compatibility_score,
        match_reason,
        ai_analysis,
        month_year,
        status
      ) VALUES (
        target_user_id,
        potential_match.id,
        CASE
          WHEN target_user_data.company_segment = potential_match.company_segment THEN 'same_segment'
          WHEN target_user_data.main_goal = potential_match.main_goal THEN 'same_goal'
          ELSE 'complementary'
        END,
        compatibility_score,
        match_reason,
        ai_analysis,
        current_month,
        'pending'
      );
      
      matches_created := matches_created + 1;
    END IF;
  END LOOP;
  
  RETURN jsonb_build_object(
    'success', true,
    'matches_created', matches_created,
    'user_profile', jsonb_build_object(
      'name', target_user_data.name,
      'company', target_user_data.company_name,
      'segment', target_user_data.company_segment,
      'ai_level', target_user_data.ai_level,
      'goal', target_user_data.main_goal
    )
  );
END;
$$;

-- Função para atualizar métricas de networking
CREATE OR REPLACE FUNCTION public.update_networking_metrics(target_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  current_month text;
  pending_matches integer;
  accepted_connections integer;
  total_conversations integer;
  result jsonb;
BEGIN
  current_month := to_char(now(), 'YYYY-MM');
  
  -- Contar matches pendentes
  SELECT COUNT(*) INTO pending_matches
  FROM public.network_matches
  WHERE user_id = target_user_id AND status = 'pending';
  
  -- Contar conexões aceitas
  SELECT COUNT(*) INTO accepted_connections
  FROM public.member_connections
  WHERE (requester_id = target_user_id OR recipient_id = target_user_id)
  AND status = 'accepted';
  
  -- Contar conversas ativas
  SELECT COUNT(*) INTO total_conversations
  FROM public.conversations
  WHERE participant_1_id = target_user_id OR participant_2_id = target_user_id;
  
  -- Atualizar ou inserir métricas
  INSERT INTO public.networking_metrics (
    user_id,
    metric_month,
    total_matches,
    pending_matches,
    accepted_connections,
    messages_sent,
    profile_views,
    updated_at
  ) VALUES (
    target_user_id,
    current_month,
    pending_matches,
    pending_matches,
    accepted_connections,
    total_conversations,
    0,
    now()
  )
  ON CONFLICT (user_id, metric_month) 
  DO UPDATE SET
    total_matches = pending_matches,
    pending_matches = EXCLUDED.pending_matches,
    accepted_connections = EXCLUDED.accepted_connections,
    messages_sent = EXCLUDED.messages_sent,
    updated_at = now();
  
  result := jsonb_build_object(
    'success', true,
    'user_id', target_user_id,
    'month', current_month,
    'metrics', jsonb_build_object(
      'pending_matches', pending_matches,
      'accepted_connections', accepted_connections,
      'total_conversations', total_conversations
    )
  );
  
  RETURN result;
END;
$$;

-- Índices para otimizar performance do networking
CREATE INDEX IF NOT EXISTS idx_network_matches_user_month 
ON public.network_matches(user_id, month_year);

CREATE INDEX IF NOT EXISTS idx_network_matches_compatibility 
ON public.network_matches(compatibility_score DESC);

CREATE INDEX IF NOT EXISTS idx_quick_onboarding_completed 
ON public.quick_onboarding(user_id, is_completed) 
WHERE is_completed = true;

CREATE INDEX IF NOT EXISTS idx_member_connections_participants 
ON public.member_connections(requester_id, recipient_id, status);

-- Corrigir estrutura da tabela networking_metrics se necessário
DO $$
BEGIN
  -- Verificar se a coluna metric_month existe, senão criar
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'networking_metrics' 
    AND column_name = 'metric_month'
  ) THEN
    ALTER TABLE public.networking_metrics ADD COLUMN metric_month text;
  END IF;
  
  -- Criar índice único se não existir
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'networking_metrics_user_month_unique'
  ) THEN
    ALTER TABLE public.networking_metrics 
    ADD CONSTRAINT networking_metrics_user_month_unique 
    UNIQUE (user_id, metric_month);
  END IF;
END
$$;