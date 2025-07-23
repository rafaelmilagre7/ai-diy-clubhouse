-- MIGRAÇÃO: Sistema de Onboarding Completo - VIA Aurora Style (CORRIGIDO)
-- Estrutura para onboarding em 6 steps com dados ricos para personalização

-- 1. Adicionar campos de controle de onboarding na tabela profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- 2. Criar tabela principal do onboarding
CREATE TABLE IF NOT EXISTS public.onboarding_final (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Controle de fluxo
  current_step INTEGER NOT NULL DEFAULT 1,
  completed_steps INTEGER[] DEFAULT ARRAY[]::INTEGER[],
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  
  -- Step 1: Informações Pessoais
  personal_info JSONB DEFAULT '{}'::jsonb,
  
  -- Step 2: Contexto de Negócio
  business_info JSONB DEFAULT '{}'::jsonb,
  
  -- Step 3: Experiência com IA
  ai_experience JSONB DEFAULT '{}'::jsonb,
  
  -- Step 4: Objetivos
  goals_info JSONB DEFAULT '{}'::jsonb,
  
  -- Step 5: Personalização
  personalization JSONB DEFAULT '{}'::jsonb,
  
  -- Step 6: Mensagem da NINA
  nina_message TEXT DEFAULT NULL,
  nina_generated_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  
  -- Metadados
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Constraint para garantir um onboarding por usuário
  UNIQUE(user_id)
);

-- 3. Habilitar RLS
ALTER TABLE public.onboarding_final ENABLE ROW LEVEL SECURITY;

-- 4. Políticas RLS - Usuários só acessam seus próprios dados
CREATE POLICY "Users can view their own onboarding"
  ON public.onboarding_final
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own onboarding"
  ON public.onboarding_final
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own onboarding"
  ON public.onboarding_final
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all onboarding data"
  ON public.onboarding_final
  FOR ALL
  USING (is_user_admin_secure(auth.uid()));

-- 5. Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_onboarding_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_onboarding_final_updated_at
  BEFORE UPDATE ON public.onboarding_final
  FOR EACH ROW
  EXECUTE FUNCTION public.update_onboarding_updated_at();

-- 6. Função para finalizar onboarding
CREATE OR REPLACE FUNCTION public.complete_onboarding_flow(p_user_id UUID)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Atualizar onboarding como completo
  UPDATE public.onboarding_final
  SET 
    is_completed = true,
    completed_at = now(),
    status = 'completed',
    completed_steps = ARRAY[1,2,3,4,5,6]
  WHERE user_id = p_user_id;
  
  -- Atualizar profile
  UPDATE public.profiles
  SET 
    onboarding_completed = true,
    onboarding_completed_at = now()
  WHERE id = p_user_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Onboarding completado com sucesso',
    'completed_at', now()
  );
END;
$$;

-- 7. Marcar usuários existentes como onboarding completo
-- (para não forçar onboarding em quem já usa a plataforma)
UPDATE public.profiles 
SET 
  onboarding_completed = true,
  onboarding_completed_at = now()
WHERE created_at < now() - INTERVAL '1 day';

-- 8. Habilitar realtime
ALTER TABLE public.onboarding_final REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.onboarding_final;