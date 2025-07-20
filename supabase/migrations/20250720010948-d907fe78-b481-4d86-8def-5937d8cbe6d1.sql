-- Verificar se a tabela networking_metrics existe, e criar se necessário
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'networking_metrics'
    ) THEN
        -- Criar tabela networking_metrics para evitar erros nos logs
        CREATE TABLE public.networking_metrics (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID REFERENCES auth.users(id),
            total_matches INTEGER DEFAULT 0,
            active_connections INTEGER DEFAULT 0,
            compatibility_score NUMERIC(3,2),
            last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Habilitar RLS
        ALTER TABLE public.networking_metrics ENABLE ROW LEVEL SECURITY;

        -- Política para usuários verem apenas seus próprios dados
        CREATE POLICY "Users can view own networking metrics"
            ON public.networking_metrics
            FOR SELECT
            USING (auth.uid() = user_id);

        -- Política para usuários criarem/atualizarem seus próprios dados
        CREATE POLICY "Users can manage own networking metrics"
            ON public.networking_metrics
            FOR ALL
            USING (auth.uid() = user_id)
            WITH CHECK (auth.uid() = user_id);

        RAISE NOTICE 'Tabela networking_metrics criada com sucesso';
    ELSE
        RAISE NOTICE 'Tabela networking_metrics já existe';
    END IF;
END
$$;