-- Adicionar campo response_code para ID único legível de cada resposta NPS
ALTER TABLE public.learning_lesson_nps 
ADD COLUMN response_code TEXT UNIQUE;

-- Criar função para gerar código único de resposta
CREATE OR REPLACE FUNCTION generate_nps_response_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
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
$$;

-- Popular registros existentes com códigos únicos
UPDATE public.learning_lesson_nps
SET response_code = generate_nps_response_code()
WHERE response_code IS NULL;

-- Criar trigger para gerar código automaticamente em novas respostas
CREATE OR REPLACE FUNCTION set_nps_response_code()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.response_code IS NULL THEN
    NEW.response_code := generate_nps_response_code();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER before_insert_nps_response_code
BEFORE INSERT ON public.learning_lesson_nps
FOR EACH ROW
EXECUTE FUNCTION set_nps_response_code();

-- Adicionar índice para melhor performance nas buscas por código
CREATE INDEX idx_learning_lesson_nps_response_code 
ON public.learning_lesson_nps(response_code);

-- Adicionar constraint NOT NULL após popular os dados
ALTER TABLE public.learning_lesson_nps 
ALTER COLUMN response_code SET NOT NULL;