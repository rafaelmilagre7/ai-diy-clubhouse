-- Criar função sync_profile_roles que estava faltando
CREATE OR REPLACE FUNCTION public.sync_profile_roles()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  corrected_count integer := 0;
  total_profiles integer := 0;
  default_role_id uuid;
  result_message text;
BEGIN
  -- Obter role padrão 'member'
  SELECT id INTO default_role_id 
  FROM public.user_roles 
  WHERE name = 'member' OR name = 'membro_club'
  ORDER BY name
  LIMIT 1;
  
  -- Se não existir role padrão, criar uma
  IF default_role_id IS NULL THEN
    INSERT INTO public.user_roles (name, description, permissions)
    VALUES ('member', 'Membro padrão', '{"read": true}'::jsonb)
    RETURNING id INTO default_role_id;
  END IF;
  
  -- Contar total de perfis
  SELECT COUNT(*) INTO total_profiles FROM public.profiles;
  
  -- Corrigir perfis sem role_id ou com role_id inválido
  UPDATE public.profiles 
  SET 
    role_id = default_role_id,
    role = 'member'
  WHERE role_id IS NULL 
     OR NOT EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.id = profiles.role_id);
  
  GET DIAGNOSTICS corrected_count = ROW_COUNT;
  
  -- Corrigir discrepâncias entre role e role_id
  UPDATE public.profiles p
  SET role = ur.name
  FROM public.user_roles ur
  WHERE p.role_id = ur.id 
    AND (p.role IS NULL OR p.role != ur.name);
  
  -- Preparar mensagem de resultado
  IF corrected_count > 0 THEN
    result_message := format('Sincronização concluída: %s perfis corrigidos de %s total', 
                           corrected_count, total_profiles);
  ELSE
    result_message := format('Nenhuma correção necessária. Todos os %s perfis estão sincronizados', 
                           total_profiles);
  END IF;
  
  RETURN jsonb_build_object(
    'success', true,
    'total_profiles', total_profiles,
    'profiles_corrected', corrected_count,
    'message', result_message
  );
END;
$$;

-- Melhorar função de validação com melhor tratamento de erros
CREATE OR REPLACE FUNCTION public.validate_profile_roles()
RETURNS TABLE(
  user_id uuid,
  email text,
  user_role text,
  user_role_id uuid,
  expected_role_name text,
  expected_role_id uuid,
  issue_type text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verificar se as tabelas existem e são acessíveis
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles' AND table_schema = 'public') THEN
    RAISE EXCEPTION 'Tabela profiles não encontrada';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_roles' AND table_schema = 'public') THEN
    RAISE EXCEPTION 'Tabela user_roles não encontrada';
  END IF;

  RETURN QUERY
  SELECT 
    p.id as user_id,
    COALESCE(p.email, 'email_not_found') as email,
    p.role as user_role,
    p.role_id as user_role_id,
    COALESCE(ur.name, 'ROLE_NOT_FOUND') as expected_role_name,
    p.role_id as expected_role_id,
    CASE 
      WHEN p.role IS NULL AND p.role_id IS NULL THEN 'both_null'
      WHEN p.role IS NOT NULL AND p.role_id IS NULL THEN 'missing_role_id'
      WHEN p.role IS NULL AND p.role_id IS NOT NULL THEN 'missing_role'
      WHEN p.role_id IS NOT NULL AND ur.id IS NULL THEN 'invalid_role_id'
      WHEN p.role IS NOT NULL AND p.role_id IS NOT NULL AND ur.id IS NOT NULL AND p.role != ur.name THEN 'role_mismatch'
      ELSE 'unknown'
    END as issue_type
  FROM public.profiles p
  LEFT JOIN public.user_roles ur ON p.role_id = ur.id
  WHERE 
    -- Casos problemáticos
    (p.role IS NULL AND p.role_id IS NULL) OR
    (p.role IS NOT NULL AND p.role_id IS NULL) OR
    (p.role IS NULL AND p.role_id IS NOT NULL) OR
    (p.role_id IS NOT NULL AND ur.id IS NULL) OR
    (p.role IS NOT NULL AND p.role_id IS NOT NULL AND ur.id IS NOT NULL AND p.role != ur.name)
  ORDER BY p.created_at DESC;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Erro na validação de roles: %', SQLERRM;
END;
$$;

-- Atualizar comentários das funções
COMMENT ON FUNCTION public.sync_profile_roles() IS 'Sincroniza roles dos perfis, corrigindo inconsistências e atribuindo role padrão quando necessário';
COMMENT ON FUNCTION public.validate_profile_roles() IS 'Valida consistência entre roles e role_ids nos perfis, com melhor tratamento de erros';