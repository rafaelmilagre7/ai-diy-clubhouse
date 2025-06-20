
-- Remover funções redundantes do sistema de convites para atingir simplicidade máxima

-- 1. Remover função híbrida complexa (se ainda existir)
DROP FUNCTION IF EXISTS public.create_invite_hybrid(text, uuid, interval, text) CASCADE;

-- 2. Remover função de verificação redundante (temos validação no use_invite)
DROP FUNCTION IF EXISTS public.check_invite_token(text) CASCADE;

-- 3. Remover função de log desnecessário para sistema simples
DROP FUNCTION IF EXISTS public.log_invite_validation_attempt(text, text, text) CASCADE;

-- 4. Remover trigger de atualização desnecessário
DROP FUNCTION IF EXISTS public.update_invite_send_attempts_updated_at() CASCADE;

-- 5. Remover função de validação complexa desnecessária
DROP FUNCTION IF EXISTS public.validate_invite_token_enhanced(text) CASCADE;

-- Comentário: Mantemos apenas 4 funções essenciais:
-- - create_invite: Criar convites
-- - use_invite: Usar convites  
-- - generate_invite_token: Gerar tokens únicos
-- - update_invite_send_attempt: Atualizar tentativas de envio
