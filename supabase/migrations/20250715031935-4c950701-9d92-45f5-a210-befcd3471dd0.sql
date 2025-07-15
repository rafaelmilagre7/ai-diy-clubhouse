-- Limpar registros antigos de rate limiting e ajustar configurações
-- Primeiro, vamos limpar registros antigos que podem estar causando bloqueios
DELETE FROM public.rate_limit_attempts 
WHERE last_attempt < NOW() - INTERVAL '1 hour'
  OR (block_until IS NOT NULL AND block_until < NOW());

-- Resetar todos os bloqueios ativos para dar uma nova chance
UPDATE public.rate_limit_attempts 
SET block_until = NULL, 
    block_level = 0,
    attempts = 1 
WHERE block_until IS NOT NULL;