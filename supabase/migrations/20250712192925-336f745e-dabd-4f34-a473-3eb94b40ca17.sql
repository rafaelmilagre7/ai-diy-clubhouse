-- Criar tabela de preferências de networking
CREATE TABLE public.networking_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Preferências de matching
  preferred_match_types TEXT[] NOT NULL DEFAULT ARRAY['customer', 'supplier', 'partner'],
  min_compatibility_score INTEGER NOT NULL DEFAULT 70,
  max_matches_per_month INTEGER NOT NULL DEFAULT 10,
  
  -- Preferências de comunicação
  auto_accept_high_compatibility BOOLEAN NOT NULL DEFAULT false,
  notification_frequency TEXT NOT NULL DEFAULT 'daily' CHECK (notification_frequency IN ('immediate', 'daily', 'weekly')),
  
  -- Preferências de filtros
  preferred_industries TEXT[] DEFAULT ARRAY[]::TEXT[],
  preferred_company_sizes TEXT[] DEFAULT ARRAY[]::TEXT[],
  preferred_locations TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  -- Configurações avançadas
  ai_matching_enabled BOOLEAN NOT NULL DEFAULT true,
  share_profile_publicly BOOLEAN NOT NULL DEFAULT true,
  receive_intro_requests BOOLEAN NOT NULL DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Constraint para garantir um registro por usuário
  UNIQUE(user_id)
);

-- Habilitar RLS
ALTER TABLE public.networking_preferences ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view their own networking preferences"
  ON public.networking_preferences
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own networking preferences"
  ON public.networking_preferences
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own networking preferences"
  ON public.networking_preferences
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all networking preferences"
  ON public.networking_preferences
  FOR ALL
  USING (is_user_admin(auth.uid()));

-- Trigger para atualizar updated_at
CREATE TRIGGER update_networking_preferences_updated_at
  BEFORE UPDATE ON public.networking_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Habilitar realtime
ALTER TABLE public.networking_preferences REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.networking_preferences;