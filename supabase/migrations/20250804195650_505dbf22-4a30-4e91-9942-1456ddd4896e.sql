-- Atualizar trigger de segurança para permitir alterações via função de onboarding
CREATE OR REPLACE FUNCTION public.detect_privilege_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Se alguém tenta alterar role_id diretamente (não via função segura)
  IF OLD.role_id IS DISTINCT FROM NEW.role_id THEN
    -- Verificar se é um admin fazendo a alteração OU se é via função de onboarding
    IF NOT (
      EXISTS (
        SELECT 1 FROM profiles p
        INNER JOIN user_roles ur ON p.role_id = ur.id
        WHERE p.id = auth.uid() AND ur.name = 'admin'
      ) OR 
      -- Permitir quando executado por função SECURITY DEFINER (complete_onboarding_flow)
      current_setting('role', true) = 'service_role' OR
      -- Verificar se está sendo chamado de dentro do contexto de onboarding
      current_setting('app.onboarding_context', true) = 'true'
    ) THEN
      -- Log da tentativa maliciosa
      INSERT INTO audit_logs (
        user_id,
        event_type,
        action,
        resource_id,
        details,
        severity
      ) VALUES (
        auth.uid(),
        'security_violation',
        'privilege_escalation_attempt',
        NEW.id::text,
        jsonb_build_object(
          'attempted_by', auth.uid(),
          'target_user', NEW.id,
          'old_role_id', OLD.role_id,
          'attempted_new_role_id', NEW.role_id,
          'blocked', true,
          'timestamp', now(),
          'context', current_setting('app.onboarding_context', true)
        ),
        'critical'
      );
      
      -- Bloquear a tentativa
      RAISE EXCEPTION 'SECURITY VIOLATION: Tentativa de escalação de privilégios detectada e bloqueada';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Atualizar função de onboarding para definir contexto
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
BEGIN
  -- Definir contexto de onboarding para bypass do trigger de segurança
  PERFORM set_config('app.onboarding_context', 'true', true);
  
  -- Buscar dados do onboarding
  SELECT * INTO onboarding_record
  FROM public.onboarding_final
  WHERE user_id = p_user_id;
  
  IF onboarding_record.id IS NULL THEN
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
    'synced_data', jsonb_build_object(
      'name', onboarding_record.personal_info->>'name',
      'profile_picture', onboarding_record.personal_info->>'profile_picture',
      'company_name', onboarding_record.business_info->>'company_name',
      'current_position', onboarding_record.business_info->>'current_position'
    )
  );
  
  RETURN result;
  
EXCEPTION
  WHEN OTHERS THEN
    -- Limpar contexto em caso de erro
    PERFORM set_config('app.onboarding_context', '', true);
    RAISE;
END;
$$;