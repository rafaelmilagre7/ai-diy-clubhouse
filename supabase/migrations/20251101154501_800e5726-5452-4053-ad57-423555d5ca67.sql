-- ============================================
-- MIGRATION: ATIVAR FUNCIONALIDADE DESCOBRIR
-- ============================================
-- Cria view, índices e rate limiting para networking

-- 1. CRIAR VIEW OTIMIZADA DE PERFIS DISPONÍVEIS
CREATE OR REPLACE VIEW public.available_profiles_for_connection 
WITH (security_invoker=true)
AS
SELECT DISTINCT
  p.id,
  p.name,
  p.email,
  p.avatar_url,
  p.company_name,
  p.current_position,
  p.industry,
  p.created_at
FROM public.profiles p
WHERE p.name IS NOT NULL
  AND p.id != auth.uid()
  AND p.id NOT IN (
    -- Excluir conexões já estabelecidas
    SELECT CASE 
      WHEN requester_id = auth.uid() THEN recipient_id
      WHEN recipient_id = auth.uid() THEN requester_id
    END as connected_id
    FROM public.member_connections
    WHERE (requester_id = auth.uid() OR recipient_id = auth.uid())
      AND status IN ('accepted', 'pending')
  );

-- 2. CRIAR ÍNDICES COMPOSTOS PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_member_connections_requester_status 
  ON public.member_connections(requester_id, status);

CREATE INDEX IF NOT EXISTS idx_member_connections_recipient_status 
  ON public.member_connections(recipient_id, status);

CREATE INDEX IF NOT EXISTS idx_member_connections_both_users 
  ON public.member_connections(requester_id, recipient_id);

CREATE INDEX IF NOT EXISTS idx_profiles_name_not_null 
  ON public.profiles(id) WHERE name IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_industry 
  ON public.profiles(industry) WHERE industry IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_company 
  ON public.profiles(company_name) WHERE company_name IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_position 
  ON public.profiles(current_position) WHERE current_position IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_created_at 
  ON public.profiles(created_at DESC);

-- 3. CRIAR TABELA DE RATE LIMITING
CREATE TABLE IF NOT EXISTS public.user_action_rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type text NOT NULL,
  action_count integer DEFAULT 0,
  window_start timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, action_type, window_start)
);

-- 4. CRIAR FUNÇÃO DE RATE LIMITING
CREATE OR REPLACE FUNCTION public.check_connection_request_rate_limit(
  p_user_id uuid,
  p_max_requests integer DEFAULT 10,
  p_window_hours integer DEFAULT 1
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_current_count integer;
  v_window_start timestamptz;
BEGIN
  v_window_start := now() - (p_window_hours || ' hours')::interval;
  
  -- Limpar janelas antigas
  DELETE FROM public.user_action_rate_limits
  WHERE user_id = p_user_id
    AND action_type = 'connection_request'
    AND window_start < v_window_start;
  
  -- Contar ações na janela atual
  SELECT COALESCE(SUM(action_count), 0)
  INTO v_current_count
  FROM public.user_action_rate_limits
  WHERE user_id = p_user_id
    AND action_type = 'connection_request'
    AND window_start >= v_window_start;
  
  -- Verificar se excedeu o limite
  IF v_current_count >= p_max_requests THEN
    RETURN false;
  END IF;
  
  -- Incrementar contador
  INSERT INTO public.user_action_rate_limits (user_id, action_type, action_count, window_start)
  VALUES (p_user_id, 'connection_request', 1, date_trunc('hour', now()))
  ON CONFLICT (user_id, action_type, window_start)
  DO UPDATE SET
    action_count = user_action_rate_limits.action_count + 1,
    updated_at = now();
  
  RETURN true;
END;
$$;

-- 5. HABILITAR RLS NA TABELA DE RATE LIMITING
ALTER TABLE public.user_action_rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own rate limits"
  ON public.user_action_rate_limits
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can manage rate limits"
  ON public.user_action_rate_limits
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- 6. COMENTÁRIOS PARA DOCUMENTAÇÃO
COMMENT ON VIEW public.available_profiles_for_connection IS 
  'View otimizada que retorna perfis disponíveis para conexão, excluindo o próprio usuário e conexões já estabelecidas/pendentes';

COMMENT ON FUNCTION public.check_connection_request_rate_limit IS 
  'Verifica e aplica rate limiting de 10 solicitações de conexão por hora por usuário';