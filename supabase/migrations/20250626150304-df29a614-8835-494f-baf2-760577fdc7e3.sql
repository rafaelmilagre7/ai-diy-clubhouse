
-- Migration: Adicionar foreign key constraint entre profiles e user_roles
-- Data: 2025-01-27
-- Descrição: Estabelece relacionamento formal entre profiles.role_id e user_roles.id

-- Primeiro, verificar se existem dados inconsistentes
-- (role_id que não existem na tabela user_roles)
DO $$
DECLARE
    inconsistent_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO inconsistent_count
    FROM public.profiles p
    LEFT JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.role_id IS NOT NULL AND ur.id IS NULL;
    
    IF inconsistent_count > 0 THEN
        RAISE NOTICE 'Encontrados % registros com role_id inconsistente. Serão definidos como NULL antes da criação da foreign key.', inconsistent_count;
        
        -- Limpar role_id inconsistentes (definir como NULL)
        UPDATE public.profiles 
        SET role_id = NULL 
        WHERE role_id IS NOT NULL 
        AND role_id NOT IN (SELECT id FROM public.user_roles);
    END IF;
END $$;

-- Criar a foreign key constraint
ALTER TABLE public.profiles 
ADD CONSTRAINT fk_profiles_role_id 
FOREIGN KEY (role_id) REFERENCES public.user_roles(id)
ON DELETE SET NULL  -- Se um role for deletado, definir role_id como NULL
ON UPDATE CASCADE;  -- Se o ID de um role mudar, atualizar as referências

-- Criar índice para melhorar performance das queries com JOIN
CREATE INDEX IF NOT EXISTS idx_profiles_role_id 
ON public.profiles(role_id) 
WHERE role_id IS NOT NULL;

-- Verificar se a constraint foi criada com sucesso
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_profiles_role_id' 
        AND table_name = 'profiles'
    ) THEN
        RAISE NOTICE '✅ Foreign key constraint fk_profiles_role_id criada com sucesso';
    ELSE
        RAISE EXCEPTION '❌ Falha ao criar foreign key constraint';
    END IF;
END $$;
