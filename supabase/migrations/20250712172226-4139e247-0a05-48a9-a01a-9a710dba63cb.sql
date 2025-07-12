-- Criar tabela referrals que está sendo referenciada no código mas não existe
CREATE TABLE public.referrals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID NOT NULL,
  email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'registered', 'completed', 'expired')),
  role_id UUID REFERENCES public.user_roles(id),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '30 days'),
  completed_at TIMESTAMP WITH TIME ZONE,
  type TEXT NOT NULL DEFAULT 'general' CHECK (type IN ('general', 'course', 'event', 'solution')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_referrals_referrer_id ON public.referrals(referrer_id);
CREATE INDEX idx_referrals_token ON public.referrals(token);
CREATE INDEX idx_referrals_email ON public.referrals(email);
CREATE INDEX idx_referrals_status ON public.referrals(status);

-- Habilitar RLS
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para referrals
CREATE POLICY "Users can view their own referrals"
ON public.referrals
FOR SELECT
USING (referrer_id = auth.uid());

CREATE POLICY "Users can create referrals"
ON public.referrals
FOR INSERT
WITH CHECK (referrer_id = auth.uid());

CREATE POLICY "Users can update their own referrals"
ON public.referrals
FOR UPDATE
USING (referrer_id = auth.uid());

CREATE POLICY "Admins can manage all referrals"
ON public.referrals
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = auth.uid() AND ur.name = 'admin'
  )
);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_referrals_updated_at
BEFORE UPDATE ON public.referrals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Criar tabela network_matches que está sendo referenciada no código mas não existe
CREATE TABLE public.network_matches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  matched_user_id UUID NOT NULL,
  match_type TEXT NOT NULL CHECK (match_type IN ('customer', 'supplier', 'partner', 'mentor', 'mentee')),
  compatibility_score NUMERIC(5,2) CHECK (compatibility_score >= 0 AND compatibility_score <= 100),
  match_reason TEXT,
  ai_analysis JSONB DEFAULT '{}',
  month_year TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'expired')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_network_matches_user_id ON public.network_matches(user_id);
CREATE INDEX idx_network_matches_matched_user_id ON public.network_matches(matched_user_id);
CREATE INDEX idx_network_matches_month_year ON public.network_matches(month_year);
CREATE INDEX idx_network_matches_status ON public.network_matches(status);

-- Constraint para evitar auto-match
ALTER TABLE public.network_matches ADD CONSTRAINT no_self_match 
CHECK (user_id != matched_user_id);

-- Habilitar RLS
ALTER TABLE public.network_matches ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para network_matches
CREATE POLICY "Users can view their own matches"
ON public.network_matches
FOR SELECT
USING (user_id = auth.uid() OR matched_user_id = auth.uid());

CREATE POLICY "Users can update their own matches"
ON public.network_matches
FOR UPDATE
USING (user_id = auth.uid() OR matched_user_id = auth.uid());

CREATE POLICY "System can create matches"
ON public.network_matches
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can manage all matches"
ON public.network_matches
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = auth.uid() AND ur.name = 'admin'
  )
);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_network_matches_updated_at
BEFORE UPDATE ON public.network_matches
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();