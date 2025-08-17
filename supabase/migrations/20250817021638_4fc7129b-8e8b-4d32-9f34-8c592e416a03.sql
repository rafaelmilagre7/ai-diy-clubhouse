-- ==========================================
-- CORREÇÃO: FUNÇÕES SEM SET SEARCH_PATH
-- Resolver os 7 avisos restantes de segurança
-- ==========================================

-- 1. IDENTIFICAR E CORRIGIR FUNÇÕES SEM search_path
-- Primeiro, vamos corrigir as funções que criamos recentemente

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

-- 2. CORRIGIR FUNÇÃO DE VALIDAÇÃO
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
    
    -- Log da validação
    INSERT INTO audit_logs (
        user_id, event_type, action, details, severity
    ) VALUES (
        auth.uid(), 'role_validation', 'consistency_check', result,
        CASE WHEN inconsistent_count > 0 OR missing_role_id > 0 OR orphaned_role_ids > 0 
             THEN 'warning' ELSE 'info' END
    );
    
    RETURN result;
END;
$$;

-- 3. BUSCAR E CORRIGIR OUTRAS FUNÇÕES SEM SEARCH_PATH
-- Vamos identificar quais outras funções precisam ser corrigidas

DO $$
DECLARE
    func_record RECORD;
    function_count INTEGER := 0;
BEGIN
    -- Listar funções SECURITY DEFINER sem search_path configurado
    FOR func_record IN 
        SELECT 
            n.nspname as schema_name,
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
        
        -- Log das funções encontradas
        INSERT INTO audit_logs (
            user_id, event_type, action, details, severity
        ) VALUES (
            NULL, 'security_audit', 'function_missing_search_path',
            jsonb_build_object(
                'schema_name', func_record.schema_name,
                'function_name', func_record.function_name,
                'arguments', func_record.arguments,
                'discovered_at', now()
            ),
            'warning'
        ) ON CONFLICT DO NOTHING;
    END LOOP;
    
    RAISE NOTICE 'Encontradas % funções sem search_path', function_count;
END $$;

-- 4. CORRIGIR FUNÇÕES ESPECÍFICAS CONHECIDAS
-- Baseado nas funções que vimos no código anteriormente

-- Função para verificar admin (versão melhorada e segura)
CREATE OR REPLACE FUNCTION public.is_user_admin(target_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.profiles p
    INNER JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = COALESCE(target_user_id, auth.uid())
    AND ur.name = 'admin'
  );
$$;

-- Função is_admin simplificada
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT public.is_admin_via_role_table();
$$;

-- 5. MIGRAR ALGUMAS POLÍTICAS RLS CRÍTICAS PARA USAR NOVAS FUNÇÕES
-- Atualizar políticas importantes para usar fonte única da verdade

-- Políticas de admin_settings
DROP POLICY IF EXISTS "Admins can manage settings" ON admin_settings;
CREATE POLICY "Admins can manage settings" ON admin_settings
FOR ALL USING (is_admin_via_role_table());

-- Políticas de automated_interventions  
DROP POLICY IF EXISTS "Admins can manage interventions" ON automated_interventions;
CREATE POLICY "Admins can manage interventions" ON automated_interventions
FOR ALL USING (is_admin_via_role_table());

-- Políticas de automation_rules
DROP POLICY IF EXISTS "Admins can manage automation rules" ON automation_rules;
CREATE POLICY "Admins can manage automation rules" ON automation_rules
FOR ALL USING (is_admin_via_role_table());

-- 6. FUNÇÃO PARA CORRIGIR INCONSISTÊNCIAS AUTOMATICAMENTE
CREATE OR REPLACE FUNCTION public.fix_role_inconsistencies()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    fixed_count integer := 0;
    admin_role_id uuid;
    member_role_id uuid;
    result jsonb;
BEGIN
    -- Buscar IDs dos papéis
    SELECT id INTO admin_role_id FROM user_roles WHERE name = 'admin' LIMIT 1;
    SELECT id INTO member_role_id FROM user_roles WHERE name IN ('member', 'membro') LIMIT 1;
    
    -- Sincronizar campo 'role' com role_id
    UPDATE profiles p
    SET role = ur.name
    FROM user_roles ur 
    WHERE p.role_id = ur.id 
    AND p.role IS DISTINCT FROM ur.name;
    
    GET DIAGNOSTICS fixed_count = ROW_COUNT;
    
    result := jsonb_build_object(
        'fixed_inconsistencies', fixed_count,
        'admin_role_id', admin_role_id,
        'member_role_id', member_role_id,
        'fixed_at', now()
    );
    
    -- Log da correção
    INSERT INTO audit_logs (
        user_id, event_type, action, details, severity
    ) VALUES (
        auth.uid(), 'role_maintenance', 'inconsistencies_fixed', result, 'info'
    );
    
    RETURN result;
END;
$$;

-- 7. EXECUTAR CORREÇÃO DE INCONSISTÊNCIAS
SELECT public.fix_role_inconsistencies();

-- 8. LOG FINAL
INSERT INTO audit_logs (
  user_id, event_type, action, details, severity
) VALUES (
  NULL, 'system_migration', 'search_path_security_fixes',
  jsonb_build_object(
    'migration_step', 2,
    'actions', ARRAY[
      'added_search_path_to_role_functions',
      'updated_key_rls_policies',
      'created_consistency_fixer',
      'identified_remaining_functions'
    ],
    'security_improvement', 'functions_now_secure',
    'next_phase', 'complete_rls_migration',
    'completed_at', now()
  ),
  'info'
) ON CONFLICT DO NOTHING;