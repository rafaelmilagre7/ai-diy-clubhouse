-- Adicionar coluna used_by_user_id à tabela invites
-- Esta coluna rastreia qual usuário usou cada convite

ALTER TABLE public.invites 
ADD COLUMN IF NOT EXISTS used_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Criar índice para melhorar performance de queries
CREATE INDEX IF NOT EXISTS idx_invites_used_by_user 
ON public.invites(used_by_user_id) 
WHERE used_by_user_id IS NOT NULL;

-- Comentário da coluna
COMMENT ON COLUMN public.invites.used_by_user_id IS 
'ID do usuário que utilizou este convite. Preenchido quando apply_invite_to_user é executado com sucesso.';