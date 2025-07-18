-- =============================================
-- FASE 1.4: LIMPEZA AGRESSIVA DE TRIGGERS
-- =============================================

-- 1. IDENTIFICAR E DROPAR TODOS OS TRIGGERS NA TABELA PROFILES
DROP TRIGGER IF EXISTS validate_role_changes ON public.profiles CASCADE;
DROP TRIGGER IF EXISTS validate_role_change_trigger ON public.profiles CASCADE;
DROP TRIGGER IF EXISTS ensure_role_sync ON public.profiles CASCADE;
DROP TRIGGER IF EXISTS profile_role_sync_trigger ON public.profiles CASCADE;

-- 2. DROPAR TODAS AS FUNÇÕES QUE PODEM ESTAR CAUSANDO PROBLEMA
DROP FUNCTION IF EXISTS public.validate_role_change_trigger() CASCADE;
DROP FUNCTION IF EXISTS public.validate_role_changes() CASCADE;
DROP FUNCTION IF EXISTS public.ensure_role_sync() CASCADE;

-- 3. TENTAR LISTAR TRIGGERS RESTANTES
SELECT 
  t.trigger_name,
  t.event_manipulation,
  t.action_statement
FROM information_schema.triggers t
WHERE t.event_object_table = 'profiles' 
AND t.event_object_schema = 'public';

-- 4. AGORA RECRIAR A FUNÇÃO is_user_admin
CREATE OR REPLACE FUNCTION public.is_user_admin(user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
BEGIN
  -- Verificação simples sem recursão
  RETURN user_id = auth.uid() AND EXISTS (
    SELECT 1 
    FROM public.profiles p
    INNER JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = user_id 
    AND ur.name = 'admin'
  );
END;
$$;