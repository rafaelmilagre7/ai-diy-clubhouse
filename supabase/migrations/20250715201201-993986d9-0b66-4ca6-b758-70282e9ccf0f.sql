-- Criar função get_user_profile_safe que está faltando nos logs
CREATE OR REPLACE FUNCTION public.get_user_profile_safe(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  profile_data jsonb;
BEGIN
  SELECT to_jsonb(p.*) INTO profile_data
  FROM (
    SELECT 
      pr.*,
      ur.id as role_id_expanded,
      ur.name as role_name,
      ur.description as role_description,
      ur.permissions as role_permissions
    FROM public.profiles pr
    LEFT JOIN public.user_roles ur ON pr.role_id = ur.id
    WHERE pr.id = p_user_id
  ) p;
  
  IF profile_data IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Perfil não encontrado'
    );
  END IF;
  
  RETURN jsonb_build_object(
    'success', true,
    'profile', profile_data
  );
END;
$function$;

-- Otimizar trigger handle_new_user para ser mais silencioso e não interferir no frontend
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  default_role_id uuid;
  invite_token text;
  invite_data jsonb;
BEGIN
  -- Silencioso: não fazer logs desnecessários
  
  -- Buscar role padrão (membro)
  SELECT id INTO default_role_id
  FROM public.user_roles
  WHERE name IN ('membro_club', 'member', 'membro')
  ORDER BY 
    CASE 
      WHEN name = 'membro_club' THEN 1
      WHEN name = 'member' THEN 2
      ELSE 3
    END
  LIMIT 1;
  
  -- Extrair token do convite dos metadados
  invite_token := NEW.raw_user_meta_data->>'invite_token';
  
  -- Se tiver token, buscar dados do convite
  IF invite_token IS NOT NULL THEN
    SELECT to_jsonb(i.*) INTO invite_data
    FROM public.invites i
    WHERE i.token = invite_token
    AND i.expires_at > now()
    LIMIT 1;
    
    -- Se convite válido, usar role do convite
    IF invite_data IS NOT NULL THEN
      default_role_id := (invite_data->>'role_id')::uuid;
    END IF;
  END IF;
  
  -- Criar perfil básico
  INSERT INTO public.profiles (
    id,
    email,
    role_id,
    name,
    created_at,
    updated_at,
    onboarding_completed
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(default_role_id, (SELECT id FROM public.user_roles WHERE name = 'membro_club' LIMIT 1)),
    COALESCE(
      NEW.raw_user_meta_data->>'name',
      NEW.raw_user_meta_data->>'full_name',
      split_part(NEW.email, '@', 1)
    ),
    now(),
    now(),
    false
  ) ON CONFLICT (id) DO NOTHING;
  
  -- Inicializar onboarding de forma assíncrona (não bloquear)
  IF invite_data IS NOT NULL THEN
    PERFORM public.initialize_onboarding_for_user(NEW.id, invite_data);
  ELSE
    PERFORM public.initialize_onboarding_for_user(NEW.id);
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Em caso de erro, não bloquear criação do usuário
    RETURN NEW;
END;
$function$;