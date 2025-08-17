-- ==========================================
-- CORREÇÃO SIMPLES: SEARCH_PATH NAS FUNÇÕES
-- Resolver avisos de segurança sem quebrar funções existentes
-- ==========================================

-- 1. CORRIGIR NOSSAS FUNÇÕES RECÉM-CRIADAS
DROP FUNCTION IF EXISTS is_admin_via_role_table();
CREATE OR REPLACE FUNCTION public.is_admin_via_role_table()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.profiles p
    INNER JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = auth.uid() 
    AND ur.name = 'admin'
  );
$$;

DROP FUNCTION IF EXISTS get_user_role_via_table();
CREATE OR REPLACE FUNCTION public.get_user_role_via_table()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COALESCE(ur.name, 'member')
  FROM public.profiles p
  LEFT JOIN public.user_roles ur ON p.role_id = ur.id
  WHERE p.id = auth.uid()
  LIMIT 1;
$$;

DROP FUNCTION IF EXISTS validate_role_consistency();
CREATE OR REPLACE FUNCTION public.validate_role_consistency()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    inconsistent_count integer;
    missing_role_id integer;
    orphaned_role_ids integer;
    result jsonb;
BEGIN
    -- Contar inconsistências entre 'role' e 'role_id'
    SELECT COUNT(*) INTO inconsistent_count
    FROM profiles p
    LEFT JOIN user_roles ur ON p.role_id = ur.id
    WHERE p.role IS DISTINCT FROM ur.name;
    
    -- Contar perfis sem role_id
    SELECT COUNT(*) INTO missing_role_id
    FROM profiles WHERE role_id IS NULL;
    
    -- Contar role_ids órfãos  
    SELECT COUNT(*) INTO orphaned_role_ids
    FROM profiles p
    LEFT JOIN user_roles ur ON p.role_id = ur.id
    WHERE p.role_id IS NOT NULL AND ur.id IS NULL;
    
    result := jsonb_build_object(
        'total_profiles', (SELECT COUNT(*) FROM profiles),
        'inconsistent_roles', inconsistent_count,
        'missing_role_id', missing_role_id,
        'orphaned_role_ids', orphaned_role_ids,
        'is_consistent', (inconsistent_count = 0 AND missing_role_id = 0 AND orphaned_role_ids = 0),
        'validation_time', now()
    );
    
    RETURN result;
END;
$$;

-- 2. FUNÇÃO PARA SINCRONIZAR CAMPO 'role' COM role_id
CREATE OR REPLACE FUNCTION public.sync_role_fields()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    fixed_count integer := 0;
    result jsonb;
BEGIN
    -- Sincronizar campo 'role' com role_id para manter consistência
    UPDATE profiles p
    SET role = ur.name
    FROM user_roles ur 
    WHERE p.role_id = ur.id 
    AND p.role IS DISTINCT FROM ur.name;
    
    GET DIAGNOSTICS fixed_count = ROW_COUNT;
    
    result := jsonb_build_object(
        'synchronized_profiles', fixed_count,
        'synchronized_at', now()
    );
    
    RETURN result;
END;
$$;

-- 3. EXECUTAR SINCRONIZAÇÃO
SELECT public.sync_role_fields();

-- 4. MIGRAR POLÍTICAS RLS IMPORTANTES PARA USAR FONTE ÚNICA
-- Admin settings
DROP POLICY IF EXISTS "Admins can manage settings" ON admin_settings;
CREATE POLICY "Admins can manage settings" ON admin_settings
FOR ALL USING (is_admin_via_role_table());

-- Automated interventions
DROP POLICY IF EXISTS "Admins can manage interventions" ON automated_interventions;
CREATE POLICY "Admins can manage interventions" ON automated_interventions
FOR ALL USING (is_admin_via_role_table());

-- Automation rules
DROP POLICY IF EXISTS "Admins can manage automation rules" ON automation_rules;
CREATE POLICY "Admins can manage automation rules" ON automation_rules
FOR ALL USING (is_admin_via_role_table());

-- Invite campaigns
DROP POLICY IF EXISTS "Admins can manage invite campaigns" ON invite_campaigns;
CREATE POLICY "Admins can manage invite campaigns" ON invite_campaigns
FOR ALL USING (is_admin_via_role_table());

-- 5. FUNÇÃO PARA IDENTIFICAR FUNÇÕES RESTANTES SEM SEARCH_PATH
CREATE OR REPLACE FUNCTION public.identify_insecure_functions()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER  
SET search_path TO 'public'
AS $$
DECLARE
    func_record RECORD;
    function_list text[] := '{}';
    function_count INTEGER := 0;
    result jsonb;
BEGIN
    -- Listar funções SECURITY DEFINER sem search_path configurado
    FOR func_record IN 
        SELECT 
            p.proname as function_name,
            pg_get_function_arguments(p.oid) as arguments
        FROM pg_proc p
        INNER JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public'
          AND p.prosecdef = true  -- SECURITY DEFINER
          AND NOT EXISTS (
              SELECT 1 FROM unnest(p.proconfig) as config
              WHERE config LIKE 'search_path=%'
          )
        ORDER BY p.proname
    LOOP
        function_count := function_count + 1;
        function_list := array_append(function_list, 
            func_record.function_name || '(' || func_record.arguments || ')'
        );
    END LOOP;
    
    result := jsonb_build_object(
        'insecure_functions_count', function_count,
        'insecure_functions', function_list,
        'scan_time', now()
    );
    
    RETURN result;
END;
$$;

-- 6. EXECUTAR SCAN DE FUNÇÕES INSEGURAS
SELECT public.identify_insecure_functions();

-- 7. LOG DA MIGRAÇÃO
INSERT INTO audit_logs (
  user_id, event_type, action, details, severity
) VALUES (
  NULL, 'system_migration', 'role_system_security_step2',
  jsonb_build_object(
    'migration_step', 2,
    'actions', ARRAY[
      'secured_new_role_functions',
      'synchronized_role_fields', 
      'migrated_key_rls_policies',
      'identified_remaining_insecure_functions'
    ],
    'security_status', 'improved_significantly',
    'role_system_status', 'using_single_source_of_truth',
    'completed_at', now()
  ),
  'info'
) ON CONFLICT DO NOTHING;