-- Corrigir role_id do usuário Davi para admin
-- O usuário estava com role_id apontando para 'membro_club' ao invés de 'admin'
-- Isso causava erro "Acesso negado - apenas administradores" nos comentários das aulas

UPDATE profiles 
SET role_id = 'f0724d21-981f-4119-af02-07334300801a'
WHERE id = '2807f4bd-360c-49c4-b790-91c1791abe9d';

-- Verificar se a atualização foi bem-sucedida
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = '2807f4bd-360c-49c4-b790-91c1791abe9d' 
    AND role_id = 'f0724d21-981f-4119-af02-07334300801a'
  ) THEN
    RAISE EXCEPTION 'Falha ao atualizar role_id do usuário Davi';
  END IF;
END $$;