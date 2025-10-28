
-- Função para incrementar o contador de cliques em benefícios
CREATE OR REPLACE FUNCTION public.increment_benefit_clicks(tool_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  UPDATE public.tools
  SET benefit_clicks = COALESCE(benefit_clicks, 0) + 1
  WHERE id = tool_id;
END;
$$;
