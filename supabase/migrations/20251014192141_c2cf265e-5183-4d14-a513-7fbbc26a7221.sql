-- Criar tabela de oportunidades de networking
CREATE TABLE IF NOT EXISTS public.networking_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  opportunity_type TEXT NOT NULL CHECK (opportunity_type IN ('parceria', 'fornecedor', 'cliente', 'investimento', 'outro')),
  tags TEXT[] DEFAULT '{}',
  contact_preference TEXT DEFAULT 'platform' CHECK (contact_preference IN ('platform', 'linkedin', 'whatsapp', 'email')),
  is_active BOOLEAN DEFAULT true,
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_networking_opportunities_user_id ON public.networking_opportunities(user_id);
CREATE INDEX IF NOT EXISTS idx_networking_opportunities_type ON public.networking_opportunities(opportunity_type);
CREATE INDEX IF NOT EXISTS idx_networking_opportunities_active ON public.networking_opportunities(is_active) WHERE is_active = true;

-- Habilitar RLS
ALTER TABLE public.networking_opportunities ENABLE ROW LEVEL SECURITY;

-- Policy: Todos autenticados podem ver oportunidades ativas
CREATE POLICY "Todos podem ver oportunidades ativas"
ON public.networking_opportunities
FOR SELECT
TO authenticated
USING (is_active = true);

-- Policy: Usuários podem criar suas oportunidades
CREATE POLICY "Usuários podem criar suas oportunidades"
ON public.networking_opportunities
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy: Usuários podem editar suas oportunidades
CREATE POLICY "Usuários podem editar suas oportunidades"
ON public.networking_opportunities
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy: Usuários podem deletar suas oportunidades
CREATE POLICY "Usuários podem deletar suas oportunidades"
ON public.networking_opportunities
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_networking_opportunities_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_networking_opportunities_timestamp
BEFORE UPDATE ON public.networking_opportunities
FOR EACH ROW
EXECUTE FUNCTION public.update_networking_opportunities_updated_at();