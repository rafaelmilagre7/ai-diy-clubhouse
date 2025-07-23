-- Criar políticas RLS para tabela onboarding_final (apenas as que não existem)

-- Habilitar RLS se não estiver habilitado
ALTER TABLE public.onboarding_final ENABLE ROW LEVEL SECURITY;

-- Política para usuários visualizarem seus próprios dados
CREATE POLICY "Users can view their own onboarding data" 
ON public.onboarding_final 
FOR SELECT 
USING (auth.uid() = user_id);

-- Política para usuários criarem seus próprios dados
CREATE POLICY "Users can insert their own onboarding data" 
ON public.onboarding_final 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Política para usuários atualizarem seus próprios dados
CREATE POLICY "Users can update their own onboarding data" 
ON public.onboarding_final 
FOR UPDATE 
USING (auth.uid() = user_id);