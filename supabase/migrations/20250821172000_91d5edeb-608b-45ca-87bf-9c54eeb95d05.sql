-- Função para sincronizar permissões da tabela role_permissions para o campo JSONB permissions
CREATE OR REPLACE FUNCTION sync_role_permissions_to_jsonb()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  role_record RECORD;
  permission_record RECORD;
  permissions_obj jsonb := '{}';
  updated_count integer := 0;
BEGIN
  -- Verificar se é admin
  IF NOT public.is_user_admin_secure(auth.uid()) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Acesso negado - apenas administradores'
    );
  END IF;

  -- Para cada role, sincronizar suas permissões
  FOR role_record IN 
    SELECT id, name FROM public.user_roles
  LOOP
    permissions_obj := '{}';
    
    -- Buscar todas as permissões desta role na tabela role_permissions
    FOR permission_record IN
      SELECT pd.code, pd.category
      FROM public.role_permissions rp
      INNER JOIN public.permission_definitions pd ON rp.permission_id = pd.id
      WHERE rp.role_id = role_record.id
    LOOP
      -- Converter código da permissão para formato JSONB
      -- Ex: learning.access -> {"learning": true}
      IF permission_record.code LIKE '%.access' THEN
        permissions_obj := permissions_obj || jsonb_build_object(
          replace(permission_record.code, '.access', ''), true
        );
      ELSE
        -- Para outros tipos de permissões, usar o código completo
        permissions_obj := permissions_obj || jsonb_build_object(
          permission_record.code, true
        );
      END IF;
    END LOOP;
    
    -- Atualizar o campo permissions da role
    UPDATE public.user_roles 
    SET 
      permissions = permissions_obj,
      updated_at = now()
    WHERE id = role_record.id;
    
    updated_count := updated_count + 1;
    
    -- Log da sincronização
    INSERT INTO public.audit_logs (
      user_id,
      event_type,
      action,
      details
    ) VALUES (
      auth.uid(),
      'permission_sync',
      'sync_role_permissions',
      jsonb_build_object(
        'role_id', role_record.id,
        'role_name', role_record.name,
        'permissions_count', jsonb_object_keys(permissions_obj),
        'synced_permissions', permissions_obj
      )
    );
  END LOOP;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', format('Sincronizadas %s roles com sucesso', updated_count),
    'updated_roles', updated_count
  );
END;
$$;

-- Executar a sincronização inicial
SELECT sync_role_permissions_to_jsonb();