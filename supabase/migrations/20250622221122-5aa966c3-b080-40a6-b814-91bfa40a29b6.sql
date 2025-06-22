
-- 1. Criar tabelas de backup ausentes
CREATE TABLE IF NOT EXISTS public.invite_backups (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  original_invite_id uuid,
  email text NOT NULL,
  backup_reason text NOT NULL,
  backup_data jsonb NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.analytics_backups (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  table_name text NOT NULL,
  backup_data jsonb NOT NULL,
  backup_reason text NOT NULL,
  record_count integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_backups (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  original_user_id uuid NOT NULL,
  email text NOT NULL,
  backup_reason text NOT NULL,
  backup_data jsonb NOT NULL,
  affected_tables text[] NOT NULL DEFAULT '{}',
  total_records_deleted integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 2. Habilitar RLS nas tabelas de backup
ALTER TABLE public.invite_backups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_backups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_backups ENABLE ROW LEVEL SECURITY;

-- 3. Criar policies para que apenas admins vejam os backups
CREATE POLICY "Apenas admins podem ver backups de convites" 
  ON public.invite_backups 
  FOR ALL 
  USING (public.is_user_admin(auth.uid()));

CREATE POLICY "Apenas admins podem ver backups de analytics" 
  ON public.analytics_backups 
  FOR ALL 
  USING (public.is_user_admin(auth.uid()));

CREATE POLICY "Apenas admins podem ver backups de usuários" 
  ON public.user_backups 
  FOR ALL 
  USING (public.is_user_admin(auth.uid()));

-- 4. Criar função unificada para exclusão TOTAL de usuários
CREATE OR REPLACE FUNCTION public.admin_force_delete_auth_user(user_email text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  target_user_id uuid;
  backup_record_id uuid;
  affected_tables text[] := '{}';
  total_deleted integer := 0;
  error_count integer := 0;
  error_messages text[] := '{}';
  operation_timestamp text;
  table_name text;
  backup_data jsonb;
  delete_count integer;
BEGIN
  operation_timestamp := to_char(now(), 'YYYY-MM-DD HH24:MI:SS');
  
  -- Verificar se usuário executando é admin
  IF NOT public.is_user_admin(auth.uid()) THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Acesso negado: apenas administradores podem executar esta operação',
      'details', jsonb_build_object(
        'backup_records', 0,
        'affected_tables', affected_tables,
        'auth_user_deleted', false,
        'error_count', 1,
        'error_messages', ARRAY['Permissão insuficiente'],
        'operation_timestamp', operation_timestamp,
        'total_records_deleted', 0
      )
    );
  END IF;

  -- Buscar o usuário pelo email
  SELECT id INTO target_user_id
  FROM public.profiles
  WHERE email = user_email;
  
  IF target_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Usuário não encontrado com o email fornecido',
      'details', jsonb_build_object(
        'backup_records', 0,
        'affected_tables', affected_tables,
        'auth_user_deleted', false,
        'error_count', 1,
        'error_messages', ARRAY['Usuário não encontrado'],
        'operation_timestamp', operation_timestamp,
        'total_records_deleted', 0
      )
    );
  END IF;

  -- Lista de tabelas para limpeza (todas as tabelas com user_id)
  FOR table_name IN 
    SELECT DISTINCT tablename 
    FROM pg_tables 
    WHERE schemaname = 'public'
    AND tablename NOT LIKE '%backup%'
    AND EXISTS (
      SELECT 1 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = tablename 
      AND column_name = 'user_id'
    )
  LOOP
    BEGIN
      -- Fazer backup dos dados antes de excluir
      EXECUTE format('SELECT to_jsonb(array_agg(t.*)) FROM %I t WHERE user_id = $1', table_name) 
      INTO backup_data USING target_user_id;
      
      IF backup_data IS NOT NULL AND backup_data != 'null'::jsonb THEN
        INSERT INTO public.user_backups (
          original_user_id,
          email,
          backup_reason,
          backup_data,
          affected_tables
        ) VALUES (
          target_user_id,
          user_email,
          'admin_force_delete',
          jsonb_build_object('table', table_name, 'data', backup_data),
          ARRAY[table_name]
        );
      END IF;
      
      -- Excluir registros da tabela
      EXECUTE format('DELETE FROM %I WHERE user_id = $1', table_name) USING target_user_id;
      GET DIAGNOSTICS delete_count = ROW_COUNT;
      
      IF delete_count > 0 THEN
        affected_tables := array_append(affected_tables, table_name);
        total_deleted := total_deleted + delete_count;
      END IF;
      
    EXCEPTION
      WHEN OTHERS THEN
        error_count := error_count + 1;
        error_messages := array_append(error_messages, 
          format('Erro na tabela %s: %s', table_name, SQLERRM));
    END;
  END LOOP;

  -- Excluir da tabela profiles
  BEGIN
    DELETE FROM public.profiles WHERE id = target_user_id;
    GET DIAGNOSTICS delete_count = ROW_COUNT;
    
    IF delete_count > 0 THEN
      affected_tables := array_append(affected_tables, 'profiles');
      total_deleted := total_deleted + delete_count;
    END IF;
  EXCEPTION
    WHEN OTHERS THEN
      error_count := error_count + 1;
      error_messages := array_append(error_messages, 
        format('Erro ao excluir profiles: %s', SQLERRM));
  END;

  -- Tentar excluir da auth.users (pode falhar se não houver permissão)
  BEGIN
    DELETE FROM auth.users WHERE email = user_email;
    GET DIAGNOSTICS delete_count = ROW_COUNT;
    
    -- Log da operação
    INSERT INTO public.audit_logs (
      event_type,
      action,
      user_id,
      details
    ) VALUES (
      'admin_action',
      'force_delete_user',
      auth.uid(),
      jsonb_build_object(
        'target_email', user_email,
        'target_user_id', target_user_id,
        'affected_tables', affected_tables,
        'total_deleted', total_deleted,
        'auth_user_deleted', delete_count > 0,
        'operation_timestamp', operation_timestamp
      )
    );
    
    RETURN jsonb_build_object(
      'success', true,
      'message', format('Usuário %s removido completamente do sistema', user_email),
      'details', jsonb_build_object(
        'backup_records', array_length(affected_tables, 1),
        'affected_tables', affected_tables,
        'auth_user_deleted', delete_count > 0,
        'error_count', error_count,
        'error_messages', error_messages,
        'operation_timestamp', operation_timestamp,
        'total_records_deleted', total_deleted
      )
    );
    
  EXCEPTION
    WHEN OTHERS THEN
      -- Se falhar na auth.users, ainda registrar sucesso parcial
      error_count := error_count + 1;
      error_messages := array_append(error_messages, 
        format('Não foi possível excluir de auth.users: %s', SQLERRM));
      
      -- Log da operação mesmo com erro parcial
      INSERT INTO public.audit_logs (
        event_type,
        action,
        user_id,
        details
      ) VALUES (
        'admin_action',
        'force_delete_user_partial',
        auth.uid(),
        jsonb_build_object(
          'target_email', user_email,
          'target_user_id', target_user_id,
          'affected_tables', affected_tables,
          'total_deleted', total_deleted,
          'auth_user_deleted', false,
          'operation_timestamp', operation_timestamp,
          'error_messages', error_messages
        )
      );
      
      RETURN jsonb_build_object(
        'success', true,
        'message', format('Usuário %s removido do sistema público (auth.users requer acesso direto)', user_email),
        'details', jsonb_build_object(
          'backup_records', array_length(affected_tables, 1),
          'affected_tables', affected_tables,
          'auth_user_deleted', false,
          'error_count', error_count,
          'error_messages', error_messages,
          'operation_timestamp', operation_timestamp,
          'total_records_deleted', total_deleted
        )
      );
  END;
END;
$$;

-- 5. Função para limpeza de convites expirados melhorada
CREATE OR REPLACE FUNCTION public.cleanup_expired_invites_enhanced()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  expired_invites_count integer := 0;
  backup_count integer := 0;
  cleanup_timestamp text;
BEGIN
  cleanup_timestamp := to_char(now(), 'YYYY-MM-DD HH24:MI:SS');
  
  -- Verificar permissão de admin
  IF NOT public.is_user_admin(auth.uid()) THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Acesso negado: apenas administradores podem executar limpeza'
    );
  END IF;
  
  -- Contar convites expirados
  SELECT COUNT(*) INTO expired_invites_count
  FROM public.invites
  WHERE expires_at < now() AND used_at IS NULL;
  
  IF expired_invites_count = 0 THEN
    RETURN jsonb_build_object(
      'success', true,
      'message', 'Nenhum convite expirado encontrado',
      'expired_invites', 0,
      'deleted_invites', 0,
      'cleanup_timestamp', cleanup_timestamp
    );
  END IF;
  
  -- Fazer backup dos convites expirados
  INSERT INTO public.invite_backups (email, backup_reason, backup_data)
  SELECT 
    email,
    'expired_cleanup',
    to_jsonb(invites.*)
  FROM public.invites
  WHERE expires_at < now() AND used_at IS NULL;
  
  GET DIAGNOSTICS backup_count = ROW_COUNT;
  
  -- Excluir convites expirados
  DELETE FROM public.invites
  WHERE expires_at < now() AND used_at IS NULL;
  
  -- Log da operação
  INSERT INTO public.audit_logs (
    event_type,
    action,
    user_id,
    details
  ) VALUES (
    'admin_action',
    'cleanup_expired_invites',
    auth.uid(),
    jsonb_build_object(
      'expired_count', expired_invites_count,
      'backup_count', backup_count,
      'cleanup_timestamp', cleanup_timestamp
    )
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'message', format('%s convites expirados removidos com backup', expired_invites_count),
    'expired_invites', expired_invites_count,
    'deleted_invites', expired_invites_count,
    'cleanup_timestamp', cleanup_timestamp
  );
END;
$$;

-- 6. Função para reset de analytics melhorada
CREATE OR REPLACE FUNCTION public.reset_analytics_data_enhanced()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  reset_timestamp text;
  tables_to_reset text[] := ARRAY['analytics', 'audit_logs', 'invite_analytics_events'];
  table_name text;
  record_count integer;
  total_backup_records integer := 0;
  total_deleted_records integer := 0;
BEGIN
  reset_timestamp := to_char(now(), 'YYYY-MM-DD HH24:MI:SS');
  
  -- Verificar permissão de admin
  IF NOT public.is_user_admin(auth.uid()) THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Acesso negado: apenas administradores podem resetar analytics'
    );
  END IF;
  
  -- Processar cada tabela
  FOREACH table_name IN ARRAY tables_to_reset LOOP
    -- Contar registros
    EXECUTE format('SELECT COUNT(*) FROM %I', table_name) INTO record_count;
    
    IF record_count > 0 THEN
      -- Fazer backup
      EXECUTE format('
        INSERT INTO public.analytics_backups (table_name, backup_data, backup_reason, record_count)
        SELECT $1, to_jsonb(array_agg(t.*)), $2, $3
        FROM %I t
      ', table_name) USING table_name, 'admin_reset', record_count;
      
      total_backup_records := total_backup_records + record_count;
      
      -- Limpar dados (preservar registros do sistema)
      EXECUTE format('DELETE FROM %I WHERE id != $1', table_name) 
      USING '00000000-0000-0000-0000-000000000000'::uuid;
      
      total_deleted_records := total_deleted_records + record_count;
    END IF;
  END LOOP;
  
  -- Log da operação
  INSERT INTO public.audit_logs (
    event_type,
    action,
    user_id,
    details
  ) VALUES (
    'admin_action',
    'analytics_reset',
    auth.uid(),
    jsonb_build_object(
      'backup_records', total_backup_records,
      'deleted_records', total_deleted_records,
      'tables_affected', tables_to_reset,
      'reset_timestamp', reset_timestamp
    )
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'message', format('Analytics resetado: %s registros em backup', total_backup_records),
    'backupRecords', total_backup_records,
    'deletedRecords', total_deleted_records,
    'tablesAffected', tables_to_reset,
    'resetTimestamp', reset_timestamp
  );
END;
$$;
