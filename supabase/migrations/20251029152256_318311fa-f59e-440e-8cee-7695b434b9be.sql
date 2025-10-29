
-- ========================================
-- PROTEÇÕES V2: Sem índices parciais com NOW()
-- ========================================

-- 1. Função para recuperar usuários órfãos automaticamente
CREATE OR REPLACE FUNCTION public.auto_recover_orphaned_users()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  orphan_record RECORD;
  v_default_role_id uuid;
BEGIN
  SELECT id INTO v_default_role_id
  FROM public.user_roles
  WHERE name = 'membro_club'
  LIMIT 1;
  
  FOR orphan_record IN 
    SELECT au.id, au.email, au.raw_user_meta_data
    FROM auth.users au
    LEFT JOIN public.profiles p ON au.id = p.id
    WHERE au.created_at > NOW() - INTERVAL '24 hours'
      AND p.id IS NULL
  LOOP
    BEGIN
      INSERT INTO public.profiles (
        id, email, role_id, name,
        onboarding_completed, is_master_user,
        created_at, updated_at
      )
      VALUES (
        orphan_record.id,
        orphan_record.email,
        v_default_role_id,
        COALESCE(
          orphan_record.raw_user_meta_data->>'name',
          split_part(orphan_record.email, '@', 1)
        ),
        false, true,
        NOW(), NOW()
      );
      
      INSERT INTO public.onboarding_final (
        user_id, current_step, is_completed,
        personal_info, professional_info,
        created_at, updated_at
      )
      VALUES (
        orphan_record.id, 1, false,
        '{}'::jsonb, '{}'::jsonb,
        NOW(), NOW()
      )
      ON CONFLICT (user_id) DO NOTHING;
      
      RAISE NOTICE 'Usuário órfão recuperado: %', orphan_record.email;
    EXCEPTION
      WHEN OTHERS THEN
        RAISE WARNING 'Erro ao recuperar %: %', orphan_record.email, SQLERRM;
    END;
  END LOOP;
END;
$$;

-- 2. Função de health check
CREATE OR REPLACE FUNCTION public.check_invite_flow_health()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
  orphaned_count int;
  active_invites int;
  recent_signups int;
BEGIN
  SELECT COUNT(*) INTO orphaned_count
  FROM auth.users au
  LEFT JOIN public.profiles p ON au.id = p.id
  WHERE au.created_at > NOW() - INTERVAL '24 hours'
    AND p.id IS NULL;
  
  SELECT COUNT(*) INTO active_invites
  FROM public.invites
  WHERE used_at IS NULL
    AND expires_at > NOW();
  
  SELECT COUNT(*) INTO recent_signups
  FROM auth.users
  WHERE created_at > NOW() - INTERVAL '24 hours';
  
  result := jsonb_build_object(
    'orphaned_users', orphaned_count,
    'active_invites', active_invites,
    'recent_signups_24h', recent_signups,
    'health_status', CASE 
      WHEN orphaned_count = 0 THEN 'healthy'
      WHEN orphaned_count < 3 THEN 'warning'
      ELSE 'critical'
    END,
    'checked_at', NOW()
  );
  
  RETURN result;
END;
$$;

-- 3. Índices simples (sem predicados com NOW())
CREATE INDEX IF NOT EXISTS idx_invites_token ON public.invites(token);
CREATE INDEX IF NOT EXISTS idx_invites_expires ON public.invites(expires_at);
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding_status ON public.profiles(onboarding_completed);
CREATE INDEX IF NOT EXISTS idx_onboarding_completion ON public.onboarding_final(is_completed);
