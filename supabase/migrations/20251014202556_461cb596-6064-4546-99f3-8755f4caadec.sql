-- Criar função RPC para calcular compatibilidade de negócio
CREATE OR REPLACE FUNCTION calculate_business_compatibility(
  user1_segment text,
  user1_ai_level text,
  user1_objectives text[],
  user1_company_size text,
  user2_segment text,
  user2_ai_level text,
  user2_objectives text[],
  user2_company_size text
)
RETURNS numeric
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  score numeric := 0.5;
  common_objectives int;
BEGIN
  -- Score base por segmento complementar
  IF user1_segment IS DISTINCT FROM user2_segment THEN
    score := score + 0.2;
  END IF;
  
  -- Score por nível de IA similar
  IF user1_ai_level = user2_ai_level THEN
    score := score + 0.1;
  END IF;
  
  -- Score por objetivos comuns
  IF user1_objectives IS NOT NULL AND user2_objectives IS NOT NULL THEN
    SELECT COUNT(*) INTO common_objectives
    FROM unnest(user1_objectives) obj1
    WHERE obj1 = ANY(user2_objectives);
    
    score := score + (common_objectives * 0.05);
  END IF;
  
  -- Score por tamanho de empresa complementar
  IF user1_company_size IS DISTINCT FROM user2_company_size THEN
    score := score + 0.1;
  END IF;
  
  -- Limitar entre 0 e 1
  RETURN LEAST(1.0, GREATEST(0.0, score));
END;
$$;