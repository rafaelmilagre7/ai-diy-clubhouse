-- FASE 3.1 CORRIGIDA: Adicionar search_path em funções SECURITY DEFINER
-- A função validate_admin_access já tem SET search_path TO 'public'
-- Vamos adicionar nas outras funções importantes

-- Função: is_admin (se existir, atualizar; se não, criar)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role_name text;
  user_email text;
BEGIN
  -- Buscar role do usuário
  SELECT ur.name, p.email INTO user_role_name, user_email
  FROM public.profiles p
  LEFT JOIN public.user_roles ur ON p.role_id = ur.id
  WHERE p.id = auth.uid()
  LIMIT 1;
  
  -- Admin por role ou email
  RETURN (user_role_name = 'admin') OR (user_email LIKE '%@viverdeia.ai');
END;
$$;

-- Adicionar SET search_path em detect_login_anomaly (se existir)
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' AND p.proname = 'detect_login_anomaly'
  ) THEN
    EXECUTE 'ALTER FUNCTION public.detect_login_anomaly(uuid, text) SET search_path = public';
  END IF;
END $$;

-- Adicionar SET search_path em check_rate_limit (se existir)
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' AND p.proname = 'check_rate_limit'
  ) THEN
    EXECUTE 'ALTER FUNCTION public.check_rate_limit(text, integer, integer) SET search_path = public';
  END IF;
END $$;

-- Adicionar SET search_path em update_updated_at_column (se existir)
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' AND p.proname = 'update_updated_at_column'
  ) THEN
    EXECUTE 'ALTER FUNCTION public.update_updated_at_column() SET search_path = public';
  END IF;
END $$;

COMMENT ON FUNCTION public.is_admin IS 'Verifica se usuário atual é admin - protegido contra path hijacking';
