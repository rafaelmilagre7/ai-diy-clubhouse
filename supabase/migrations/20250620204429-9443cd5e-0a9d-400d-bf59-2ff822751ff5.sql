
-- Limpeza final da tabela invites - removendo colunas desnecessárias
-- para atingir sistema 100% simples

-- Remover colunas relacionadas ao WhatsApp e canais múltiplos
ALTER TABLE public.invites 
DROP COLUMN IF EXISTS phone,
DROP COLUMN IF EXISTS channel_preference,
DROP COLUMN IF EXISTS email_provider,
DROP COLUMN IF EXISTS email_id;

-- Comentário: Agora a tabela invites contém apenas as colunas essenciais:
-- id, email, role_id, token, expires_at, used_at, created_by, created_at, 
-- last_sent_at, send_attempts, notes
