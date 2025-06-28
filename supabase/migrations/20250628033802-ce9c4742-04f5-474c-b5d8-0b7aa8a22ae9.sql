
-- Remover constraint duplicada entre profiles e user_roles
-- Mantém apenas profiles_role_id_fkey e remove fk_profiles_role_id

-- Verificar se a constraint fk_profiles_role_id existe e removê-la
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_profiles_role_id' 
        AND table_name = 'profiles'
    ) THEN
        ALTER TABLE public.profiles DROP CONSTRAINT fk_profiles_role_id;
        RAISE NOTICE 'Constraint fk_profiles_role_id removida com sucesso';
    ELSE
        RAISE NOTICE 'Constraint fk_profiles_role_id não encontrada';
    END IF;
END $$;

-- Verificar se profiles_role_id_fkey ainda existe (deve ser mantida)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'profiles_role_id_fkey' 
        AND table_name = 'profiles'
    ) THEN
        RAISE NOTICE 'Constraint profiles_role_id_fkey mantida (correto)';
    ELSE
        -- Se não existe, recriar
        ALTER TABLE public.profiles 
        ADD CONSTRAINT profiles_role_id_fkey 
        FOREIGN KEY (role_id) REFERENCES public.user_roles(id);
        RAISE NOTICE 'Constraint profiles_role_id_fkey recriada';
    END IF;
END $$;
