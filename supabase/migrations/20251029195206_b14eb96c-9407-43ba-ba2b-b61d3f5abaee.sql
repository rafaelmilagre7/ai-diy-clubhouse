-- Corrigir search_path da função set_nps_response_code
-- O problema: search_path vazio impede encontrar funções e tabelas
CREATE OR REPLACE FUNCTION public.set_nps_response_code()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.response_code IS NULL THEN
    NEW.response_code := public.generate_nps_response_code();
  END IF;
  RETURN NEW;
END;
$function$;

-- Garantir que generate_nps_response_code também tem search_path correto
CREATE OR REPLACE FUNCTION public.generate_nps_response_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    -- Gerar código no formato NPS-XXXXX (5 caracteres alfanuméricos)
    new_code := 'NPS-' || upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 5));
    
    -- Verificar se código já existe
    SELECT EXISTS(
      SELECT 1 FROM public.learning_lesson_nps WHERE response_code = new_code
    ) INTO code_exists;
    
    -- Se não existe, usar este código
    IF NOT code_exists THEN
      RETURN new_code;
    END IF;
  END LOOP;
END;
$function$;