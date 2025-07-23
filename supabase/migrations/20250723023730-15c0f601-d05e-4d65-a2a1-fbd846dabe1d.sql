-- Corrigir sistema de convites - remover e recriar função conflitante

-- 1. Remover função existente que está causando conflito
DROP FUNCTION IF EXISTS public.validate_invite_token_enhanced(text) CASCADE;

-- 2. Recriar função com retorno correto
CREATE OR REPLACE FUNCTION public.validate_invite_token_enhanced(p_token text)
RETURNS jsonb AS $$
DECLARE
  invite_record record;
BEGIN
  -- Buscar convite e role em uma query
  SELECT 
    i.*,
    ur.name as role_name,
    ur.description as role_description
  INTO invite_record
  FROM public.invites i
  LEFT JOIN public.user_roles ur ON i.role_id = ur.id
  WHERE i.token = p_token;
  
  -- Validações
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'valid', false,
      'reason', 'not_found',
      'message', 'Token de convite não encontrado'
    );
  END IF;
  
  IF invite_record.used_at IS NOT NULL THEN
    RETURN jsonb_build_object(
      'valid', false,
      'reason', 'already_used',
      'message', 'Este convite já foi utilizado',
      'used_at', invite_record.used_at
    );
  END IF;
  
  IF invite_record.expires_at < now() THEN
    RETURN jsonb_build_object(
      'valid', false,
      'reason', 'expired',
      'message', 'Este convite expirou',
      'expires_at', invite_record.expires_at
    );
  END IF;
  
  -- Retornar dados completos
  RETURN jsonb_build_object(
    'valid', true,
    'invite', jsonb_build_object(
      'id', invite_record.id,
      'email', invite_record.email,
      'role_id', invite_record.role_id,
      'expires_at', invite_record.expires_at,
      'created_at', invite_record.created_at,
      'notes', invite_record.notes,
      'whatsapp_number', invite_record.whatsapp_number
    ),
    'role', jsonb_build_object(
      'id', invite_record.role_id,
      'name', invite_record.role_name,
      'description', invite_record.role_description
    ),
    'message', 'Convite válido e pronto para uso'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- 3. Função para envio automático de convites
CREATE OR REPLACE FUNCTION public.send_invite_automatically()
RETURNS TRIGGER AS $$
DECLARE
  invite_data jsonb;
  role_name text;
BEGIN
  -- Buscar dados do role
  SELECT ur.name INTO role_name
  FROM public.user_roles ur
  WHERE ur.id = NEW.role_id;
  
  -- Log do trigger
  INSERT INTO public.audit_logs (
    user_id,
    event_type,
    action,
    resource_id,
    details,
    severity
  ) VALUES (
    NEW.created_by,
    'invite_automation',
    'auto_send_triggered',
    NEW.id::text,
    jsonb_build_object(
      'invite_id', NEW.id,
      'email', NEW.email,
      'channel', NEW.preferred_channel,
      'trigger_time', now()
    ),
    'info'
  );
  
  -- Marcar para envio (será processado pelas Edge Functions)
  RAISE NOTICE 'Convite criado para envio automático: % (%)', NEW.email, role_name;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- 4. Criar trigger para envio automático
DROP TRIGGER IF EXISTS auto_send_invite_trigger ON public.invites;
CREATE TRIGGER auto_send_invite_trigger
  AFTER INSERT ON public.invites
  FOR EACH ROW
  EXECUTE FUNCTION public.send_invite_automatically();

-- 5. Função para reenvio manual de convites
CREATE OR REPLACE FUNCTION public.resend_invite_manual(p_invite_id uuid)
RETURNS jsonb AS $$
DECLARE
  invite_record record;
BEGIN
  -- Verificar permissões de admin
  IF NOT public.is_user_admin_secure(auth.uid()) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Acesso negado - apenas administradores'
    );
  END IF;
  
  -- Buscar dados do convite
  SELECT i.*, ur.name as role_name
  INTO invite_record
  FROM public.invites i
  LEFT JOIN public.user_roles ur ON i.role_id = ur.id
  WHERE i.id = p_invite_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Convite não encontrado'
    );
  END IF;
  
  IF invite_record.used_at IS NOT NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Convite já foi utilizado'
    );
  END IF;
  
  IF invite_record.expires_at < now() THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Convite expirado'
    );
  END IF;
  
  -- Registrar reenvio
  INSERT INTO public.audit_logs (
    user_id,
    event_type,
    action,
    resource_id,
    details,
    severity
  ) VALUES (
    auth.uid(),
    'invite_resend',
    'manual_resend',
    p_invite_id::text,
    jsonb_build_object(
      'invite_id', p_invite_id,
      'email', invite_record.email,
      'resent_by', auth.uid(),
      'resent_at', now()
    ),
    'info'
  );
  
  -- Atualizar contador de tentativas
  UPDATE public.invites
  SET 
    send_attempts = COALESCE(send_attempts, 0) + 1,
    last_sent_at = now()
  WHERE id = p_invite_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Convite reenviado com sucesso',
    'invite_id', p_invite_id,
    'email', invite_record.email,
    'sent_at', now()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- 6. Criar view para dashboard de convites
CREATE OR REPLACE VIEW public.invite_dashboard_stats AS
SELECT 
  COUNT(*) as total_invites,
  COUNT(CASE WHEN used_at IS NOT NULL THEN 1 END) as used_invites,
  COUNT(CASE WHEN expires_at > now() AND used_at IS NULL THEN 1 END) as active_invites,
  COUNT(CASE WHEN expires_at < now() AND used_at IS NULL THEN 1 END) as expired_invites,
  COUNT(CASE WHEN created_at > now() - interval '7 days' THEN 1 END) as recent_invites,
  ROUND(
    COUNT(CASE WHEN used_at IS NOT NULL THEN 1 END)::decimal / 
    NULLIF(COUNT(*), 0) * 100, 
    2
  ) as conversion_rate
FROM public.invites;

-- 7. Conceder permissões
GRANT SELECT ON public.invite_dashboard_stats TO authenticated;
GRANT EXECUTE ON FUNCTION public.resend_invite_manual(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.validate_invite_token_enhanced(text) TO authenticated;

SELECT 'Sistema de convites otimizado com triggers e Edge Functions!' as status;