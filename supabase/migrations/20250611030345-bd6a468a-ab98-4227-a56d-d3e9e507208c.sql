
-- FASE 1: CRIAR FUNÇÃO SECURITY DEFINER PARA VERIFICAÇÃO DE ADMIN
-- ================================================================

-- Função robusta e segura para verificar se um usuário é administrador
-- Usa SECURITY DEFINER para evitar problemas de RLS recursivo
CREATE OR REPLACE FUNCTION public.is_admin(check_user_id uuid DEFAULT NULL)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  -- Se não especificar user_id, usa o usuário atual
  WITH target_user AS (
    SELECT COALESCE(check_user_id, auth.uid()) as user_id
  )
  SELECT EXISTS (
    SELECT 1 
    FROM public.profiles p
    JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = (SELECT user_id FROM target_user)
    AND ur.name = 'admin'
    AND ur.is_system = true
  );
$$;

-- Função auxiliar para verificar o papel atual do usuário autenticado
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT COALESCE(ur.name, 'member')
  FROM public.profiles p
  JOIN public.user_roles ur ON p.role_id = ur.id
  WHERE p.id = auth.uid();
$$;

-- Função para verificar se usuário tem papel específico
CREATE OR REPLACE FUNCTION public.has_role_name(role_name text, check_user_id uuid DEFAULT NULL)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  WITH target_user AS (
    SELECT COALESCE(check_user_id, auth.uid()) as user_id
  )
  SELECT EXISTS (
    SELECT 1 
    FROM public.profiles p
    JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = (SELECT user_id FROM target_user)
    AND ur.name = role_name
  );
$$;

-- COMENTÁRIO SOBRE SEGURANÇA:
-- ============================
-- Estas funções usam SECURITY DEFINER para executar com privilégios elevados
-- Isso evita problemas de RLS recursivo quando políticas dependem de verificações de papel
-- A verificação é feita exclusivamente via tabela user_roles, eliminando hardcoded emails
-- Todas as verificações administrativas devem usar estas funções a partir de agora
