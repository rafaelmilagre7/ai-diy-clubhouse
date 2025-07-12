-- Corrigir função audit_role_assignments que está causando erro de estrutura
-- Esta migração corrige o retorno da função para ser compatível

DROP FUNCTION IF EXISTS public.audit_role_assignments() CASCADE;

-- Recriar função com estrutura de retorno corrigida
CREATE OR REPLACE FUNCTION public.audit_role_assignments()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb := '{}';
  user_counts jsonb;
  inconsistencies_count bigint;
  total_users_count bigint;
  roles_without_users text[];
  users_without_roles_count bigint;
BEGIN
  -- Contar usuários por role
  SELECT jsonb_object_agg(
    COALESCE(ur.name, 'sem_role'), 
    count(*)
  ) INTO user_counts
  FROM public.profiles p
  LEFT JOIN public.user_roles ur ON p.role_id = ur.id
  GROUP BY ur.name;

  -- Contar inconsistências
  SELECT COUNT(*) INTO inconsistencies_count
  FROM public.profiles p
  LEFT JOIN public.user_roles ur ON p.role_id = ur.id
  WHERE 
    (p.role IS NULL AND p.role_id IS NULL) OR
    (p.role IS NOT NULL AND p.role_id IS NULL) OR
    (p.role IS NULL AND p.role_id IS NOT NULL) OR
    (p.role_id IS NOT NULL AND ur.id IS NULL) OR
    (p.role IS NOT NULL AND p.role_id IS NOT NULL AND ur.id IS NOT NULL AND p.role != ur.name);

  -- Total de usuários
  SELECT COUNT(*) INTO total_users_count FROM public.profiles;

  -- Roles sem usuários
  SELECT array_agg(ur.name) INTO roles_without_users
  FROM public.user_roles ur
  WHERE NOT EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.role_id = ur.id
  );

  -- Usuários sem roles
  SELECT COUNT(*) INTO users_without_roles_count
  FROM public.profiles p
  WHERE p.role_id IS NULL;

  -- Construir resultado
  result := jsonb_build_object(
    'user_count_by_role', COALESCE(user_counts, '{}'),
    'inconsistencies_count', COALESCE(inconsistencies_count, 0),
    'total_users', COALESCE(total_users_count, 0),
    'roles_without_users', COALESCE(roles_without_users, ARRAY[]::text[]),
    'users_without_roles', COALESCE(users_without_roles_count, 0)
  );

  RETURN result;
END;
$$;

-- Corrigir políticas RLS para storage buckets
-- Permitir criação de buckets para admins
DO $$
BEGIN
  -- Remover políticas existentes se houver
  DROP POLICY IF EXISTS "Allow bucket creation for admins" ON storage.buckets;
  
  -- Criar política para permitir criação de buckets por admins
  CREATE POLICY "Allow bucket creation for admins"
    ON storage.buckets
    FOR INSERT
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM public.profiles p
        JOIN public.user_roles ur ON p.role_id = ur.id
        WHERE p.id = auth.uid() AND ur.name = 'admin'
      )
    );
    
  -- Remover políticas de atualização se houver
  DROP POLICY IF EXISTS "Allow bucket management for admins" ON storage.buckets;
  
  -- Permitir gerenciamento de buckets por admins
  CREATE POLICY "Allow bucket management for admins"
    ON storage.buckets
    FOR ALL
    USING (
      EXISTS (
        SELECT 1 FROM public.profiles p
        JOIN public.user_roles ur ON p.role_id = ur.id
        WHERE p.id = auth.uid() AND ur.name = 'admin'
      )
    );
EXCEPTION
  WHEN OTHERS THEN
    -- Se houver erro, apenas log mas não falha
    RAISE NOTICE 'Erro ao configurar políticas de storage: %', SQLERRM;
END $$;

-- Função segura para verificação de health check sem acessar auth.users
CREATE OR REPLACE FUNCTION public.check_system_health()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb := '{}';
  db_status text := 'operational';
  profile_count bigint;
  roles_count bigint;
BEGIN
  -- Testar acesso básico ao banco
  BEGIN
    SELECT COUNT(*) INTO profile_count FROM public.profiles LIMIT 1000;
    SELECT COUNT(*) INTO roles_count FROM public.user_roles;
    
    -- Se chegou até aqui, banco está operacional
    db_status := 'operational';
  EXCEPTION
    WHEN OTHERS THEN
      db_status := 'error';
      profile_count := 0;
      roles_count := 0;
  END;

  result := jsonb_build_object(
    'database_status', db_status,
    'profile_count', profile_count,
    'roles_count', roles_count,
    'timestamp', now()
  );

  RETURN result;
END;
$$;

-- Comentários para documentação
COMMENT ON FUNCTION public.audit_role_assignments() IS 'Função corrigida para retornar JSONB em vez de TABLE - resolve erro de estrutura';
COMMENT ON FUNCTION public.check_system_health() IS 'Função segura para health check sem acessar auth.users';