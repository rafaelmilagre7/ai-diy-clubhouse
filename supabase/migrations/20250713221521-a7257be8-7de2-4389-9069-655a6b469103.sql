-- Criar nova tabela simplificada de onboarding
CREATE TABLE public.onboarding_simple (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE,
  
  -- Passo 1: Informações Essenciais
  name text,
  email text,
  phone text,
  
  -- Passo 2: Contexto Profissional
  company_name text,
  role text,
  company_size text,
  main_challenge text,
  
  -- Passo 3: Finalização
  goals text[],
  expectations text,
  
  -- Controle
  current_step integer NOT NULL DEFAULT 1,
  is_completed boolean NOT NULL DEFAULT false,
  completed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.onboarding_simple ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can manage their own onboarding data"
ON public.onboarding_simple
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Trigger para updated_at
CREATE TRIGGER update_onboarding_simple_updated_at
  BEFORE UPDATE ON public.onboarding_simple
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger para sincronizar com profiles quando completar
CREATE OR REPLACE FUNCTION public.sync_simple_onboarding_to_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Sincronizar dados com a tabela profiles
  UPDATE public.profiles
  SET 
    name = COALESCE(NEW.name, name),
    company_name = COALESCE(NEW.company_name, company_name),
    onboarding_completed = NEW.is_completed,
    onboarding_completed_at = CASE 
      WHEN NEW.is_completed THEN COALESCE(NEW.completed_at, now()) 
      ELSE NULL 
    END,
    updated_at = now()
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER sync_simple_onboarding_to_profile_trigger
  AFTER INSERT OR UPDATE ON public.onboarding_simple
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_simple_onboarding_to_profile();