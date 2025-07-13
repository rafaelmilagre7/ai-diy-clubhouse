-- Criar nova tabela onboarding com campos específicos baseados no front-end
CREATE TABLE IF NOT EXISTS public.onboarding (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Dados pessoais (Step 1 - personal_info)
  name text,
  email text,
  phone text,
  instagram text,
  linkedin text,
  birth_date text, -- frontend envia como string
  profile_picture text,
  curiosity text,
  
  -- Localização (Step 1 - location_info)
  state text,
  city text,
  country text DEFAULT 'Brasil',
  timezone text DEFAULT 'America/Sao_Paulo',
  
  -- Dados empresariais (Step 2 - business_info)
  company_name text,
  position text,
  business_sector text,
  company_size text,
  annual_revenue text,
  company_website text,
  
  -- Experiência com IA (Step 3 - ai_experience)
  has_implemented_ai text, -- 'sim', 'nao', 'parcialmente'
  ai_tools_used text[], -- array de ferramentas
  ai_knowledge_level text, -- 'iniciante', 'intermediario', 'avancado'
  who_will_implement text, -- 'eu_mesmo', 'equipe_interna', 'consultoria'
  ai_implementation_objective text,
  ai_implementation_urgency text,
  ai_main_challenge text,
  
  -- Objetivos (Step 4 - goals_info)  
  main_objective text,
  area_to_impact text,
  expected_result_90_days text,
  urgency_level text,
  success_metric text,
  main_obstacle text,
  preferred_support text,
  ai_implementation_budget text,
  
  -- Personalização (Step 5 - personalization)
  weekly_learning_time text,
  best_days text[], -- array de dias
  best_periods text[], -- array de períodos
  content_preference text[], -- array de preferências
  content_frequency text,
  wants_networking text, -- 'yes', 'maybe', 'no'
  community_interaction_style text,
  preferred_communication_channel text,
  follow_up_type text,
  motivation_sharing text,
  
  -- Controle do fluxo
  current_step integer DEFAULT 1,
  completed_steps integer[] DEFAULT ARRAY[]::integer[],
  is_completed boolean DEFAULT false,
  completed_at timestamptz,
  
  -- Metadados
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Constraint para garantir um registro por usuário
  UNIQUE(user_id)
);

-- Habilitar RLS
ALTER TABLE public.onboarding ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view their own onboarding"
  ON public.onboarding FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own onboarding"
  ON public.onboarding FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own onboarding"
  ON public.onboarding FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all onboarding"
  ON public.onboarding FOR SELECT
  USING (is_user_admin(auth.uid()));

-- Trigger para updated_at
CREATE TRIGGER update_onboarding_updated_at
  BEFORE UPDATE ON public.onboarding
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger para sincronizar com profiles quando onboarding for completado
CREATE OR REPLACE FUNCTION public.sync_onboarding_to_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Atualizar perfil quando onboarding for completado
  IF NEW.is_completed = true AND (OLD.is_completed IS NULL OR OLD.is_completed = false) THEN
    UPDATE public.profiles
    SET 
      name = COALESCE(NEW.name, name),
      company_name = COALESCE(NEW.company_name, company_name),
      industry = COALESCE(NEW.business_sector, industry),
      onboarding_completed = NEW.is_completed,
      onboarding_completed_at = COALESCE(NEW.completed_at, now()),
      updated_at = now()
    WHERE id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Criar trigger
CREATE TRIGGER trigger_sync_onboarding_to_profile
  AFTER UPDATE ON public.onboarding
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_onboarding_to_profile();