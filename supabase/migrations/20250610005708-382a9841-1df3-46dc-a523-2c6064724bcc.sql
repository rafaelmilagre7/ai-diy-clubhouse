
-- Criar tabela onboarding_sync para sincronização de dados de onboarding
CREATE TABLE IF NOT EXISTS public.onboarding_sync (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Habilitar RLS
ALTER TABLE public.onboarding_sync ENABLE ROW LEVEL SECURITY;

-- Política para que usuários vejam apenas seus próprios dados
CREATE POLICY "Users can view own onboarding sync data" 
  ON public.onboarding_sync 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Política para que usuários possam inserir seus próprios dados
CREATE POLICY "Users can insert own onboarding sync data" 
  ON public.onboarding_sync 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Política para que usuários possam atualizar seus próprios dados
CREATE POLICY "Users can update own onboarding sync data" 
  ON public.onboarding_sync 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Política para que usuários possam deletar seus próprios dados
CREATE POLICY "Users can delete own onboarding sync data" 
  ON public.onboarding_sync 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_onboarding_sync_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_onboarding_sync_updated_at
  BEFORE UPDATE ON public.onboarding_sync
  FOR EACH ROW
  EXECUTE FUNCTION public.update_onboarding_sync_updated_at();
