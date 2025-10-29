-- ============================================
-- FUNÇÃO: Recuperar Usuários Órfãos
-- ============================================
-- Cria perfis para usuários que foram registrados mas não têm perfil
-- devido ao bug anterior da role 'member' inexistente
-- ============================================

CREATE OR REPLACE FUNCTION public.recover_orphan_users()
RETURNS TABLE (
  user_id UUID,
  user_email TEXT,
  profile_created BOOLEAN,
  error_message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  orphan_record RECORD;
  default_role_id UUID;
  recovery_count INTEGER := 0;
BEGIN
  -- Buscar role padrão
  SELECT id INTO default_role_id 
  FROM public.user_roles 
  WHERE name = 'convidado' 
  LIMIT 1;
  
  RAISE NOTICE '🔧 Iniciando recuperação de usuários órfãos com role: %', default_role_id;
  
  -- Buscar todos os usuários sem perfil
  FOR orphan_record IN
    SELECT au.id, au.email, au.raw_user_meta_data
    FROM auth.users au
    LEFT JOIN public.profiles p ON au.id = p.id
    WHERE p.id IS NULL
  LOOP
    BEGIN
      RAISE NOTICE '👤 Recuperando usuário: % (%)', orphan_record.email, orphan_record.id;
      
      -- Criar perfil
      INSERT INTO public.profiles (id, email, name, role_id)
      VALUES (
        orphan_record.id,
        orphan_record.email,
        COALESCE(orphan_record.raw_user_meta_data->>'name', split_part(orphan_record.email, '@', 1)),
        default_role_id
      );
      
      recovery_count := recovery_count + 1;
      
      -- Retornar sucesso
      user_id := orphan_record.id;
      user_email := orphan_record.email;
      profile_created := TRUE;
      error_message := NULL;
      RETURN NEXT;
      
      RAISE NOTICE '✅ Perfil criado com sucesso para: %', orphan_record.email;
      
    EXCEPTION
      WHEN OTHERS THEN
        RAISE NOTICE '❌ Erro ao recuperar %: %', orphan_record.email, SQLERRM;
        
        user_id := orphan_record.id;
        user_email := orphan_record.email;
        profile_created := FALSE;
        error_message := SQLERRM;
        RETURN NEXT;
    END;
  END LOOP;
  
  RAISE NOTICE '✅ Recuperação concluída. Total recuperados: %', recovery_count;
  
  RETURN;
END;
$function$;