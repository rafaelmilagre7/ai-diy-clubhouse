-- FASE 1: Corrigir problemas críticos de banco de dados (corrigido)

-- 1. Criar tabela quick_onboarding que está faltando
CREATE TABLE IF NOT EXISTS public.quick_onboarding (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  email TEXT NOT NULL,
  name TEXT DEFAULT '',
  whatsapp TEXT DEFAULT '',
  country_code TEXT DEFAULT '+55',
  birth_date DATE,
  instagram_url TEXT DEFAULT '',
  linkedin_url TEXT DEFAULT '',
  how_found_us TEXT DEFAULT '',
  referred_by TEXT DEFAULT '',
  company_name TEXT DEFAULT '',
  role TEXT DEFAULT '',
  company_size TEXT DEFAULT '',
  company_segment TEXT DEFAULT '',
  company_website TEXT DEFAULT '',
  annual_revenue_range TEXT DEFAULT '',
  main_challenge TEXT DEFAULT '',
  ai_knowledge_level TEXT DEFAULT '',
  uses_ai TEXT DEFAULT '',
  main_goal TEXT DEFAULT '',
  desired_ai_areas TEXT[] DEFAULT ARRAY[]::TEXT[],
  has_implemented TEXT DEFAULT '',
  previous_tools TEXT[] DEFAULT ARRAY[]::TEXT[],
  current_step INTEGER DEFAULT 1,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Recriar admin_analytics_overview sem referência à solutions
DROP VIEW IF EXISTS public.admin_analytics_overview;
CREATE VIEW public.admin_analytics_overview AS
SELECT 
  COUNT(DISTINCT p.id) as total_users,
  COUNT(DISTINCT CASE WHEN p.created_at >= NOW() - INTERVAL '30 days' THEN p.id END) as new_users_30d,
  COUNT(DISTINCT CASE WHEN p.onboarding_completed = true THEN p.id END) as completed_onboarding,
  0 as total_solutions, 
  0 as new_solutions_30d, 
  COUNT(DISTINCT ll.id) as total_lessons,
  COUNT(DISTINCT lp.user_id) as active_learners,
  COUNT(DISTINCT CASE WHEN a.created_at >= NOW() - INTERVAL '7 days' THEN a.user_id END) as active_users_7d,
  COALESCE(AVG(CASE WHEN p.created_at >= NOW() - INTERVAL '60 days' THEN 1 ELSE 0 END) * 100, 0) as growth_rate,
  COALESCE(AVG(CASE WHEN lp.completed_at IS NOT NULL THEN 1 ELSE 0 END) * 100, 0) as completion_rate
FROM public.profiles p
LEFT JOIN public.learning_lessons ll ON true
LEFT JOIN public.learning_progress lp ON lp.user_id = p.id
LEFT JOIN public.analytics a ON a.user_id = p.id;

-- 3. Habilitar RLS na tabela quick_onboarding
ALTER TABLE public.quick_onboarding ENABLE ROW LEVEL SECURITY;

-- 4. Criar políticas RLS para quick_onboarding
CREATE POLICY "Users can view their own quick onboarding"
ON public.quick_onboarding FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own quick onboarding"
ON public.quick_onboarding FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own quick onboarding"
ON public.quick_onboarding FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all quick onboarding"
ON public.quick_onboarding FOR ALL
USING (is_user_admin(auth.uid()));

-- 5. Trigger para updated_at
CREATE OR REPLACE FUNCTION public.update_quick_onboarding_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_quick_onboarding_updated_at
  BEFORE UPDATE ON public.quick_onboarding
  FOR EACH ROW
  EXECUTE FUNCTION public.update_quick_onboarding_updated_at();