
-- FASE 1: CORREÇÕES CRÍTICAS DE SEGURANÇA
-- Corrigir funções sem search_path e adicionar RLS em tabelas desprotegidas

-- 1. Corrigir funções críticas sem search_path
CREATE OR REPLACE FUNCTION public.generate_certificate_validation_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN upper(substring(md5(random()::text || now()::text) from 1 for 12));
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_invite_token()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN upper(substring(md5(random()::text || now()::text) from 1 for 16));
END;
$$;

CREATE OR REPLACE FUNCTION public.is_user_admin(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles p
    JOIN user_roles ur ON p.role_id = ur.id
    WHERE p.id = user_id AND ur.name = 'admin'
  );
END;
$$;

-- 2. Adicionar RLS nas tabelas que não têm proteção
ALTER TABLE public.rate_limit_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rate_limit_system_access_only"
ON public.rate_limit_attempts
FOR ALL
USING (false)
WITH CHECK (false);

ALTER TABLE public.user_backups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_can_access_own_backups"
ON public.user_backups
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "admins_can_manage_all_backups"
ON public.user_backups
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    JOIN user_roles ur ON p.role_id = ur.id
    WHERE p.id = auth.uid() AND ur.name = 'admin'
  )
);

-- 3. FASE 2: Limpeza de tabelas órfãs do onboarding
DROP TABLE IF EXISTS public.onboarding_final CASCADE;
DROP TABLE IF EXISTS public.quick_onboarding CASCADE;
DROP TABLE IF EXISTS public.onboarding_progress CASCADE;

-- 4. Limpar campos desnecessários da tabela profiles
ALTER TABLE public.profiles 
DROP COLUMN IF EXISTS onboarding_completed CASCADE,
DROP COLUMN IF EXISTS onboarding_completed_at CASCADE,
DROP COLUMN IF EXISTS onboarding_step CASCADE,
DROP COLUMN IF EXISTS current_position CASCADE,
DROP COLUMN IF EXISTS annual_revenue CASCADE,
DROP COLUMN IF EXISTS company_sector CASCADE,
DROP COLUMN IF EXISTS company_website CASCADE;

-- 5. Verificar se tabela progress está alinhada com frontend
-- Manter estrutura atual que já funciona com o frontend

-- 6. Adicionar índices para performance
CREATE INDEX IF NOT EXISTS idx_profiles_role_id ON public.profiles(role_id);
CREATE INDEX IF NOT EXISTS idx_progress_user_id ON public.progress(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON public.analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_solutions_published ON public.solutions(published);

-- 7. Função para validar health check do sistema
CREATE OR REPLACE FUNCTION public.validate_system_health()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result jsonb;
BEGIN
  -- Verificar se usuário é admin
  IF NOT public.is_user_admin(auth.uid()) THEN
    RETURN jsonb_build_object('error', 'Acesso negado');
  END IF;

  SELECT jsonb_build_object(
    'total_users', (SELECT COUNT(*) FROM profiles),
    'total_solutions', (SELECT COUNT(*) FROM solutions),
    'active_progress', (SELECT COUNT(*) FROM progress),
    'system_status', 'healthy',
    'timestamp', now()
  ) INTO result;
  
  RETURN result;
END;
$$;
