-- Primeiro, vamos corrigir os usuários com role_id NULL
-- Buscar o ID do role 'member' padrão
DO $$
DECLARE
    default_role_id UUID;
BEGIN
    -- Encontrar o role_id padrão (member)
    SELECT id INTO default_role_id 
    FROM public.user_roles 
    WHERE name IN ('member', 'membro') 
    ORDER BY name 
    LIMIT 1;
    
    -- Se não encontrou role padrão, criar um
    IF default_role_id IS NULL THEN
        INSERT INTO public.user_roles (name, description, permissions)
        VALUES ('member', 'Membro padrão', '{}')
        RETURNING id INTO default_role_id;
    END IF;
    
    -- Atualizar perfis com role_id NULL
    UPDATE public.profiles 
    SET role_id = default_role_id
    WHERE role_id IS NULL;
    
    -- Agora marcar todos como onboarding completo
    UPDATE public.profiles 
    SET 
        onboarding_completed = true,
        onboarding_completed_at = COALESCE(onboarding_completed_at, now()),
        updated_at = now()
    WHERE onboarding_completed = false OR onboarding_completed IS NULL;
END $$;