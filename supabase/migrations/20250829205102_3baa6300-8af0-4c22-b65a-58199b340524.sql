-- ⚡ OTIMIZAÇÃO DE EXCLUSÃO DE CONVITES - Soft Delete + Background Cleanup

-- 1️⃣ Adicionar coluna para Soft Delete
ALTER TABLE public.invites 
ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE NULL;

-- 2️⃣ Criar índices otimizados para performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_invites_deleted_at 
ON public.invites (deleted_at) 
WHERE deleted_at IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_invites_active 
ON public.invites (created_at DESC) 
WHERE deleted_at IS NULL;

-- 3️⃣ Otimizar índices para CASCADE DELETE (quando necessário)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_invite_deliveries_invite_id_cascade 
ON public.invite_deliveries (invite_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_invite_analytics_events_invite_id_cascade 
ON public.invite_analytics_events (invite_id);

-- 4️⃣ Criar função para limpeza automática em background
CREATE OR REPLACE FUNCTION public.cleanup_deleted_invites_background()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  cleanup_count integer := 0;
  start_time timestamp := now();
  v_is_admin boolean := false;
BEGIN
  -- Verificar se é admin
  SELECT EXISTS (
    SELECT 1 
    FROM public.profiles p
    INNER JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = auth.uid() AND ur.name = 'admin'
  ) INTO v_is_admin;
  
  IF NOT v_is_admin THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Acesso negado: apenas administradores'
    );
  END IF;
  
  -- Limpeza física de convites marcados como deletados há mais de 24h
  DELETE FROM public.invites 
  WHERE deleted_at IS NOT NULL 
    AND deleted_at < (now() - interval '24 hours');
    
  GET DIAGNOSTICS cleanup_count = ROW_COUNT;
  
  -- Log da operação
  INSERT INTO public.audit_logs (
    user_id,
    event_type,
    action,
    details,
    severity
  ) VALUES (
    auth.uid(),
    'maintenance',
    'invite_cleanup_background',
    jsonb_build_object(
      'cleaned_invites', cleanup_count,
      'duration_ms', extract(epoch from (now() - start_time)) * 1000,
      'timestamp', now()
    ),
    'info'
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'cleaned_count', cleanup_count,
    'duration_ms', extract(epoch from (now() - start_time)) * 1000,
    'message', format('Limpeza concluída: %s convites removidos fisicamente', cleanup_count)
  );
END;
$function$;

-- 5️⃣ Criar função para soft delete rápido
CREATE OR REPLACE FUNCTION public.soft_delete_invite_fast(p_invite_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  invite_record record;
  v_is_admin boolean := false;
  v_user_id uuid := auth.uid();
BEGIN
  -- Verificar autenticação
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Usuário não autenticado'
    );
  END IF;
  
  -- Verificar se é admin
  SELECT EXISTS (
    SELECT 1 
    FROM public.profiles p
    INNER JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = v_user_id AND ur.name = 'admin'
  ) INTO v_is_admin;
  
  IF NOT v_is_admin THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Acesso negado: apenas administradores'
    );
  END IF;
  
  -- Buscar convite
  SELECT email, created_at INTO invite_record
  FROM public.invites
  WHERE id = p_invite_id AND deleted_at IS NULL;
  
  IF invite_record.email IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Convite não encontrado ou já foi removido'
    );
  END IF;
  
  -- Soft Delete (marca como deletado)
  UPDATE public.invites 
  SET deleted_at = now()
  WHERE id = p_invite_id;
  
  -- Log da ação
  INSERT INTO public.audit_logs (
    user_id,
    event_type,
    action,
    details,
    severity
  ) VALUES (
    v_user_id,
    'invite_management',
    'invite_soft_deleted',
    jsonb_build_object(
      'invite_id', p_invite_id,
      'email', invite_record.email,
      'deleted_by', v_user_id,
      'soft_delete_at', now()
    ),
    'info'
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Convite removido com sucesso',
    'email', invite_record.email,
    'soft_deleted_at', now()
  );
END;
$function$;