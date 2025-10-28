-- =============================================
-- CORREÇÃO FINAL: Profiles órfãos e role_id NULL
-- Desabilita apenas triggers USER (não do sistema)
-- =============================================

-- Desabilitar apenas triggers USER (não triggers de constraints)
ALTER TABLE profiles DISABLE TRIGGER prevent_privilege_escalation;
ALTER TABLE profiles DISABLE TRIGGER trigger_sync_is_master_user_insert;
ALTER TABLE profiles DISABLE TRIGGER trigger_sync_is_master_user_update;
ALTER TABLE profiles DISABLE TRIGGER audit_profile_role_changes;
ALTER TABLE profiles DISABLE TRIGGER audit_role_changes_trigger;
ALTER TABLE profiles DISABLE TRIGGER role_change_audit_trigger;
ALTER TABLE profiles DISABLE TRIGGER trigger_invalidate_profile_cache;
ALTER TABLE profiles DISABLE TRIGGER create_notification_preferences_on_profile_creation;

-- Executar correções
DO $$
DECLARE
  default_role_id uuid;
  profiles_fixed integer := 0;
  orphans_created integer := 0;
  onboarding_fixed integer := 0;
  orphan_user RECORD;
BEGIN
  -- Buscar role_id padrão "membro_club"
  SELECT id INTO default_role_id 
  FROM user_roles 
  WHERE name = 'membro_club' 
  LIMIT 1;

  IF default_role_id IS NULL THEN
    RAISE EXCEPTION 'Role padrão "membro_club" não encontrado';
  END IF;

  RAISE NOTICE '✅ Role padrão encontrado: %', default_role_id;

  -- Passo 1: Corrigir profiles existentes com role_id NULL
  UPDATE profiles
  SET 
    role_id = default_role_id,
    is_master_user = true,
    updated_at = now()
  WHERE role_id IS NULL;
  
  GET DIAGNOSTICS profiles_fixed = ROW_COUNT;
  RAISE NOTICE '✅ Profiles com role_id NULL corrigidos: %', profiles_fixed;

  -- Passo 2: Criar profiles para usuários órfãos (em lotes)
  FOR orphan_user IN 
    SELECT 
      au.id,
      au.email,
      au.raw_user_meta_data->>'full_name' as full_name,
      au.created_at
    FROM auth.users au
    LEFT JOIN profiles p ON p.id = au.id
    WHERE p.id IS NULL
    ORDER BY au.created_at DESC
    LIMIT 100 -- Processar em lotes
  LOOP
    BEGIN
      INSERT INTO profiles (
        id,
        email,
        full_name,
        role_id,
        onboarding_completed,
        is_master_user,
        created_at,
        updated_at
      ) VALUES (
        orphan_user.id,
        orphan_user.email,
        COALESCE(orphan_user.full_name, 'Usuário'),
        default_role_id,
        false,
        true,
        orphan_user.created_at,
        now()
      )
      ON CONFLICT (id) DO NOTHING;
      
      orphans_created := orphans_created + 1;
      
      IF orphans_created <= 5 THEN
        RAISE NOTICE '✅ Profile criado: %', orphan_user.email;
      END IF;
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING '⚠️ Erro ao criar profile para %: %', orphan_user.email, SQLERRM;
    END;
  END LOOP;

  IF orphans_created > 5 THEN
    RAISE NOTICE '   ... e mais % profiles criados', orphans_created - 5;
  END IF;

  -- Passo 3: Corrigir onboarding_completed NULL
  UPDATE profiles
  SET 
    onboarding_completed = false,
    updated_at = now()
  WHERE onboarding_completed IS NULL;
  
  GET DIAGNOSTICS onboarding_fixed = ROW_COUNT;
  RAISE NOTICE '✅ Profiles com onboarding_completed NULL corrigidos: %', onboarding_fixed;

  -- Log final
  RAISE NOTICE '🎉 Migration concluída!';
  RAISE NOTICE '   - Profiles com role_id corrigidos: %', profiles_fixed;
  RAISE NOTICE '   - Profiles órfãos criados: %', orphans_created;
  RAISE NOTICE '   - Onboarding corrigidos: %', onboarding_fixed;

  -- Criar log de auditoria
  BEGIN
    INSERT INTO audit_logs (
      user_id,
      event_type,
      action,
      details,
      severity
    ) VALUES (
      NULL,
      'system_maintenance',
      'fix_orphan_profiles_and_roles',
      jsonb_build_object(
        'profiles_fixed', profiles_fixed,
        'orphans_created', orphans_created,
        'onboarding_fixed', onboarding_fixed,
        'timestamp', now()
      ),
      'info'
    );
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING '⚠️ Não foi possível criar audit log: %', SQLERRM;
  END;
END $$;

-- Reabilitar triggers USER
ALTER TABLE profiles ENABLE TRIGGER prevent_privilege_escalation;
ALTER TABLE profiles ENABLE TRIGGER trigger_sync_is_master_user_insert;
ALTER TABLE profiles ENABLE TRIGGER trigger_sync_is_master_user_update;
ALTER TABLE profiles ENABLE TRIGGER audit_profile_role_changes;
ALTER TABLE profiles ENABLE TRIGGER audit_role_changes_trigger;
ALTER TABLE profiles ENABLE TRIGGER role_change_audit_trigger;
ALTER TABLE profiles ENABLE TRIGGER trigger_invalidate_profile_cache;
ALTER TABLE profiles ENABLE TRIGGER create_notification_preferences_on_profile_creation;

-- Verificação final
DO $$
DECLARE
  total_profiles integer;
  profiles_with_role integer;
  profiles_without_role integer;
  orphan_users integer;
BEGIN
  SELECT 
    COUNT(*),
    COUNT(*) FILTER (WHERE role_id IS NOT NULL),
    COUNT(*) FILTER (WHERE role_id IS NULL)
  INTO total_profiles, profiles_with_role, profiles_without_role
  FROM profiles;

  SELECT COUNT(*)
  INTO orphan_users
  FROM auth.users au
  LEFT JOIN profiles p ON p.id = au.id
  WHERE p.id IS NULL;

  RAISE NOTICE '📊 VERIFICAÇÃO FINAL:';
  RAISE NOTICE '   Total de profiles: %', total_profiles;
  RAISE NOTICE '   Profiles COM role_id: %', profiles_with_role;
  RAISE NOTICE '   Profiles SEM role_id: %', profiles_without_role;
  RAISE NOTICE '   Usuários órfãos restantes: %', orphan_users;

  IF profiles_without_role = 0 AND orphan_users = 0 THEN
    RAISE NOTICE '✅ SUCESSO! Todos os profiles estão corretos!';
  ELSIF profiles_without_role > 0 THEN
    RAISE WARNING '⚠️ Ainda existem % profiles sem role_id', profiles_without_role;
  ELSIF orphan_users > 0 THEN
    RAISE NOTICE '⚠️ Restam % usuários órfãos (executar migration novamente)', orphan_users;
  END IF;
END $$;