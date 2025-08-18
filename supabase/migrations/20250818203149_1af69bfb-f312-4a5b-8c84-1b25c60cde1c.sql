-- Criar políticas RLS para network_matches se não existirem
DO $$
BEGIN
  -- Verificar se a política já existe
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'network_matches' 
    AND policyname = 'Users can view their matches'
  ) THEN
    CREATE POLICY "Users can view their matches" ON public.network_matches
      FOR SELECT USING (user_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'network_matches' 
    AND policyname = 'Users can insert their matches'
  ) THEN
    CREATE POLICY "Users can insert their matches" ON public.network_matches
      FOR INSERT WITH CHECK (user_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'network_matches' 
    AND policyname = 'Admins can manage all matches'
  ) THEN
    CREATE POLICY "Admins can manage all matches" ON public.network_matches
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM public.profiles p
          JOIN public.user_roles ur ON p.role_id = ur.id
          WHERE p.id = auth.uid() AND ur.name = 'admin'
        )
      );
  END IF;
END $$;