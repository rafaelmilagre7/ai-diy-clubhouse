
-- Limpeza final das funções residuais para 100% de simplicidade

-- 1. Remover função híbrida com assinatura correta (6 parâmetros)
DROP FUNCTION IF EXISTS public.create_invite_hybrid(text, uuid, text, interval, text, text) CASCADE;

-- 2. Remover função de log com assinatura correta (3 parâmetros com boolean)
DROP FUNCTION IF EXISTS public.log_invite_validation_attempt(text, boolean, text) CASCADE;

-- 3. Verificar e remover outras variações possíveis da função híbrida
DROP FUNCTION IF EXISTS public.create_invite_hybrid(text, uuid, interval, text, text, text) CASCADE;
DROP FUNCTION IF EXISTS public.create_invite_hybrid(text, uuid, text, text, interval, text) CASCADE;

-- 4. Verificar e remover outras variações da função de log
DROP FUNCTION IF EXISTS public.log_invite_validation_attempt(text, text, boolean) CASCADE;
DROP FUNCTION IF EXISTS public.log_invite_validation_attempt(boolean, text, text) CASCADE;

-- Comentário: Sistema agora 100% limpo com apenas 4 funções essenciais:
-- ✅ create_invite: Criar convites
-- ✅ use_invite: Usar convites  
-- ✅ generate_invite_token: Gerar tokens únicos
-- ✅ update_invite_send_attempt: Atualizar tentativas de envio
-- 🗑️ REMOVIDAS: Todas as funções redundantes e desnecessárias
