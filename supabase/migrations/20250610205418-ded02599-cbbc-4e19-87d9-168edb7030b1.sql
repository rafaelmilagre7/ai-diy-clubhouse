
-- Correção das políticas RLS para a tabela profiles
-- Esta migration resolve o problema de acesso aos dados do perfil após a limpeza das funções

-- 1. Remover políticas RLS problemáticas existentes
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by owner" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are updatable by owner" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for users based on user_id" ON public.profiles;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.profiles;

-- 2. Criar função segura para verificar se é admin (sem recursão)
CREATE OR REPLACE FUNCTION public.current_user_is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.user_roles ur
    WHERE ur.name = 'admin'
    AND ur.id = (
      SELECT role_id 
      FROM public.profiles 
      WHERE id = auth.uid()
    )
  );
$$;

-- 3. Criar políticas RLS corrigidas para profiles
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (
    auth.uid() = id OR 
    public.current_user_is_admin()
  );

CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (
    auth.uid() = id OR 
    public.current_user_is_admin()
  )
  WITH CHECK (
    auth.uid() = id OR 
    public.current_user_is_admin()
  );

CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (
    auth.uid() = id OR 
    public.current_user_is_admin()
  );

-- 4. Garantir que RLS está ativo na tabela profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 5. Criar função auxiliar para buscar perfil com segurança
CREATE OR REPLACE FUNCTION public.get_user_profile_safe(user_id uuid DEFAULT auth.uid())
RETURNS SETOF public.profiles
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT * FROM public.profiles 
  WHERE id = user_id
  AND (id = auth.uid() OR public.current_user_is_admin());
$$;

-- 6. Atualizar função log_security_access para ser mais robusta
CREATE OR REPLACE FUNCTION public.log_security_access(
  p_table_name text,
  p_operation text,
  p_resource_id text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Inserir log apenas se a tabela audit_logs existir e o usuário estiver autenticado
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_logs') 
     AND auth.uid() IS NOT NULL THEN
    
    INSERT INTO public.audit_logs (
      user_id,
      event_type,
      action,
      resource_id,
      details
    ) VALUES (
      auth.uid(),
      'data_access',
      p_operation,
      p_resource_id,
      jsonb_build_object(
        'table_name', p_table_name,
        'timestamp', NOW()
      )
    );
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    -- Falhar silenciosamente para não quebrar operações principais
    NULL;
END;
$$;

-- 7. Comentários de validação
COMMENT ON POLICY "Users can view own profile" ON public.profiles IS 'Política corrigida: usuários podem ver próprio perfil ou admins podem ver todos';
COMMENT ON POLICY "Users can update own profile" ON public.profiles IS 'Política corrigida: usuários podem atualizar próprio perfil ou admins podem atualizar todos';
COMMENT ON FUNCTION public.current_user_is_admin() IS 'Função segura para verificar admin sem recursão RLS';
