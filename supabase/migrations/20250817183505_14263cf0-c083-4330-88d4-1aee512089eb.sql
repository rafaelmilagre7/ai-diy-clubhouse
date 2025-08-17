-- Etapa 1: Preparação Segura do Banco de Dados
-- Adicionar campo user_type com valor padrão para não quebrar usuários existentes

ALTER TABLE public.onboarding_final 
ADD COLUMN user_type TEXT DEFAULT 'entrepreneur';

-- Adicionar constraint para garantir valores válidos
ALTER TABLE public.onboarding_final 
ADD CONSTRAINT check_user_type 
CHECK (user_type IN ('entrepreneur', 'learner'));

-- Comentário para documentar a mudança
COMMENT ON COLUMN public.onboarding_final.user_type IS 
'Tipo de usuário: entrepreneur (empresário/gestor) ou learner (pessoa que quer aprender IA). Default entrepreneur para compatibilidade com usuários existentes.';