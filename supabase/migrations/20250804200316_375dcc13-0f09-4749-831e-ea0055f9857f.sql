-- Correção final da função complete_onboarding_flow para garantir funcionamento completo
CREATE OR REPLACE FUNCTION public.complete_onboarding_flow(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  onboarding_record public.onboarding_final;
  default_role_id uuid;
  current_user_role_id uuid;
  result jsonb;
  update_count integer;
BEGIN
  -- Definir contexto de onboarding para bypass do trigger de segurança
  PERFORM set_config('app.onboarding_context', 'true', true);
  
  -- Buscar dados do onboarding
  SELECT * INTO onboarding_record
  FROM public.onboarding_final
  WHERE user_id = p_user_id;
  
  IF onboarding_record.id IS NULL THEN
    -- Limpar contexto antes de retornar erro
    PERFORM set_config('app.onboarding_context', '', true);
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Dados de onboarding não encontrados'
    );
  END IF;
  
  -- Verificar se usuário já tem role
  SELECT role_id INTO current_user_role_id
  FROM public.profiles
  WHERE id = p_user_id;
  
  -- Se usuário não tem role, buscar role padrão
  IF current_user_role_id IS NULL THEN
    SELECT id INTO default_role_id 
    FROM public.user_roles 
    WHERE name IN ('member', 'membro_club', 'membro') 
    ORDER BY 
      CASE 
        WHEN name = 'member' THEN 1
        WHEN name = 'membro_club' THEN 2
        WHEN name = 'membro' THEN 3
        ELSE 4
      END
    LIMIT 1;
    
    -- Se não encontrou role padrão, criar um básico
    IF default_role_id IS NULL THEN
      INSERT INTO public.user_roles (name, description, permissions) 
      VALUES ('member', 'Membro da plataforma', '{"basic": true}'::jsonb)
      ON CONFLICT (name) DO NOTHING
      RETURNING id INTO default_role_id;
      
      -- Se ainda não conseguiu (por causa do conflict), buscar novamente
      IF default_role_id IS NULL THEN
        SELECT id INTO default_role_id FROM public.user_roles WHERE name = 'member' LIMIT 1;
      END IF;
    END IF;
  END IF;
  
  -- Marcar onboarding como completo na tabela onboarding_final
  UPDATE public.onboarding_final
  SET 
    is_completed = true,
    completed_at = now(),
    current_step = 6,
    completed_steps = ARRAY[1,2,3,4,5,6]
  WHERE user_id = p_user_id;
  
  -- Sincronizar dados principais com a tabela profiles
  -- IMPORTANTE: NÃO alterar role_id se usuário já tem um
  UPDATE public.profiles
  SET 
    -- Atualizar nome se fornecido no onboarding
    name = COALESCE(
      NULLIF(onboarding_record.personal_info->>'name', ''), 
      name
    ),
    -- Atualizar foto de perfil se fornecida no onboarding
    avatar_url = COALESCE(
      NULLIF(onboarding_record.personal_info->>'profile_picture', ''), 
      avatar_url
    ),
    -- Atualizar informações da empresa se fornecidas
    company_name = COALESCE(
      NULLIF(onboarding_record.business_info->>'company_name', ''), 
      company_name
    ),
    -- Atualizar cargo se fornecido
    current_position = COALESCE(
      NULLIF(onboarding_record.business_info->>'current_position', ''), 
      current_position
    ),
    -- IMPORTANTE: Só atribuir role se usuário não tiver nenhum
    role_id = CASE 
      WHEN current_user_role_id IS NULL THEN default_role_id 
      ELSE role_id 
    END,
    -- Marcar onboarding como completo
    onboarding_completed = true,
    onboarding_completed_at = now(),
    updated_at = now()
  WHERE id = p_user_id;
  
  -- Verificar se update funcionou
  GET DIAGNOSTICS update_count = ROW_COUNT;
  
  -- Limpar contexto
  PERFORM set_config('app.onboarding_context', '', true);
  
  result := jsonb_build_object(
    'success', true,
    'message', 'Onboarding completado e perfil sincronizado com sucesso',
    'current_role_preserved', current_user_role_id IS NOT NULL,
    'assigned_role_id', CASE 
      WHEN current_user_role_id IS NULL THEN default_role_id 
      ELSE current_user_role_id 
    END,
    'profile_updated', update_count > 0,
    'onboarding_data_found', onboarding_record.id IS NOT NULL,
    'synced_data', jsonb_build_object(
      'name', onboarding_record.personal_info->>'name',
      'profile_picture', onboarding_record.personal_info->>'profile_picture',
      'company_name', onboarding_record.business_info->>'company_name',
      'current_position', onboarding_record.business_info->>'current_position'
    )
  );
  
  -- Log de auditoria do onboarding completado
  INSERT INTO public.audit_logs (
    user_id,
    event_type,
    action,
    details,
    severity
  ) VALUES (
    p_user_id,
    'onboarding_completion',
    'complete_onboarding_flow',
    result,
    'info'
  );
  
  RETURN result;
  
EXCEPTION
  WHEN OTHERS THEN
    -- Limpar contexto em caso de erro
    PERFORM set_config('app.onboarding_context', '', true);
    
    -- Log do erro para debug
    INSERT INTO public.audit_logs (
      user_id,
      event_type,
      action,
      details,
      severity
    ) VALUES (
      p_user_id,
      'onboarding_error',
      'complete_onboarding_flow_failed',
      jsonb_build_object(
        'error_message', SQLERRM,
        'error_code', SQLSTATE,
        'user_id', p_user_id
      ),
      'high'
    );
    
    RAISE;
END;
$$;