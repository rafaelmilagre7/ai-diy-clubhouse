-- FASE 4: Continuar correção de funções com search_path inseguro e criar função is_user_admin

CREATE OR REPLACE FUNCTION public.is_user_admin(user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.profiles p
    JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = user_id AND ur.name = 'admin'
  );
END;
$function$;

-- Corrigir mais funções críticas com search_path
CREATE OR REPLACE FUNCTION public.handle_new_user_with_onboarding()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
DECLARE
  invite_token_from_metadata text;
  invite_record public.invites;
  user_role_id uuid;
  onboarding_result jsonb;
BEGIN
  RAISE NOTICE 'Processando novo usuário: % (ID: %)', NEW.email, NEW.id;
  
  -- Verificar se há invite_token nos metadados
  IF NEW.raw_user_meta_data IS NOT NULL THEN
    invite_token_from_metadata := NEW.raw_user_meta_data->>'invite_token';
    RAISE NOTICE 'Token de convite encontrado: %', COALESCE(left(invite_token_from_metadata, 8) || '***', 'nenhum');
  END IF;
  
  -- Se há token de convite, buscar o role_id correspondente
  IF invite_token_from_metadata IS NOT NULL THEN
    SELECT i.* INTO invite_record
    FROM public.invites i
    WHERE UPPER(REGEXP_REPLACE(i.token, '\s+', '', 'g')) = UPPER(REGEXP_REPLACE(invite_token_from_metadata, '\s+', '', 'g'))
    AND i.expires_at > now()
    ORDER BY i.created_at DESC
    LIMIT 1;
    
    IF invite_record.id IS NOT NULL THEN
      user_role_id := invite_record.role_id;
      RAISE NOTICE 'Role encontrado para convite: %', user_role_id;
    ELSE
      RAISE NOTICE 'Convite não encontrado ou expirado para token: %', invite_token_from_metadata;
    END IF;
  END IF;
  
  -- Se não tem role_id do convite, usar role padrão 'membro'
  IF user_role_id IS NULL THEN
    SELECT id INTO user_role_id 
    FROM public.user_roles 
    WHERE name IN ('membro', 'member') 
    ORDER BY name 
    LIMIT 1;
    RAISE NOTICE 'Usando role padrão: %', user_role_id;
  END IF;
  
  -- Criar perfil com role_id correto
  BEGIN
    INSERT INTO public.profiles (
      id, 
      email, 
      name, 
      role_id, 
      created_at, 
      updated_at,
      onboarding_completed
    )
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(
        NEW.raw_user_meta_data->>'name',
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'display_name',
        split_part(NEW.email, '@', 1)
      ),
      user_role_id,
      now(),
      now(),
      false
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      name = COALESCE(EXCLUDED.name, public.profiles.name),
      role_id = COALESCE(EXCLUDED.role_id, public.profiles.role_id),
      updated_at = now();
      
    RAISE NOTICE 'Perfil criado/atualizado com sucesso para usuário: %', NEW.email;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE WARNING 'Erro ao criar perfil para %: %', NEW.email, SQLERRM;
      RETURN NEW; -- Continuar mesmo com erro no perfil
  END;
  
  RETURN NEW;
END;
$function$;