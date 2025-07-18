-- Corrigir RLS em tabelas que têm RLS ativado mas sem políticas
-- Focando nas tabelas reais (não views) identificadas

-- 1. admin_settings
CREATE POLICY "Admins can manage settings"
ON public.admin_settings
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = auth.uid() AND ur.name = 'admin'
  )
);

-- 2. analytics_backups 
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

-- 3. event_access_control
CREATE POLICY "Admins can manage event access control"
ON public.event_access_control
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = auth.uid() AND ur.name = 'admin'
  )
);

-- 4. invite_deliveries
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

-- Política para inserção de deliveries (sistema pode inserir)
CREATE POLICY "System can insert invite deliveries"
ON public.invite_deliveries
FOR INSERT
WITH CHECK (auth.role() = 'service_role' OR true);

-- 5. invites (política mais robusta para não bloquear sistema)
CREATE POLICY "Admins can manage invites"
ON public.invites
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = auth.uid() AND ur.name = 'admin'
  )
);

-- Permitir que o sistema/service_role insira/atualize convites
CREATE POLICY "Service role can manage invites"
ON public.invites
FOR ALL
USING (auth.role() = 'service_role');

-- 6. Para tabelas que podem bloquear fetchUserProfile
-- Garantir política básica para profiles (se não existir)
DO $$
BEGIN
  -- Verificar se há política básica para profiles
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'profiles' 
    AND policyname LIKE '%authenticated%'
  ) THEN
    CREATE POLICY "Authenticated users can view profiles"
    ON public.profiles
    FOR SELECT
    USING (auth.uid() IS NOT NULL);
  END IF;
END $$;

-- 7. Garantir acesso à tabela user_roles (crítica para verificação de permissões)
-- Verificar se user_roles tem política para usuários autenticados
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'user_roles' 
    AND policyname LIKE '%authenticated%'
  ) THEN
    CREATE POLICY "Authenticated users can view roles"
    ON public.user_roles
    FOR SELECT
    USING (auth.uid() IS NOT NULL);
  END IF;
END $$;