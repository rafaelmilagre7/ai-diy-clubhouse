
-- Remover função calculate_user_health_score e tabela user_health_metrics
DROP FUNCTION IF EXISTS public.calculate_user_health_score(UUID);
DROP TABLE IF EXISTS public.user_health_metrics CASCADE;

-- Remover função simple_health_check se existir (usada no useSupabaseHealthCheck.ts)
DROP FUNCTION IF EXISTS public.simple_health_check();

-- Criar função simple_health_check básica para compatibilidade (apenas retorna true)
CREATE OR REPLACE FUNCTION public.simple_health_check()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT true;
$$;
