-- Remover a função antiga sem parâmetros para evitar ambiguidade
DROP FUNCTION IF EXISTS public.get_nps_analytics_data();

-- A função com parâmetros já existe e está correta
-- get_nps_analytics_data(p_start_date timestamptz, p_end_date timestamptz)