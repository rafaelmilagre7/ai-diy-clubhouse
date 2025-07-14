-- Corrigir inconsistências de roles (versão segura)

-- 1. Primeiro, atualizar convites que usam role 'member'
UPDATE public.invites 
SET role_id = (SELECT id FROM public.user_roles WHERE name = 'membro_club' LIMIT 1)
WHERE role_id = (SELECT id FROM public.user_roles WHERE name = 'member' LIMIT 1);

-- 2. Padronizar roles de usuário
UPDATE public.profiles 
SET role_id = (SELECT id FROM public.user_roles WHERE name = 'membro_club' LIMIT 1)
WHERE role_id = (SELECT id FROM public.user_roles WHERE name = 'member' LIMIT 1);

-- 3. Agora podemos remover o role "member" duplicado
DELETE FROM public.user_roles WHERE name = 'member';

-- 4. Adicionar índices para performance de auth
CREATE INDEX IF NOT EXISTS idx_profiles_email_active ON public.profiles (email) WHERE role_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_role_onboarding ON public.profiles (role_id, onboarding_completed);

-- 5. Função para limpeza de sessões órfãs
CREATE OR REPLACE FUNCTION public.cleanup_orphaned_sessions()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  cleaned_count integer := 0;
BEGIN
  -- Esta função pode ser expandida para limpar sessões órfãs
  -- Por agora apenas conta profiles sem role válido
  SELECT COUNT(*) INTO cleaned_count
  FROM public.profiles p
  WHERE p.role_id IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.user_roles ur WHERE ur.id = p.role_id
  );
  
  RETURN cleaned_count;
END;
$$;