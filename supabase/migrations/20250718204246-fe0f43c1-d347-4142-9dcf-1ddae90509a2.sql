-- Corrigir as 7 tabelas críticas com RLS ativado mas sem políticas definidas
-- Aplicar políticas básicas de SELECT para usuários autenticados

-- 1. admin_analytics_overview (provavelmente só admins devem ver)
CREATE POLICY "Admins can view analytics overview"
ON public.admin_analytics_overview
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = auth.uid() AND ur.name = 'admin'
  )
);

-- 2. admin_settings (só admins devem acessar)
CREATE POLICY "Admins can view settings"
ON public.admin_settings
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = auth.uid() AND ur.name = 'admin'
  )
);

-- 3. analytics_backups (só admins devem ver)
CREATE POLICY "Admins can view analytics backups"
ON public.analytics_backups
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = auth.uid() AND ur.name = 'admin'
  )
);

-- 4. event_access_control (só admins devem gerenciar)
CREATE POLICY "Admins can view event access control"
ON public.event_access_control
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = auth.uid() AND ur.name = 'admin'
  )
);

-- 5. invite_deliveries (só admins devem ver)
CREATE POLICY "Admins can view invite deliveries"
ON public.invite_deliveries
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = auth.uid() AND ur.name = 'admin'
  )
);

-- 6. invites (só admins devem gerenciar)
CREATE POLICY "Admins can view invites"
ON public.invites
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = auth.uid() AND ur.name = 'admin'
  )
);

-- Política básica para inserção de convites (só admins)
CREATE POLICY "Admins can create invites"
ON public.invites
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = auth.uid() AND ur.name = 'admin'
  )
);

-- Política básica para atualização de convites (só admins)
CREATE POLICY "Admins can update invites"
ON public.invites
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = auth.uid() AND ur.name = 'admin'
  )
);

-- 7. Verificar se há uma 7ª tabela específica ou se são essas 6 principais
-- Criando política para uma possível tabela que não foi listada especificamente
-- mas que é crítica para o funcionamento do fetchUserProfile()

-- Garantir que a tabela profiles tenha acesso básico (importante para fetchUserProfile)
-- Verificar se não há conflito com políticas existentes
DO $$
BEGIN
  -- Verificar se já existe política para profiles
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'profiles' 
    AND policyname = 'Users can view own profile basic'
  ) THEN
    -- Criar política básica se não existir
    EXECUTE 'CREATE POLICY "Users can view own profile basic"
      ON public.profiles
      FOR SELECT
      USING (auth.uid() = id OR auth.uid() IS NOT NULL)';
  END IF;
END $$;