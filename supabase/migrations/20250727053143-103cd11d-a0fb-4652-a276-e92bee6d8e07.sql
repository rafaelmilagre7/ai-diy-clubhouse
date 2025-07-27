-- Criar tabela para solicitações de implementação
CREATE TABLE public.implementation_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  solution_id UUID NOT NULL,
  
  -- Dados do usuário (snapshot no momento da solicitação)
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  user_phone TEXT,
  
  -- Dados da solução
  solution_title TEXT NOT NULL,
  solution_category TEXT NOT NULL,
  
  -- Status e controle
  status TEXT NOT NULL DEFAULT 'pending',
  pipedrive_deal_id TEXT,
  discord_message_id TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadados adicionais
  metadata JSONB DEFAULT '{}'::jsonb,
  notes TEXT
);

-- Índices para performance
CREATE INDEX idx_implementation_requests_user_id ON public.implementation_requests(user_id);
CREATE INDEX idx_implementation_requests_solution_id ON public.implementation_requests(solution_id);
CREATE INDEX idx_implementation_requests_status ON public.implementation_requests(status);
CREATE INDEX idx_implementation_requests_created_at ON public.implementation_requests(created_at);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_implementation_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER update_implementation_requests_updated_at
  BEFORE UPDATE ON public.implementation_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_implementation_requests_updated_at();

-- Habilitar Row Level Security
ALTER TABLE public.implementation_requests ENABLE ROW LEVEL SECURITY;

-- Política: Usuários podem ver suas próprias solicitações
CREATE POLICY "Users can view their own implementation requests"
ON public.implementation_requests
FOR SELECT
USING (auth.uid() = user_id);

-- Política: Usuários podem criar suas próprias solicitações
CREATE POLICY "Users can create their own implementation requests"
ON public.implementation_requests
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Política: Admins podem ver todas as solicitações
CREATE POLICY "Admins can view all implementation requests"
ON public.implementation_requests
FOR ALL
USING (
  EXISTS (
    SELECT 1 
    FROM public.profiles p
    JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = auth.uid() AND ur.name = 'admin'
  )
);

-- Comentários para documentação
COMMENT ON TABLE public.implementation_requests IS 'Solicitações de contratação de implementação de soluções';
COMMENT ON COLUMN public.implementation_requests.status IS 'Status: pending, processing, completed, failed';
COMMENT ON COLUMN public.implementation_requests.pipedrive_deal_id IS 'ID do deal criado no Pipedrive';
COMMENT ON COLUMN public.implementation_requests.discord_message_id IS 'ID da mensagem enviada no Discord';