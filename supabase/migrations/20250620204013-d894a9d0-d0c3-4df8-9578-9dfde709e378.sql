
-- Etapa 1: Remover tabela de domínios confiáveis
DROP TABLE IF EXISTS public.trusted_domains CASCADE;

-- Etapa 2: Remover tabela de tentativas de envio
DROP TABLE IF EXISTS public.invite_send_attempts CASCADE;

-- Etapa 3: Remover funções relacionadas aos domínios confiáveis (se existirem)
DROP FUNCTION IF EXISTS public.check_trusted_domain(text) CASCADE;

-- Comentário: Mantemos apenas a tabela 'invites' e suas funções essenciais para o sistema 100% simples
