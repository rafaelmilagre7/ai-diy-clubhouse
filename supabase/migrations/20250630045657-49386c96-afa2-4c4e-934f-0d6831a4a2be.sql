
-- Verificar e criar coluna benefit_clicks na tabela tools se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tools' 
    AND column_name = 'benefit_clicks'
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE public.tools ADD COLUMN benefit_clicks integer DEFAULT 0;
  END IF;
END $$;

-- Criar função RPC para incrementar cliques em benefícios
CREATE OR REPLACE FUNCTION public.increment_benefit_clicks(tool_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.tools
  SET benefit_clicks = COALESCE(benefit_clicks, 0) + 1
  WHERE id = tool_id;
END;
$$;

-- Log da criação da função
INSERT INTO public.audit_logs (
  user_id,
  event_type,
  action,
  details
) VALUES (
  NULL,
  'system_event',
  'benefit_clicks_function_created',
  jsonb_build_object(
    'function_name', 'increment_benefit_clicks',
    'purpose', 'Incrementar contador de cliques em benefícios de ferramentas',
    'table_affected', 'tools',
    'column_affected', 'benefit_clicks',
    'created_at', NOW()
  )
);
