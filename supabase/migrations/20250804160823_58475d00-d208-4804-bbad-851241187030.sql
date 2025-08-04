-- Correção crítica de segurança: Adicionar RLS à view admin_analytics_overview
-- Esta view expõe dados analíticos sensíveis e precisa de proteção

-- Primeiro, habilitar RLS na view
ALTER VIEW public.admin_analytics_overview SET (security_barrier = true);

-- Criar política para restringir acesso apenas a administradores
CREATE POLICY "admin_analytics_overview_admin_only" 
ON public.admin_analytics_overview
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 
    FROM public.profiles p
    INNER JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = auth.uid() 
    AND ur.name = 'admin'
  )
);

-- Habilitar RLS na view (equivalente para views)
-- Como views não suportam ALTER TABLE ... ENABLE ROW LEVEL SECURITY,
-- vamos recriar a view como uma tabela com RLS ou usar função segura

-- Alternativa: Criar função segura para buscar analytics apenas para admins
CREATE OR REPLACE FUNCTION public.get_admin_analytics_overview_secure()
RETURNS TABLE(
  total_users bigint,
  active_users_24h bigint,
  new_users_30d bigint,
  total_solutions bigint,
  completed_implementations bigint,
  completion_rate numeric,
  avg_implementation_time_hours numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Verificar se é admin
  IF NOT EXISTS (
    SELECT 1 
    FROM public.profiles p
    INNER JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = auth.uid() 
    AND ur.name = 'admin'
  ) THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores podem ver analytics';
  END IF;

  -- Retornar dados da view original
  RETURN QUERY
  SELECT 
    aao.total_users,
    aao.active_users_24h,
    aao.new_users_30d,
    aao.total_solutions,
    aao.completed_implementations,
    aao.completion_rate,
    aao.avg_implementation_time_hours
  FROM public.admin_analytics_overview aao;
END;
$$;