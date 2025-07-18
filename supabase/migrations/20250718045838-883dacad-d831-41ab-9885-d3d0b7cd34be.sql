-- =============================================
-- FASE 1.1: CORREÇÃO PREPARATÓRIA - TRIGGERS E DEPENDÊNCIAS
-- =============================================

-- 1. IDENTIFICAR E CORRIGIR TRIGGER PROBLEMÁTICO
-- Dropar trigger que está causando erro com is_user_admin
DROP TRIGGER IF EXISTS validate_role_change_trigger ON public.profiles;
DROP FUNCTION IF EXISTS public.validate_role_change_trigger();

-- 2. VERIFICAR OUTRAS DEPENDÊNCIAS DA FUNÇÃO is_user_admin
-- Temporariamente dropar outros triggers que possam usar is_user_admin
DROP TRIGGER IF EXISTS check_admin_permissions ON public.user_roles;
DROP FUNCTION IF EXISTS public.check_admin_permissions();

-- 3. RECRIAR FUNÇÃO is_user_admin COM NOVA IMPLEMENTAÇÃO SEGURA
CREATE OR REPLACE FUNCTION public.is_user_admin(user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  -- IMPLEMENTAÇÃO SEGURA: Verificar através de user_roles diretamente sem recursão
  SELECT EXISTS (
    SELECT 1 
    FROM public.profiles p
    INNER JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = user_id 
    AND ur.name = 'admin'
    AND user_id = auth.uid() -- Apenas para usuário autenticado atual
  );
$$;

-- 4. VERIFICAR SE FUNÇÃO ESTÁ FUNCIONANDO
SELECT public.is_user_admin('00000000-0000-0000-0000-000000000000'::uuid) as test_result;