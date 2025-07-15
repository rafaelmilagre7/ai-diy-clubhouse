-- Corrigir perfis órfãos para usuários que aceitaram convites mas não têm perfil
-- Função corrigida para criar perfis órfãos

CREATE OR REPLACE FUNCTION public.fix_orphaned_invites()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  fixed_count integer := 0;
  user_record record;
  invite_record record;
  user_name text;
BEGIN
  -- Buscar usuários com convites aceitos mas sem perfil
  FOR user_record IN 
    SELECT 
      u.id as user_id,
      u.email,
      u.raw_user_meta_data->>'invite_token' as invite_token,
      u.raw_user_meta_data,
      u.created_at
    FROM auth.users u
    WHERE NOT EXISTS (
      SELECT 1 FROM public.profiles p WHERE p.id = u.id
    )
    AND u.raw_user_meta_data->>'invite_token' IS NOT NULL
  LOOP
    -- Buscar dados do convite
    SELECT * INTO invite_record
    FROM public.invites i
    WHERE i.token = user_record.invite_token
    AND i.used_at IS NOT NULL;
    
    -- Se encontrou o convite, criar o perfil
    IF invite_record.id IS NOT NULL THEN
      -- Extrair nome dos metadados
      user_name := COALESCE(
        user_record.raw_user_meta_data->>'name',
        user_record.raw_user_meta_data->>'full_name',
        user_record.raw_user_meta_data->>'display_name',
        split_part(user_record.email, '@', 1)
      );
      
      INSERT INTO public.profiles (
        id,
        email,
        role_id,
        name,
        created_at,
        updated_at,
        onboarding_completed
      ) VALUES (
        user_record.user_id,
        user_record.email,
        invite_record.role_id,
        user_name,
        user_record.created_at,
        now(),
        false
      )
      ON CONFLICT (id) DO UPDATE SET
        role_id = invite_record.role_id,
        name = COALESCE(EXCLUDED.name, profiles.name),
        updated_at = now();
        
      fixed_count := fixed_count + 1;
      
      RAISE NOTICE 'Perfil criado para usuário % com convite %', user_record.email, invite_record.token;
    END IF;
  END LOOP;
  
  RETURN jsonb_build_object(
    'success', true,
    'fixed_profiles', fixed_count,
    'message', format('Corrigidos %s perfis órfãos', fixed_count)
  );
END;
$function$;

-- Executar a correção
SELECT public.fix_orphaned_invites();