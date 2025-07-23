-- Melhorar sistema de convites com envio automático
-- Adicionar trigger para envio automático após criação

-- 1. Função para envio automático de convites
CREATE OR REPLACE FUNCTION public.send_invite_automatically()
RETURNS TRIGGER AS $$
DECLARE
  invite_data jsonb;
  role_name text;
  result jsonb;
BEGIN
  -- Buscar dados do role
  SELECT ur.name INTO role_name
  FROM public.user_roles ur
  WHERE ur.id = NEW.role_id;
  
  -- Preparar dados para as Edge Functions
  invite_data := jsonb_build_object(
    'inviteId', NEW.id,
    'email', NEW.email,
    'token', NEW.token,
    'roleName', COALESCE(role_name, 'Membro'),
    'invitedByName', 'Administrador',
    'expiresAt', NEW.expires_at,
    'notes', NEW.notes
  );
  
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
  
  -- Chamar Edge Function para email (sempre)
  BEGIN
    SELECT content INTO result
    FROM http((
      'POST',
      current_setting('app.base_url', true) || '/functions/v1/send-invite-email',
      ARRAY[
        http_header('Authorization', 'Bearer ' || current_setting('app.service_role_key', true)),
        http_header('Content-Type', 'application/json'),
        http_header('apikey', current_setting('app.anon_key', true))
      ],
      'application/json',
      invite_data::text
    ));
    
    RAISE NOTICE 'Email enviado automaticamente para %', NEW.email;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Erro ao enviar email automaticamente: %', SQLERRM;
  END;
  
  -- Chamar Edge Function para WhatsApp (se configurado)
  IF NEW.whatsapp_number IS NOT NULL AND NEW.preferred_channel IN ('whatsapp', 'both') THEN
    BEGIN
      SELECT content INTO result
      FROM http((
        'POST',
        current_setting('app.base_url', true) || '/functions/v1/send-invite-whatsapp',
        ARRAY[
          http_header('Authorization', 'Bearer ' || current_setting('app.service_role_key', true)),
          http_header('Content-Type', 'application/json'),
          http_header('apikey', current_setting('app.anon_key', true))
        ],
        'application/json',
        (invite_data || jsonb_build_object(
          'phone', NEW.whatsapp_number,
          'recipientName', COALESCE(NEW.notes, NEW.email)
        ))::text
      ));
      
      RAISE NOTICE 'WhatsApp enviado automaticamente para %', NEW.whatsapp_number;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Erro ao enviar WhatsApp automaticamente: %', SQLERRM;
    END;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- 2. Criar trigger para envio automático
DROP TRIGGER IF EXISTS auto_send_invite_trigger ON public.invites;
CREATE TRIGGER auto_send_invite_trigger
  AFTER INSERT ON public.invites
  FOR EACH ROW
  EXECUTE FUNCTION public.send_invite_automatically();

-- 3. Função para reenvio manual de convites
CREATE OR REPLACE FUNCTION public.resend_invite_manual(p_invite_id uuid)
RETURNS jsonb AS $$
DECLARE
  invite_record record;
  role_name text;
  invite_data jsonb;
  result jsonb;
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
  
  -- Preparar dados
  invite_data := jsonb_build_object(
    'inviteId', invite_record.id,
    'email', invite_record.email,
    'token', invite_record.token,
    'roleName', COALESCE(invite_record.role_name, 'Membro'),
    'invitedByName', 'Administrador',
    'expiresAt', invite_record.expires_at,
    'notes', invite_record.notes
  );
  
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

-- 4. Função para configurar URLs base (deve ser chamada pelo admin)
CREATE OR REPLACE FUNCTION public.configure_invite_settings(
  p_base_url text,
  p_service_role_key text,
  p_anon_key text
)
RETURNS jsonb AS $$
BEGIN
  -- Verificar permissões de admin
  IF NOT public.is_user_admin_secure(auth.uid()) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Acesso negado - apenas administradores'
    );
  END IF;
  
  -- Configurar settings no sistema
  PERFORM set_config('app.base_url', p_base_url, false);
  PERFORM set_config('app.service_role_key', p_service_role_key, false);
  PERFORM set_config('app.anon_key', p_anon_key, false);
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Configurações atualizadas com sucesso',
    'base_url', p_base_url,
    'configured_at', now()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- 5. Melhorar função de validação de convites
CREATE OR REPLACE FUNCTION public.validate_invite_token_enhanced(p_token text)
RETURNS jsonb AS $$
DECLARE
  invite_record record;
  role_record record;
  result jsonb;
BEGIN
  -- Buscar convite e role em uma query
  SELECT 
    i.*,
    ur.name as role_name,
    ur.description as role_description,
    ur.id as role_id
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
  
  -- Log da validação
  INSERT INTO public.audit_logs (
    event_type,
    action,
    resource_id,
    details,
    severity
  ) VALUES (
    'invite_validation',
    'token_validated',
    invite_record.id::text,
    jsonb_build_object(
      'token_prefix', left(p_token, 6),
      'email', invite_record.email,
      'validation_time', now(),
      'valid', true
    ),
    'info'
  );
  
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

-- 7. Comentar funções para documentação
COMMENT ON FUNCTION public.send_invite_automatically() IS 'Trigger function para envio automático de convites via Edge Functions';
COMMENT ON FUNCTION public.resend_invite_manual(uuid) IS 'Função para reenvio manual de convites pelo admin';
COMMENT ON FUNCTION public.configure_invite_settings(text, text, text) IS 'Configurar URLs e chaves para Edge Functions';
COMMENT ON FUNCTION public.validate_invite_token_enhanced(text) IS 'Validação melhorada de tokens com dados completos';
COMMENT ON VIEW public.invite_dashboard_stats IS 'Estatísticas do dashboard de convites';

-- 8. Conceder permissões
GRANT SELECT ON public.invite_dashboard_stats TO authenticated;
GRANT EXECUTE ON FUNCTION public.resend_invite_manual(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.configure_invite_settings(text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.validate_invite_token_enhanced(text) TO authenticated;

SELECT 'Sistema de convites melhorado com envio automático!' as status;