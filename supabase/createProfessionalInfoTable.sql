
-- Verifica se a tabela onboarding_professional_info já existe, se não, cria
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'onboarding_professional_info') THEN
        CREATE TABLE public.onboarding_professional_info (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            progress_id UUID NOT NULL REFERENCES public.onboarding_progress(id) ON DELETE CASCADE,
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            company_name TEXT,
            company_size TEXT,
            company_sector TEXT,
            company_website TEXT,
            current_position TEXT,
            annual_revenue TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );

        -- Configurar RLS para esta tabela
        ALTER TABLE public.onboarding_professional_info ENABLE ROW LEVEL SECURITY;

        -- Políticas de acesso - usuários só podem ver e editar seus próprios dados
        CREATE POLICY "Usuários podem ver seus próprios dados profissionais"
            ON public.onboarding_professional_info
            FOR SELECT
            USING (auth.uid() = user_id);

        CREATE POLICY "Usuários podem atualizar seus próprios dados profissionais"
            ON public.onboarding_professional_info
            FOR UPDATE
            USING (auth.uid() = user_id);

        CREATE POLICY "Usuários podem inserir seus próprios dados profissionais"
            ON public.onboarding_professional_info
            FOR INSERT
            WITH CHECK (auth.uid() = user_id);

        -- Criar trigger para atualizar o timestamp
        CREATE TRIGGER set_updated_at
            BEFORE UPDATE ON public.onboarding_professional_info
            FOR EACH ROW
            EXECUTE FUNCTION public.update_updated_at_column();

        RAISE NOTICE 'Tabela onboarding_professional_info criada com sucesso.';
    ELSE
        RAISE NOTICE 'Tabela onboarding_professional_info já existe.';
    END IF;
END
$$;
