-- Atualizar trigger handle_new_user para detectar perfis pré-existentes
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = ''
AS $function$
DECLARE
  existing_profile public.profiles;
  default_role_id uuid;
BEGIN
  -- 🎯 NOVO FLUXO: Verificar se já existe perfil pré-existente pelo email
  SELECT * INTO existing_profile
  FROM public.profiles
  WHERE email = NEW.email AND status = 'invited';
  
  IF existing_profile.id IS NOT NULL THEN
    -- Perfil pré-existente encontrado (criado pelo convite)
    RAISE NOTICE 'Perfil pré-existente encontrado para %: %', NEW.email, existing_profile.id;
    
    -- Ativar o perfil conectando ao auth.users
    UPDATE public.profiles
    SET 
      id = NEW.id, -- Conectar ao auth.users
      status = 'active',
      updated_at = now()
    WHERE email = NEW.email AND status = 'invited';
    
    RAISE NOTICE 'Perfil ativado: % -> %', existing_profile.id, NEW.id;
  ELSE
    -- Não há perfil pré-existente, criar novo perfil normal
    SELECT id INTO default_role_id
    FROM public.user_roles
    WHERE name = 'member'
    LIMIT 1;
    
    INSERT INTO public.profiles (
      id, 
      email,
      name,
      role_id,
      status,
      onboarding_completed,
      created_at,
      updated_at
    )
    VALUES (
      NEW.id, 
      NEW.email,
      COALESCE(
        NEW.raw_user_meta_data->>'name',
        NEW.raw_user_meta_data->>'full_name', 
        NEW.raw_user_meta_data->>'display_name'
      ),
      default_role_id,
      'active',
      false,
      now(),
      now()
    );
    
    RAISE NOTICE 'Novo perfil criado para %: %', NEW.email, NEW.id;
  END IF;
  
  RETURN NEW;
END;
$function$;